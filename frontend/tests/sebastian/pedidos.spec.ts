import {
  buscarPedidoPorId,
  cambiarEstadoPedido,
  crearPedido,
  obtenerPedidos,
} from '../../src/datos/pedidosService.js'
import { agregarProductoAlCarrito, obtenerCarrito } from '../../src/datos/carritoService.js'
import { actualizarProducto, buscarProductoPorCodigo, obtenerProductos } from '../../src/datos/productosService.js'
import type { EstadoPedido, Pedido } from '../../src/tipos/Pedido'
import type { Producto } from '../../src/tipos/Producto'

const CLAVE_PEDIDOS = 'sonido-vivo-ep2-pedidos'
const CLAVE_PRODUCTOS = 'sonido-vivo-ep2-productos'
const CLAVE_CARRITO = 'sonido-vivo-ep2-carrito'
const cantidad = 2

describe('Sebastián — pedidos y confirmación de compras', () => {
  let almacen: Record<string, string>
  let producto: Producto
  let datos: Pick<Pedido, 'usuarioId' | 'comprador' | 'entrega'>

  beforeEach(() => {
    almacen = {}
    spyOn(Storage.prototype, 'getItem').and.callFake((clave: string) => almacen[clave] ?? null)
    spyOn(Storage.prototype, 'setItem').and.callFake((clave: string, valor: string) => {
      almacen[clave] = valor
    })
    spyOn(Storage.prototype, 'removeItem').and.callFake((clave: string) => {
      delete almacen[clave]
    })
    const disponible = obtenerProductos().find((actual) => actual.stock >= cantidad)
    if (!disponible) throw new Error('El catálogo necesita un producto con stock suficiente para estas pruebas.')
    producto = disponible
    datos = {
      usuarioId: 'cliente-prueba',
      comprador: { nombre: 'Cliente', apellido: 'Demostración', correo: 'compra@sonidovivo.example' },
      entrega: {
        tipo: 'despacho', calle: 'Calle ficticia', numero: '100', complemento: 'Local de prueba',
        region: 'Región de Valparaíso', comuna: 'Valparaíso', indicaciones: 'Entrada principal',
      },
    }
  })

  it('Devuelve pedidos vacíos y undefined al buscar un ID inexistente', () => {
    expect(obtenerPedidos()).toEqual([])
    expect(buscarPedidoPorId('pedido-inexistente')).toBeUndefined()
    expect(almacen).toEqual({})
    expect(Storage.prototype.setItem).not.toHaveBeenCalled()
    expect(Storage.prototype.removeItem).not.toHaveBeenCalled()
  })

  it('Confirma un despacho con el precio vigente, guarda el pedido y actualiza stock y carrito', () => {
    agregarProductoAlCarrito(producto.codigo, cantidad)
    const vigente = actualizarProducto(producto.codigo, { ...producto, precio: producto.precio + 1 })

    const pedido = crearPedido(datos)

    expect(pedido.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    expect(new Date(pedido.fecha).toISOString()).toBe(pedido.fecha)
    expect(pedido.estado).toBe('pagado')
    expect(pedido.usuarioId).toBe(datos.usuarioId)
    expect(pedido.comprador).toEqual(datos.comprador)
    expect(pedido.entrega).toEqual(datos.entrega)
    expect(pedido.items).toEqual([{
      codigo: vigente.codigo, nombre: vigente.nombre, cantidad, precioUnitario: vigente.precio,
    }])
    expect(pedido.total).toBe(vigente.precio * cantidad)
    expect(JSON.parse(almacen[CLAVE_PEDIDOS])).toEqual([pedido])
    expect(obtenerPedidos()).toEqual([pedido])
    expect(buscarPedidoPorId(pedido.id)).toEqual(pedido)
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock - cantidad)
    expect(obtenerCarrito()).toEqual([])
    expect(JSON.parse(almacen[CLAVE_CARRITO])).toEqual([])
  })

  it('Confirma un retiro de invitado con dirección vacía y actualiza inventario y carrito', () => {
    agregarProductoAlCarrito(producto.codigo, cantidad)
    datos.usuarioId = null
    datos.entrega.tipo = 'retiro'

    const pedido = crearPedido(datos)

    expect(pedido.usuarioId).toBeNull()
    expect(pedido.entrega).toEqual({
      tipo: 'retiro', calle: '', numero: '', complemento: '', region: '', comuna: '', indicaciones: '',
    })
    expect(pedido.items).toEqual([{
      codigo: producto.codigo, nombre: producto.nombre, cantidad, precioUnitario: producto.precio,
    }])
    expect(pedido.total).toBe(producto.precio * cantidad)
    expect(JSON.parse(almacen[CLAVE_PEDIDOS])).toEqual([pedido])
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock - cantidad)
    expect(obtenerCarrito()).toEqual([])
    expect(JSON.parse(almacen[CLAVE_CARRITO])).toEqual([])
  })

  it('Rechaza carrito vacío y datos inválidos sin crear pedidos ni modificar existencias', () => {
    const antesSinCarrito = { ...almacen }
    expect(() => crearPedido(datos)).toThrowError(/carrito está vacío/)
    expect(obtenerPedidos()).toEqual([])
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock)
    expect(obtenerCarrito()).toEqual([])
    expect(almacen).toEqual(antesSinCarrito)

    agregarProductoAlCarrito(producto.codigo, cantidad)
    const antesConCarrito = { ...almacen }
    const casosInvalidos = [
      { ...datos, comprador: { ...datos.comprador, nombre: '' } },
      { ...datos, comprador: { ...datos.comprador, apellido: '' } },
      { ...datos, comprador: { ...datos.comprador, correo: 'correo-invalido' } },
      { ...datos, entrega: { ...datos.entrega, calle: '' } },
    ]
    for (const caso of casosInvalidos) {
      expect(() => crearPedido(caso)).toThrowError()
      expect(obtenerPedidos()).toEqual([])
      expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock)
      expect(obtenerCarrito()).toEqual([{ codigo: producto.codigo, cantidad }])
      expect(almacen).toEqual(antesConCarrito)
    }
  })

  it('Rechaza stock insuficiente tras agregar al carrito y conserva los datos para corregirlos', () => {
    agregarProductoAlCarrito(producto.codigo, cantidad)
    actualizarProducto(producto.codigo, { ...producto, stock: cantidad - 1 })
    const anteriores = { ...almacen }

    expect(() => crearPedido(datos)).toThrowError(/stock/)

    expect(obtenerPedidos()).toEqual([])
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(cantidad - 1)
    expect(obtenerCarrito()).toEqual([{ codigo: producto.codigo, cantidad }])
    expect(almacen).toEqual(anteriores)
  })

  it('Informa pedidos dañados e impide la compra sin sobrescribirlos', () => {
    agregarProductoAlCarrito(producto.codigo, cantidad)
    for (const guardado of ['{json-invalido', '{"pedidos":[]}']) {
      almacen[CLAVE_PEDIDOS] = guardado
      const anteriores = { ...almacen }

      expect(() => obtenerPedidos()).toThrowError(/pedidos guardados no son válidos/)
      expect(() => crearPedido(datos)).toThrowError(/pedidos guardados no son válidos/)

      expect(almacen[CLAVE_PEDIDOS]).toBe(guardado)
      expect(almacen).toEqual(anteriores)
      expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock)
      expect(obtenerCarrito()).toEqual([{ codigo: producto.codigo, cantidad }])
    }
  })

  it('Restaura las tres claves cuando falla el vaciado del carrito después de guardar pedido y stock', () => {
    almacen[CLAVE_PEDIDOS] = '[ ]'
    almacen[CLAVE_PRODUCTOS] = JSON.stringify(obtenerProductos(), null, 2)
    agregarProductoAlCarrito(producto.codigo, cantidad)
    const anteriores = { ...almacen }
    let falloSimulado = false
    let guardadoParcial = false
    const escritura = Storage.prototype.setItem as jasmine.Spy
    escritura.and.callFake((clave: string, valor: string) => {
      if (clave === CLAVE_CARRITO && !falloSimulado) {
        falloSimulado = true
        const pedidos: Pedido[] = JSON.parse(almacen[CLAVE_PEDIDOS])
        const productos: Producto[] = JSON.parse(almacen[CLAVE_PRODUCTOS])
        guardadoParcial = pedidos.length === 1 &&
          productos.find((actual) => actual.codigo === producto.codigo)?.stock === producto.stock - cantidad
        throw new Error('Fallo de escritura simulado.')
      }
      almacen[clave] = valor
    })

    expect(() => crearPedido(datos)).toThrowError(/No se confirmó la compra.*Se restauraron los valores anteriores/)

    expect(falloSimulado).toBeTrue()
    expect(guardadoParcial).toBeTrue()
    expect(almacen[CLAVE_PEDIDOS]).toBe(anteriores[CLAVE_PEDIDOS])
    expect(almacen[CLAVE_PRODUCTOS]).toBe(anteriores[CLAVE_PRODUCTOS])
    expect(almacen[CLAVE_CARRITO]).toBe(anteriores[CLAVE_CARRITO])
    expect(obtenerPedidos()).toEqual([])
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock)
    expect(obtenerCarrito()).toEqual([{ codigo: producto.codigo, cantidad }])
  })

  it('Evita confirmaciones repetidas y cambia estados sin reponer stock al cancelar', () => {
    agregarProductoAlCarrito(producto.codigo, cantidad)
    const pedido = crearPedido(datos)
    const despuesDeComprar = { ...almacen }

    expect(() => crearPedido(datos)).toThrowError(/carrito está vacío/)
    expect(almacen).toEqual(despuesDeComprar)
    expect(obtenerPedidos()).toEqual([pedido])

    for (const estado of ['enviado', 'entregado'] as const) {
      const actualizado = cambiarEstadoPedido(pedido.id, estado)
      expect(actualizado).toEqual({ ...pedido, estado })
      expect(buscarPedidoPorId(pedido.id)).toEqual(actualizado)
      expect(JSON.parse(almacen[CLAVE_PEDIDOS])).toEqual([actualizado])
    }
    const antesDeEstadoInvalido = { ...almacen }
    expect(() => cambiarEstadoPedido(pedido.id, 'pendiente' as EstadoPedido)).toThrowError(/estado del pedido no es válido/)
    expect(almacen).toEqual(antesDeEstadoInvalido)

    const cancelado = cambiarEstadoPedido(pedido.id, 'cancelado')
    expect(cancelado).toEqual({ ...pedido, estado: 'cancelado' })
    expect(obtenerPedidos()).toEqual([cancelado])
    expect(JSON.parse(almacen[CLAVE_PEDIDOS])).toEqual([cancelado])
    expect(buscarProductoPorCodigo(producto.codigo)?.stock).toBe(producto.stock - cantidad)
    expect(almacen[CLAVE_PRODUCTOS]).toBe(despuesDeComprar[CLAVE_PRODUCTOS])
    expect(obtenerCarrito()).toEqual([])
  })
})
