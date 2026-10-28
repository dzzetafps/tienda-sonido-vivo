import { useState } from 'react'
import { Link } from 'react-router-dom'
import TarjetaIndicador from '../componentes/moleculas/TarjetaIndicador'
import TablaMasVendidos from '../componentes/organismos/TablaMasVendidos'
import TablaPedidosPorEstado from '../componentes/organismos/TablaPedidosPorEstado'
import TablaStockBajo from '../componentes/organismos/TablaStockBajo'
import { calcularValorInventario, leerCatalogo, productosConStockBajo } from '../datos/catalogoAdmin'
import { formatearPrecio } from '../datos/formatos'
import { calcularTotalVendido, leerPedidos, pedidosVigentes, productosMasVendidos, resumirPorEstado } from '../datos/pedidosAdmin'

const opcionesLimite = [2, 3, 5]

function AdminReportes() {
  const [catalogo] = useState(leerCatalogo)
  const [ventas] = useState(leerPedidos)
  const [limite, setLimite] = useState(3)

  const vigentes = pedidosVigentes(ventas.pedidos)
  const indicadoresVentas = [
    { titulo: 'Total vendido', valor: formatearPrecio(calcularTotalVendido(ventas.pedidos)) },
    { titulo: 'Pedidos vigentes', valor: vigentes.length },
    { titulo: 'Unidades vendidas', valor: vigentes.reduce((total, pedido) => total + pedido.items.reduce((suma, item) => suma + item.cantidad, 0), 0) },
    { titulo: 'Pedidos cancelados', valor: ventas.pedidos.length - vigentes.length },
  ]

  const stockBajo = productosConStockBajo(catalogo.productos, limite)
  const unidades = catalogo.productos.reduce((total, producto) => total + producto.stock, 0)
  const sinStock = catalogo.productos.filter((producto) => producto.stock === 0).length
  const indicadores = [
    { titulo: 'Valor del inventario', valor: formatearPrecio(calcularValorInventario(catalogo.productos)) },
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

      <h2 className="h4 mt-4">Ventas</h2>
      <p className="text-secondary">Los pedidos cancelados no se suman a las ventas.</p>
      {ventas.error ? (
        <p className="alert alert-danger" role="alert">{ventas.error}</p>
      ) : (
        <>
          <div className="row g-3 mb-4">
            {indicadoresVentas.map((indicador) => (
              <div className="col-12 col-sm-6 col-lg-3" key={indicador.titulo}>
                <TarjetaIndicador titulo={indicador.titulo} valor={indicador.valor} />
              </div>
            ))}
          </div>
          <div className="row g-4 mb-5">
            <div className="col-12 col-lg-5">
              <h3 className="h5">Pedidos por estado</h3>
              <TablaPedidosPorEstado resumen={resumirPorEstado(ventas.pedidos)} />
            </div>
            <div className="col-12 col-lg-7">
              <h3 className="h5">Productos más vendidos</h3>
              <TablaMasVendidos productos={productosMasVendidos(ventas.pedidos, 5)} />
            </div>
          </div>
        </>
      )}

      {catalogo.error ? (
        <p className="alert alert-danger" role="alert">{catalogo.error}</p>
      ) : (
        <>
          <h2 className="h4">Inventario</h2>
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
