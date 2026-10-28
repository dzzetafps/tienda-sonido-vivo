import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false)
  const { pathname } = useLocation()
  const enlaces = [
    { ruta: '/', texto: 'Inicio' },
    { ruta: '/productos', texto: 'Productos' },
    { ruta: '/contacto', texto: 'Contacto' },
    { ruta: '/carrito', texto: 'Carrito' },
    { ruta: '/login', texto: 'Iniciar sesión' },
    { ruta: '/registro', texto: 'Registrarse' },
  ]

  return (
    <nav className="navbar navbar-expand-md bg-dark" data-bs-theme="dark" aria-label="Navegación principal">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/" onClick={() => setMenuAbierto(false)}>
          Sonido Vivo
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="menu-principal"
          aria-expanded={menuAbierto}
          aria-label="Mostrar u ocultar navegación"
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse${menuAbierto ? ' show' : ''}`} id="menu-principal">
          <ul className="navbar-nav ms-auto">
            {enlaces.map(({ ruta, texto }) => (
              <li className="nav-item" key={ruta}>
                <Link
                  className={`nav-link${pathname === ruta ? ' active' : ''}`}
                  to={ruta}
                  aria-current={pathname === ruta ? 'page' : undefined}
                  onClick={() => setMenuAbierto(false)}
                >
                  {texto}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
