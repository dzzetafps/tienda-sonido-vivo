export interface SeccionArticulo {
  titulo: string
  texto: string
}

export interface Articulo {
  id: string
  titulo: string
  resumen: string
  introduccion: string
  imagen: string
  descripcionImagen: string
  secciones: SeccionArticulo[]
}
