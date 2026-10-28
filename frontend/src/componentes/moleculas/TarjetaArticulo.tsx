import { Link } from 'react-router-dom'
import type { Articulo } from '../../tipos/Articulo'

interface TarjetaArticuloProps {
  articulo: Articulo
}

function TarjetaArticulo({ articulo }: TarjetaArticuloProps) {
  return (
    <article className="card h-100">
      <div className="ratio ratio-4x3">
        <img
          src={articulo.imagen}
          alt={articulo.descripcionImagen}
          className="card-img-top object-fit-contain p-3"
          loading="lazy"
        />
      </div>
      <div className="card-body d-flex flex-column">
        <h3 className="h5 card-title">{articulo.titulo}</h3>
        <p className="card-text">{articulo.resumen}</p>
        <Link
          className="btn btn-primary mt-auto align-self-start"
          to={`/blogs/${encodeURIComponent(articulo.id)}`}
          aria-label={`Leer más sobre ${articulo.titulo}`}
        >
          Leer más
        </Link>
      </div>
    </article>
  )
}

export default TarjetaArticulo
