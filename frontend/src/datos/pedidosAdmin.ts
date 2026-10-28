import { obtenerPedidos } from './pedidosService.js'
import type { EstadoPedido, Pedido } from '../tipos/Pedido'

export interface ResumenEstado {
  estado: EstadoPedido
  pedidos: number
  total: number
}

export interface ProductoVendido {
  codigo: string
  nombre: string
  unidades: number
  total: number
}

export const estadosPedido: EstadoPedido[] = ['pagado', 'enviado', 'entregado', 'cancelado']

export const nombresEstado: Record<EstadoPedido, string> = {
  pagado: 'Pagado',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export function codigoPedido(id: string) {
  return id.slice(0, 8).toUpperCase()
}

export function leerPedidos(): { pedidos: Pedido[]; error: string } {
  try {
    return { pedidos: obtenerPedidos(), error: '' }
  } catch (error) {
    return { pedidos: [], error: error instanceof Error ? error.message : 'No se pudieron cargar los pedidos.' }
  }
}

export function pedidosVigentes(pedidos: Pedido[]) {
  return pedidos.filter((pedido) => pedido.estado !== 'cancelado')
}

export function calcularTotalVendido(pedidos: Pedido[]) {
  return pedidosVigentes(pedidos).reduce((total, pedido) => total + pedido.total, 0)
}

export function resumirPorEstado(pedidos: Pedido[]): ResumenEstado[] {
  return estadosPedido.map((estado) => {
    const delEstado = pedidos.filter((pedido) => pedido.estado === estado)
    return {
      estado,
      pedidos: delEstado.length,
      total: delEstado.reduce((total, pedido) => total + pedido.total, 0),
    }
  })
}

export function productosMasVendidos(pedidos: Pedido[], limite: number): ProductoVendido[] {
  const vendidos = new Map<string, ProductoVendido>()

  for (const pedido of pedidosVigentes(pedidos)) {
    for (const item of pedido.items) {
      const actual = vendidos.get(item.codigo) ?? { codigo: item.codigo, nombre: item.nombre, unidades: 0, total: 0 }
      actual.unidades += item.cantidad
      actual.total += item.cantidad * item.precioUnitario
      vendidos.set(item.codigo, actual)
    }
  }

  return [...vendidos.values()]
    .sort((primero, segundo) => segundo.unidades - primero.unidades || segundo.total - primero.total)
    .slice(0, limite)
}
