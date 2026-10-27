import { Link, useParams } from 'react-router-dom'
import { buscarProductoPorCodigo } from '../datos/productosService.js'
import type { Producto } from '../tipos/Producto'

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function DetalleProducto() {
  const { codigo } = useParams<{ codigo: string }>()
  let producto: Producto | undefined
  let error = ''

  if (!codigo) {
    error = 'No se indicó el código del producto.'
  } else {
    try {
      producto = buscarProductoPorCodigo(codigo)
      if (!producto) error = 'No se encontró el producto solicitado.'
    } catch (problema) {
      error = problema instanceof Error ? problema.message : 'No se pudo cargar el producto.'
    }
  }

  return (
    <section>
      <Link className="d-inline-block mb-4" to="/productos">Volver al catálogo</Link>
      {error || !producto ? (
        <>
          <h1>Detalle de producto</h1>
          <p className="alert alert-danger" role="alert">{error || 'No se pudo cargar el producto.'}</p>
        </>
      ) : (
        <div className="row g-4 align-items-start">
          <div className="col-12 col-md-6">
            <div className="ratio ratio-1x1 bg-white border rounded">
              <img className="object-fit-contain p-4" src={producto.imagen} alt={producto.nombre} />
            </div>
          </div>
          <div className="col-12 col-md-6">
            <h1>{producto.nombre}</h1>
            <dl className="row mt-4">
              <dt className="col-4">Código</dt><dd className="col-8">{producto.codigo}</dd>
              <dt className="col-4">Marca</dt><dd className="col-8">{producto.marca}</dd>
              <dt className="col-4">Modelo</dt><dd className="col-8">{producto.modelo}</dd>
              <dt className="col-4">Categoría</dt><dd className="col-8">{producto.categoria}</dd>
              <dt className="col-4">Stock</dt><dd className="col-8">{producto.stock}</dd>
            </dl>
            <p>{producto.descripcion}</p>
            <p className="fs-3 fw-bold">{formatoPrecio.format(producto.precio)}</p>
            <p className={producto.stock > 0 ? 'text-success' : 'text-secondary'}>
              {producto.stock > 0 ? 'Disponible' : 'Sin stock'}
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

export default DetalleProducto
