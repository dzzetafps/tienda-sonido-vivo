import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { obtenerSesion } from '../../datos/usuariosService.js'

function RutaAdmin() {
  const location = useLocation()
  const sesion = obtenerSesion()

  if (!sesion) {
    return <Navigate to="/login" replace state={{ desde: location.pathname }} />
  }

  if (sesion.rol !== 'administrador') {
    return (
      <section>
        <h1>Acceso restringido</h1>
        <p className="alert alert-warning" role="alert">
          Tu cuenta no tiene permisos para entrar al panel de administración.
        </p>
        <Link className="btn btn-outline-primary" to="/">Volver a la tienda</Link>
      </section>
    )
  }

  return <Outlet />
}

export default RutaAdmin
