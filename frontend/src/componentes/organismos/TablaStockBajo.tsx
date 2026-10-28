import { Link } from 'react-router-dom'
import type { Producto } from '../../tipos/Producto'

interface TablaStockBajoProps {
  productos: Producto[]
}

function TablaStockBajo({ productos }: TablaStockBajoProps) {
  if (productos.length === 0) {
    return <p className="alert alert-success">No hay productos con stock bajo.</p>
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle bg-white">
        <caption className="visually-hidden">Productos con stock bajo</caption>
        <thead className="table-dark">
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Nombre</th>
            <th scope="col" className="d-none d-md-table-cell">Categoría</th>
            <th scope="col" className="text-end">Stock</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto.codigo}>
              <td>{producto.codigo}</td>
              <td>{producto.nombre}</td>
              <td className="d-none d-md-table-cell">{producto.categoria}</td>
              <td className="text-end">
                <span className={producto.stock === 0 ? 'badge text-bg-danger' : 'badge text-bg-warning'}>
                  {producto.stock === 0 ? 'Sin stock' : producto.stock}
                </span>
              </td>
              <td>
                <Link
                  className="btn btn-sm btn-primary"
                  to={`/admin/productos/editar/${encodeURIComponent(producto.codigo)}`}
                  aria-label={`Reponer stock de ${producto.codigo}`}
                >
                  Reponer
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaStockBajo
