import { Link, useLocation } from 'react-router-dom'

function CompraError() {
  const location = useLocation()
  const estado: unknown = location.state
  let mensaje = 'Ocurrió un problema al intentar completar la compra. Revisa tus datos y los productos del carrito antes de volver a intentarlo.'

  if (
    estado !== null &&
    typeof estado === 'object' &&
    !Array.isArray(estado) &&
    'motivo' in estado &&
    typeof estado.motivo === 'string' &&
    estado.motivo.trim()
  ) {
    mensaje = estado.motivo.trim()
  }

  return (
    <section className="row justify-content-center" aria-labelledby="titulo-compra-error">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="card shadow-sm">
          <div className="card-body p-4 p-md-5">
            <h1 className="h2 mb-4" id="titulo-compra-error">No se pudo completar la compra</h1>
            <p className="alert alert-warning text-break" role="alert">{mensaje}</p>
            <p className="text-secondary mb-4">Puedes volver al checkout para revisar tus datos o al carrito para revisar tus productos.</p>
            <div className="d-grid gap-3 d-sm-flex flex-sm-wrap">
              <Link className="btn btn-primary" to="/checkout">Volver al checkout</Link>
              <Link className="btn btn-outline-secondary" to="/carrito">Volver al carrito</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CompraError
