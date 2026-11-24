import { apiFetch } from './api'

export interface ItemCarritoApi {
  codigo: string
  nombre: string
  imagen: string | null
  cantidad: number
  stock: number
  precioUnitario: number
  subtotal: number
  disponible: boolean
}

export interface CarritoApi {
  id: string
  usuarioId: string
  items: ItemCarritoApi[]
  cantidadTotal: number
  total: number
}

export function obtenerCarrito(): Promise<CarritoApi> {
  return apiFetch<CarritoApi>('/carrito')
}

export function agregarProductoAlCarrito(
  codigo: string,
  cantidad = 1,
): Promise<CarritoApi> {
  return apiFetch<CarritoApi>('/carrito/items', {
    method: 'POST',
    body: JSON.stringify({ codigo, cantidad }),
  })
}

export function modificarCantidad(
  codigo: string,
  cantidad: number,
): Promise<CarritoApi> {
  return apiFetch<CarritoApi>(
    `/carrito/items/${encodeURIComponent(codigo)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ cantidad }),
    },
  )
}

export function eliminarProductoDelCarrito(
  codigo: string,
): Promise<CarritoApi> {
  return apiFetch<CarritoApi>(
    `/carrito/items/${encodeURIComponent(codigo)}`,
    {
      method: 'DELETE',
    },
  )
}

export async function vaciarCarrito(): Promise<CarritoApi> {
  await apiFetch<void>('/carrito', {
    method: 'DELETE',
  })

  return obtenerCarrito()
}