import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormularioUsuario from '../componentes/organismos/FormularioUsuario'
import { actualizarUsuario, asignarContrasena, buscarUsuarioPorId, crearUsuario, obtenerSesion } from '../datos/usuariosService.js'
import type { Usuario } from '../tipos/Usuario'

interface AdminFormularioUsuarioProps {
  modo: 'nuevo' | 'editar'
}

function leerUsuario(modo: 'nuevo' | 'editar', id: string): { usuario: Usuario | undefined; error: string } {
  if (modo === 'nuevo') return { usuario: undefined, error: '' }
  try {
    const usuario = buscarUsuarioPorId(id)
    return usuario ? { usuario, error: '' } : { usuario: undefined, error: 'No se encontró el usuario solicitado.' }
  } catch (error) {
    return { usuario: undefined, error: error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.' }
  }
}

function AdminFormularioUsuario({ modo }: AdminFormularioUsuarioProps) {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [errorGuardar, setErrorGuardar] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const datos = leerUsuario(modo, id)
  const titulo = modo === 'nuevo' ? 'Nuevo usuario' : 'Editar usuario'

  async function guardar(campos: Omit<Usuario, 'id' | 'activo' | 'fechaRegistro'>, contrasena: string) {
    setErrorGuardar('')
    setOcupado(true)
    let usuarioGuardado: Usuario

    try {
      if (modo === 'nuevo') {
        usuarioGuardado = crearUsuario({ ...campos, id: crypto.randomUUID(), activo: true, fechaRegistro: new Date().toISOString() })
      } else {
        if (!datos.usuario) throw new Error('No se encontró el usuario solicitado.')
        if (obtenerSesion()?.usuarioId === id && campos.rol !== 'administrador') {
          throw new Error('No puedes quitarte el rol de administrador mientras tienes la sesión iniciada.')
        }
        usuarioGuardado = actualizarUsuario(id, { ...datos.usuario, ...campos })
      }
    } catch (error) {
      setErrorGuardar(error instanceof Error ? error.message : 'No se pudo guardar el usuario.')
      setOcupado(false)
      return
    }

    const nombre = `${usuarioGuardado.nombre} ${usuarioGuardado.apellidos}`
    try {
      if (contrasena !== '') await asignarContrasena(usuarioGuardado.id, contrasena)
      navigate('/admin/usuarios', {
        state: { mensaje: `Usuario ${nombre} ${modo === 'nuevo' ? 'creado' : 'actualizado'} correctamente.` },
      })
    } catch (error) {
      const motivo = error instanceof Error ? error.message : 'error desconocido'
      navigate('/admin/usuarios', {
        state: {
          tipo: 'danger',
          mensaje: `Se guardaron los datos de ${nombre}, pero no la contraseña (${motivo}). Asígnala desde Editar.`,
        },
      })
    }
  }

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Panel</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/usuarios">Usuarios</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{titulo}</li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm p-3 p-md-4">
            <h1 className="h2 mb-4">{titulo}</h1>

            {errorGuardar && <p className="alert alert-danger" role="alert">{errorGuardar}</p>}

            {datos.error ? (
              <>
                <p className="alert alert-danger" role="alert">{datos.error}</p>
                <Link className="btn btn-outline-secondary align-self-start" to="/admin/usuarios">
                  Volver al listado
                </Link>
              </>
            ) : (
              <FormularioUsuario
                key={`${modo}-${id}`}
                modo={modo}
                usuarioInicial={datos.usuario}
                ocupado={ocupado}
                onGuardar={guardar}
                onCancelar={() => navigate('/admin/usuarios')}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminFormularioUsuario
