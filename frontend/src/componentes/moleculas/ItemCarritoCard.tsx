import type { ItemCarrito } from '../../tipos/ItemCarrito'
import type { Producto } from '../../tipos/Producto'

interface ItemCarritoCardProps {
  item: ItemCarrito
  producto: Producto | undefined
  subtotal: number | null
  error: string
  onModificarCantidad: (codigo: string, cantidad: number) => void
  onEliminar: (codigo: string) => void
}

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function ItemCarritoCard({ item, producto, subtotal, error, onModificarCantidad, onEliminar }: ItemCarritoCardProps) {
  const superaStock = producto !== undefined && item.cantidad > producto.stock
  const cantidadMenor = producto ? Math.min(item.cantidad - 1, producto.stock) : 0
  const nombre = producto?.nombre ?? item.codigo

  return (
    <article className="card shadow-sm">
      <div className="card-body">
        <div className="row g-3 align-items-center">
          <div className="col-4 col-sm-3">
            {producto ? (
              <div className="ratio ratio-1x1">
                <img className="w-100 h-100 object-fit-contain rounded" src={producto.imagen} alt={producto.nombre} />
              </div>
            ) : (
              <div className="bg-light border rounded p-3 text-center text-secondary">Sin imagen</div>
            )}
          </div>
          <div className="col-8 col-sm-9">
            <p className="small text-secondary mb-1">{item.codigo}</p>
            <h2 className="h5">{producto?.nombre ?? 'Producto no disponible'}</h2>
            {producto && (
              <>
                <p className="mb-1">Precio unitario: {formatoPrecio.format(producto.precio)}</p>
                <p className="small text-secondary mb-0">Stock disponible: {producto.stock}</p>
              </>
            )}
          </div>
          <div className="col-12">
            {error && <p className="alert alert-danger mb-3" role="alert">{error}</p>}
            {superaStock && (
              <p className="alert alert-warning mb-3" role="alert">
                La cantidad supera el stock disponible. {producto.stock > 0 ? 'Ajusta la cantidad para poder comprar.' : 'Elimina este producto: no quedan unidades.'}
              </p>
            )}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div className="d-flex flex-wrap align-items-center gap-2" role="group" aria-label={`Cantidad de ${nombre}`}>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={!producto || cantidadMenor < 1 || Boolean(error)}
                  aria-label={`Reducir cantidad de ${nombre} a ${cantidadMenor}`}
                  onClick={() => onModificarCantidad(item.codigo, cantidadMenor)}
                >
                  {superaStock && producto.stock > 0 ? `Ajustar a ${producto.stock}` : '−'}
                </button>
                <span aria-live="polite">Cantidad: <strong>{item.cantidad}</strong></span>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  disabled={!producto || item.cantidad >= producto.stock || Boolean(error)}
                  aria-label={`Aumentar cantidad de ${nombre}`}
                  onClick={() => onModificarCantidad(item.codigo, item.cantidad + 1)}
                >
                  +
                </button>
              </div>
              <p className="mb-0 fw-bold">Subtotal: {subtotal === null ? 'No disponible' : formatoPrecio.format(subtotal)}</p>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                aria-label={`Eliminar ${nombre} del carrito`}
                onClick={() => onEliminar(item.codigo)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

export default ItemCarritoCard
