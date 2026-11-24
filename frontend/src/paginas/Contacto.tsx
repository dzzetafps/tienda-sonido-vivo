import { useState } from 'react'
import { Link } from 'react-router-dom'
import FormularioContacto from '../componentes/organismos/FormularioContacto'
import { ErrorApi, mensajeError } from '../datos/api'
import { enviarMensaje } from '../datos/contactosApi'
import type { MensajeContacto } from '../tipos/MensajeContacto'

function Contacto() {
  const [enviadoPor, setEnviadoPor] = useState('')
  const [error, setError] = useState('')
  const [sinSesion, setSinSesion] = useState(false)

  async function recibirMensaje(mensaje: MensajeContacto) {
    setEnviadoPor('')
    setError('')
    setSinSesion(false)
    try {
      await enviarMensaje(mensaje)
      setEnviadoPor(mensaje.nombre)
      return true
    } catch (e) {
      setSinSesion(e instanceof ErrorApi && e.estado === 401)
      setError(mensajeError(e, 'No se pudo enviar el mensaje.'))
      return false
    }
  }

  return (
    <section className="row justify-content-center g-4">
      <div className="col-12 col-md-8 col-lg-6">
        <h1>Contacto</h1>
        <p className="lead">Envíanos tu consulta y nos pondremos en contacto contigo.</p>
        <p className="text-secondary">Sonido Vivo · Instrumentos y equipos musicales en Viña del Mar.</p>

        {enviadoPor && (
          <div className="alert alert-success d-flex justify-content-between align-items-start gap-3" role="status">
            <span>Comentario registrado con éxito. Gracias por escribirnos, {enviadoPor}.</span>
            <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setEnviadoPor('')} />
          </div>
        )}

        {error && (
          <div className="alert alert-danger" role="alert">
            {error} {sinSesion && <Link to="/login">Iniciar sesión</Link>}
          </div>
        )}

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <FormularioContacto onEnviar={recibirMensaje} />
          </div>
        </div>
      </div>

      <div className="col-12 col-lg-5">
        <h2 className="h4">Dónde estamos</h2>
        <p className="text-secondary">Tienda física y retiro de pedidos en Viña del Mar.</p>
        <div className="ratio ratio-4x3 border rounded">
          <iframe
            title="Mapa de Viña del Mar"
            src="https://www.google.com/maps?q=Vi%C3%B1a+del+Mar,+Chile&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}

export default Contacto
