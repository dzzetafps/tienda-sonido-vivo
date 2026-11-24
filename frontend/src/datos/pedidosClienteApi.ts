import { apiFetch } from './api'
import type { Pedido } from '../tipos/Pedido'

export type PedidoCliente = Omit<Pedido, 'estado'> & {
  estado:
    | 'pendiente'
    | 'pagado'
    | 'enviado'
    | 'entregado'
    | 'cancelado'
}

export type DatosPedido = Pick<
  Pedido,
  'comprador' | 'entrega'
>

export function crearPedido(
  datos: DatosPedido,
): Promise<PedidoCliente> {
  return apiFetch<PedidoCliente>('/pedidos', {
    method: 'POST',
    body: JSON.stringify(datos),
  })
}

export function obtenerMisPedidos(): Promise<PedidoCliente[]> {
  return apiFetch<PedidoCliente[]>('/pedidos/mis-pedidos')
}

export function buscarPedidoPorId(
  id: string,
): Promise<PedidoCliente> {
  return apiFetch<PedidoCliente>(
    `/pedidos/${encodeURIComponent(id)}`,
  )
}