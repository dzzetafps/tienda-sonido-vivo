import { Link, useSearchParams } from 'react-router-dom'
import { buscarPedidoPorId } from '../datos/pedidosService.js'
import type { Pedido } from '../tipos/Pedido'

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function textoValido(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.trim().length > 0
}

function CompraExitosa() {
  const [parametros] = useSearchParams()
  const id = parametros.get('pedido')
  let pedido: Pedido | undefined
  try {
    if (id?.trim()) pedido = buscarPedidoPorId(id)
  } catch {
    pedido = undefined
  }

  if (!pedido || pedido.estado === 'cancelado') {
    return (
      <section className="row justify-content-center" aria-labelledby="titulo-sin-compra">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h1 className="h2 mb-4" id="titulo-sin-compra">Información de compra</h1>
              <p className="alert alert-warning" role="status">No hay una compra confirmada disponible.</p>
              <Link className="btn btn-primary" to="/productos">Volver al catálogo</Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const compra = {
    identificador: pedido.id,
    cliente: pedido.comprador,
    entrega: pedido.entrega,
    productos: pedido.items,
    total: pedido.total,
  }

  return (
    <section aria-labelledby="titulo-compra-exitosa">
      <h1 id="titulo-compra-exitosa">Compra realizada con éxito</h1>
      <p className="text-secondary">Compra confirmada en la simulación académica; no se realizó un pago bancario.</p>
      <p className="text-secondary text-break mb-4">Identificador de compra: <strong>{compra.identificador}</strong></p>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body text-break">
              <h2 className="h4 mb-3">Datos del cliente</h2>
              <dl className="mb-0">
                <dt>Nombre</dt>
                <dd>{compra.cliente.nombre} {compra.cliente.apellido}</dd>
                <dt>Correo electrónico</dt>
                <dd className="mb-0">{compra.cliente.correo}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body text-break">
              <h2 className="h4 mb-3">Información de entrega</h2>
              {compra.entrega.tipo === 'retiro' ? (
                <p className="mb-0">Retiro en tienda Sonido Vivo.</p>
              ) : (
                <>
                  <p>Despacho a domicilio</p>
                  <p className="mb-1">{compra.entrega.calle} {compra.entrega.numero}</p>
                  {textoValido(compra.entrega.complemento) && <p className="mb-1">{compra.entrega.complemento}</p>}
                  <p className="mb-0">{compra.entrega.comuna}, {compra.entrega.region}</p>
                  {textoValido(compra.entrega.indicaciones) && (
                    <p className="mt-3 mb-0"><strong>Indicaciones:</strong> {compra.entrega.indicaciones}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h4 mb-3">Resumen de productos</h2>
          <div className="table-responsive">
            <table className="table align-middle">
              <caption>Productos de la compra confirmada. Precios en pesos chilenos.</caption>
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col" className="text-end">Precio unitario</th>
                  <th scope="col" className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {compra.productos.map((producto) => (
                  <tr key={producto.codigo}>
                    <th scope="row" className="fw-normal text-break">{producto.nombre}</th>
                    <td>{producto.cantidad}</td>
                    <td className="text-end text-nowrap">{formatoPrecio.format(producto.precioUnitario)}</td>
                    <td className="text-end text-nowrap">{formatoPrecio.format(producto.precioUnitario * producto.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={3}>Total (CLP)</th>
                  <td className="text-end text-nowrap fw-bold">{formatoPrecio.format(compra.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <Link className="btn btn-primary" to="/productos">Volver al catálogo</Link>
    </section>
  )
}

export default CompraExitosa
