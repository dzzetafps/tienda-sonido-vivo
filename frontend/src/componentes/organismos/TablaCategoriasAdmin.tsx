import { Link } from 'react-router-dom'
import type { FilaCategoria } from '../../datos/categoriasApi'

interface TablaCategoriasAdminProps {
  categorias: FilaCategoria[]
  onEditar: (categoria: FilaCategoria) => void
  onEliminar: (categoria: FilaCategoria) => void
}

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function TablaCategoriasAdmin({ categorias, onEditar, onEliminar }: TablaCategoriasAdminProps) {
  if (categorias.length === 0) {
    return <p className="alert alert-light border">No hay categorías para mostrar.</p>
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle bg-white">
        <caption className="visually-hidden">Categorías del catálogo</caption>
        <thead className="table-dark">
          <tr>
            <th scope="col">Categoría</th>
            <th scope="col" className="text-end">Productos</th>
            <th scope="col" className="text-end">Stock total</th>
            <th scope="col" className="text-end d-none d-md-table-cell">Valor del inventario</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categorias.map((categoria) => (
            <tr key={categoria.id}>
              <td>
                {categoria.nombre}
                {categoria.descripcion && <small className="d-block text-secondary">{categoria.descripcion}</small>}
              </td>
              <td className="text-end">{categoria.productos}</td>
              <td className="text-end">{categoria.stock}</td>
              <td className="text-end text-nowrap d-none d-md-table-cell">{formatoPrecio.format(categoria.valor)}</td>
              <td>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    className="btn btn-sm btn-primary"
                    to={`/admin/productos?categoria=${encodeURIComponent(categoria.nombre)}`}
                    aria-label={`Ver productos de ${categoria.nombre}`}
                  >
                    Ver productos
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    aria-label={`Editar ${categoria.nombre}`}
                    onClick={() => onEditar(categoria)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    aria-label={`Eliminar ${categoria.nombre}`}
                    onClick={() => onEliminar(categoria)}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaCategoriasAdmin
