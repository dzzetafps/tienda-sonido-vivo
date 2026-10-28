export type EstadoPedido = 'pagado' | 'enviado' | 'entregado' | 'cancelado'

export interface ItemPedido {
  codigo: string
  nombre: string
  cantidad: number
  precioUnitario: number
}

export interface Pedido {
  id: string
  fecha: string
  usuarioId: string | null
  comprador: {
    nombre: string
    apellido: string
    correo: string
  }
  entrega: {
    tipo: 'despacho' | 'retiro'
    calle: string
    numero: string
    complemento: string
    region: string
    comuna: string
    indicaciones: string
  }
  items: ItemPedido[]
  total: number
  estado: EstadoPedido
}
