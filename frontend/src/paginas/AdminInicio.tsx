import { useState } from 'react'
import { Link } from 'react-router-dom'
import TarjetaIndicador from '../componentes/moleculas/TarjetaIndicador'
import { leerCatalogo, resumirCategorias } from '../datos/catalogoAdmin'

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
]

function AdminInicio() {
  const [catalogo] = useState(leerCatalogo)
  const indicadores = [
    { titulo: 'Productos', valor: catalogo.productos.length },
    { titulo: 'Sin stock', valor: catalogo.productos.filter((producto) => producto.stock === 0).length },
    { titulo: 'Categorías', valor: resumirCategorias(catalogo.productos).length },
  ]

  return (
    <section>
      <h1>Panel de administración</h1>
      <p className="lead">Administra el catálogo de instrumentos y equipos de Sonido Vivo.</p>

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
              <h2 className="h4">Usuarios y pedidos</h2>
              <p>Administra los usuarios de la tienda y el estado de los pedidos.</p>
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
