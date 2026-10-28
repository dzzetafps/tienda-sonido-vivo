import { useState } from 'react'
import FormularioContacto from '../componentes/organismos/FormularioContacto'
import type { MensajeContacto } from '../tipos/MensajeContacto'

function Contacto() {
  const [enviadoPor, setEnviadoPor] = useState('')

  function recibirMensaje(mensaje: MensajeContacto) {
    setEnviadoPor(mensaje.nombre)
  }

  return (
    <section className="row justify-content-center">
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

        <div className="card shadow-sm">
          <div className="card-body p-4">
            <FormularioContacto onEnviar={recibirMensaje} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contacto
