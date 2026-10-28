export function limpiarRut(rut: string) {
  return rut.replace(/[.\-\s]/g, '').toUpperCase()
}

export function formatearRut(rut: string) {
  const limpio = limpiarRut(rut)
  return `${Number(limpio.slice(0, -1)).toLocaleString('es-CL')}-${limpio.slice(-1)}`
}

export function calcularDigitoVerificador(cuerpo: string) {
  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }
  const resto = 11 - (suma % 11)
  if (resto === 11) return '0'
  if (resto === 10) return 'K'
  return String(resto)
}
