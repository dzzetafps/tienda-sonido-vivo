import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TablaPedidosAdmin from '../../src/componentes/organismos/TablaPedidosAdmin'
import AdminDetallePedido from '../../src/paginas/AdminDetallePedido'
import { calcularTotalVendido, productosMasVendidos, resumirPorEstado } from '../../src/datos/pedidosAdmin'
import type { EstadoPedido, ItemPedido, Pedido } from '../../src/tipos/Pedido'

function crearPedido(id: string, estado: EstadoPedido, items: ItemPedido[]): Pedido {
  return {
    id,
    fecha: '2026-10-27T15:30:00.000Z',
    usuarioId: 'u-cliente-1',
    comprador: { nombre: 'Ana', apellido: 'Rojas', correo: 'ana@correo.cl' },
    entrega: { tipo: 'retiro', calle: '', numero: '', complemento: '', region: '', comuna: '', indicaciones: '' },
    items,
    total: items.reduce((total, item) => total + item.cantidad * item.precioUnitario, 0),
    estado,
  }
}

const guitarra = { codigo: 'GA001', nombre: 'Guitarra Acústica Folk', precioUnitario: 129990 }
const cable = { codigo: 'AC001', nombre: 'Cable de instrumento', precioUnitario: 9990 }

const pedidos = [
  crearPedido('p-1', 'pagado', [{ ...guitarra, cantidad: 1 }, { ...cable, cantidad: 2 }]),
  crearPedido('p-2', 'entregado', [{ ...cable, cantidad: 3 }]),
  crearPedido('p-3', 'cancelado', [{ ...guitarra, cantidad: 5 }]),
]

const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

describe('Felipe — pedidos y reportes de ventas', () => {
  let contenedor: HTMLDivElement
  let root: Root

  beforeEach(() => {
    contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    root = createRoot(contenedor)
  })

  afterEach(async () => {
    try {
      await act(async () => root.unmount())
    } finally {
      contenedor.remove()
    }
  })

  it('calcularTotalVendido suma solo los pedidos que no están cancelados', () => {
    expect(calcularTotalVendido(pedidos)).toBe(129990 + 2 * 9990 + 3 * 9990)
  })

  it('resumirPorEstado cuenta pedidos y monto de cada estado en orden', () => {
    expect(resumirPorEstado(pedidos)).toEqual([
      { estado: 'pagado', pedidos: 1, total: 149970 },
      { estado: 'enviado', pedidos: 0, total: 0 },
      { estado: 'entregado', pedidos: 1, total: 29970 },
      { estado: 'cancelado', pedidos: 1, total: 649950 },
    ])
  })

  it('productosMasVendidos agrupa por producto, ignora cancelados y ordena por unidades', () => {
    expect(productosMasVendidos(pedidos, 5)).toEqual([
      { codigo: 'AC001', nombre: 'Cable de instrumento', unidades: 5, total: 49950 },
      { codigo: 'GA001', nombre: 'Guitarra Acústica Folk', unidades: 1, total: 129990 },
    ])
    expect(productosMasVendidos(pedidos, 1).length).toBe(1)
  })

  it('TablaPedidosAdmin muestra el código corto, el estado, el total y el enlace al detalle', async () => {
    const pedido = crearPedido('abcdef12-3456-7890-abcd-ef1234567890', 'enviado', [{ ...guitarra, cantidad: 1 }])
    await act(async () => {
      root.render(<MemoryRouter><TablaPedidosAdmin pedidos={[pedido]} /></MemoryRouter>)
    })
    const fila = contenedor.querySelector('tbody tr')!

    expect(fila.textContent).toContain('ABCDEF12')
    expect(fila.textContent).toContain('Enviado')
    expect(fila.textContent).toContain(formatoCLP.format(129990))
    expect(fila.querySelector('a')?.getAttribute('href')).toBe('/admin/pedidos/abcdef12-3456-7890-abcd-ef1234567890')
  })

  it('AdminDetallePedido cambia el estado con cambiarEstadoPedido y lo guarda en LocalStorage', async () => {
    const almacen: Record<string, string> = {
      'sonido-vivo-ep2-pedidos': JSON.stringify([crearPedido('p-1', 'pagado', [{ ...guitarra, cantidad: 1 }])]),
    }
    spyOn(Storage.prototype, 'getItem').and.callFake((clave: string) => almacen[clave] ?? null)
    spyOn(Storage.prototype, 'setItem').and.callFake((clave: string, valor: string) => {
      almacen[clave] = valor
    })

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin/pedidos/p-1']}>
          <Routes>
            <Route path="/admin/pedidos/:id" element={<AdminDetallePedido />} />
          </Routes>
        </MemoryRouter>,
      )
    })
    const boton = contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!
    expect(boton.disabled).toBeTrue()

    await act(async () => {
      const lista = contenedor.querySelector<HTMLSelectElement>('#estado-pedido')!
      lista.value = 'enviado'
      lista.dispatchEvent(new Event('change', { bubbles: true }))
    })
    await act(async () => {
      boton.click()
    })

    expect(JSON.parse(almacen['sonido-vivo-ep2-pedidos'])[0].estado).toBe('enviado')
    expect(contenedor.textContent).toContain('Estado actualizado a Enviado.')
  })
})
