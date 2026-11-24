import {
  useEffect,
  useState,
} from 'react'

import type { ReactNode } from 'react'

import type {
  Sesion,
  Usuario,
} from '../tipos/Usuario'

import {
  iniciarSesion,
  cerrarSesion,
  renovarSesion,
  obtenerUsuarioActual,
} from '../datos/authService'

import type { LoginRequest } from '../datos/authService'

import {
  establecerToken,
  configurarRenovacion,
  obtenerVersionSesion,
  ErrorApi,
} from '../datos/api'

import { AuthContext } from './authContextBase'

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [sesion, setSesion] =
    useState<Sesion | null>(null)

  const [usuario, setUsuario] =
    useState<Usuario | null>(null)

  const [cargando, setCargando] =
    useState(true)

  useEffect(() => {
    let activo = true

    // Renovacion automatica solicitada por apiFetch
    const desconfigurar = configurarRenovacion(
      async () => {
        const version = obtenerVersionSesion()

        const respuesta = await renovarSesion()

        const usuarioActual =
          await obtenerUsuarioActual()

        if (obtenerVersionSesion() !== version) {
          throw new ErrorApi(
            'La sesión ha cambiado.',
            401,
          )
        }

        if (activo) {
          setSesion({
            usuarioId: respuesta.usuarioId,
            rol: respuesta.rol,
          })

          setUsuario(usuarioActual)
        }
      },

      // Ejecutado cuando la sesion deja de ser valida
      () => {
        if (activo) {
          setSesion(null)
          setUsuario(null)
          setCargando(false)
        }
      },
    )

    // Recuperar la sesion cuando se recarga React
    async function recuperarSesion() {
      const version = obtenerVersionSesion()

      try {
        const respuesta = await renovarSesion()

        const usuarioActual =
          await obtenerUsuarioActual()

        if (
          activo &&
          obtenerVersionSesion() === version
        ) {
          setSesion({
            usuarioId: respuesta.usuarioId,
            rol: respuesta.rol,
          })

          setUsuario(usuarioActual)
        }
      } catch {
        if (
          activo &&
          obtenerVersionSesion() === version
        ) {
          establecerToken(null)

          setSesion(null)
          setUsuario(null)
        }
      } finally {
        if (activo) {
          setCargando(false)
        }
      }
    }

    void recuperarSesion()

    return () => {
      activo = false
      desconfigurar()
    }
  }, [])

  // Login
  async function login(
    datos: LoginRequest,
  ): Promise<Sesion> {
    setCargando(true)

    try {
      const respuesta =
        await iniciarSesion(datos)

      const version =
        obtenerVersionSesion()

      const usuarioActual =
        await obtenerUsuarioActual()

      if (obtenerVersionSesion() !== version) {
        throw new ErrorApi(
          'La sesión ha cambiado.',
          401,
        )
      }

      const nuevaSesion: Sesion = {
        usuarioId: respuesta.usuarioId,
        rol: respuesta.rol,
      }

      setSesion(nuevaSesion)
      setUsuario(usuarioActual)

      return nuevaSesion
    } catch (error) {
      establecerToken(null)

      setSesion(null)
      setUsuario(null)

      throw error
    } finally {
      setCargando(false)
    }
  }

  // Logout
  async function logout(): Promise<void> {
    setCargando(true)

    try {
      await cerrarSesion()
    } finally {
      establecerToken(null)

      setSesion(null)
      setUsuario(null)
      setCargando(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        sesion,
        usuario,
        cargando,
        autenticado: sesion !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}