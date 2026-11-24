import { createContext } from 'react'

import type { Sesion, Usuario } from '../tipos/Usuario'
import type { LoginRequest } from '../datos/authService'

export interface AuthContextType {
  sesion: Sesion | null
  usuario: Usuario | null
  cargando: boolean
  autenticado: boolean
  login: (datos: LoginRequest) => Promise<Sesion>
  logout: () => Promise<void>
}

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined)