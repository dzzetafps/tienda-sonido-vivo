import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mensajeError } from '../datos/api'
import { listarMensajes } from '../datos/contactosApi'
import { formatearFecha } from '../datos/formatos'
import type { MensajeRecibido } from '../tipos/MensajeContacto'

function AdminMensajes() {
  const [mensajes, setMensajes] = useState<MensajeRecibido[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    listarMensajes()
      .then((lista) => {
        if (activo) setMensajes(lista)
      })
      .catch((e) => {
        if (activo) setError(mensajeError(e, 'No se pudieron cargar los mensajes.'))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Panel</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Mensajes</li>
        </ol>
      </nav>

      <h1 className="mb-4">Mensajes de contacto</h1>

      {cargando ? (
        <p className="text-secondary" role="status">Cargando mensajes...</p>
      ) : error ? (
        <p className="alert alert-danger" role="alert">{error}</p>
      ) : mensajes.length === 0 ? (
        <p className="alert alert-light border">Todavía no hay mensajes.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle bg-white">
            <caption className="visually-hidden">Mensajes recibidos desde el formulario de contacto</caption>
            <thead className="table-dark">
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Nombre</th>
                <th scope="col" className="d-none d-md-table-cell">Correo</th>
                <th scope="col">Comentario</th>
              </tr>
            </thead>
            <tbody>
              {mensajes.map((mensaje) => (
                <tr key={mensaje.id}>
                  <td className="text-nowrap">{formatearFecha(mensaje.fechaEnvio)}</td>
                  <td>{mensaje.nombre}</td>
                  <td className="d-none d-md-table-cell">{mensaje.correo || '—'}</td>
                  <td>{mensaje.comentario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default AdminMensajes
