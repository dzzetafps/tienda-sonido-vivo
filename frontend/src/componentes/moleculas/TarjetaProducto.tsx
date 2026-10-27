import { Link } from 'react-router-dom'
import type { Producto } from '../../tipos/Producto'

interface TarjetaProductoProps {
  producto: Producto
}

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function TarjetaProducto({ producto }: TarjetaProductoProps) {
  return (
    <article className="card h-100">
      <div className="ratio ratio-4x3">
        <img
          src={producto.imagen}
          alt={producto.nombre}
          className="card-img-top object-fit-contain p-3"
          loading="lazy"
        />
      </div>
      <div className="card-body d-flex flex-column">
        <p className="small text-secondary mb-2">{producto.categoria}</p>
        <h3 className="h5 card-title">{producto.nombre}</h3>
        <p className="card-text">{producto.marca} · {producto.modelo}</p>
        <p className="small text-secondary">Código: {producto.codigo}</p>
        <p className="fs-5 fw-bold mt-auto">{formatoPrecio.format(producto.precio)}</p>
        <p className={producto.stock > 0 ? 'text-success' : 'text-secondary'}>
          {producto.stock > 0 ? `Disponible · Stock: ${producto.stock}` : 'Sin stock'}
        </p>
        <Link
          className="btn btn-primary"
          to={`/producto/${encodeURIComponent(producto.codigo)}`}
          aria-label={`Ver detalle de ${producto.nombre}`}
        >
          Ver detalle
        </Link>
      </div>
    </article>
  )
}

export default TarjetaProducto
