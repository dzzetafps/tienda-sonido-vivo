import { Link } from 'react-router-dom'
import type { Producto } from '../../tipos/Producto'

interface TablaProductosAdminProps {
  productos: Producto[]
  onEliminar: (codigo: string) => void
}

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function TablaProductosAdmin({ productos, onEliminar }: TablaProductosAdminProps) {
  if (productos.length === 0) {
    return <p className="alert alert-light border">No hay productos que coincidan con la búsqueda.</p>
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle bg-white">
        <caption className="visually-hidden">Productos del catálogo</caption>
        <thead className="table-dark">
          <tr>
            <th scope="col">Código</th>
            <th scope="col">Nombre</th>
            <th scope="col" className="d-none d-md-table-cell">Categoría</th>
            <th scope="col" className="d-none d-lg-table-cell">Marca</th>
            <th scope="col" className="text-end">Precio</th>
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
              <td className="d-none d-lg-table-cell">{producto.marca}</td>
              <td className="text-end text-nowrap">{formatoPrecio.format(producto.precio)}</td>
              <td className="text-end">
                {producto.stock === 0 ? <span className="badge text-bg-secondary">Sin stock</span> : producto.stock}
              </td>
              <td>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    className="btn btn-sm btn-primary"
                    to={`/admin/productos/editar/${encodeURIComponent(producto.codigo)}`}
                    aria-label={`Editar producto ${producto.codigo}`}
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    aria-label={`Eliminar producto ${producto.codigo}`}
                    onClick={() => onEliminar(producto.codigo)}
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

export default TablaProductosAdmin
