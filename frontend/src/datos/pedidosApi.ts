import { apiFetch } from './api'
import type { EstadoPedido, Pedido } from '../tipos/Pedido'

// Estados que acepta PATCH /api/pedidos/{id}/estado.
export type EstadoEditable = Extract<EstadoPedido, 'enviado' | 'entregado' | 'cancelado'>

// Transiciones que ofrece la pantalla. El backend valida y tiene la última palabra.
const transiciones: Record<EstadoPedido, EstadoEditable[]> = {
  pendiente: [],
  pagado: ['enviado', 'cancelado'],
  enviado: ['entregado'],
  entregado: [],
  cancelado: [],
}

export function estadosSiguientes(estado: EstadoPedido): EstadoEditable[] {
  return transiciones[estado] ?? []
}

// ms-carrito puede enviar montos como BigDecimal: se pasan a number para sumar y formatear.
function normalizar(pedido: Pedido): Pedido {
  return {
    ...pedido,
    total: Number(pedido.total),
    items: pedido.items.map((item) => ({
      ...item,
      cantidad: Number(item.cantidad),
      precioUnitario: Number(item.precioUnitario),
    })),
  }
}

export async function listarPedidos(): Promise<Pedido[]> {
  const pedidos = await apiFetch<Pedido[]>('/pedidos')
  return pedidos.map(normalizar)
}

export async function buscarPedido(id: string): Promise<Pedido> {
  return normalizar(await apiFetch<Pedido>(`/pedidos/${encodeURIComponent(id)}`))
}

export async function actualizarEstadoPedido(id: string, estado: EstadoEditable): Promise<Pedido> {
  const pedido = await apiFetch<Pedido>(`/pedidos/${encodeURIComponent(id)}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ estado }),
  })
  return normalizar(pedido)
}
