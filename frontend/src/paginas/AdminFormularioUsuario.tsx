import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormularioUsuario from '../componentes/organismos/FormularioUsuario'
import { mensajeError } from '../datos/api'
import { actualizarUsuario, buscarUsuario, crearUsuario } from '../datos/usuariosApi'
import type { Usuario } from '../tipos/Usuario'

interface AdminFormularioUsuarioProps {
  modo: 'nuevo' | 'editar'
}

function AdminFormularioUsuario({ modo }: AdminFormularioUsuarioProps) {
  const { id = '' } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState<Usuario | undefined>(undefined)
  const [cargando, setCargando] = useState(modo === 'editar')
  const [errorCarga, setErrorCarga] = useState('')
  const [errorGuardar, setErrorGuardar] = useState('')
  const [ocupado, setOcupado] = useState(false)
  const titulo = modo === 'nuevo' ? 'Nuevo usuario' : 'Editar usuario'

  useEffect(() => {
    if (modo !== 'editar') return
    let activo = true
    buscarUsuario(id)
      .then((encontrado) => {
        if (activo) setUsuario(encontrado)
      })
      .catch((e) => {
        if (activo) setErrorCarga(mensajeError(e, 'No se pudo cargar el usuario.'))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [modo, id])

  async function guardar(campos: Omit<Usuario, 'id' | 'activo' | 'fechaRegistro'>, contrasena: string) {
    setErrorGuardar('')
    setOcupado(true)
    try {
      const guardado = modo === 'nuevo'
        ? await crearUsuario({ ...campos, contrasena })
        : await actualizarUsuario(id, { ...campos, contrasena })
      navigate('/admin/usuarios', {
        state: { mensaje: `Usuario ${guardado.nombre} ${guardado.apellidos} ${modo === 'nuevo' ? 'creado' : 'actualizado'} correctamente.` },
      })
    } catch (e) {
      setErrorGuardar(mensajeError(e, 'No se pudo guardar el usuario.'))
      setOcupado(false)
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

            {cargando ? (
              <p className="text-secondary" role="status">Cargando usuario...</p>
            ) : errorCarga ? (
              <>
                <p className="alert alert-danger" role="alert">{errorCarga}</p>
                <Link className="btn btn-outline-secondary align-self-start" to="/admin/usuarios">
                  Volver al listado
                </Link>
              </>
            ) : (
              <FormularioUsuario
                key={`${modo}-${id}`}
                modo={modo}
                usuarioInicial={usuario}
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
