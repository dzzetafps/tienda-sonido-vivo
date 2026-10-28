import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

function Login() {
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState({ correo: '', contrasena: '' })
  const [datosValidos, setDatosValidos] = useState(false)

  function validarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const nuevosErrores = { correo: '', contrasena: '' }
    const correoIngresado = correo.trim()

    if (!correoIngresado) {
      nuevosErrores.correo = 'El correo es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoIngresado)) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.'
    } else if (correoIngresado.length > 100) {
      nuevosErrores.correo = 'El correo no puede superar los 100 caracteres.'
    }

    if (!contrasena.trim()) {
      nuevosErrores.contrasena = 'La contraseña es obligatoria.'
    } else if (contrasena.length < 4 || contrasena.length > 10) {
      nuevosErrores.contrasena = 'La contraseña debe tener entre 4 y 10 caracteres.'
    }

    setErrores(nuevosErrores)
    setDatosValidos(!nuevosErrores.correo && !nuevosErrores.contrasena)
  }

  return (
    <section className="row justify-content-center" aria-labelledby="titulo-login">
      <div className="col-12 col-md-8 col-lg-6">
        <div className="card shadow-sm">
          <div className="card-body p-4 p-md-5">
            <h1 className="h2 mb-3" id="titulo-login">Iniciar sesión</h1>
            <p className="text-secondary mb-4">Ingresa tus datos para acceder a Sonido Vivo.</p>

            <form onSubmit={validarFormulario} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="correo">Correo electrónico</label>
                <input
                  id="correo"
                  name="correo"
                  type="email"
                  autoComplete="email"
                  maxLength={100}
                  required
                  className={`form-control${errores.correo ? ' is-invalid' : ''}`}
                  value={correo}
                  onChange={(evento) => {
                    setCorreo(evento.target.value)
                    setErrores({ ...errores, correo: '' })
                    setDatosValidos(false)
                  }}
                  aria-invalid={Boolean(errores.correo)}
                  aria-describedby={errores.correo ? 'error-correo' : undefined}
                />
                {errores.correo && (
                  <div id="error-correo" className="invalid-feedback" role="alert">{errores.correo}</div>
                )}
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="contrasena">Contraseña</label>
                <input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  autoComplete="current-password"
                  minLength={4}
                  maxLength={10}
                  required
                  className={`form-control${errores.contrasena ? ' is-invalid' : ''}`}
                  value={contrasena}
                  onChange={(evento) => {
                    setContrasena(evento.target.value)
                    setErrores({ ...errores, contrasena: '' })
                    setDatosValidos(false)
                  }}
                  aria-invalid={Boolean(errores.contrasena)}
                  aria-describedby={errores.contrasena ? 'error-contrasena' : undefined}
                />
                {errores.contrasena && (
                  <div id="error-contrasena" className="invalid-feedback" role="alert">{errores.contrasena}</div>
                )}
              </div>

              {datosValidos && (
                <p className="alert alert-info" role="status">
                  Datos del formulario válidos. La autenticación estará disponible próximamente
                </p>
              )}
              <button type="submit" className="btn btn-primary w-100">Ingresar</button>
            </form>

            <p className="mt-4 mb-0">¿Aún no te registras? <Link to="/registro">Regístrate aquí</Link></p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Login
