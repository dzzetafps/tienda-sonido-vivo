import {
  apiFetch,
  establecerToken,
  obtenerVersionSesion,
  ErrorApi,
} from './api'

import type {
  RolUsuario,
  Usuario,
} from '../tipos/Usuario'

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

// Registrar un nuevo cliente
export async function registrar(
  datos: RegistroRequest,
): Promise<RegistroResponse> {
  return apiFetch<RegistroResponse>('/auth/registro', {
    method: 'POST',
    body: JSON.stringify({
      ...datos,
      fechaNacimiento: datos.fechaNacimiento || null,
    }),
  })
}

// Iniciar sesion
export async function iniciarSesion(
  datos: LoginRequest,
): Promise<LoginResponse> {
  establecerToken(null)

  const version = obtenerVersionSesion()

  // Esperar una renovacion anterior antes de iniciar otra sesion
  if (renovacionPendiente) {
    await renovacionPendiente.catch(() => undefined)
  }

  if (obtenerVersionSesion() !== version) {
    throw new ErrorApi('La sesión ha cambiado.', 401)
  }

  const respuesta = await apiFetch<LoginResponse>(
    '/auth/login',
    {
      method: 'POST',
      headers: headersCsrf,
      body: JSON.stringify(datos),
    },
  )

  if (obtenerVersionSesion() !== version) {
    throw new ErrorApi('La sesión ha cambiado.', 401)
  }

  establecerToken(respuesta.accessToken)

  return respuesta
}

// Renovar mediante la cookie HttpOnly
export function renovarSesion(): Promise<LoginResponse> {
  if (renovacionPendiente) {
    return renovacionPendiente
  }

  const version = obtenerVersionSesion()

  renovacionPendiente = apiFetch<LoginResponse>(
    '/auth/refresh',
    {
      method: 'POST',
      headers: headersCsrf,
    },
  )
    .then((respuesta) => {
      if (obtenerVersionSesion() !== version) {
        throw new ErrorApi(
          'La sesión fue cerrada o modificada.',
          401,
        )
      }

      establecerToken(respuesta.accessToken)

      return respuesta
    })
    .finally(() => {
      renovacionPendiente = null
    })

  return renovacionPendiente
}

// Consultar los datos del usuario autenticado
export async function obtenerUsuarioActual(): Promise<Usuario> {
  return apiFetch<Usuario>('/auth/me')
}

// Cerrar la sesion
export async function cerrarSesion(): Promise<void> {
  // Invalidar inmediatamente las peticiones anteriores
  establecerToken(null)

  const version = obtenerVersionSesion()

  // Esperar una posible rotacion de la cookie
  if (renovacionPendiente) {
    await renovacionPendiente.catch(() => undefined)
  }

  if (obtenerVersionSesion() !== version) {
    throw new ErrorApi('La sesión ha cambiado.', 401)
  }

  await apiFetch<void>('/auth/logout', {
    method: 'POST',
    headers: headersCsrf,
  })
}