import { obtenerProductos } from './productosService.js'
import type { Producto } from '../tipos/Producto'

export interface ResumenCategoria {
  categoria: string
  productos: number
  stock: number
  valor: number
}

export function leerCatalogo(): { productos: Producto[]; error: string } {
  try {
    return { productos: obtenerProductos(), error: '' }
  } catch (error) {
    return { productos: [], error: error instanceof Error ? error.message : 'No se pudo cargar el catálogo.' }
  }
}

export function resumirCategorias(productos: Producto[]): ResumenCategoria[] {
  const resumen = new Map<string, ResumenCategoria>()

  for (const producto of productos) {
    const actual = resumen.get(producto.categoria) ?? { categoria: producto.categoria, productos: 0, stock: 0, valor: 0 }
    actual.productos += 1
    actual.stock += producto.stock
    actual.valor += producto.precio * producto.stock
    resumen.set(producto.categoria, actual)
  }

  return [...resumen.values()].sort((primera, segunda) => primera.categoria.localeCompare(segunda.categoria, 'es'))
}

export function productosConStockBajo(productos: Producto[], limite: number): Producto[] {
  return productos
    .filter((producto) => producto.stock <= limite)
    .sort((primero, segundo) => primero.stock - segundo.stock || primero.nombre.localeCompare(segundo.nombre, 'es'))
}

export function calcularValorInventario(productos: Producto[]): number {
  return productos.reduce((total, producto) => total + producto.precio * producto.stock, 0)
}
