import { apiFetch, establecerToken } from './api'
import type { RolUsuario, Usuario } from '../tipos/Usuario'

export interface LoginRequest {
  correo: string
  contrasena: string
}

export interface LoginResponse {
  accessToken: string
  tokenType: string
  expiresIn: number
  usuarioId: string
  rol: RolUsuario
}

export interface RegistroRequest {
  rut: string
  nombre: string
  apellidos: string
  correo: string
  fechaNacimiento: string
  region: string
  comuna: string
  direccion: string
  contrasena: string
}

export interface RegistroResponse {
  id: string
  nombre: string
  correo: string
  rol: RolUsuario
  mensaje: string
}

const headersCsrf = {
  'X-CSRF-Protection': '1',
}

let renovacionPendiente: Promise<LoginResponse> | null = null

// Registrar un nuevo usuario
export async function registrar(
  datos: RegistroRequest,
): Promise<RegistroResponse> {
  return apiFetch<RegistroResponse>('/auth/registro', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

// Iniciar sesion y guardar el JWT en memoria
export async function iniciarSesion(
  datos: LoginRequest,
): Promise<LoginResponse> {
  establecerToken(null)

  const respuesta = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    headers: headersCsrf,
    body: JSON.stringify(datos),
  })

  establecerToken(respuesta.accessToken)

  return respuesta
}

// Renovar la sesion utilizando la cookie HttpOnly
export function renovarSesion(): Promise<LoginResponse> {
  if (renovacionPendiente) {
    return renovacionPendiente
  }

  establecerToken(null)

  renovacionPendiente = apiFetch<LoginResponse>('/auth/refresh', {
    method: 'POST',
    headers: headersCsrf,
  })
    .then((respuesta) => {
      establecerToken(respuesta.accessToken)
      return respuesta
    })
    .catch((error) => {
      establecerToken(null)
      throw error
    })
    .finally(() => {
      renovacionPendiente = null
    })

  return renovacionPendiente
}

// Obtener los datos del usuario autenticado
export async function obtenerUsuarioActual(): Promise<Usuario> {
  return apiFetch<Usuario>('/auth/me')
}

// Cerrar sesion y eliminar el JWT de memoria
export async function cerrarSesion(): Promise<void> {
  if (renovacionPendiente) {
    await renovacionPendiente.catch(() => undefined)
  }

  establecerToken(null)

  try {
    await apiFetch<void>('/auth/logout', {
      method: 'POST',
      headers: headersCsrf,
    })
  } finally {
    establecerToken(null)
  }
}