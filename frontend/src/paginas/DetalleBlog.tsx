import { Link, useParams } from 'react-router-dom'
import { buscarArticulo } from '../datos/articulos'

function DetalleBlog() {
  const { id = '' } = useParams<{ id: string }>()
  const articulo = buscarArticulo(id)

  if (!articulo) {
    return (
      <section>
        <h1>Artículo no encontrado</h1>
        <p className="alert alert-warning" role="alert">No existe una publicación con esa dirección.</p>
        <Link className="btn btn-outline-primary" to="/blogs">Volver a Blogs</Link>
      </section>
    )
  }

  return (
    <article className="row justify-content-center">
      <div className="col-12 col-lg-8">
        <nav aria-label="Ruta de navegación">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/blogs">Blogs</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{articulo.titulo}</li>
          </ol>
        </nav>
        <h1>{articulo.titulo}</h1>
        <p className="lead">{articulo.introduccion}</p>
        <img
          src={articulo.imagen}
          alt={articulo.descripcionImagen}
          className="img-fluid rounded border bg-white d-block mx-auto my-4 p-3"
          style={{ maxHeight: '320px' }}
        />
        {articulo.secciones.map((seccion) => (
          <section className="mb-4" key={seccion.titulo}>
            <h2 className="h4">{seccion.titulo}</h2>
            <p>{seccion.texto}</p>
          </section>
        ))}
        <Link className="btn btn-outline-primary" to="/blogs">Volver a Blogs</Link>
      </div>
    </article>
  )
}

export default DetalleBlog
