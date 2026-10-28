import { useState } from 'react'
import type { SubmitEvent } from 'react'
import CampoFormulario from '../moleculas/CampoFormulario'
import { regiones } from '../../datos/regiones.js'
import { calcularDigitoVerificador, formatearRut, limpiarRut } from '../../datos/rut'
import type { RolUsuario, Usuario } from '../../tipos/Usuario'

type CamposUsuario = Omit<Usuario, 'id' | 'activo' | 'fechaRegistro'>
type ErroresUsuario = Partial<Record<keyof CamposUsuario | 'contrasena', string>>

interface FormularioUsuarioProps {
  modo: 'nuevo' | 'editar'
  usuarioInicial?: Usuario
  ocupado?: boolean
  onGuardar: (campos: CamposUsuario, contrasena: string) => void
  onCancelar: () => void
}

function FormularioUsuario({ modo, usuarioInicial, ocupado = false, onGuardar, onCancelar }: FormularioUsuarioProps) {
  const [rut, setRut] = useState(usuarioInicial ? formatearRut(usuarioInicial.rut) : '')
  const [nombre, setNombre] = useState(usuarioInicial?.nombre ?? '')
  const [apellidos, setApellidos] = useState(usuarioInicial?.apellidos ?? '')
  const [correo, setCorreo] = useState(usuarioInicial?.correo ?? '')
  const [fechaNacimiento, setFechaNacimiento] = useState(usuarioInicial?.fechaNacimiento ?? '')
  const [region, setRegion] = useState(usuarioInicial?.region ?? '')
  const [comuna, setComuna] = useState(usuarioInicial?.comuna ?? '')
  const [direccion, setDireccion] = useState(usuarioInicial?.direccion ?? '')
  const [rol, setRol] = useState<RolUsuario>(usuarioInicial?.rol ?? 'cliente')
  const [contrasena, setContrasena] = useState('')
  const [errores, setErrores] = useState<ErroresUsuario>({})

  const comunas = regiones.find((actual) => actual.nombre === region)?.comunas ?? []

  function cambiarRegion(valor: string) {
    setRegion(valor)
    setComuna('')
  }

  function validar(): ErroresUsuario {
    const nuevosErrores: ErroresUsuario = {}
    const rutLimpio = limpiarRut(rut)

    if (rutLimpio === '') {
      nuevosErrores.rut = 'Ingresa el RUT'
    } else if (!/^\d{7,8}[\dK]$/.test(rutLimpio)) {
      nuevosErrores.rut = 'Ingresa el RUT con su dígito verificador, por ejemplo 12345678-9'
    } else if (calcularDigitoVerificador(rutLimpio.slice(0, -1)) !== rutLimpio.slice(-1)) {
      nuevosErrores.rut = 'El dígito verificador del RUT no es válido'
    }

    if (nombre.trim() === '') nuevosErrores.nombre = 'Ingresa el nombre'
    else if (nombre.trim().length > 50) nuevosErrores.nombre = 'El nombre admite hasta 50 caracteres'

    if (apellidos.trim() === '') nuevosErrores.apellidos = 'Ingresa los apellidos'
    else if (apellidos.trim().length > 100) nuevosErrores.apellidos = 'Los apellidos admiten hasta 100 caracteres'

    if (correo.trim() === '') {
      nuevosErrores.correo = 'Ingresa el correo'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      nuevosErrores.correo = 'Ingresa un correo válido'
    } else if (correo.trim().length > 100) {
      nuevosErrores.correo = 'El correo admite hasta 100 caracteres'
    }

    if (region === '') nuevosErrores.region = 'Selecciona una región'
    if (comuna === '') nuevosErrores.comuna = 'Selecciona una comuna'

    if (direccion.trim() === '') nuevosErrores.direccion = 'Ingresa la dirección'
    else if (direccion.trim().length > 300) nuevosErrores.direccion = 'La dirección admite hasta 300 caracteres'

    if (modo === 'nuevo' && contrasena === '') {
      nuevosErrores.contrasena = 'Ingresa una contraseña temporal'
    } else if (contrasena !== '' && (contrasena.length < 4 || contrasena.length > 10)) {
      nuevosErrores.contrasena = 'La contraseña debe tener entre 4 y 10 caracteres'
    }

    return nuevosErrores
  }

  function manejarEnvio(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault()

    const nuevosErrores = validar()
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    onGuardar(
      {
        rut: rut.trim(),
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim(),
        fechaNacimiento,
        region,
        comuna,
        direccion: direccion.trim(),
        rol,
      },
      contrasena,
    )
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <CampoFormulario
            etiqueta="RUT"
            id="usuario-rut"
            tipo="text"
            valor={rut}
            alCambiar={setRut}
            error={errores.rut}
            soloLectura={modo === 'editar'}
            ayuda={modo === 'editar' ? 'El RUT no se puede modificar.' : 'Con dígito verificador, por ejemplo 12345678-9.'}
          />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario etiqueta="Correo" id="usuario-correo" tipo="email" valor={correo} alCambiar={setCorreo} error={errores.correo} />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario etiqueta="Nombre" id="usuario-nombre" tipo="text" valor={nombre} alCambiar={setNombre} error={errores.nombre} />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario etiqueta="Apellidos" id="usuario-apellidos" tipo="text" valor={apellidos} alCambiar={setApellidos} error={errores.apellidos} />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario
            etiqueta="Fecha de nacimiento"
            id="usuario-fecha"
            tipo="date"
            valor={fechaNacimiento}
            alCambiar={setFechaNacimiento}
            ayuda="Opcional."
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="usuario-rol">Rol</label>
          <select
            id="usuario-rol"
            className="form-select"
            value={rol}
            onChange={(evento) => setRol(evento.target.value === 'administrador' ? 'administrador' : 'cliente')}
          >
            <option value="cliente">Cliente</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="usuario-region">Región</label>
          <select
            id="usuario-region"
            className={errores.region ? 'form-select is-invalid' : 'form-select'}
            value={region}
            aria-invalid={Boolean(errores.region)}
            onChange={(evento) => cambiarRegion(evento.target.value)}
          >
            <option value="">Seleccione una región</option>
            {regiones.map((actual) => <option key={actual.nombre} value={actual.nombre}>{actual.nombre}</option>)}
          </select>
          {errores.region && <div className="invalid-feedback">{errores.region}</div>}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="usuario-comuna">Comuna</label>
          <select
            id="usuario-comuna"
            className={errores.comuna ? 'form-select is-invalid' : 'form-select'}
            value={comuna}
            disabled={region === ''}
            aria-invalid={Boolean(errores.comuna)}
            onChange={(evento) => setComuna(evento.target.value)}
          >
            <option value="">{region === '' ? 'Primero elige una región' : 'Seleccione una comuna'}</option>
            {comunas.map((actual) => <option key={actual} value={actual}>{actual}</option>)}
          </select>
          {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
        </div>

        <div className="col-12">
          <CampoFormulario etiqueta="Dirección" id="usuario-direccion" tipo="text" valor={direccion} alCambiar={setDireccion} error={errores.direccion} />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario
            etiqueta={modo === 'nuevo' ? 'Contraseña temporal' : 'Nueva contraseña'}
            id="usuario-contrasena"
            tipo="password"
            valor={contrasena}
            alCambiar={setContrasena}
            error={errores.contrasena}
            ayuda={modo === 'nuevo' ? 'Entre 4 y 10 caracteres.' : 'Opcional. Déjala vacía para mantener la actual.'}
          />
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-4">
        <button type="submit" className="btn btn-primary" disabled={ocupado}>
          {ocupado ? 'Guardando…' : modo === 'nuevo' ? 'Crear usuario' : 'Guardar cambios'}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar} disabled={ocupado}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioUsuario
