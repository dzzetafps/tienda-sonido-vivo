import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TarjetaIndicador from '../componentes/moleculas/TarjetaIndicador'
import { leerCatalogo, resumirCategorias } from '../datos/catalogoAdmin'
import { buscarUsuarioPorId, cerrarSesion, obtenerSesion } from '../datos/usuariosService.js'

function leerNombreSesion() {
  try {
    const sesion = obtenerSesion()
    const usuario = sesion ? buscarUsuarioPorId(sesion.usuarioId) : undefined
    return usuario ? `${usuario.nombre} ${usuario.apellidos}` : ''
  } catch {
    return ''
  }
}

const secciones = [
  {
    titulo: 'Productos',
    descripcion: 'Crea, edita y elimina los instrumentos, equipos y accesorios del catálogo.',
    ruta: '/admin/productos',
    boton: 'Gestionar productos',
  },
  {
    titulo: 'Categorías',
    descripcion: 'Revisa cuántos productos, unidades y valor tiene cada categoría.',
    ruta: '/admin/categorias',
    boton: 'Ver categorías',
  },
  {
    titulo: 'Reportes',
    descripcion: 'Consulta el valor del inventario y los productos con stock bajo.',
    ruta: '/admin/reportes',
    boton: 'Ver reportes',
  },
  {
    titulo: 'Usuarios',
    descripcion: 'Crea, edita, activa o desactiva las cuentas de clientes y administradores.',
    ruta: '/admin/usuarios',
    boton: 'Gestionar usuarios',
  },
]

function AdminInicio() {
  const navigate = useNavigate()
  const [catalogo] = useState(leerCatalogo)
  const [nombreSesion] = useState(leerNombreSesion)
  const [errorSalir, setErrorSalir] = useState('')
  const indicadores = [
    { titulo: 'Productos', valor: catalogo.productos.length },
    { titulo: 'Sin stock', valor: catalogo.productos.filter((producto) => producto.stock === 0).length },
    { titulo: 'Categorías', valor: resumirCategorias(catalogo.productos).length },
  ]

  function salir() {
    try {
      cerrarSesion()
      navigate('/login', { replace: true })
    } catch (error) {
      setErrorSalir(error instanceof Error ? error.message : 'No se pudo cerrar la sesión.')
    }
  }

  return (
    <section>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h1>Panel de administración</h1>
          {nombreSesion && <p className="text-secondary mb-0">Sesión iniciada como {nombreSesion}</p>}
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={salir}>Cerrar sesión</button>
      </div>
      {errorSalir && <p className="alert alert-danger mt-3" role="alert">{errorSalir}</p>}
      <p className="lead mt-3">Administra el catálogo de instrumentos y equipos de Sonido Vivo.</p>

      {catalogo.error ? (
        <p className="alert alert-danger" role="alert">{catalogo.error}</p>
      ) : (
        <div className="row g-3 mb-4">
          {indicadores.map((indicador) => (
            <div className="col-12 col-sm-4" key={indicador.titulo}>
              <TarjetaIndicador titulo={indicador.titulo} valor={indicador.valor} />
            </div>
          ))}
        </div>
      )}

      <div className="row g-4">
        {secciones.map((seccion) => (
          <div className="col-12 col-md-6" key={seccion.titulo}>
            <article className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h2 className="h4">{seccion.titulo}</h2>
                <p>{seccion.descripcion}</p>
                <Link className="btn btn-primary mt-auto align-self-start" to={seccion.ruta}>
                  {seccion.boton}
                </Link>
              </div>
            </article>
          </div>
        ))}
        <div className="col-12 col-md-6">
          <article className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h2 className="h4">Pedidos</h2>
              <p>Revisa las compras de la tienda y actualiza su estado.</p>
              <span className="badge text-bg-secondary mt-auto align-self-start">Próximamente</span>
            </div>
          </article>
        </div>
      </div>

      <Link className="d-inline-block mt-4" to="/">Volver a la tienda</Link>
    </section>
  )
}

export default AdminInicio
