import { useContext } from 'react'

import { AuthContext } from './authContextBase'
import type { AuthContextType } from './authContextBase'

export function useAuth(): AuthContextType {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider',
    )
  }

  return contexto
}