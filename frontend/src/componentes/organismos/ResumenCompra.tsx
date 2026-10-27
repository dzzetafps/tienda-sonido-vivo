interface ResumenCompraProps {
  cantidadUnidades: number
  total: number | null
  error: string
}

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function ResumenCompra({ cantidadUnidades, total, error }: ResumenCompraProps) {
  return (
    <aside className="card shadow-sm" aria-labelledby="titulo-resumen">
      <div className="card-body">
        <h2 className="h4 mb-4" id="titulo-resumen">Resumen de compra</h2>
        <dl aria-live="polite">
          <div className="d-flex justify-content-between gap-3">
            <dt className="fw-normal">Unidades</dt>
            <dd>{cantidadUnidades}</dd>
          </div>
          <div className="d-flex flex-wrap justify-content-between gap-2">
            <dt className="fw-normal">Subtotal</dt>
            <dd>{total === null ? 'No disponible' : formatoPrecio.format(total)}</dd>
          </div>
          <div className="d-flex flex-wrap justify-content-between gap-2 border-top pt-3">
            <dt>Total</dt>
            <dd className="fw-bold">{total === null ? 'No disponible' : formatoPrecio.format(total)}</dd>
          </div>
        </dl>
        {error && (
          <div className="alert alert-warning" role="alert">
            <p className="mb-1">{error}</p>
            <p className="mb-0">Resuelve este problema antes de continuar con la compra.</p>
          </div>
        )}
        <button type="button" className="btn btn-primary w-100" disabled aria-describedby="aviso-checkout">
          Continuar al checkout
        </button>
        <p className="small text-secondary mt-2 mb-0" id="aviso-checkout">
          El checkout estará disponible próximamente. Por ahora puedes revisar y ajustar tu carrito.
        </p>
      </div>
    </aside>
  )
}

export default ResumenCompra
