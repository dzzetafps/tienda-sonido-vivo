import { buscarProductoPorCodigo } from './productosService.js'

/** @typedef {import('../tipos/ItemCarrito').ItemCarrito} ItemCarrito */

const CLAVE_CARRITO = 'sonido-vivo-ep2-carrito'

/**
 * @param {unknown} cantidad
 * @returns {void}
 */
function validarCantidad(cantidad) {
  if (typeof cantidad !== 'number' || !Number.isSafeInteger(cantidad) || cantidad <= 0) {
    throw new Error('La cantidad debe ser un número entero positivo válido.')
  }
}

/**
 * @param {unknown} item
 * @returns {asserts item is ItemCarrito}
 */
function validarItem(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    throw new Error('Cada elemento del carrito debe ser un objeto.')
  }

  const datos = /** @type {Record<string, unknown>} */ (item)
  if (typeof datos.codigo !== 'string' || !datos.codigo.trim() || datos.codigo !== datos.codigo.trim()) {
    throw new Error('El código debe ser texto no vacío y sin espacios en sus extremos.')
  }
  validarCantidad(datos.cantidad)
}

/**
 * Consulta el catálogo vigente sin modificar su stock.
 * @param {ItemCarrito} item
 * @returns {import('../tipos/Producto').Producto}
 */
function validarDisponibilidad(item) {
  validarItem(item)
  const producto = buscarProductoPorCodigo(item.codigo)
  if (!producto) throw new Error(`El producto ${item.codigo} no existe en el catálogo.`)
  if (item.cantidad > producto.stock) {
    throw new Error(`La cantidad de ${item.codigo} supera el stock disponible (${producto.stock}).`)
  }
  return producto
}

/**
 * Valida los datos guardados antes de cualquier escritura, incluso al vaciar.
 * La disponibilidad se comprueba aparte para poder corregir un stock reducido
 * o eliminar un producto que ya no está en el catálogo.
 * @returns {ItemCarrito[]}
 */
function leerCarrito() {
  /** @type {string | null} */
  let guardado
  try {
    guardado = localStorage.getItem(CLAVE_CARRITO)
  } catch {
    throw new Error('No se pudo leer el carrito. Revisa los permisos del almacenamiento local.')
  }

  if (guardado === null) return []

  try {
    /** @type {unknown} */
    const carrito = JSON.parse(guardado)
    if (!Array.isArray(carrito)) throw new Error('El carrito debe ser una lista.')
    carrito.forEach(validarItem)
    if (new Set(carrito.map((item) => item.codigo)).size !== carrito.length) {
      throw new Error('Hay códigos duplicados en el carrito.')
    }
    return carrito.map((item) => ({ codigo: item.codigo, cantidad: item.cantidad }))
  } catch {
    throw new Error('El carrito guardado no es válido. Revisa los datos de LocalStorage antes de continuar; no se han sobrescrito.')
  }
}

/**
 * Guarda la estructura ya recuperada, sin exigir disponibilidad de otros artículos.
 * @param {ItemCarrito[]} carrito
 * @returns {ItemCarrito[]}
 */
function guardarCarrito(carrito) {
  carrito.forEach(validarItem)
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito))
  } catch {
    throw new Error('No se pudo guardar el carrito. Revisa el espacio y los permisos del navegador.')
  }
  return carrito
}

/**
 * Devuelve el carrito validando su estructura, sin exigir disponibilidad.
 * No elimina ni ajusta automáticamente los datos si el catálogo cambió.
 * @returns {ItemCarrito[]}
 */
export function obtenerCarrito() {
  return leerCarrito()
}

/**
 * Agrega unidades; si el código ya existe, suma la cantidad sin duplicarlo.
 * Valida la cantidad resultante solo para el producto que se agrega.
 * @param {string} codigo
 * @param {number} [cantidad=1]
 * @returns {ItemCarrito[]}
 */
export function agregarProductoAlCarrito(codigo, cantidad = 1) {
  validarItem({ codigo, cantidad })
  const carrito = leerCarrito()
  const existente = carrito.find((item) => item.codigo === codigo)
  const cantidadFinal = existente ? existente.cantidad + cantidad : cantidad
  validarDisponibilidad({ codigo, cantidad: cantidadFinal })
  if (existente) {
    existente.cantidad = cantidadFinal
  } else {
    carrito.push({ codigo, cantidad })
  }
  return guardarCarrito(carrito)
}

/**
 * Reemplaza la cantidad. Para quitar el producto, usar eliminarProductoDelCarrito.
 * Comprueba el stock actual de este producto sin bloquearse por otros artículos.
 * @param {string} codigo
 * @param {number} cantidad
 * @returns {ItemCarrito[]}
 */
export function modificarCantidad(codigo, cantidad) {
  validarItem({ codigo, cantidad })
  const carrito = leerCarrito()
  const item = carrito.find((actual) => actual.codigo === codigo)
  if (!item) throw new Error('El producto no está en el carrito.')
  validarDisponibilidad({ codigo, cantidad })
  item.cantidad = cantidad
  return guardarCarrito(carrito)
}

/**
 * Permite quitar también un producto eliminado del catálogo.
 * @param {string} codigo
 * @returns {ItemCarrito[]}
 */
export function eliminarProductoDelCarrito(codigo) {
  const carrito = leerCarrito()
  if (!carrito.some((item) => item.codigo === codigo)) {
    throw new Error('El producto no está en el carrito.')
  }
  return guardarCarrito(carrito.filter((item) => item.codigo !== codigo))
}

/**
 * Vacía explícitamente un carrito con estructura válida, aunque cambió el catálogo.
 * Rechaza datos dañados para no borrarlos silenciosamente.
 * @returns {ItemCarrito[]}
 */
export function vaciarCarrito() {
  leerCarrito()
  return guardarCarrito([])
}

/**
 * Calcula el subtotal de una línea usando el precio actual del catálogo.
 * No exige stock suficiente ni autoriza una compra. Rechaza productos inexistentes.
 * @param {ItemCarrito} item
 * @returns {number}
 */
export function calcularSubtotal(item) {
  validarItem(item)
  const producto = buscarProductoPorCodigo(item.codigo)
  if (!producto) throw new Error(`El producto ${item.codigo} no existe en el catálogo.`)
  return producto.precio * item.cantidad
}

/**
 * Suma los subtotales del carrito guardado. Sin envío, descuentos ni checkout.
 * No valida disponibilidad; si falta un producto, informa el error sin omitirlo.
 * @returns {number}
 */
export function calcularTotal() {
  return leerCarrito().reduce((total, item) => total + calcularSubtotal(item), 0)
}

/**
 * Comprueba existencia y stock de todos los artículos del carrito guardado.
 * El futuro checkout deberá llamar esta función antes de confirmar una compra
 * y detenerse si lanza un Error. No reserva ni descuenta stock.
 * @returns {void}
 */
export function validarDisponibilidadCarrito() {
  leerCarrito().forEach(validarDisponibilidad)
}
