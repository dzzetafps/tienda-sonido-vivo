import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { buscarPedidoPorId } from '../datos/pedidosClienteApi'
import type { PedidoCliente } from '../datos/pedidosClienteApi'

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function CompraExitosa() {
  const [parametros] = useSearchParams()
  const id = parametros.get('pedido')

  const [pedido, setPedido] = useState<PedidoCliente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true

    async function cargarPedido() {
      setCargando(true)
      setError('')
      setPedido(null)

      if (!id?.trim()) {
        setError('No se indicó un pedido válido.')
        setCargando(false)
        return
      }

      try {
        const resultado = await buscarPedidoPorId(id)

        if (activo) setPedido(resultado)
      } catch (problema) {
        if (activo) {
          setError(
            problema instanceof Error
              ? problema.message
              : 'No se pudo consultar el pedido.',
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargarPedido()

    return () => {
      activo = false
    }
  }, [id])

  if (cargando) {
    return <p role="status">Consultando pedido...</p>
  }

  if (error || !pedido) {
    return (
      <section>
        <h1>Información de compra</h1>

        <p className="alert alert-danger" role="alert">
          {error || 'No hay una compra disponible.'}
        </p>

        <Link className="btn btn-primary" to="/mis-pedidos">
          Mis pedidos
        </Link>
      </section>
    )
  }

  if (pedido.estado === 'pendiente') {
    return (
      <section>
        <h1>Pedido pendiente</h1>

        <p className="alert alert-warning">
          La compra todavía no está confirmada.
        </p>

        <Link className="btn btn-warning" to="/checkout">
          Reintentar confirmación
        </Link>
      </section>
    )
  }

  if (pedido.estado === 'cancelado') {
    return (
      <section>
        <h1>Pedido cancelado</h1>

        <p className="alert alert-warning">
          Este pedido fue cancelado.
        </p>

        <Link className="btn btn-primary" to="/mis-pedidos">
          Mis pedidos
        </Link>
      </section>
    )
  }

  return (
    <section aria-labelledby="titulo-compra-exitosa">
      <h1 id="titulo-compra-exitosa">
        Compra realizada con éxito
      </h1>

      <p className="text-secondary">
        Compra confirmada en la simulación académica.
        No se realizó un pago bancario.
      </p>

      <p className="text-break">
        Identificador: <strong>{pedido.id}</strong>
      </p>

      <p>
        Estado: <strong>{pedido.estado}</strong>
      </p>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body text-break">
              <h2 className="h4">Datos del cliente</h2>

              <p>
                {pedido.comprador.nombre} {pedido.comprador.apellido}
              </p>

              <p>{pedido.comprador.correo}</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body text-break">
              <h2 className="h4">Información de entrega</h2>

              {pedido.entrega.tipo === 'retiro' ? (
                <p>Retiro en tienda Sonido Vivo.</p>
              ) : (
                <>
                  <p>Despacho a domicilio</p>

                  <p>
                    {pedido.entrega.calle} {pedido.entrega.numero}
                  </p>

                  {pedido.entrega.complemento && (
                    <p>{pedido.entrega.complemento}</p>
                  )}

                  <p>
                    {pedido.entrega.comuna}, {pedido.entrega.region}
                  </p>

                  {pedido.entrega.indicaciones && (
                    <p>{pedido.entrega.indicaciones}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h4">Resumen de productos</h2>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th className="text-end">Precio unitario</th>
                  <th className="text-end">Subtotal</th>
                </tr>
              </thead>

              <tbody>
                {pedido.items.map((item) => (
                  <tr key={item.codigo}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad}</td>

                    <td className="text-end text-nowrap">
                      {formatoPrecio.format(item.precioUnitario)}
                    </td>

                    <td className="text-end text-nowrap">
                      {formatoPrecio.format(
                        item.precioUnitario * item.cantidad,
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <th colSpan={3}>Total (CLP)</th>

                  <td className="text-end fw-bold">
                    {formatoPrecio.format(pedido.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2">
        <Link className="btn btn-primary" to="/productos">
          Volver al catálogo
        </Link>

        <Link className="btn btn-outline-secondary" to="/mis-pedidos">
          Mis pedidos
        </Link>
      </div>
    </section>
  )
}

export default CompraExitosa