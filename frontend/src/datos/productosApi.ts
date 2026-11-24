import { apiFetch } from './api'
import type { Producto } from '../tipos/Producto'

export interface Categoria {
  id: number
  nombre: string
  descripcion: string
}

export function obtenerProductos(): Promise<Producto[]> {
  return apiFetch<Producto[]>('/productos')
}

export function buscarProductoPorCodigo(codigo: string): Promise<Producto> {
  return apiFetch<Producto>(
    `/productos/${encodeURIComponent(codigo)}`,
  )
}

export function crearProducto(producto: Producto): Promise<Producto> {
  return apiFetch<Producto>('/productos', {
    method: 'POST',
    body: JSON.stringify(producto),
  })
}

export function actualizarProducto(
  codigo: string,
  producto: Producto,
): Promise<Producto> {
  return apiFetch<Producto>(
    `/productos/${encodeURIComponent(codigo)}`,
    {
      method: 'PUT',
      body: JSON.stringify(producto),
    },
  )
}

export function eliminarProducto(codigo: string): Promise<void> {
  return apiFetch<void>(
    `/productos/${encodeURIComponent(codigo)}`,
    {
      method: 'DELETE',
    },
  )
}

export function obtenerCategorias(): Promise<Categoria[]> {
  return apiFetch<Categoria[]>('/categorias')
}