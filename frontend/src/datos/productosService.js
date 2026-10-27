import { productos as productosIniciales } from './productos.js'

/** @typedef {import('../tipos/Producto').Producto} Producto */

const CLAVE_PRODUCTOS = 'sonido-vivo-ep2-productos'

/**
 * @param {unknown} producto
 * @returns {asserts producto is Producto}
 */
function validarProducto(producto) {
  if (!producto || typeof producto !== 'object') {
    throw new Error('El producto debe ser un objeto.')
  }

  const campos = ['codigo', 'categoria', 'nombre', 'marca', 'modelo', 'descripcion', 'imagen']
  const datos = /** @type {Record<string, unknown>} */ (producto)
  for (const campo of campos) {
    if (typeof datos[campo] !== 'string' || !datos[campo].trim()) {
      throw new Error(`El campo ${campo} es obligatorio y debe ser texto.`)
    }
  }

  if (typeof datos.stock !== 'number' || !Number.isInteger(datos.stock) || datos.stock < 0) {
    throw new Error('El stock debe ser un número entero mayor o igual a cero.')
  }
  if (typeof datos.precio !== 'number' || !Number.isFinite(datos.precio) || datos.precio < 0) {
    throw new Error('El precio debe ser un número finito mayor o igual a cero.')
  }
  if (datos.codigo !== /** @type {string} */ (datos.codigo).trim()) {
    throw new Error('El código no debe tener espacios al inicio ni al final.')
  }
}

/** @returns {Producto[]} */
export function obtenerProductos() {
  /** @type {string | null} */
  let guardados
  try {
    guardados = localStorage.getItem(CLAVE_PRODUCTOS)
  } catch {
    throw new Error('No se pudo acceder al almacenamiento local. Revisa los permisos del navegador.')
  }

  // Sin cambios guardados, devolver copias para no modificar el catálogo original.
  if (guardados === null) return productosIniciales.map((producto) => ({ ...producto }))

  try {
    /** @type {unknown} */
    const productos = JSON.parse(guardados)
    if (!Array.isArray(productos)) throw new Error('El catálogo debe ser una lista.')
    productos.forEach(validarProducto)
    if (new Set(productos.map((producto) => producto.codigo)).size !== productos.length) {
      throw new Error('Hay códigos duplicados.')
    }
    return productos
  } catch {
    // No sobrescribir los cambios del usuario si los datos están dañados.
    throw new Error('El catálogo guardado no es válido. Revisa los datos de LocalStorage antes de continuar.')
  }
}

/**
 * @param {Producto[]} productos
 * @returns {void}
 */
function guardarProductos(productos) {
  try {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos))
  } catch {
    throw new Error('No se pudieron guardar los productos. Revisa el espacio y los permisos del navegador.')
  }
}

/**
 * @param {string} codigo
 * @returns {Producto | undefined}
 */
export function buscarProductoPorCodigo(codigo) {
  return obtenerProductos().find((producto) => producto.codigo === codigo)
}

/**
 * @param {Producto} producto
 * @returns {Producto}
 */
export function crearProducto(producto) {
  validarProducto(producto)
  const productos = obtenerProductos()
  if (productos.some((actual) => actual.codigo === producto.codigo)) {
    throw new Error('Ya existe un producto con ese código.')
  }
  guardarProductos([...productos, producto])
  return { ...producto }
}

/**
 * @param {string} codigo
 * @param {Producto} producto
 * @returns {Producto}
 */
export function actualizarProducto(codigo, producto) {
  validarProducto(producto)
  if (producto.codigo !== codigo) throw new Error('No se puede cambiar el código de un producto.')

  const productos = obtenerProductos()
  const indice = productos.findIndex((actual) => actual.codigo === codigo)
  if (indice === -1) throw new Error('El producto no existe.')

  productos[indice] = { ...producto }
  guardarProductos(productos)
  return { ...producto }
}

/**
 * @param {string} codigo
 * @returns {void}
 */
export function eliminarProducto(codigo) {
  const productos = obtenerProductos()
  if (!productos.some((producto) => producto.codigo === codigo)) {
    throw new Error('El producto no existe.')
  }
  guardarProductos(productos.filter((producto) => producto.codigo !== codigo))
}
