import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../componentes/atomos/Input'
import TablaPedidosAdmin from '../componentes/organismos/TablaPedidosAdmin'
import { mensajeError } from '../datos/api'
import { estadosPedido, nombresEstado } from '../datos/pedidosAdmin'
import { listarPedidos } from '../datos/pedidosApi'
import type { Pedido } from '../tipos/Pedido'

function AdminPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [estado, setEstado] = useState('')

  useEffect(() => {
    let activo = true
    listarPedidos()
      .then((lista) => {
        if (activo) setPedidos(lista)
      })
      .catch((e) => {
        if (activo) setError(mensajeError(e, 'No se pudieron cargar los pedidos.'))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  const texto = busqueda.trim().toLocaleLowerCase('es-CL')
  const pedidosFiltrados = pedidos
    .filter((pedido) => {
      const coincideEstado = estado === '' || pedido.estado === estado
      const coincideTexto = [pedido.id, pedido.comprador.nombre, pedido.comprador.apellido, pedido.comprador.correo]
        .some((valor) => (valor ?? '').toLocaleLowerCase('es-CL').includes(texto))
      return coincideEstado && coincideTexto
    })
    .sort((primero, segundo) => segundo.fecha.localeCompare(primero.fecha))

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Panel</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Pedidos</li>
        </ol>
      </nav>

      <h1 className="mb-4">Pedidos</h1>

      {cargando ? (
        <p className="text-secondary" role="status">Cargando pedidos...</p>
      ) : error ? (
        <p className="alert alert-danger" role="alert">{error}</p>
      ) : pedidos.length === 0 ? (
        <p className="alert alert-light border">
          Todavía no hay pedidos registrados. Aparecerán aquí cuando un cliente confirme una compra.
        </p>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-8">
              <label className="form-label" htmlFor="busqueda-pedidos">Buscar por pedido, cliente o correo</label>
              <Input id="busqueda-pedidos" tipo="search" valor={busqueda} alCambiar={setBusqueda} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="estado-pedidos">Estado</label>
              <select id="estado-pedidos" className="form-select" value={estado} onChange={(evento) => setEstado(evento.target.value)}>
                <option value="">Todos los estados</option>
                {estadosPedido.map((opcion) => <option key={opcion} value={opcion}>{nombresEstado[opcion]}</option>)}
              </select>
            </div>
          </div>
          <p aria-live="polite">
            Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos
          </p>
          <TablaPedidosAdmin pedidos={pedidosFiltrados} />
        </>
      )}
    </section>
  )
}

export default AdminPedidos
