import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ErrorApi, mensajeError } from '../datos/api'
import { buscarArticulo } from '../datos/blogsApi'
import type { Articulo } from '../tipos/Articulo'

function DetalleBlog() {
  const { id = '' } = useParams<{ id: string }>()
  const [articulo, setArticulo] = useState<Articulo | null>(null)
  const [cargando, setCargando] = useState(true)
  const [noExiste, setNoExiste] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    buscarArticulo(id)
      .then((encontrado) => {
        if (activo) setArticulo(encontrado)
      })
      .catch((e) => {
        if (!activo) return
        if (e instanceof ErrorApi && e.estado === 404) setNoExiste(true)
        else setError(mensajeError(e, 'No se pudo cargar el artículo.'))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [id])

  if (cargando) return <p className="text-secondary" role="status">Cargando artículo...</p>

  if (noExiste || error || !articulo) {
    return (
      <section>
        <h1>{noExiste ? 'Artículo no encontrado' : 'No se pudo cargar el artículo'}</h1>
        <p className="alert alert-warning" role="alert">
          {noExiste ? 'No existe una publicación con esa dirección.' : error}
        </p>
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
