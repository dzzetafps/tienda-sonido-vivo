import EstadoPedidoBadge from '../atomos/EstadoPedidoBadge'
import { formatearPrecio } from '../../datos/formatos'
import type { ResumenEstado } from '../../datos/pedidosAdmin'

interface TablaPedidosPorEstadoProps {
  resumen: ResumenEstado[]
}

function TablaPedidosPorEstado({ resumen }: TablaPedidosPorEstadoProps) {
  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle bg-white">
        <caption className="visually-hidden">Pedidos por estado</caption>
        <thead className="table-dark">
          <tr>
            <th scope="col">Estado</th>
            <th scope="col" className="text-end">Pedidos</th>
            <th scope="col" className="text-end">Monto</th>
          </tr>
        </thead>
        <tbody>
          {resumen.map((fila) => (
            <tr key={fila.estado}>
              <td><EstadoPedidoBadge estado={fila.estado} /></td>
              <td className="text-end">{fila.pedidos}</td>
              <td className="text-end text-nowrap">{formatearPrecio(fila.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaPedidosPorEstado
