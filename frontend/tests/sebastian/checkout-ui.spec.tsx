import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import Checkout from '../../src/paginas/Checkout'
import CompraExitosa from '../../src/paginas/CompraExitosa'
import { establecerToken } from '../../src/datos/api'
import type { CarritoApi } from '../../src/datos/carritoApi'
import type { DatosPedido, PedidoCliente } from '../../src/datos/pedidosClienteApi'

const comprador = { nombre: 'Cliente', apellido: 'Demostración', correo: 'compra@sonidovivo.example' }
const entrega: DatosPedido['entrega'] = {
  tipo: 'despacho', calle: 'Calle ficticia', numero: '100', complemento: '',
  region: 'Región de Valparaíso', comuna: 'Valparaíso', indicaciones: '',
}
const item = { codigo: 'QA001', nombre: 'Producto de prueba', cantidad: 2, precioUnitario: 129990 }
const formatoPrecio = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })

function RutaActual() {
  const ubicacion = useLocation()
  return <output id="ruta-prueba">{ubicacion.pathname + ubicacion.search}</output>
}

function respuesta(estado: number, datos: unknown) {
  return new Response(JSON.stringify(datos), { status: estado, headers: { 'Content-Type': 'application/json' } })
}

describe('Sebastián — Checkout y CompraExitosa REST', () => {
  let contenedor: HTMLDivElement
  let root: Root
  let carrito: CarritoApi
  let pedidos: PedidoCliente[]
  let solicitudes: DatosPedido[]
  let fetchMock: jasmine.Spy
  let confirmar: (datos: DatosPedido) => Promise<Response>

  function nuevoPedido(datos: DatosPedido, estado: PedidoCliente['estado'] = 'pagado'): PedidoCliente {
    return { id: '550e8400-e29b-41d4-a716-446655440000', usuarioId: 'cliente-prueba',
      fecha: '2026-11-24T12:00:00Z', ...structuredClone(datos), items: [{ ...item }], total: 259980, estado }
  }

  beforeEach(() => {
    establecerToken('jwt-unitario-sin-validez-real')
    carrito = { id: 'carrito-prueba', usuarioId: 'cliente-prueba', cantidadTotal: 2, total: 259980,
      items: [{ ...item, imagen: null, stock: 5, subtotal: 259980, disponible: true }] }
    pedidos = []
    solicitudes = []
    confirmar = async (datos) => {
      const pedido = nuevoPedido(datos)
      pedidos = [pedido]
      carrito = { ...carrito, items: [], cantidadTotal: 0, total: 0 }
      return respuesta(201, pedido)
    }
    fetchMock = spyOn(window, 'fetch').and.callFake(async (entrada: RequestInfo | URL, opciones?: RequestInit) => {
      const ruta = new URL(String(entrada)).pathname
      const metodo = opciones?.method ?? 'GET'
      if (metodo === 'GET' && ruta === '/api/carrito') return respuesta(200, carrito)
      if (metodo === 'GET' && ruta === '/api/pedidos/mis-pedidos') return respuesta(200, pedidos)
      if (metodo === 'GET' && ruta.startsWith('/api/pedidos/')) {
        const pedido = pedidos.find((p) => p.id === ruta.split('/').at(-1))
        return pedido ? respuesta(200, pedido) : respuesta(404, { mensaje: 'Pedido inexistente.' })
      }
      if (metodo === 'POST' && ruta === '/api/pedidos') {
        const datos = JSON.parse(String(opciones?.body)) as DatosPedido
        solicitudes.push(datos)
        return confirmar(datos)
      }
      throw new Error(`Solicitud no prevista: ${metodo} ${ruta}`)
    })
    contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    root = createRoot(contenedor)
  })

  afterEach(async () => {
    try { await act(async () => root.unmount()) } finally {
      contenedor.remove()
      establecerToken(null)
    }
    // Jasmine restaura el spy de fetch al finalizar cada caso.
  })

  async function esperar(condicion: () => boolean, descripcion: string) {
    const limite = Date.now() + 2000
    while (Date.now() < limite) {
      await act(async () => { await new Promise<void>((resolver) => setTimeout(resolver, 10)) })
      if (condicion()) return
    }
    throw new Error(`No se cumplió: ${descripcion}. DOM: ${contenedor.textContent}`)
  }

  async function montar(ruta = '/checkout') {
    await act(async () => {
      root.render(<MemoryRouter initialEntries={[ruta]}><RutaActual /><Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/compra-exitosa" element={<CompraExitosa />} />
        <Route path="/mis-pedidos" element={<section>Historial verificado</section>} />
      </Routes></MemoryRouter>)
    })
    await esperar(() => Boolean(contenedor.querySelector('section')), 'pantalla cargada')
  }

  async function remontar(ruta: string) {
    await act(async () => root.unmount())
    root = createRoot(contenedor)
    await montar(ruta)
  }

  async function cambiarCampo(id: string, valor: string) {
    const control = contenedor.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`#${id}`)
    if (!control) throw new Error(`No existe el campo ${id}`)
    await act(async () => {
      const prototipo = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype
        : control instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      Object.getOwnPropertyDescriptor(prototipo, 'value')!.set!.call(control, valor)
      control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
    })
  }

  async function completar(tipo: 'despacho' | 'retiro' = 'despacho') {
    for (const [campo, valor] of Object.entries(comprador)) await cambiarCampo(campo, valor)
    await cambiarCampo('entrega', tipo)
    if (tipo === 'despacho') {
      for (const campo of ['calle', 'numero', 'region', 'comuna'] as const) await cambiarCampo(campo, entrega[campo])
    }
  }

  function submit() {
    contenedor.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  }
  async function enviar() { await act(async () => submit()) }
  async function esperarExito() {
    await esperar(() => Boolean(contenedor.querySelector('#titulo-compra-exitosa')), 'compra confirmada')
    const pedido = pedidos[0]
    expect(contenedor.textContent).toContain(pedido.id)
    expect(contenedor.textContent).toContain(pedido.comprador.correo)
    expect(contenedor.querySelector('tfoot td')?.textContent).toBe(formatoPrecio.format(pedido.total))
    expect(contenedor.querySelector('#ruta-prueba')?.textContent).toBe(`/compra-exitosa?pedido=${pedido.id}`)
  }

  it('muestra resumen y valida campos obligatorios sin enviar pedidos', async () => {
    await montar()
    expect(contenedor.querySelector('aside')?.textContent).toContain(item.nombre)
    expect(contenedor.querySelector('aside')?.textContent).toContain(formatoPrecio.format(carrito.total))
    await enviar()
    for (const campo of ['nombre', 'apellido', 'correo', 'calle', 'numero', 'region', 'comuna']) {
      expect(contenedor.querySelector(`#${campo}`)?.getAttribute('aria-invalid')).toBe('true')
    }
    expect(solicitudes.length).toBe(0)
    expect(pedidos.length).toBe(0)
    expect(carrito.items[0].cantidad).toBe(2)
  })

  it('confirma despacho mediante REST y consulta el pedido después de navegar', async () => {
    await montar()
    await completar()
    await enviar()
    await esperarExito()
    expect(solicitudes).toEqual([{ comprador, entrega }])
    expect(contenedor.textContent).toContain('Calle ficticia 100')
    const llamada = fetchMock.calls.allArgs().find(([, opciones]) => opciones?.method === 'POST')!
    expect(new Headers(llamada[1].headers).get('Authorization')).toBe('Bearer jwt-unitario-sin-validez-real')
    expect(llamada[1].credentials).toBe('include')
  })

  it('confirma retiro en tienda sin exigir dirección', async () => {
    await montar()
    await completar('retiro')
    expect(contenedor.querySelector('#calle')).toBeNull()
    await enviar()
    await esperarExito()
    expect(solicitudes[0].entrega).toEqual({ tipo: 'retiro', calle: '', numero: '', complemento: '', region: '', comuna: '', indicaciones: '' })
    expect(contenedor.textContent).toContain('Retiro en tienda')
  })

  it('impide dos envíos consecutivos antes del siguiente render', async () => {
    let resolver!: (respuesta: Response) => void
    confirmar = () => new Promise<Response>((resolve) => { resolver = resolve })
    await montar()
    await completar()
    await act(async () => { submit(); submit() })
    expect(solicitudes.length).toBe(1)
    expect(contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBeTrue()
    pedidos = [nuevoPedido(solicitudes[0])]
    await act(async () => resolver(respuesta(201, pedidos[0])))
    await esperarExito()
  })

  it('recupera el pendiente tras remontar y reintenta con UUID y datos originales', async () => {
    confirmar = async (datos) => { pedidos = [nuevoPedido(datos, 'pendiente')]; return respuesta(202, pedidos[0]) }
    await montar()
    await completar()
    await enviar()
    await esperar(() => contenedor.textContent!.includes('Pedido pendiente de confirmación'), 'pedido pendiente')
    const original = structuredClone(pedidos[0])
    expect(contenedor.querySelector('#titulo-compra-exitosa')).toBeNull()
    await remontar('/checkout')
    expect(contenedor.querySelector<HTMLInputElement>('#nombre')!.value).toBe(original.comprador.nombre)
    expect(contenedor.querySelectorAll('fieldset:disabled').length).toBe(2)
    confirmar = async () => { pedidos = [{ ...original, estado: 'pagado' }]; return respuesta(201, pedidos[0]) }
    await enviar()
    await esperarExito()
    expect(solicitudes[1]).toEqual({ comprador: original.comprador, entrega: original.entrega })
    expect(pedidos[0].id).toBe(original.id)
  })

  it('consulta por ID y rechaza ausentes, inexistentes, pendientes y cancelados como éxito', async () => {
    pedidos = [nuevoPedido({ comprador, entrega })]
    const ruta = `/compra-exitosa?pedido=${pedidos[0].id}`
    await montar(ruta)
    await esperarExito()
    await remontar(ruta)
    await esperarExito()
    for (const acceso of ['/compra-exitosa', '/compra-exitosa?pedido=inexistente']) {
      await remontar(acceso)
      expect(contenedor.querySelector('[role="alert"]')).not.toBeNull()
      expect(contenedor.querySelector('#titulo-compra-exitosa')).toBeNull()
    }
    for (const estado of ['pendiente', 'cancelado'] as const) {
      pedidos[0].estado = estado
      await remontar(ruta)
      expect(contenedor.querySelector('h1')?.textContent).toContain(estado)
      expect(contenedor.querySelector('#titulo-compra-exitosa')).toBeNull()
    }
  })

  it('consulta historial si se pierde la respuesta de una compra ya confirmada y no repite el POST', async () => {
    confirmar = async (datos) => {
      pedidos = [nuevoPedido(datos)]
      carrito = { ...carrito, items: [], cantidadTotal: 0, total: 0 }
      throw new TypeError('Respuesta perdida')
    }
    await montar()
    await completar()
    await enviar()
    await esperar(() => contenedor.querySelector('#ruta-prueba')?.textContent === '/mis-pedidos', 'historial tras respuesta perdida')
    expect(solicitudes.length).toBe(1)
    expect(pedidos[0].estado).toBe('pagado')
  })

  it('permite reintentar después de HTTP 503 tras consultar el estado persistido', async () => {
    const confirmarNormal = confirmar
    confirmar = async () => respuesta(503, { mensaje: 'Servicio temporalmente no disponible.' })
    await montar()
    await completar()
    await enviar()
    await esperar(() => Boolean(contenedor.querySelector('[role="alert"]')) &&
      !contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled, 'recuperación tras 503')
    expect(contenedor.textContent).toContain('Servicio temporalmente no disponible.')
    expect(pedidos.length).toBe(0)
    expect(contenedor.querySelector<HTMLInputElement>('#nombre')!.value).toBe(comprador.nombre)
    expect(fetchMock.calls.allArgs().filter(([url]) => String(url).endsWith('/pedidos/mis-pedidos')).length).toBe(2)
    confirmar = confirmarNormal
    await enviar()
    await esperarExito()
    expect(solicitudes.length).toBe(2)
    expect(pedidos.length).toBe(1)
  })
})
