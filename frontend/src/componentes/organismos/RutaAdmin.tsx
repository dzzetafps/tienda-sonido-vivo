import {
  Navigate,
  Outlet,
  useLocation,
  Link,
} from 'react-router-dom'

import { useAuth } from '../../context/useAuth'
import type { RolUsuario } from '../../tipos/Usuario'

interface RutaAdminProps {
  roles?: RolUsuario[]
}

export default function RutaAdmin({
  roles = ['administrador'],
}: RutaAdminProps) {
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

  if (!roles.includes(sesion.rol)) {
    return (
      <section className="text-center py-5">
        <h1>Acceso restringido</h1>

        <p className="text-secondary">
          No tienes permisos para acceder a esta sección.
        </p>

        <Link to="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </section>
    )
  }

  return <Outlet />
}