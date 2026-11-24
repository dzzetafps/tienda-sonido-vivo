import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TarjetaArticulo from '../componentes/moleculas/TarjetaArticulo'
import { ErrorApi, mensajeError } from '../datos/api'
import { listarArticulos } from '../datos/blogsApi'
import type { Articulo } from '../tipos/Articulo'

function Blogs() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [sinSesion, setSinSesion] = useState(false)

  useEffect(() => {
    let activo = true
    listarArticulos()
      .then((lista) => {
        if (activo) setArticulos(lista)
      })
      .catch((e) => {
        if (!activo) return
        setSinSesion(e instanceof ErrorApi && e.estado === 401)
        setError(mensajeError(e, 'No se pudieron cargar los artículos.'))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  return (
    <>
      <section className="mb-5">
        <h1>Blog Sonido Vivo</h1>
        <p className="lead">Consejos, recomendaciones y novedades sobre instrumentos musicales y equipos de audio.</p>
      </section>
      <section aria-labelledby="titulo-publicaciones">
        <h2 id="titulo-publicaciones" className="h4 mb-4">Últimas publicaciones</h2>
        {cargando && <p className="text-secondary" role="status">Cargando artículos...</p>}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error} {sinSesion && <Link to="/login">Iniciar sesión</Link>}
          </div>
        )}
        <div className="row g-4">
          {articulos.map((articulo) => (
            <div className="col-12 col-md-6 col-lg-4" key={articulo.id}>
              <TarjetaArticulo articulo={articulo} />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

export default Blogs
