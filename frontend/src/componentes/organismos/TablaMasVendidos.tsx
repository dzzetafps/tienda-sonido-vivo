import { formatearPrecio } from '../../datos/formatos'
import type { ProductoVendido } from '../../datos/pedidosAdmin'

interface TablaMasVendidosProps {
  productos: ProductoVendido[]
}

function TablaMasVendidos({ productos }: TablaMasVendidosProps) {
  if (productos.length === 0) {
    return <p className="alert alert-light border">Aún no hay ventas registradas.</p>
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle bg-white">
        <caption className="visually-hidden">Productos más vendidos</caption>
        <thead className="table-dark">
          <tr>
            <th scope="col">#</th>
            <th scope="col">Producto</th>
            <th scope="col" className="text-end">Unidades</th>
            <th scope="col" className="text-end">Total vendido</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto, indice) => (
            <tr key={producto.codigo}>
              <td>{indice + 1}</td>
              <td>
                {producto.nombre}
                <span className="d-block small text-secondary">{producto.codigo}</span>
              </td>
              <td className="text-end">{producto.unidades}</td>
              <td className="text-end text-nowrap">{formatearPrecio(producto.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaMasVendidos
