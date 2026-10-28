import { useState } from 'react'
import { Link } from 'react-router-dom'
import { obtenerProductos } from '../datos/productosService.js'

// Resumen del catálogo para las tarjetas del panel.
function leerResumen() {
  try {
    const productos = obtenerProductos()
    return {
      total: productos.length,
      sinStock: productos.filter((producto) => producto.stock === 0).length,
      categorias: new Set(productos.map((producto) => producto.categoria)).size,
      error: '',
    }
  } catch (error) {
    return {
      total: 0,
      sinStock: 0,
      categorias: 0,
      error: error instanceof Error ? error.message : 'No se pudo cargar el resumen del catálogo.',
    }
  }
}

function AdminInicio() {
  const [resumen] = useState(leerResumen)
  const indicadores = [
    { titulo: 'Productos', valor: resumen.total },
    { titulo: 'Sin stock', valor: resumen.sinStock },
    { titulo: 'Categorías', valor: resumen.categorias },
  ]

  return (
    <section>
      <h1>Panel de administración</h1>
      <p className="lead">Administra el catálogo de instrumentos y equipos de Sonido Vivo.</p>

      {resumen.error ? (
        <p className="alert alert-danger" role="alert">{resumen.error}</p>
      ) : (
        <div className="row g-3 mb-4">
          {indicadores.map((indicador) => (
            <div className="col-12 col-sm-4" key={indicador.titulo}>
              <div className="card text-center h-100">
                <div className="card-body">
                  <p className="text-secondary mb-1">{indicador.titulo}</p>
                  <p className="display-6 fw-bold mb-0">{indicador.valor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-md-6">
          <article className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h2 className="h4">Productos</h2>
              <p>Crea, edita y elimina los instrumentos, equipos y accesorios del catálogo.</p>
              <Link className="btn btn-primary mt-auto align-self-start" to="/admin/productos">
                Gestionar productos
              </Link>
            </div>
          </article>
        </div>
        <div className="col-12 col-md-6">
          <article className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <h2 className="h4">Usuarios</h2>
              <p>Administra los datos y roles de los usuarios de la tienda.</p>
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
