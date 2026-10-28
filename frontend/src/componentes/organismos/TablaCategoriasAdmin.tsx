import { Link } from 'react-router-dom'
import type { ResumenCategoria } from '../../datos/catalogoAdmin'

interface TablaCategoriasAdminProps {
  categorias: ResumenCategoria[]
}

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function TablaCategoriasAdmin({ categorias }: TablaCategoriasAdminProps) {
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
            <tr key={categoria.categoria}>
              <td>{categoria.categoria}</td>
              <td className="text-end">{categoria.productos}</td>
              <td className="text-end">{categoria.stock}</td>
              <td className="text-end text-nowrap d-none d-md-table-cell">{formatoPrecio.format(categoria.valor)}</td>
              <td>
                <Link
                  className="btn btn-sm btn-primary"
                  to={`/admin/productos?categoria=${encodeURIComponent(categoria.categoria)}`}
                  aria-label={`Ver productos de ${categoria.categoria}`}
                >
                  Ver productos
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaCategoriasAdmin
