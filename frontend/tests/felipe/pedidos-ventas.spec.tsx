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
      { estado: 'pendiente', pedidos: 0, total: 0 },
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

  it('AdminDetallePedido cambia el estado con PATCH /api/pedidos/{id}/estado', async () => {
    const original = crearPedido('p-1', 'pagado', [{ ...guitarra, cantidad: 1 }])
    const espia = spyOn(window, 'fetch').and.callFake((_entrada: RequestInfo | URL, opciones?: RequestInit) => {
      const datos = opciones?.method === 'PATCH' ? { ...original, estado: 'enviado' } : original
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(datos) } as Response)
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
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 0))
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
    await act(async () => {
      await new Promise((resolver) => setTimeout(resolver, 0))
    })

    const [url, opciones] = espia.calls.mostRecent().args
    expect(String(url)).toBe('http://localhost:8080/api/pedidos/p-1/estado')
    expect(opciones?.method).toBe('PATCH')
    expect(JSON.parse(String(opciones?.body))).toEqual({ estado: 'enviado' })
    expect(contenedor.textContent).toContain('Estado actualizado a Enviado.')
  })
})
