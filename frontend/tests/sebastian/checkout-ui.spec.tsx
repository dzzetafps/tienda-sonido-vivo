import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import Checkout from '../../src/paginas/Checkout'
import CompraExitosa from '../../src/paginas/CompraExitosa'
import { agregarProductoAlCarrito, obtenerCarrito } from '../../src/datos/carritoService.js'
import { buscarProductoPorCodigo, obtenerProductos } from '../../src/datos/productosService.js'
import { buscarPedidoPorId, cambiarEstadoPedido, crearPedido, obtenerPedidos } from '../../src/datos/pedidosService.js'
import { obtenerSesion, obtenerUsuarios } from '../../src/datos/usuariosService.js'
import type { Pedido } from '../../src/tipos/Pedido'
import type { Producto } from '../../src/tipos/Producto'

const CLAVE_PEDIDOS = 'sonido-vivo-ep2-pedidos'
const CLAVE_PRODUCTOS = 'sonido-vivo-ep2-productos'
const CLAVE_CARRITO = 'sonido-vivo-ep2-carrito'
const cantidad = 2
const comprador = { nombre: 'Cliente', apellido: 'Demostración', correo: 'compra@sonidovivo.example' }
const entrega: Pedido['entrega'] = {
  tipo: 'despacho', calle: 'Calle ficticia', numero: '100', complemento: '',
  region: 'Región de Valparaíso', comuna: 'Valparaíso', indicaciones: '',
}
const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP', maximumFractionDigits: 0,
})

function RutaActual() {
  const ubicacion = useLocation()
  return <output id="ruta-prueba">{ubicacion.pathname + ubicacion.search}</output>
}

describe('Sebastián — Checkout y CompraExitosa', () => {
  let almacen: Record<string, string>
  let contenedor: HTMLDivElement
  let root: Root
  let producto: Producto

  beforeEach(() => {
    almacen = {}
    spyOn(Storage.prototype, 'getItem').and.callFake((clave: string) => almacen[clave] ?? null)
    spyOn(Storage.prototype, 'setItem').and.callFake((clave: string, valor: string) => {
      almacen[clave] = valor
    })
    spyOn(Storage.prototype, 'removeItem').and.callFake((clave: string) => {
      delete almacen[clave]
    })
    contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    root = createRoot(contenedor)
    const disponible = obtenerProductos().find((actual) => actual.stock >= cantidad)
    if (!disponible) throw new Error('Se necesita un producto del catálogo con stock suficiente.')
    producto = disponible
    agregarProductoAlCarrito(producto.codigo, cantidad)
  })

  afterEach(async () => {
    try {
      await act(async () => root.unmount())
    } finally {
      contenedor.remove()
    }
  })

  async function montar(ruta = '/checkout') {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[ruta]}>
          <RutaActual />
          <Routes>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/compra-exitosa" element={<CompraExitosa />} />
          </Routes>
        </MemoryRouter>,
      )
    })
  }

  async function volverAMontar(ruta: string) {
    await act(async () => root.unmount())
    root = createRoot(contenedor)
    await montar(ruta)
  }

  async function cambiarCampo(id: string, valor: string) {
    await act(async () => {
      const control = contenedor.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`#${id}`)!
      const prototipo = control instanceof HTMLSelectElement ? HTMLSelectElement.prototype
        : control instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
      // El setter nativo permite que React detecte el cambio del campo controlado.
      Object.getOwnPropertyDescriptor(prototipo, 'value')!.set!.call(control, valor)
      control.dispatchEvent(new Event(control instanceof HTMLSelectElement ? 'change' : 'input', { bubbles: true }))
    })
  }

  async function completarFormulario(tipo: 'despacho' | 'retiro' = 'despacho') {
    for (const [campo, valor] of Object.entries(comprador)) await cambiarCampo(campo, valor)
    await cambiarCampo('entrega', tipo)
    if (tipo === 'despacho') {
      for (const campo of ['calle', 'numero', 'region', 'comuna'] as const) {
        await cambiarCampo(campo, entrega[campo])
      }
    }
  }

  async function enviar() {
    await act(async () => {
      contenedor.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
  }

  function rutaActual() {
    return contenedor.querySelector('#ruta-prueba')!.textContent
  }

  function comprobarPedidoVisible(pedido: Pedido) {
    expect(contenedor.querySelector('#titulo-compra-exitosa')).not.toBeNull()
    expect(contenedor.textContent).toContain(pedido.id)
    expect(contenedor.textContent).toContain(`${pedido.comprador.nombre} ${pedido.comprador.apellido}`)
    expect(contenedor.textContent).toContain(pedido.comprador.correo)
    expect(contenedor.textContent).toContain(pedido.entrega.tipo === 'retiro' ? 'Retiro en tienda' : 'Despacho a domicilio')
    if (pedido.entrega.tipo === 'despacho') {
      expect(contenedor.textContent).toContain(`${pedido.entrega.calle} ${pedido.entrega.numero}`)
      expect(contenedor.textContent).toContain(`${pedido.entrega.comuna}, ${pedido.entrega.region}`)
    }
    const filas = Array.from(contenedor.querySelectorAll('tbody tr'), (fila) =>
      Array.from(fila.querySelectorAll('th, td'), (celda) => celda.textContent),
    )
    expect(filas).toEqual(pedido.items.map((item) => [
      item.nombre, String(item.cantidad), formatoPrecio.format(item.precioUnitario),
      formatoPrecio.format(item.precioUnitario * item.cantidad),
    ]))
    expect(contenedor.querySelector('tfoot td')?.textContent).toBe(formatoPrecio.format(pedido.total))
  }

  it('Muestra el resumen y valida campos obligatorios sin modificar pedido, stock ni carrito', async () => {
    await montar()
    expect(contenedor.querySelector('aside')?.textContent).toContain(producto.nombre)
    expect(contenedor.querySelector('aside')?.textContent).toContain(formatoPrecio.format(producto.precio * cantidad))
    await cambiarCampo('entrega', 'retiro')
    expect(contenedor.querySelector('#calle')).toBeNull()
    await cambiarCampo('entrega', 'despacho')
    expect(contenedor.querySelector('#calle')).not.toBeNull()
    const anteriores = { ...almacen }

    await enviar()

    for (const campo of ['nombre', 'apellido', 'correo', 'calle', 'numero', 'region', 'comuna']) {
      expect(contenedor.querySelector(`#error-${campo}`)?.textContent).toBeTruthy()
      expect(contenedor.querySelector(`#${campo}`)?.getAttribute('aria-invalid')).toBe('true')
    }
    expect(contenedor.querySelector('[role="alert"]')?.textContent).toContain('Revisa los campos')
    expect(rutaActual()).toBe('/checkout')
    expect(obtenerPedidos()).toEqual([])
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock)
    expect(obtenerCarrito()).toEqual([{ codigo: producto.codigo, cantidad }])
    expect(almacen).toEqual(anteriores)
  })

  it('Confirma un despacho con sesión válida y muestra el pedido real después de navegar', async () => {
    const cliente = obtenerUsuarios().find((usuario) => usuario.rol === 'cliente' && usuario.activo)!
    almacen['sonido-vivo-ep2-sesion'] = JSON.stringify({ usuarioId: cliente.id, rol: cliente.rol })
    expect(obtenerSesion()?.usuarioId).toBe(cliente.id)
    await montar()
    await completarFormulario()

    await enviar()

    const pedidos = obtenerPedidos()
    expect(pedidos.length).toBe(1)
    const pedido = pedidos[0]
    expect(pedido.usuarioId).toBe(cliente.id)
    expect(pedido.comprador).toEqual(comprador)
    expect(pedido.entrega).toEqual(entrega)
    expect(pedido.total).toBe(producto.precio * cantidad)
    expect(JSON.parse(almacen[CLAVE_PEDIDOS])).toEqual([pedido])
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock - cantidad)
    expect(obtenerCarrito()).toEqual([])
    expect(rutaActual()).toBe(`/compra-exitosa?pedido=${pedido.id}`)
    comprobarPedidoVisible(pedido)
  })

  it('Confirma retiro como invitado sin dirección y muestra su total', async () => {
    expect(obtenerSesion()).toBeNull()
    await montar()
    await completarFormulario('retiro')
    expect(contenedor.querySelector('#calle')).toBeNull()

    await enviar()

    const pedidos = obtenerPedidos()
    expect(pedidos.length).toBe(1)
    const pedido = pedidos[0]
    expect(pedido.usuarioId).toBeNull()
    expect(pedido.entrega).toEqual({ tipo: 'retiro', calle: '', numero: '', complemento: '', region: '', comuna: '', indicaciones: '' })
    expect(pedido.total).toBe(producto.precio * cantidad)
    expect(obtenerCarrito()).toEqual([])
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock - cantidad)
    expect(rutaActual()).toBe(`/compra-exitosa?pedido=${pedido.id}`)
    comprobarPedidoVisible(pedido)
  })

  it('Bloquea dos envíos consecutivos antes del render y registra una sola compra', async () => {
    await montar()
    await completarFormulario()
    const formulario = contenedor.querySelector('form')!
    const lecturas = Storage.prototype.getItem as jasmine.Spy

    await act(async () => {
      formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      const lecturasTrasConfirmar = lecturas.calls.count()
      expect(contenedor.querySelector('#titulo-checkout')).not.toBeNull()
      formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      expect(lecturas.calls.count()).toBe(lecturasTrasConfirmar)
    })

    const pedidos = obtenerPedidos()
    expect(pedidos.length).toBe(1)
    expect(JSON.parse(almacen[CLAVE_PEDIDOS])).toEqual(pedidos)
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock - cantidad)
    expect(obtenerCarrito()).toEqual([])
    expect(rutaActual()).toBe(`/compra-exitosa?pedido=${pedidos[0].id}`)
    expect(contenedor.querySelectorAll('#titulo-compra-exitosa').length).toBe(1)
  })

  it('Muestra un fallo recuperable, restaura los datos y permite confirmar al reintentar', async () => {
    await montar()
    await completarFormulario()
    const anteriores = { ...almacen }
    let provocarFallo = true
    let guardadoParcial = false
    const escritura = Storage.prototype.setItem as jasmine.Spy
    escritura.and.callFake((clave: string, valor: string) => {
      if (clave === CLAVE_CARRITO && provocarFallo) {
        guardadoParcial = JSON.parse(almacen[CLAVE_PEDIDOS]).length === 1 &&
          (JSON.parse(almacen[CLAVE_PRODUCTOS]) as Producto[])
            .find((actual) => actual.codigo === producto.codigo)?.stock === producto.stock - cantidad
        throw new Error('Fallo de escritura simulado.')
      }
      almacen[clave] = valor
    })

    await enviar()

    expect(guardadoParcial).toBeTrue()
    expect(contenedor.querySelector('.alert-danger')?.textContent).toContain('No se confirmó la compra')
    expect(rutaActual()).toBe('/checkout')
    expect(contenedor.querySelector('#titulo-compra-exitosa')).toBeNull()
    expect(obtenerPedidos()).toEqual([])
    expect(almacen).toEqual(anteriores)
    expect(Storage.prototype.removeItem).toHaveBeenCalledWith(CLAVE_PEDIDOS)
    expect(Storage.prototype.removeItem).toHaveBeenCalledWith(CLAVE_PRODUCTOS)
    expect(contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.disabled).toBeFalse()
    expect(contenedor.querySelectorAll('fieldset:disabled').length).toBe(0)

    provocarFallo = false
    await enviar()

    const pedidos = obtenerPedidos()
    expect(pedidos.length).toBe(1)
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock - cantidad)
    expect(obtenerCarrito()).toEqual([])
    expect(rutaActual()).toBe(`/compra-exitosa?pedido=${pedidos[0].id}`)
    comprobarPedidoVisible(pedidos[0])
  })

  it('Recupera el pedido por ID al remontar y rechaza accesos sin pedido válido o cancelados', async () => {
    const pedido = crearPedido({ usuarioId: null, comprador, entrega })
    const ruta = `/compra-exitosa?pedido=${pedido.id}`
    const anteriores = { ...almacen }

    await montar(ruta)
    comprobarPedidoVisible(pedido)
    await volverAMontar(ruta)
    comprobarPedidoVisible(pedido)
    expect(buscarPedidoPorId(pedido.id)).toEqual(pedido)
    expect(obtenerPedidos()).toEqual([pedido])
    expect(almacen).toEqual(anteriores)

    for (const acceso of ['/compra-exitosa', '/compra-exitosa?pedido=inexistente']) {
      await volverAMontar(acceso)
      expect(contenedor.textContent).toContain('No hay una compra confirmada disponible.')
      expect(contenedor.querySelector('#titulo-compra-exitosa')).toBeNull()
      expect(almacen).toEqual(anteriores)
    }

    const cancelado = cambiarEstadoPedido(pedido.id, 'cancelado')
    const despuesDeCancelar = { ...almacen }
    await volverAMontar(ruta)
    expect(contenedor.textContent).toContain('No hay una compra confirmada disponible.')
    expect(contenedor.querySelector('#titulo-compra-exitosa')).toBeNull()
    expect(obtenerPedidos()).toEqual([cancelado])
    expect(almacen).toEqual(despuesDeCancelar)
  })
})
