import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import EstadoPedidoBadge from '../componentes/atomos/EstadoPedidoBadge'
import type { Aviso } from '../datos/avisos'
import { formatearFecha, formatearPrecio } from '../datos/formatos'
import { codigoPedido, estadosPedido, nombresEstado } from '../datos/pedidosAdmin'
import { buscarPedidoPorId, cambiarEstadoPedido } from '../datos/pedidosService.js'
import type { EstadoPedido, Pedido } from '../tipos/Pedido'

function leerPedido(id: string): { pedido: Pedido | undefined; error: string } {
  try {
    const pedido = buscarPedidoPorId(id)
    return pedido ? { pedido, error: '' } : { pedido: undefined, error: 'No se encontró el pedido solicitado.' }
  } catch (error) {
    return { pedido: undefined, error: error instanceof Error ? error.message : 'No se pudieron cargar los pedidos.' }
  }
}

function AdminDetallePedido() {
  const { id = '' } = useParams<{ id: string }>()
  const [datos, setDatos] = useState(() => leerPedido(id))
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPedido>(datos.pedido?.estado ?? 'pagado')
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const pedido = datos.pedido

  function guardarEstado(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (!pedido || nuevoEstado === pedido.estado) return
    if (nuevoEstado === 'cancelado' && !window.confirm('¿Cancelar este pedido? El stock no se repone automáticamente.')) return

    try {
      const actualizado = cambiarEstadoPedido(pedido.id, nuevoEstado)
      setDatos({ pedido: actualizado, error: '' })
      setAviso({
        tipo: 'success',
        texto: actualizado.estado === 'cancelado'
          ? 'Pedido cancelado. El stock no se repuso; si corresponde, ajústalo en Productos.'
          : `Estado actualizado a ${nombresEstado[actualizado.estado]}.`,
      })
    } catch (error) {
      setAviso({ tipo: 'danger', texto: error instanceof Error ? error.message : 'No se pudo cambiar el estado del pedido.' })
    }
  }

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Panel</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/pedidos">Pedidos</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{pedido ? codigoPedido(pedido.id) : 'Detalle'}</li>
        </ol>
      </nav>

      {!pedido ? (
        <>
          <p className="alert alert-danger" role="alert">{datos.error}</p>
          <Link className="btn btn-outline-secondary" to="/admin/pedidos">Volver a pedidos</Link>
        </>
      ) : (
        <>
          <div className="d-flex flex-wrap align-items-center gap-3 mb-1">
            <h1 className="mb-0">Pedido {codigoPedido(pedido.id)}</h1>
            <EstadoPedidoBadge estado={pedido.estado} />
          </div>
          <p className="text-secondary">Realizado el {formatearFecha(pedido.fecha)}</p>

          {aviso && (
            <div
              className={`alert alert-${aviso.tipo} d-flex justify-content-between align-items-start gap-3`}
              role={aviso.tipo === 'danger' ? 'alert' : 'status'}
            >
              <span>{aviso.texto}</span>
              <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setAviso(null)} />
            </div>
          )}

          <div className="row g-4">
            <div className="col-12 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5">Productos</h2>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead>
                        <tr>
                          <th scope="col">Producto</th>
                          <th scope="col" className="text-end">Cantidad</th>
                          <th scope="col" className="text-end d-none d-sm-table-cell">Precio</th>
                          <th scope="col" className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pedido.items.map((item) => (
                          <tr key={item.codigo}>
                            <td>
                              {item.nombre}
                              <span className="d-block small text-secondary">{item.codigo}</span>
                            </td>
                            <td className="text-end">{item.cantidad}</td>
                            <td className="text-end text-nowrap d-none d-sm-table-cell">{formatearPrecio(item.precioUnitario)}</td>
                            <td className="text-end text-nowrap">{formatearPrecio(item.cantidad * item.precioUnitario)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th scope="row" colSpan={2}>Total</th>
                          <td className="d-none d-sm-table-cell" />
                          <td className="text-end fw-bold text-nowrap">{formatearPrecio(pedido.total)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-4 d-flex flex-column gap-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5">Estado del pedido</h2>
                  <form onSubmit={guardarEstado}>
                    <label className="form-label" htmlFor="estado-pedido">Cambiar estado</label>
                    <select
                      id="estado-pedido"
                      className="form-select mb-3"
                      value={nuevoEstado}
                      onChange={(evento) => setNuevoEstado(estadosPedido.find((opcion) => opcion === evento.target.value) ?? pedido.estado)}
                    >
                      {estadosPedido.map((opcion) => <option key={opcion} value={opcion}>{nombresEstado[opcion]}</option>)}
                    </select>
                    <button type="submit" className="btn btn-primary" disabled={nuevoEstado === pedido.estado}>
                      Guardar estado
                    </button>
                  </form>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5">Comprador</h2>
                  <p className="mb-1">{pedido.comprador.nombre} {pedido.comprador.apellido}</p>
                  <p className="mb-1 text-break">{pedido.comprador.correo}</p>
                  <p className="small text-secondary mb-0">
                    {pedido.usuarioId ? 'Cliente con cuenta registrada' : 'Compra sin cuenta'}
                  </p>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-body">
                  <h2 className="h5">Entrega</h2>
                  {pedido.entrega.tipo === 'retiro' ? (
                    <p className="mb-0">Retiro en tienda</p>
                  ) : (
                    <>
                      <p className="mb-1">Despacho a domicilio</p>
                      <p className="mb-1">
                        {pedido.entrega.calle} {pedido.entrega.numero}
                        {pedido.entrega.complemento && `, ${pedido.entrega.complemento}`}
                      </p>
                      <p className="mb-1">{pedido.entrega.comuna}, {pedido.entrega.region}</p>
                      {pedido.entrega.indicaciones && (
                        <p className="small text-secondary mb-0">Indicaciones: {pedido.entrega.indicaciones}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

export default AdminDetallePedido
