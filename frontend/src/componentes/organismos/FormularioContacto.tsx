import { useState } from 'react'
import type { SubmitEvent } from 'react'
import CampoFormulario from '../moleculas/CampoFormulario'
import type { MensajeContacto } from '../../tipos/MensajeContacto'

interface FormularioContactoProps {
  onEnviar: (mensaje: MensajeContacto) => void
}

type ErroresContacto = Partial<Record<keyof MensajeContacto, string>>

const MAXIMO_COMENTARIO = 500

function FormularioContacto({ onEnviar }: FormularioContactoProps) {
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [comentario, setComentario] = useState('')
  const [errores, setErrores] = useState<ErroresContacto>({})

  function validar(): ErroresContacto {
    const nuevosErrores: ErroresContacto = {}
    const correoIngresado = correo.trim()

    if (nombre.trim() === '') nuevosErrores.nombre = 'El nombre es obligatorio'
    else if (nombre.trim().length > 100) nuevosErrores.nombre = 'El nombre no puede tener más de 100 caracteres'

    if (correoIngresado.length > 100) {
      nuevosErrores.correo = 'El correo no puede tener más de 100 caracteres'
    } else if (correoIngresado !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoIngresado)) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido'
    }

    if (comentario.trim() === '') nuevosErrores.comentario = 'El comentario es obligatorio'
    else if (comentario.trim().length > MAXIMO_COMENTARIO) {
      nuevosErrores.comentario = `El comentario no puede tener más de ${MAXIMO_COMENTARIO} caracteres`
    }

    return nuevosErrores
  }

  function manejarEnvio(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()

    const nuevosErrores = validar()
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    onEnviar({ nombre: nombre.trim(), correo: correo.trim().toLowerCase(), comentario: comentario.trim() })
    setNombre('')
    setCorreo('')
    setComentario('')
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <div className="mb-3">
        <CampoFormulario etiqueta="Nombre" id="contacto-nombre" tipo="text" valor={nombre} alCambiar={setNombre} error={errores.nombre} />
      </div>
      <div className="mb-3">
        <CampoFormulario
          etiqueta="Correo"
          id="contacto-correo"
          tipo="email"
          valor={correo}
          alCambiar={setCorreo}
          error={errores.correo}
          ayuda="Opcional. Escríbelo si quieres que te respondamos por correo."
        />
      </div>
      <div className="mb-3">
        <label className="form-label" htmlFor="contacto-comentario">Comentario</label>
        <textarea
          id="contacto-comentario"
          className={errores.comentario ? 'form-control is-invalid' : 'form-control'}
          rows={6}
          value={comentario}
          aria-invalid={Boolean(errores.comentario)}
          onChange={(evento) => setComentario(evento.target.value)}
        />
        {errores.comentario && <div className="invalid-feedback">{errores.comentario}</div>}
        <div className="form-text">{comentario.trim().length} de {MAXIMO_COMENTARIO} caracteres</div>
      </div>
      <button type="submit" className="btn btn-primary">Enviar mensaje</button>
    </form>
  )
}

export default FormularioContacto
