import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { regiones } from '../datos/regiones.js'
import { registrarCliente } from '../datos/usuariosService.js'

interface DatosRegistro {
  rut: string
  nombre: string
  apellidos: string
  correo: string
  fechaNacimiento: string
  rol: string
  region: string
  comuna: string
  direccion: string
  contrasena: string
  confirmarContrasena: string
}

type ErroresRegistro = Partial<Record<keyof DatosRegistro, string>>

function validarRut(rut: string) {
  const rutLimpio = rut.trim().replace(/[.-]/g, '').toUpperCase()
  if (!/^\d{1,8}[\dK]$/.test(rutLimpio)) return false

  const cuerpo = rutLimpio.slice(0, -1)
  const digitoIngresado = rutLimpio.slice(-1)
  if (Number(cuerpo) === 0) return false

  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }

  const resto = 11 - (suma % 11)
  let digitoCalculado = String(resto)
  if (resto === 11) digitoCalculado = '0'
  if (resto === 10) digitoCalculado = 'K'
  return digitoCalculado === digitoIngresado
}

function Registro() {
  const [datos, setDatos] = useState<DatosRegistro>({
    rut: '',
    nombre: '',
    apellidos: '',
    correo: '',
    fechaNacimiento: '',
    rol: 'cliente',
    region: '',
    comuna: '',
    direccion: '',
    contrasena: '',
    confirmarContrasena: '',
  })
  const [errores, setErrores] = useState<ErroresRegistro>({})
  const [registrando, setRegistrando] = useState(false)
  const [cuentaCreada, setCuentaCreada] = useState(false)
  const [errorRegistro, setErrorRegistro] = useState('')
  const regionSeleccionada = regiones.find((region) => region.nombre === datos.region)
  const comunas = regionSeleccionada?.comunas ?? []

  function actualizarCampo(campo: keyof DatosRegistro, valor: string) {
    if (campo === 'region') {
      setDatos({ ...datos, region: valor, comuna: '' })
      setErrores({ ...errores, region: undefined, comuna: undefined })
    } else if (campo === 'contrasena') {
      setDatos({ ...datos, contrasena: valor })
      setErrores({ ...errores, contrasena: undefined, confirmarContrasena: undefined })
    } else {
      setDatos({ ...datos, [campo]: valor })
      setErrores({ ...errores, [campo]: undefined })
    }
    setCuentaCreada(false)
    setErrorRegistro('')
  }

  async function validarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (registrando || cuentaCreada) return
    setErrorRegistro('')
    const nuevosErrores: ErroresRegistro = {}

    if (!datos.rut.trim()) {
      nuevosErrores.rut = 'El RUT es obligatorio.'
    } else if (!validarRut(datos.rut)) {
      nuevosErrores.rut = 'Ingresa un RUT válido, incluyendo su dígito verificador.'
    }

    if (!datos.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio.'
    } else if (datos.nombre.trim().length > 50) {
      nuevosErrores.nombre = 'El nombre no puede superar los 50 caracteres.'
    }

    if (!datos.apellidos.trim()) {
      nuevosErrores.apellidos = 'Los apellidos son obligatorios.'
    } else if (datos.apellidos.trim().length > 100) {
      nuevosErrores.apellidos = 'Los apellidos no pueden superar los 100 caracteres.'
    }

    const correoIngresado = datos.correo.trim()
    if (!correoIngresado) {
      nuevosErrores.correo = 'El correo es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoIngresado)) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.'
    } else if (correoIngresado.length > 100) {
      nuevosErrores.correo = 'El correo no puede superar los 100 caracteres.'
    }

    if (datos.rol !== 'cliente') nuevosErrores.rol = 'El rol permitido para el registro es Cliente.'
    if (!regionSeleccionada) nuevosErrores.region = 'Selecciona una región del listado.'
    if (!datos.comuna) {
      nuevosErrores.comuna = 'Selecciona una comuna.'
    } else if (!comunas.includes(datos.comuna)) {
      nuevosErrores.comuna = 'Selecciona una comuna de la región indicada.'
    }

    if (!datos.direccion.trim()) {
      nuevosErrores.direccion = 'La dirección es obligatoria.'
    } else if (datos.direccion.trim().length > 300) {
      nuevosErrores.direccion = 'La dirección no puede superar los 300 caracteres.'
    }

    if (!datos.contrasena.trim()) {
      nuevosErrores.contrasena = 'La contraseña es obligatoria.'
    } else if (datos.contrasena.length < 4 || datos.contrasena.length > 10) {
      nuevosErrores.contrasena = 'La contraseña debe tener entre 4 y 10 caracteres.'
    }
    if (!datos.confirmarContrasena.trim()) {
      nuevosErrores.confirmarContrasena = 'Confirma tu contraseña.'
    } else if (datos.confirmarContrasena !== datos.contrasena) {
      nuevosErrores.confirmarContrasena = 'Las contraseñas no coinciden.'
    }

    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setRegistrando(true)
    try {
      await registrarCliente({
        rut: datos.rut,
        nombre: datos.nombre,
        apellidos: datos.apellidos,
        correo: datos.correo,
        fechaNacimiento: datos.fechaNacimiento,
        region: datos.region,
        comuna: datos.comuna,
        direccion: datos.direccion,
      }, datos.contrasena)
      setCuentaCreada(true)
      setDatos({ ...datos, contrasena: '', confirmarContrasena: '' })
    } catch (error) {
      setErrorRegistro(error instanceof Error ? error.message : 'No se pudo crear la cuenta. Inténtalo nuevamente.')
    } finally {
      setRegistrando(false)
    }
  }

  return (
    <section className="row justify-content-center" aria-labelledby="titulo-registro">
      <div className="col-12 col-md-10 col-lg-8">
        <div className="card shadow-sm">
          <div className="card-body p-4 p-md-5">
            <h1 className="h2 mb-3" id="titulo-registro">Crear cuenta</h1>
            <p className="text-secondary mb-4">Completa tus datos para registrarte en Sonido Vivo. La fecha de nacimiento es opcional.</p>

            <form onSubmit={validarFormulario} noValidate>
              <fieldset className="row g-3 mb-4" disabled={registrando}>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="rut">RUT</label>
                  <input
                    id="rut" name="rut" type="text" required
                    className={`form-control${errores.rut ? ' is-invalid' : ''}`}
                    value={datos.rut} onChange={(evento) => actualizarCampo('rut', evento.target.value)}
                    aria-invalid={Boolean(errores.rut)} aria-describedby={errores.rut ? 'error-rut' : undefined}
                  />
                  {errores.rut && <div id="error-rut" className="invalid-feedback" role="alert">{errores.rut}</div>}
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="nombre">Nombre</label>
                  <input
                    id="nombre" name="nombre" type="text" autoComplete="given-name" maxLength={50} required
                    className={`form-control${errores.nombre ? ' is-invalid' : ''}`}
                    value={datos.nombre} onChange={(evento) => actualizarCampo('nombre', evento.target.value)}
                    aria-invalid={Boolean(errores.nombre)} aria-describedby={errores.nombre ? 'error-nombre' : undefined}
                  />
                  {errores.nombre && <div id="error-nombre" className="invalid-feedback" role="alert">{errores.nombre}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="apellidos">Apellidos</label>
                  <input
                    id="apellidos" name="apellidos" type="text" autoComplete="family-name" maxLength={100} required
                    className={`form-control${errores.apellidos ? ' is-invalid' : ''}`}
                    value={datos.apellidos} onChange={(evento) => actualizarCampo('apellidos', evento.target.value)}
                    aria-invalid={Boolean(errores.apellidos)} aria-describedby={errores.apellidos ? 'error-apellidos' : undefined}
                  />
                  {errores.apellidos && <div id="error-apellidos" className="invalid-feedback" role="alert">{errores.apellidos}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="correo">Correo electrónico</label>
                  <input
                    id="correo" name="correo" type="email" autoComplete="email" maxLength={100} required
                    className={`form-control${errores.correo ? ' is-invalid' : ''}`}
                    value={datos.correo} onChange={(evento) => actualizarCampo('correo', evento.target.value)}
                    aria-invalid={Boolean(errores.correo)} aria-describedby={errores.correo ? 'error-correo' : undefined}
                  />
                  {errores.correo && <div id="error-correo" className="invalid-feedback" role="alert">{errores.correo}</div>}
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="contrasena">Contraseña</label>
                  <input
                    id="contrasena" name="contrasena" type="password" autoComplete="new-password"
                    minLength={4} maxLength={10} required
                    className={`form-control${errores.contrasena ? ' is-invalid' : ''}`}
                    value={datos.contrasena} onChange={(evento) => actualizarCampo('contrasena', evento.target.value)}
                    aria-invalid={Boolean(errores.contrasena)} aria-describedby={errores.contrasena ? 'error-contrasena' : undefined}
                  />
                  {errores.contrasena && <div id="error-contrasena" className="invalid-feedback" role="alert">{errores.contrasena}</div>}
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="confirmar-contrasena">Confirmar contraseña</label>
                  <input
                    id="confirmar-contrasena" name="confirmarContrasena" type="password" autoComplete="new-password"
                    minLength={4} maxLength={10} required
                    className={`form-control${errores.confirmarContrasena ? ' is-invalid' : ''}`}
                    value={datos.confirmarContrasena} onChange={(evento) => actualizarCampo('confirmarContrasena', evento.target.value)}
                    aria-invalid={Boolean(errores.confirmarContrasena)} aria-describedby={errores.confirmarContrasena ? 'error-confirmar-contrasena' : undefined}
                  />
                  {errores.confirmarContrasena && <div id="error-confirmar-contrasena" className="invalid-feedback" role="alert">{errores.confirmarContrasena}</div>}
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="fecha-nacimiento">Fecha de nacimiento (opcional)</label>
                  <input
                    id="fecha-nacimiento" name="fechaNacimiento" type="date" autoComplete="bday" className="form-control"
                    value={datos.fechaNacimiento} onChange={(evento) => actualizarCampo('fechaNacimiento', evento.target.value)}
                  />
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="rol">Rol</label>
                  <select
                    id="rol" name="rol" required
                    className={`form-select${errores.rol ? ' is-invalid' : ''}`}
                    value={datos.rol} onChange={(evento) => actualizarCampo('rol', evento.target.value)}
                    aria-invalid={Boolean(errores.rol)} aria-describedby={errores.rol ? 'error-rol' : undefined}
                  >
                    <option value="cliente">Cliente</option>
                  </select>
                  {errores.rol && <div id="error-rol" className="invalid-feedback" role="alert">{errores.rol}</div>}
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="region">Región</label>
                  <select
                    id="region" name="region" autoComplete="address-level1" required
                    className={`form-select${errores.region ? ' is-invalid' : ''}`}
                    value={datos.region} onChange={(evento) => actualizarCampo('region', evento.target.value)}
                    aria-invalid={Boolean(errores.region)} aria-describedby={errores.region ? 'error-region' : undefined}
                  >
                    <option value="">Selecciona una región</option>
                    {regiones.map((region) => <option key={region.nombre} value={region.nombre}>{region.nombre}</option>)}
                  </select>
                  {errores.region && <div id="error-region" className="invalid-feedback" role="alert">{errores.region}</div>}
                </div>
                <div className="col-12 col-sm-6">
                  <label className="form-label" htmlFor="comuna">Comuna</label>
                  <select
                    id="comuna" name="comuna" autoComplete="address-level2" required disabled={!regionSeleccionada}
                    className={`form-select${errores.comuna ? ' is-invalid' : ''}`}
                    value={datos.comuna} onChange={(evento) => actualizarCampo('comuna', evento.target.value)}
                    aria-invalid={Boolean(errores.comuna)} aria-describedby={errores.comuna ? 'error-comuna' : undefined}
                  >
                    <option value="">Selecciona una comuna</option>
                    {comunas.map((comuna) => <option key={comuna} value={comuna}>{comuna}</option>)}
                  </select>
                  {errores.comuna && <div id="error-comuna" className="invalid-feedback" role="alert">{errores.comuna}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="direccion">Dirección</label>
                  <input
                    id="direccion" name="direccion" type="text" autoComplete="street-address" maxLength={300} required
                    className={`form-control${errores.direccion ? ' is-invalid' : ''}`}
                    value={datos.direccion} onChange={(evento) => actualizarCampo('direccion', evento.target.value)}
                    aria-invalid={Boolean(errores.direccion)} aria-describedby={errores.direccion ? 'error-direccion' : undefined}
                  />
                  {errores.direccion && <div id="error-direccion" className="invalid-feedback" role="alert">{errores.direccion}</div>}
                </div>
              </fieldset>

              {errorRegistro && <p className="alert alert-danger" role="alert">{errorRegistro}</p>}
              {cuentaCreada && (
                <p className="alert alert-success" role="status">
                  Cuenta creada correctamente. Ya puedes iniciar sesión.{' '}
                  <Link to="/login">Ir a iniciar sesión</Link>
                </p>
              )}
              <button type="submit" className="btn btn-primary w-100" disabled={registrando || cuentaCreada}>
                {registrando ? 'Registrando...' : 'Crear cuenta'}
              </button>
            </form>

            <p className="mt-4 mb-0">¿Ya tienes una cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Registro
