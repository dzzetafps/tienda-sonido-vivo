import { useState } from 'react'
import { Link } from 'react-router-dom'
import TarjetaIndicador from '../componentes/moleculas/TarjetaIndicador'
import TablaStockBajo from '../componentes/organismos/TablaStockBajo'
import { calcularValorInventario, leerCatalogo, productosConStockBajo } from '../datos/catalogoAdmin'

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

const opcionesLimite = [2, 3, 5]

function AdminReportes() {
  const [catalogo] = useState(leerCatalogo)
  const [limite, setLimite] = useState(3)

  const stockBajo = productosConStockBajo(catalogo.productos, limite)
  const unidades = catalogo.productos.reduce((total, producto) => total + producto.stock, 0)
  const sinStock = catalogo.productos.filter((producto) => producto.stock === 0).length
  const indicadores = [
    { titulo: 'Valor del inventario', valor: formatoPrecio.format(calcularValorInventario(catalogo.productos)) },
    { titulo: 'Unidades en stock', valor: unidades },
    { titulo: 'Productos', valor: catalogo.productos.length },
    { titulo: 'Sin stock', valor: sinStock },
  ]

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Panel</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Reportes</li>
        </ol>
      </nav>

      <h1>Reportes</h1>

      {catalogo.error ? (
        <p className="alert alert-danger" role="alert">{catalogo.error}</p>
      ) : (
        <>
          <h2 className="h4 mt-4">Inventario</h2>
          <div className="row g-3 mb-5">
            {indicadores.map((indicador) => (
              <div className="col-12 col-sm-6 col-lg-3" key={indicador.titulo}>
                <TarjetaIndicador titulo={indicador.titulo} valor={indicador.valor} />
              </div>
            ))}
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
            <h2 className="h4 mb-0">Productos con stock bajo</h2>
            <div>
              <label className="form-label" htmlFor="limite-stock">Mostrar con stock hasta</label>
              <select
                id="limite-stock"
                className="form-select"
                value={limite}
                onChange={(evento) => setLimite(Number(evento.target.value))}
              >
                {opcionesLimite.map((opcion) => (
                  <option key={opcion} value={opcion}>{opcion} unidades</option>
                ))}
              </select>
            </div>
          </div>
          <p aria-live="polite">
            {stockBajo.length} productos con stock igual o menor a {limite} unidades
          </p>
          <TablaStockBajo productos={stockBajo} />
        </>
      )}
    </section>
  )
}

export default AdminReportes
