export type RolUsuario = 'cliente' | 'administrador'

export interface Usuario {
  id: string
  rut: string
  nombre: string
  apellidos: string
  correo: string
  fechaNacimiento: string
  region: string
  comuna: string
  direccion: string
  rol: RolUsuario
  activo: boolean
  fechaRegistro: string
}

export interface Sesion {
  usuarioId: string
  rol: RolUsuario
}
