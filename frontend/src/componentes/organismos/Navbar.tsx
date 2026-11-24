import { useState } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../../context/useAuth'

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  const [errorSesion, setErrorSesion] = useState('')

  const { pathname } = useLocation()

  const navegar = useNavigate()

  const {
    sesion,
    usuario,
    cargando,
    logout,
  } = useAuth()

  const enlaces = [
    { ruta: '/', texto: 'Inicio' },
    { ruta: '/productos', texto: 'Productos' },
    { ruta: '/nosotros', texto: 'Nosotros' },
    { ruta: '/blogs', texto: 'Blogs' },
    { ruta: '/contacto', texto: 'Contacto' },
    { ruta: '/carrito', texto: 'Carrito' },
    { ruta: '/admin', texto: 'Administración' },
    { ruta: '/admin/pedidos', texto: 'Gestionar pedidos' },
    { ruta: '/login', texto: 'Iniciar sesión' },
    { ruta: '/registro', texto: 'Registrarse' },
  ]

  const enlacesVisibles = enlaces.filter(({ ruta }) => {
    if (ruta === '/admin') {
      return (
        !cargando &&
        sesion?.rol === 'administrador'
      )
    }

    if (ruta === '/admin/pedidos') {
      return (
        !cargando &&
        sesion?.rol === 'vendedor'
      )
    }

    if (ruta === '/login' || ruta === '/registro') {
      return !cargando && !sesion
    }

    if (ruta === '/carrito') {
      return (
        !cargando &&
        (!sesion || sesion.rol === 'cliente')
      )
    }

    return true
  })

  async function manejarCerrarSesion() {
    if (cargando) return

    setErrorSesion('')

    try {
      await logout()

      setMenuAbierto(false)

      navegar('/login', { replace: true })

    } catch (error) {

      setErrorSesion(
        error instanceof Error
          ? error.message
          : 'No se pudo cerrar la sesión.',
      )
    }
  }

  function estaActivo(ruta: string) {
    return (
      pathname === ruta ||
      (
        ruta !== '/' &&
        pathname.startsWith(`${ruta}/`)
      )
    )
  }

  return (
    <nav
      className="navbar navbar-expand-lg bg-dark"
      data-bs-theme="dark"
      aria-label="Navegación principal"
    >
      <div className="container">

        <Link
          className="navbar-brand fw-bold"
          to="/"
          onClick={() => setMenuAbierto(false)}
        >
          Sonido Vivo
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-controls="menu-principal"
          aria-expanded={menuAbierto}
          aria-label="Mostrar u ocultar navegación"
          onClick={() =>
            setMenuAbierto(!menuAbierto)
          }
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div
          className={
            `collapse navbar-collapse${
              menuAbierto ? ' show' : ''
            }`
          }
          id="menu-principal"
        >
          <ul className="navbar-nav ms-auto">

            {enlacesVisibles.map(({ ruta, texto }) => (
              <li
                className="nav-item"
                key={ruta}
              >
                <Link
                  className={
                    `nav-link${
                      estaActivo(ruta)
                        ? ' active'
                        : ''
                    }`
                  }
                  to={ruta}
                  aria-current={
                    estaActivo(ruta)
                      ? 'page'
                      : undefined
                  }
                  onClick={() =>
                    setMenuAbierto(false)
                  }
                >
                  {texto}
                </Link>
              </li>
            ))}

            {sesion && usuario && (
              <li className="nav-item">
                <span className="navbar-text px-lg-2">
                  Hola, {usuario.nombre}
                </span>
              </li>
            )}

            {sesion && (
              <li className="nav-item">
                <button
                  type="button"
                  className="nav-link btn btn-link"
                  onClick={manejarCerrarSesion}
                  disabled={cargando}
                >
                  {cargando
                    ? 'Cerrando sesión...'
                    : 'Cerrar sesión'}
                </button>
              </li>
            )}

          </ul>
        </div>
      </div>

      {errorSesion && (
        <div className="container">
          <p
            className="alert alert-danger w-100 mt-2 mb-0"
            role="alert"
          >
            {errorSesion}
          </p>
        </div>
      )}
    </nav>
  )
}

export default Navbar