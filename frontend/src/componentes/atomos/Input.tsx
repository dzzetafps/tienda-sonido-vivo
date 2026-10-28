interface InputProps {
  id: string
  tipo: string
  valor: string // Valor actual guardado en el estado del formulario
  alCambiar: (valor: string) => void // Función que actualiza ese estado
  invalido?: boolean
  soloLectura?: boolean
}

function Input({ id, tipo, valor, alCambiar, invalido = false, soloLectura = false }: InputProps) {
  return (
    <input
      id={id}
      name={id}
      type={tipo}
      className={invalido ? 'form-control is-invalid' : 'form-control'}
      value={valor}
      readOnly={soloLectura}
      aria-invalid={invalido}
      onChange={(evento) => alCambiar(evento.target.value)}
    />
  )
}

export default Input
