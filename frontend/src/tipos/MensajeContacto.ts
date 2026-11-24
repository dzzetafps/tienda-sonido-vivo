export interface MensajeContacto {
  nombre: string
  correo: string
  comentario: string
}

export interface MensajeRecibido extends MensajeContacto {
  id: number
  usuarioId: string | null
  fechaEnvio: string
}
