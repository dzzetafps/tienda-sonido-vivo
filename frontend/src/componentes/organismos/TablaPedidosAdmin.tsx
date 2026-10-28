import { Link } from 'react-router-dom'
import EstadoPedidoBadge from '../atomos/EstadoPedidoBadge'
import { formatearFecha, formatearPrecio } from '../../datos/formatos'
import { codigoPedido } from '../../datos/pedidosAdmin'
import type { Pedido } from '../../tipos/Pedido'

interface TablaPedidosAdminProps {
  pedidos: Pedido[]
}

function TablaPedidosAdmin({ pedidos }: TablaPedidosAdminProps) {
  if (pedidos.length === 0) {
    return <p className="alert alert-light border">No hay pedidos que coincidan con la búsqueda.</p>
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle bg-white">
        <caption className="visually-hidden">Pedidos de la tienda</caption>
        <thead className="table-dark">
          <tr>
            <th scope="col">Pedido</th>
            <th scope="col" className="d-none d-md-table-cell">Fecha</th>
            <th scope="col" className="d-none d-sm-table-cell">Cliente</th>
            <th scope="col" className="d-none d-lg-table-cell">Entrega</th>
            <th scope="col" className="text-end d-none d-sm-table-cell">Total</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td className="text-nowrap">{codigoPedido(pedido.id)}</td>
              <td className="d-none d-md-table-cell text-nowrap">{formatearFecha(pedido.fecha)}</td>
              <td className="d-none d-sm-table-cell">{pedido.comprador.nombre} {pedido.comprador.apellido}</td>
              <td className="d-none d-lg-table-cell">{pedido.entrega.tipo === 'despacho' ? 'Despacho' : 'Retiro'}</td>
              <td className="text-end text-nowrap d-none d-sm-table-cell">{formatearPrecio(pedido.total)}</td>
              <td><EstadoPedidoBadge estado={pedido.estado} /></td>
              <td>
                <Link
                  className="btn btn-sm btn-primary text-nowrap"
                  to={`/admin/pedidos/${encodeURIComponent(pedido.id)}`}
                  aria-label={`Ver detalle del pedido ${codigoPedido(pedido.id)}`}
                >
                  <span className="d-none d-sm-inline">Ver detalle</span>
                  <span className="d-sm-none">Ver</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaPedidosAdmin
