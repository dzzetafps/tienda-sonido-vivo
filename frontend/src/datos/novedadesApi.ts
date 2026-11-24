import { apiFetch } from './api'

export interface Novedad {
  id: number
  titulo: string
  descripcion: string
  tipo: 'NOVEDAD' | 'PROMOCION' | 'DESTACADO'
  imagen: string
  codigoProducto: string | null
  fechaInicio: string
  fechaFin: string | null
  activo: boolean
}

export function obtenerNovedades(): Promise<Novedad[]> {
  return apiFetch<Novedad[]>('/novedades')
}

export function obtenerNovedadesActivas(): Promise<Novedad[]> {
  return apiFetch<Novedad[]>('/novedades/activas')
}

export function crearNovedad(
  novedad: Omit<Novedad, 'id'>,
): Promise<Novedad> {
  return apiFetch<Novedad>('/novedades', {
    method: 'POST',
    body: JSON.stringify(novedad),
  })
}

export function actualizarNovedad(
  id: number,
  novedad: Omit<Novedad, 'id'>,
): Promise<Novedad> {
  return apiFetch<Novedad>(`/novedades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(novedad),
  })
}

export function cambiarEstadoNovedad(
  id: number,
  activo: boolean,
): Promise<Novedad> {
  return apiFetch<Novedad>(
    `/novedades/${id}/estado?activo=${activo}`,
    { method: 'PATCH' },
  )
}

export function eliminarNovedad(id: number): Promise<void> {
  return apiFetch<void>(`/novedades/${id}`, {
    method: 'DELETE',
  })
}