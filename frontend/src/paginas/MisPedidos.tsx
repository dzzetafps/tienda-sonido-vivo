import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { obtenerMisPedidos } from '../datos/pedidosClienteApi'
import type { PedidoCliente } from '../datos/pedidosClienteApi'

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

const coloresEstado: Record<PedidoCliente['estado'], string> = {
  pendiente: 'warning',
  pagado: 'success',
  enviado: 'primary',
  entregado: 'success',
  cancelado: 'danger',
}

export default function MisPedidos() {
  const [pedidos, setPedidos] = useState<PedidoCliente[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    obtenerMisPedidos()
      .then((datos) => {
        if (activo) setPedidos(datos)
      })
      .catch((problema) => {
        if (activo) {
          setError(
            problema instanceof Error
              ? problema.message
              : 'No se pudieron consultar tus pedidos.',
          )
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  return (
    <section>
      <h1>Mis pedidos</h1>

      <p className="text-secondary">
        Consulta el historial y estado de tus compras.
      </p>

      {cargando && <p role="status">Cargando pedidos...</p>}

      {error && (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      )}

      {!cargando && !error && pedidos.length === 0 && (
        <div className="card card-body text-center">
          <p>No tienes pedidos registrados.</p>
          <Link to="/productos">Explorar productos</Link>
        </div>
      )}

      <div className="d-flex flex-column gap-3">
        {pedidos.map((pedido) => (
          <article className="card shadow-sm" key={pedido.id}>
            <div className="card-body">
              <div className="d-flex flex-wrap justify-content-between">
                <h2 className="h5">Pedido</h2>

                <span className={`badge text-bg-${coloresEstado[pedido.estado]}`}>
                  {pedido.estado}
                </span>
              </div>

              <p className="small text-break">{pedido.id}</p>

              <p>
                Entrega: {
                  pedido.entrega.tipo === 'retiro'
                    ? 'Retiro en tienda'
                    : 'Despacho a domicilio'
                }
              </p>

              <ul>
                {pedido.items.map((item) => (
                  <li key={item.codigo}>
                    {item.nombre} x {item.cantidad}
                  </li>
                ))}
              </ul>

              <p className="fw-bold">
                Total: {formatoPrecio.format(pedido.total)}
              </p>

              {pedido.estado === 'pendiente' ? (
                <Link className="btn btn-warning" to="/checkout">
                  Revisar pedido pendiente
                </Link>
              ) : (
                <Link
                  className="btn btn-outline-primary"
                  to={`/compra-exitosa?pedido=${encodeURIComponent(pedido.id)}`}
                >
                  Ver detalle
                </Link>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}