export const API_URL =
  import.meta.env?.VITE_API_URL ?? 'http://localhost:8080/api'

let token: string | null = null

let versionSesion = 0

let renovarAutenticacion: (() => Promise<void>) | null = null

let notificarSesionPerdida: (() => void) | null = null

let renovacionEnCurso: {
  version: number
  promesa: Promise<void>
} | null = null

// Guardar el access token solamente en memoria
export function establecerToken(nuevo: string | null) {
  token = nuevo

  if (nuevo === null) {
    versionSesion++
  }
}

export function obtenerToken() {
  return token
}

export function obtenerVersionSesion() {
  return versionSesion
}

// Registrar las funciones que administran la autenticacion
export function configurarRenovacion(
  renovar: () => Promise<void>,
  alPerderSesion: () => void,
) {
  renovarAutenticacion = renovar
  notificarSesionPerdida = alPerderSesion

  return () => {
    if (renovarAutenticacion === renovar) {
      renovarAutenticacion = null
      notificarSesionPerdida = null
    }
  }
}

export class ErrorApi extends Error {
  estado: number

  constructor(mensaje: string, estado: number) {
    super(mensaje)
    this.estado = estado
  }
}

function mensajePorEstado(estado: number) {
  if (estado === 401) {
    return 'Debes iniciar sesión para continuar.'
  }

  if (estado === 403) {
    return 'No tienes permisos para realizar esta acción.'
  }

  if (estado === 404) {
    return 'No se encontró lo que buscabas.'
  }

  return 'Ocurrió un error en el servidor. Inténtalo nuevamente.'
}

export function mensajeError(
  error: unknown,
  porDefecto: string,
) {
  return error instanceof Error && error.message
    ? error.message
    : porDefecto
}

// Ejecutar una peticion sin renovaciones automaticas
async function ejecutarPeticion(
  ruta: string,
  opciones: RequestInit,
  accessToken: string | null,
): Promise<Response> {
  const headers = new Headers(opciones.headers)

  if (opciones.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  try {
    return await fetch(`${API_URL}${ruta}`, {
      ...opciones,
      headers,
      credentials: 'include',
    })
  } catch {
    throw new ErrorApi(
      'No se pudo conectar con el servidor. Revisa que el backend esté encendido.',
      0,
    )
  }
}

// Compartir una sola renovacion entre peticiones simultaneas
function renovarUnaVez(version: number): Promise<void> {
  if (renovacionEnCurso?.version === version) {
    return renovacionEnCurso.promesa
  }

  const renovar = renovarAutenticacion

  if (!renovar) {
    return Promise.reject(
      new ErrorApi('No existe una sesión para renovar.', 401),
    )
  }

  const promesa = Promise.resolve()
    .then(renovar)
    .finally(() => {
      if (renovacionEnCurso?.promesa === promesa) {
        renovacionEnCurso = null
      }
    })

  renovacionEnCurso = {
    version,
    promesa,
  }

  return promesa
}

// Limpiar la sesion cuando ya no es posible renovarla
function perderSesion(version: number) {
  if (versionSesion !== version) {
    return
  }

  establecerToken(null)
  notificarSesionPerdida?.()
}

export async function apiFetch<T>(
  ruta: string,
  opciones: RequestInit = {},
): Promise<T> {
  const tokenOriginal = obtenerToken()
  const versionOriginal = obtenerVersionSesion()

  let respuesta = await ejecutarPeticion(
    ruta,
    opciones,
    tokenOriginal,
  )

  // No renovar login, registro, refresh, logout ni me.
  // Esto evita llamadas recursivas y bucles.
  const esRutaAuth = ruta.startsWith('/auth/')

  if (
    respuesta.status === 401 &&
    !esRutaAuth &&
    tokenOriginal !== null &&
    renovarAutenticacion !== null &&
    versionSesion === versionOriginal
  ) {
    try {
      // Si otra peticion ya renovo el JWT, reutilizarlo.
      if (obtenerToken() === tokenOriginal) {
        await renovarUnaVez(versionOriginal)
      }
    } catch (error) {
      perderSesion(versionOriginal)
      throw error
    }

    const tokenRenovado = obtenerToken()

    if (
      tokenRenovado === null ||
      versionSesion !== versionOriginal
    ) {
      throw new ErrorApi(
        'La sesión ya no está disponible.',
        401,
      )
    }

    // Reintentar solamente una vez.
    respuesta = await ejecutarPeticion(
      ruta,
      opciones,
      tokenRenovado,
    )

    if (
      respuesta.status === 401 &&
      obtenerToken() === tokenRenovado
    ) {
      perderSesion(versionOriginal)
    }
  }

  if (respuesta.status === 204) {
    return undefined as T
  }

  const datos: unknown = await respuesta
    .json()
    .catch(() => null)

  if (!respuesta.ok) {
    const mensaje =
      datos &&
      typeof datos === 'object' &&
      'mensaje' in datos &&
      typeof datos.mensaje === 'string'
        ? datos.mensaje
        : mensajePorEstado(respuesta.status)

    throw new ErrorApi(mensaje, respuesta.status)
  }

  return datos as T
}

if (import.meta.env?.DEV) {
  Object.assign(window, { establecerToken })
}