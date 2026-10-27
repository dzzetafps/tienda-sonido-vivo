import { productos as productosIniciales } from './productos.js'
import type { Producto } from '../tipos/Producto'

const CLAVE_PRODUCTOS = 'sonido-vivo-ep2-productos'

function validarProducto(producto: unknown): asserts producto is Producto {
  if (!producto || typeof producto !== 'object') {
    throw new Error('El producto debe ser un objeto.')
  }

  const campos = ['codigo', 'categoria', 'nombre', 'marca', 'modelo', 'descripcion', 'imagen']
  const datos = producto as Record<string, unknown>
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
  if (datos.codigo !== (datos.codigo as string).trim()) {
    throw new Error('El código no debe tener espacios al inicio ni al final.')
  }
}

export function obtenerProductos(): Producto[] {
  let guardados: string | null
  try {
    guardados = localStorage.getItem(CLAVE_PRODUCTOS)
  } catch {
    throw new Error('No se pudo acceder al almacenamiento local. Revisa los permisos del navegador.')
  }

  // Sin cambios guardados, devolver copias para no modificar el catálogo original.
  if (guardados === null) return productosIniciales.map((producto) => ({ ...producto }))

  try {
    const productos: unknown = JSON.parse(guardados)
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

function guardarProductos(productos: Producto[]): void {
  try {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(productos))
  } catch {
    throw new Error('No se pudieron guardar los productos. Revisa el espacio y los permisos del navegador.')
  }
}

export function buscarProductoPorCodigo(codigo: string): Producto | undefined {
  return obtenerProductos().find((producto) => producto.codigo === codigo)
}

export function crearProducto(producto: Producto): Producto {
  validarProducto(producto)
  const productos = obtenerProductos()
  if (productos.some((actual) => actual.codigo === producto.codigo)) {
    throw new Error('Ya existe un producto con ese código.')
  }
  guardarProductos([...productos, producto])
  return { ...producto }
}

export function actualizarProducto(codigo: string, producto: Producto): Producto {
  validarProducto(producto)
  if (producto.codigo !== codigo) throw new Error('No se puede cambiar el código de un producto.')

  const productos = obtenerProductos()
  const indice = productos.findIndex((actual) => actual.codigo === codigo)
  if (indice === -1) throw new Error('El producto no existe.')

  productos[indice] = { ...producto }
  guardarProductos(productos)
  return { ...producto }
}

export function eliminarProducto(codigo: string): void {
  const productos = obtenerProductos()
  if (!productos.some((producto) => producto.codigo === codigo)) {
    throw new Error('El producto no existe.')
  }
  guardarProductos(productos.filter((producto) => producto.codigo !== codigo))
}
