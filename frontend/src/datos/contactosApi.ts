import { apiFetch } from './api'
import type { MensajeContacto, MensajeRecibido } from '../tipos/MensajeContacto'

export function enviarMensaje(mensaje: MensajeContacto) {
  return apiFetch<MensajeRecibido>('/contactos', { method: 'POST', body: JSON.stringify(mensaje) })
}

export function listarMensajes() {
  return apiFetch<MensajeRecibido[]>('/contactos')
}
