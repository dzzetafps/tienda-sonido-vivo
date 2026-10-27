interface FiltrosProductosProps {
  busqueda: string
  categoria: string
  categorias: string[]
  onBusquedaChange: (valor: string) => void
  onCategoriaChange: (valor: string) => void
}

function FiltrosProductos({
  busqueda,
  categoria,
  categorias,
  onBusquedaChange,
  onCategoriaChange,
}: FiltrosProductosProps) {
  return (
    <div className="row g-3 mb-4">
      <div className="col-12 col-md-8">
        <label className="form-label" htmlFor="busqueda-productos">Buscar productos</label>
        <input
          id="busqueda-productos"
          type="search"
          className="form-control"
          placeholder="Nombre, marca, modelo o código"
          value={busqueda}
          onChange={(event) => onBusquedaChange(event.target.value)}
        />
      </div>
      <div className="col-12 col-md-4">
        <label className="form-label" htmlFor="categoria-productos">Categoría</label>
        <select
          id="categoria-productos"
          className="form-select"
          value={categoria}
          onChange={(event) => onCategoriaChange(event.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((nombre) => <option key={nombre} value={nombre}>{nombre}</option>)}
        </select>
      </div>
    </div>
  )
}

export default FiltrosProductos
