export const API_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:8080/api'

let token: string | null = null

// el login guarda aquí el access token (solo en memoria, no en localStorage)
export function establecerToken(nuevo: string | null) {
  token = nuevo
}

export function obtenerToken() {
  return token
}

export class ErrorApi extends Error {
  estado: number

  constructor(mensaje: string, estado: number) {
    super(mensaje)
    this.estado = estado
  }
}

function mensajePorEstado(estado: number) {
  if (estado === 401) return 'Debes iniciar sesión para continuar.'
  if (estado === 403) return 'No tienes permisos para realizar esta acción.'
  if (estado === 404) return 'No se encontró lo que buscabas.'
  return 'Ocurrió un error en el servidor. Inténtalo nuevamente.'
}

export function mensajeError(error: unknown, porDefecto: string) {
  return error instanceof Error && error.message ? error.message : porDefecto
}

export async function apiFetch<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const headers = new Headers(opciones.headers)
  if (opciones.body !== undefined) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let respuesta: Response
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, { ...opciones, headers, credentials: 'include' })
  } catch {
    throw new ErrorApi('No se pudo conectar con el servidor. Revisa que el backend esté encendido.', 0)
  }

  if (respuesta.status === 204) return undefined as T

  const datos: unknown = await respuesta.json().catch(() => null)
  if (!respuesta.ok) {
    const mensaje = datos && typeof datos === 'object' && 'mensaje' in datos && typeof datos.mensaje === 'string'
      ? datos.mensaje
      : mensajePorEstado(respuesta.status)
    throw new ErrorApi(mensaje, respuesta.status)
  }
  return datos as T
}

if (import.meta.env?.DEV) {
  Object.assign(window, { establecerToken })
}
