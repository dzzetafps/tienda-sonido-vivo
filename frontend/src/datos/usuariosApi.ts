import { apiFetch } from './api'
import type { Usuario } from '../tipos/Usuario'

export type DatosUsuario = Omit<Usuario, 'id' | 'activo' | 'fechaRegistro'> & { contrasena: string }

export function listarUsuarios() {
  return apiFetch<Usuario[]>('/usuarios')
}

export function buscarUsuario(id: string) {
  return apiFetch<Usuario>(`/usuarios/${encodeURIComponent(id)}`)
}

export function crearUsuario(datos: DatosUsuario) {
  return apiFetch<Usuario>('/usuarios', { method: 'POST', body: JSON.stringify(datos) })
}

export function actualizarUsuario(id: string, datos: DatosUsuario) {
  return apiFetch<Usuario>(`/usuarios/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(datos) })
}

export function cambiarEstadoUsuario(id: string, activo: boolean) {
  return apiFetch<Usuario>(`/usuarios/${encodeURIComponent(id)}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  })
}
