import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { establecerToken } from '../../src/datos/api'
import { actualizarEstadoPedido, estadosSiguientes, listarPedidos } from '../../src/datos/pedidosApi'
import AdminDetallePedido from '../../src/paginas/AdminDetallePedido'
import AdminPedidos from '../../src/paginas/AdminPedidos'
import type { EstadoPedido, Pedido } from '../../src/tipos/Pedido'

function pedido(id: string, estado: EstadoPedido, nombre = 'Juan'): Pedido {
  return {
    id,
    fecha: '2026-11-24T07:00:00',
    usuarioId: 'uuid-del-cliente',
    estado,
    comprador: { nombre, apellido: 'Perez', correo: 'cliente@ejemplo.cl' },
    entrega: {
      tipo: 'despacho', calle: 'Calle 123', numero: '100', complemento: '',
      region: 'Metropolitana', comuna: 'Santiago', indicaciones: '',
    },
    items: [{ codigo: 'GUIT-001', nombre: 'Guitarra', cantidad: 2, precioUnitario: 100000 }],
    total: 200000,
  }
}

function respuestaJson(estado: number, datos: unknown) {
  return Promise.resolve({ ok: estado >= 200 && estado < 300, status: estado, json: () => Promise.resolve(datos) } as Response)
}

describe('Felipe — pedidos conectados a la API', () => {
  afterEach(() => {
    establecerToken(null)
  })

  it('listarPedidos llama a /api/pedidos con el token y pasa los montos a número', async () => {
    const espia = spyOn(window, 'fetch').and.callFake(() => respuestaJson(200, [{ ...pedido('p-1', 'pagado'), total: '200000.00' }]))
    establecerToken('token-admin')

    const pedidos = await listarPedidos()

    const [url, opciones] = espia.calls.mostRecent().args
    expect(String(url)).toBe('http://localhost:8080/api/pedidos')
    expect(new Headers(opciones?.headers).get('Authorization')).toBe('Bearer token-admin')
    expect(pedidos[0].total).toBe(200000)
  })

  it('actualizarEstadoPedido envía un PATCH con el estado nuevo', async () => {
    const espia = spyOn(window, 'fetch').and.callFake(() => respuestaJson(200, pedido('p-1', 'enviado')))

    const actualizado = await actualizarEstadoPedido('p-1', 'enviado')

    const [url, opciones] = espia.calls.mostRecent().args
    expect(String(url)).toBe('http://localhost:8080/api/pedidos/p-1/estado')
    expect(opciones?.method).toBe('PATCH')
    expect(JSON.parse(String(opciones?.body))).toEqual({ estado: 'enviado' })
    expect(actualizado.estado).toBe('enviado')
  })

  it('estadosSiguientes no ofrece cambios para pendiente, entregado ni cancelado', () => {
    expect(estadosSiguientes('pagado')).toEqual(['enviado', 'cancelado'])
    expect(estadosSiguientes('enviado')).toEqual(['entregado'])
    expect(estadosSiguientes('pendiente')).toEqual([])
    expect(estadosSiguientes('entregado')).toEqual([])
    expect(estadosSiguientes('cancelado')).toEqual([])
  })

  describe('pantallas', () => {
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

    async function esperarRespuestas() {
      await act(async () => {
        await new Promise((resolver) => setTimeout(resolver, 0))
      })
    }

    async function mostrarDetalle(id: string) {
      await act(async () => {
        root.render(
          <MemoryRouter initialEntries={[`/admin/pedidos/${id}`]}>
            <Routes>
              <Route path="/admin/pedidos/:id" element={<AdminDetallePedido />} />
            </Routes>
          </MemoryRouter>,
        )
      })
      await esperarRespuestas()
    }

    it('AdminPedidos muestra los pedidos que entrega la API', async () => {
      spyOn(window, 'fetch').and.callFake(() => respuestaJson(200, [pedido('p-1', 'pagado'), pedido('p-2', 'pendiente', 'Ana')]))

      await act(async () => {
        root.render(<MemoryRouter><AdminPedidos /></MemoryRouter>)
      })
      await esperarRespuestas()

      expect(contenedor.querySelectorAll('tbody tr').length).toBe(2)
      expect(contenedor.textContent).toContain('Mostrando 2 de 2 pedidos')
      expect(contenedor.textContent).toContain('Pendiente')
    })

    it('AdminPedidos muestra el error 403 si el rol no tiene permiso', async () => {
      spyOn(window, 'fetch').and.callFake(() => respuestaJson(403, null))

      await act(async () => {
        root.render(<MemoryRouter><AdminPedidos /></MemoryRouter>)
      })
      await esperarRespuestas()

      expect(contenedor.textContent).toContain('No tienes permisos para realizar esta acción.')
      expect(contenedor.querySelector('table')).toBeNull()
    })

    it('AdminDetallePedido no permite modificar un pedido pendiente', async () => {
      spyOn(window, 'fetch').and.callFake(() => respuestaJson(200, pedido('p-1', 'pendiente')))

      await mostrarDetalle('p-1')

      expect(contenedor.querySelector('#estado-pedido')).toBeNull()
      expect(contenedor.textContent).toContain('El pedido está pendiente de pago y no se puede modificar.')
    })

    it('AdminDetallePedido muestra el mensaje del backend si rechaza la transición', async () => {
      spyOn(window, 'fetch').and.callFake((_entrada: RequestInfo | URL, opciones?: RequestInit) => (
        opciones?.method === 'PATCH'
          ? respuestaJson(409, { mensaje: 'No se puede cambiar de pagado a entregado.' })
          : respuestaJson(200, pedido('p-1', 'pagado'))
      ))
      await mostrarDetalle('p-1')

      await act(async () => {
        const lista = contenedor.querySelector<HTMLSelectElement>('#estado-pedido')!
        lista.value = 'enviado'
        lista.dispatchEvent(new Event('change', { bubbles: true }))
      })
      await act(async () => {
        contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
      })
      await esperarRespuestas()

      expect(contenedor.textContent).toContain('No se puede cambiar de pagado a entregado.')
    })

    it('AdminDetallePedido muestra 404 cuando el pedido no existe', async () => {
      spyOn(window, 'fetch').and.callFake(() => respuestaJson(404, { mensaje: 'Pedido no encontrado.' }))

      await mostrarDetalle('no-existe')

      expect(contenedor.textContent).toContain('Pedido no encontrado.')
      expect(contenedor.textContent).toContain('Volver a pedidos')
    })
  })
})
