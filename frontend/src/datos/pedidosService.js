import { buscarProductoPorCodigo, actualizarProducto } from './productosService.js'
import { obtenerCarrito, validarDisponibilidadCarrito, vaciarCarrito } from './carritoService.js'

/** @typedef {import('../tipos/Pedido').Pedido} Pedido */
/** @typedef {import('../tipos/Pedido').EstadoPedido} EstadoPedido */
/** @typedef {Pick<Pedido, 'usuarioId' | 'comprador' | 'entrega'>} DatosPedido */

const CLAVE_PEDIDOS = 'sonido-vivo-ep2-pedidos'
const CLAVES_COMPRA = [CLAVE_PEDIDOS, 'sonido-vivo-ep2-productos', 'sonido-vivo-ep2-carrito']
const ESTADOS = ['pagado', 'enviado', 'entregado', 'cancelado']
const CAMPOS_DIRECCION = /** @type {const} */ (['calle', 'numero', 'complemento', 'region', 'comuna', 'indicaciones'])

/** @param {unknown} valor @param {string[]} campos @returns {asserts valor is Record<string, unknown>} */
function validarCampos(valor, campos) {
  if (!valor || typeof valor !== 'object' || Array.isArray(valor) ||
    Object.keys(valor).length !== campos.length || campos.some((campo) => !Object.hasOwn(valor, campo))) {
    throw new Error('Los datos deben contener exactamente los campos del contrato de pedidos.')
  }
}

/** @param {unknown} valor @returns {valor is string} */
function esTexto(valor) {
  return typeof valor === 'string' && valor.trim().length > 0
}

/** @param {unknown} datos @returns {asserts datos is DatosPedido} */
function validarDatos(datos) {
  validarCampos(datos, ['usuarioId', 'comprador', 'entrega'])
  if (datos.usuarioId !== null && (!esTexto(datos.usuarioId) || datos.usuarioId !== datos.usuarioId.trim())) {
    throw new Error('El usuarioId debe ser un texto no vacío sin espacios en sus extremos, o null.')
  }
  validarCampos(datos.comprador, ['nombre', 'apellido', 'correo'])
  const comprador = datos.comprador
  if (!esTexto(comprador.nombre) || !esTexto(comprador.apellido)) {
    throw new Error('El nombre y el apellido del comprador son obligatorios.')
  }
  if (!esTexto(comprador.correo) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(comprador.correo.trim())) {
    throw new Error('El correo del comprador no es válido.')
  }
  validarCampos(datos.entrega, ['tipo', ...CAMPOS_DIRECCION])
  const entrega = datos.entrega
  if (entrega.tipo !== 'despacho' && entrega.tipo !== 'retiro') {
    throw new Error('La entrega debe ser despacho o retiro.')
  }
  if (CAMPOS_DIRECCION.some((campo) => typeof entrega[campo] !== 'string')) {
    throw new Error('Los campos de dirección deben ser texto; los opcionales pueden estar vacíos.')
  }
  if (entrega.tipo === 'despacho' && ['calle', 'numero', 'region', 'comuna'].some((campo) => !esTexto(entrega[campo]))) {
    throw new Error('Para despacho se requieren calle, número, región y comuna.')
  }
}

/** @param {unknown} estado @returns {asserts estado is EstadoPedido} */
function validarEstado(estado) {
  if (typeof estado !== 'string' || !ESTADOS.includes(estado)) throw new Error('El estado del pedido no es válido.')
}

/** @param {unknown} pedido @returns {asserts pedido is Pedido} */
function validarPedido(pedido) {
  validarCampos(pedido, ['id', 'fecha', 'usuarioId', 'comprador', 'entrega', 'items', 'total', 'estado'])
  validarDatos({ usuarioId: pedido.usuarioId, comprador: pedido.comprador, entrega: pedido.entrega })
  if (!esTexto(pedido.id) || pedido.id !== pedido.id.trim()) throw new Error('El ID del pedido no es válido.')
  if (typeof pedido.fecha !== 'string' || !Number.isFinite(Date.parse(pedido.fecha)) ||
    new Date(pedido.fecha).toISOString() !== pedido.fecha) throw new Error('La fecha del pedido debe estar en formato ISO.')
  validarEstado(pedido.estado)
  const entrega = /** @type {Pedido['entrega']} */ (pedido.entrega)
  if (entrega.tipo === 'retiro' && CAMPOS_DIRECCION.some((campo) => entrega[campo] !== '')) {
    throw new Error('Un retiro debe tener los campos de dirección vacíos.')
  }
  if (!Array.isArray(pedido.items) || pedido.items.length === 0) throw new Error('El pedido debe contener productos.')
  let total = 0
  const codigos = new Set()
  for (const item of pedido.items) {
    validarCampos(item, ['codigo', 'nombre', 'cantidad', 'precioUnitario'])
    if (!esTexto(item.codigo) || item.codigo !== item.codigo.trim() || !esTexto(item.nombre) || codigos.has(item.codigo)) {
      throw new Error('Los productos del pedido deben tener código único y nombre válido.')
    }
    if (typeof item.cantidad !== 'number' || !Number.isSafeInteger(item.cantidad) || item.cantidad <= 0 ||
      typeof item.precioUnitario !== 'number' || !Number.isFinite(item.precioUnitario) || item.precioUnitario < 0) {
      throw new Error('La cantidad o el precio del pedido no son válidos.')
    }
    codigos.add(item.codigo)
    total += item.cantidad * item.precioUnitario
  }
  if (!Number.isFinite(total) || pedido.total !== total) throw new Error('El total no coincide con los productos del pedido.')
}

/** @param {Pedido} pedido @returns {Pedido} */
function copiarPedido(pedido) {
  return {
    ...pedido,
    comprador: { ...pedido.comprador },
    entrega: { ...pedido.entrega },
    items: pedido.items.map((item) => ({ ...item })),
  }
}

/** @param {string} clave @returns {string | null} */
function leerTexto(clave) {
  try {
    return localStorage.getItem(clave)
  } catch {
    throw new Error(`No se pudo leer ${clave}. Revisa los permisos del almacenamiento local.`)
  }
}

/** @param {Pedido[]} pedidos */
function guardarPedidos(pedidos) {
  try {
    localStorage.setItem(CLAVE_PEDIDOS, JSON.stringify(pedidos))
  } catch {
    throw new Error('No se pudieron guardar los pedidos. Revisa el espacio y los permisos del navegador.')
  }
}

/** @returns {Pedido[]} */
export function obtenerPedidos() {
  const guardados = leerTexto(CLAVE_PEDIDOS)
  if (guardados === null) return []
  try {
    /** @type {unknown} */
    const pedidos = JSON.parse(guardados)
    if (!Array.isArray(pedidos)) throw new Error('Los pedidos deben ser una lista.')
    pedidos.forEach(validarPedido)
    if (new Set(pedidos.map((pedido) => pedido.id)).size !== pedidos.length) throw new Error('Hay IDs duplicados.')
    return pedidos.map(copiarPedido)
  } catch {
    throw new Error('Los pedidos guardados no son válidos. Revisa LocalStorage; no se han sobrescrito.')
  }
}

/** @param {string} id @returns {Pedido | undefined} */
export function buscarPedidoPorId(id) {
  return obtenerPedidos().find((pedido) => pedido.id === id)
}

/**
 * Confirma una compra simulada. La recuperación es un intento de restauración,
 * no una transacción ni una protección frente a cambios entre pestañas.
 * @param {DatosPedido} datos
 * @returns {Pedido}
 */
export function crearPedido(datos) {
  validarDatos(datos)
  validarDisponibilidadCarrito()
  if (!globalThis.crypto?.randomUUID) throw new Error('Usa HTTPS o localhost para generar el ID de la compra.')
  const id = crypto.randomUUID()
  const fecha = new Date().toISOString()
  const comprador = {
    nombre: datos.comprador.nombre.trim(), apellido: datos.comprador.apellido.trim(),
    correo: datos.comprador.correo.trim().toLowerCase(),
  }
  const entrega = { ...datos.entrega }
  for (const campo of CAMPOS_DIRECCION) entrega[campo] = entrega.tipo === 'retiro' ? '' : entrega[campo].trim()

  const anteriores = CLAVES_COMPRA.map((clave) => ({ clave, valor: leerTexto(clave) }))
  const pedidos = obtenerPedidos()
  if (pedidos.some((pedido) => pedido.id === id)) throw new Error('Ya existe un pedido con el ID generado.')
  const carrito = obtenerCarrito()
  if (carrito.length === 0) throw new Error('El carrito está vacío. Agrega productos antes de comprar.')

  // Releer el catálogo y comprobar cada cantidad justo antes de las escrituras.
  const productos = carrito.map((item) => {
    const producto = buscarProductoPorCodigo(item.codigo)
    if (!producto) throw new Error(`El producto ${item.codigo} no existe en el catálogo.`)
    if (item.cantidad > producto.stock) throw new Error(`Stock insuficiente para ${item.codigo}.`)
    return producto
  })
  const items = carrito.map((item, indice) => ({
    codigo: item.codigo, nombre: productos[indice].nombre,
    cantidad: item.cantidad, precioUnitario: productos[indice].precio,
  }))
  /** @type {Pedido} */
  const pedido = {
    id, fecha, usuarioId: datos.usuarioId, comprador, entrega, items,
    total: items.reduce((total, item) => total + item.cantidad * item.precioUnitario, 0),
    estado: 'pagado',
  }
  validarPedido(pedido)
  if (anteriores.some(({ clave, valor }) => leerTexto(clave) !== valor)) {
    throw new Error('Los datos de la compra cambiaron durante la comprobación. Revisa el carrito y vuelve a intentar.')
  }

  try {
    guardarPedidos([...pedidos, pedido])
    productos.forEach((producto, indice) => {
      actualizarProducto(producto.codigo, { ...producto, stock: producto.stock - items[indice].cantidad })
    })
    vaciarCarrito()
  } catch (error) {
    const fallos = []
    for (const { clave, valor } of anteriores) {
      try {
        if (localStorage.getItem(clave) === valor) continue
        if (valor === null) localStorage.removeItem(clave)
        else localStorage.setItem(clave, valor)
      } catch {
        fallos.push(clave)
      }
    }
    const motivo = error instanceof Error ? error.message : 'Falló una operación de almacenamiento.'
    if (fallos.length > 0) {
      throw new Error(`No se confirmó la compra. ${motivo} No se pudieron restaurar: ${fallos.join(', ')}. Revisa LocalStorage antes de reintentar.`, { cause: error })
    }
    throw new Error(`No se confirmó la compra. ${motivo} Se restauraron los valores anteriores.`, { cause: error })
  }
  return copiarPedido(pedido)
}

/** @param {string} id @param {EstadoPedido} estado @returns {Pedido} */
export function cambiarEstadoPedido(id, estado) {
  validarEstado(estado)
  const pedidos = obtenerPedidos()
  const pedido = pedidos.find((actual) => actual.id === id)
  if (!pedido) throw new Error('El pedido no existe.')
  // Cancelar cambia solo el estado; no repone stock.
  pedido.estado = estado
  guardarPedidos(pedidos)
  return copiarPedido(pedido)
}
