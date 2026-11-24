import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../../context/useAuth'

export default function RutaProtegida() {
  const { autenticado, cargando } = useAuth()

  const location = useLocation()

  if (cargando) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            Cargando sesión...
          </span>
        </div>

        <p className="mt-3">
          Verificando sesión...
        </p>
      </div>
    )
  }

  if (!autenticado) {
    return (
      <Navigate
        to="/login"
        state={{ desde: location.pathname }}
        replace
      />
    )
  }

  return <Outlet />
}