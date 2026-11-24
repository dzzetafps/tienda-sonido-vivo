import {
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom'

import { useAuth } from '../../context/useAuth'

export default function RutaAdmin() {
  const { sesion, cargando } = useAuth()

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
          Verificando permisos...
        </p>
      </div>
    )
  }

  if (!sesion) {
    return (
      <Navigate
        to="/login"
        state={{ desde: location.pathname }}
        replace
      />
    )
  }

  if (sesion.rol !== 'administrador') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}