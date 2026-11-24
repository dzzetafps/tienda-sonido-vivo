import { apiFetch } from './api'
import type { Producto } from '../tipos/Producto'

export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
}

export type DatosCategoria = Pick<Categoria, 'nombre' | 'descripcion'>

export interface FilaCategoria extends Categoria {
  productos: number
  stock: number
  valor: number
}

export function listarCategorias() {
  return apiFetch<Categoria[]>('/categorias')
}

export function crearCategoria(datos: DatosCategoria) {
  return apiFetch<Categoria>('/categorias', { method: 'POST', body: JSON.stringify(datos) })
}

export function actualizarCategoria(id: number, datos: DatosCategoria) {
  return apiFetch<Categoria>(`/categorias/${id}`, { method: 'PUT', body: JSON.stringify(datos) })
}

export function eliminarCategoria(id: number) {
  return apiFetch<void>(`/categorias/${id}`, { method: 'DELETE' })
}

// ms-productos envía el precio como BigDecimal: se pasa a number para sumar el inventario.
export async function listarProductosCatalogo(): Promise<Producto[]> {
  const productos = await apiFetch<Producto[]>('/productos')
  return productos.map((producto) => ({ ...producto, precio: Number(producto.precio), stock: Number(producto.stock) }))
}

// Une cada categoría de la API con sus productos (ProductoDTO trae el nombre de la categoría).
export function combinarCategorias(categorias: Categoria[], productos: Producto[]): FilaCategoria[] {
  return categorias
    .map((categoria) => {
      const nombre = categoria.nombre.toLocaleLowerCase('es-CL')
      const propios = productos.filter((producto) => producto.categoria.toLocaleLowerCase('es-CL') === nombre)
      return {
        ...categoria,
        productos: propios.length,
        stock: propios.reduce((total, producto) => total + producto.stock, 0),
        valor: propios.reduce((total, producto) => total + producto.precio * producto.stock, 0),
      }
    })
    .sort((primera, segunda) => primera.nombre.localeCompare(segunda.nombre, 'es'))
}
