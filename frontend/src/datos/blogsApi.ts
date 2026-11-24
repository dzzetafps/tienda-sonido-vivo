import { apiFetch } from './api'
import type { Articulo } from '../tipos/Articulo'

export function listarArticulos() {
  return apiFetch<Articulo[]>('/blogs')
}

export function buscarArticulo(id: string) {
  return apiFetch<Articulo>(`/blogs/${encodeURIComponent(id)}`)
}
