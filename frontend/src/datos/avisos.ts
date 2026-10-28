export interface Aviso {
  tipo: 'success' | 'danger'
  texto: string
}

export function leerAvisoRecibido(estado: unknown): Aviso | null {
  if (estado && typeof estado === 'object' && 'mensaje' in estado && typeof estado.mensaje === 'string') {
    const tipo = 'tipo' in estado && estado.tipo === 'danger' ? 'danger' : 'success'
    return { tipo, texto: estado.mensaje }
  }
  return null
}
