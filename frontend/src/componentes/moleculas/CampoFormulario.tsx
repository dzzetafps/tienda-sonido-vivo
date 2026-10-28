import Input from '../atomos/Input'

interface CampoFormularioProps {
  etiqueta: string
  id: string
  tipo: string
  valor: string
  alCambiar: (valor: string) => void
  error?: string
  soloLectura?: boolean
  ayuda?: string
}

function CampoFormulario({
  etiqueta,
  id,
  tipo,
  valor,
  alCambiar,
  error = '',
  soloLectura = false,
  ayuda = '',
}: CampoFormularioProps) {
  return (
    <div>
      <label className="form-label" htmlFor={id}>{etiqueta}</label>
      <Input
        id={id}
        tipo={tipo}
        valor={valor}
        alCambiar={alCambiar}
        invalido={error !== ''}
        soloLectura={soloLectura}
      />
      {error !== '' && <div className="invalid-feedback">{error}</div>}
      {ayuda !== '' && <div className="form-text">{ayuda}</div>}
    </div>
  )
}

export default CampoFormulario
