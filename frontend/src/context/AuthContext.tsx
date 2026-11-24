import {
  useEffect,
  useState,
} from 'react'

import type { ReactNode } from 'react'

import type { Sesion, Usuario } from '../tipos/Usuario'

import {
  iniciarSesion,
  cerrarSesion,
  renovarSesion,
  obtenerUsuarioActual,
} from '../datos/authService'

import type { LoginRequest } from '../datos/authService'

import { establecerToken } from '../datos/api'

import { AuthContext } from './authContextBase'

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [sesion, setSesion] = useState<Sesion | null>(null)

  const [usuario, setUsuario] = useState<Usuario | null>(null)

  const [cargando, setCargando] = useState(true)

  // Recuperar la sesion al iniciar o recargar la aplicacion
  useEffect(() => {
    let activo = true

    async function recuperarSesion() {
      try {
        const respuesta = await renovarSesion()

        const usuarioActual = await obtenerUsuarioActual()

        if (activo) {
          setSesion({
            usuarioId: respuesta.usuarioId,
            rol: respuesta.rol,
          })

          setUsuario(usuarioActual)
        }
      } catch {
        if (activo) {
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
    }
  }, [])

  // Iniciar sesion mediante el backend
  async function login(
    datos: LoginRequest,
  ): Promise<Sesion> {
    setCargando(true)

    try {
      const respuesta = await iniciarSesion(datos)

      const usuarioActual = await obtenerUsuarioActual()

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

  // Cerrar sesion mediante el backend
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