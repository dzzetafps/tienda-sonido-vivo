import { nombresEstado } from '../../datos/pedidosAdmin'
import type { EstadoPedido } from '../../tipos/Pedido'

interface EstadoPedidoBadgeProps {
  estado: EstadoPedido
}

const clases: Record<EstadoPedido, string> = {
  pagado: 'badge text-bg-primary',
  enviado: 'badge text-bg-warning',
  entregado: 'badge text-bg-success',
  cancelado: 'badge text-bg-secondary',
}

function EstadoPedidoBadge({ estado }: EstadoPedidoBadgeProps) {
  return <span className={clases[estado]}>{nombresEstado[estado]}</span>
}

export default EstadoPedidoBadge
