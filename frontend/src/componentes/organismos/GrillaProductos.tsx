import TarjetaProducto from '../moleculas/TarjetaProducto'
import type { Producto } from '../../tipos/Producto'

interface GrillaProductosProps {
  productos: Producto[]
}

function GrillaProductos({ productos }: GrillaProductosProps) {
  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
      {productos.map((producto) => (
        <div className="col" key={producto.codigo}>
          <TarjetaProducto producto={producto} />
        </div>
      ))}
    </div>
  )
}

export default GrillaProductos
