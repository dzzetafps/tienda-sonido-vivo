const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

const formatoFecha = new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' })

export function formatearPrecio(valor: number) {
  return formatoPrecio.format(valor)
}

export function formatearFecha(fechaIso: string) {
  return formatoFecha.format(new Date(fechaIso))
}
