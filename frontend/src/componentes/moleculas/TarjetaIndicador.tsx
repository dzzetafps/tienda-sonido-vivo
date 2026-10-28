interface TarjetaIndicadorProps {
  titulo: string
  valor: string | number
}

function TarjetaIndicador({ titulo, valor }: TarjetaIndicadorProps) {
  return (
    <div className="card text-center h-100">
      <div className="card-body">
        <p className="text-secondary mb-1">{titulo}</p>
        <p className="fs-3 fw-bold mb-0 text-break">{valor}</p>
      </div>
    </div>
  )
}

export default TarjetaIndicador
