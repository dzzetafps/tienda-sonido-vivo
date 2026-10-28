import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Input from '../componentes/atomos/Input'
import TablaUsuariosAdmin from '../componentes/organismos/TablaUsuariosAdmin'
import { leerAvisoRecibido } from '../datos/avisos'
import type { Aviso } from '../datos/avisos'
import { cambiarEstadoUsuario, obtenerSesion, obtenerUsuarios } from '../datos/usuariosService.js'
import type { Usuario } from '../tipos/Usuario'

function leerUsuarios(): { usuarios: Usuario[]; error: string } {
  try {
    return { usuarios: obtenerUsuarios(), error: '' }
  } catch (error) {
    return { usuarios: [], error: error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.' }
  }
}

function AdminUsuarios() {
  const location = useLocation()
  const [datos, setDatos] = useState(leerUsuarios)
  const [busqueda, setBusqueda] = useState('')
  const [rol, setRol] = useState('')
  const [aviso, setAviso] = useState<Aviso | null>(() => leerAvisoRecibido(location.state))

  const texto = busqueda.trim().toLocaleLowerCase('es-CL')
  const usuariosFiltrados = datos.usuarios.filter((usuario) => {
    const coincideRol = rol === '' || usuario.rol === rol
    const coincideTexto = [usuario.nombre, usuario.apellidos, usuario.rut, usuario.correo]
      .some((valor) => valor.toLocaleLowerCase('es-CL').includes(texto))
    return coincideRol && coincideTexto
  })

  function cambiarEstado(id: string, activo: boolean) {
    const usuario = datos.usuarios.find((actual) => actual.id === id)
    const nombre = usuario ? `${usuario.nombre} ${usuario.apellidos}` : id

    if (!activo && obtenerSesion()?.usuarioId === id) {
      setAviso({ tipo: 'danger', texto: 'No puedes desactivar tu propia cuenta mientras tienes la sesión iniciada.' })
      return
    }
    if (!activo && !window.confirm(`¿Desactivar a ${nombre}? No podrá iniciar sesión hasta que lo actives otra vez.`)) return

    try {
      cambiarEstadoUsuario(id, activo)
      setDatos(leerUsuarios())
      setAviso({ tipo: 'success', texto: `Usuario ${nombre} ${activo ? 'activado' : 'desactivado'} correctamente.` })
    } catch (error) {
      setAviso({ tipo: 'danger', texto: error instanceof Error ? error.message : 'No se pudo cambiar el estado del usuario.' })
    }
  }

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Panel</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Usuarios</li>
        </ol>
      </nav>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h1 className="mb-0">Administrar usuarios</h1>
        <Link className="btn btn-primary" to="/admin/usuarios/nuevo">Nuevo usuario</Link>
      </div>

      {aviso && (
        <div
          className={`alert alert-${aviso.tipo} d-flex justify-content-between align-items-start gap-3`}
          role={aviso.tipo === 'danger' ? 'alert' : 'status'}
        >
          <span>{aviso.texto}</span>
          <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setAviso(null)} />
        </div>
      )}

      {datos.error ? (
        <p className="alert alert-danger" role="alert">{datos.error}</p>
      ) : (
        <>
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-8">
              <label className="form-label" htmlFor="busqueda-usuarios">Buscar usuarios</label>
              <Input id="busqueda-usuarios" tipo="search" valor={busqueda} alCambiar={setBusqueda} />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="rol-usuarios">Rol</label>
              <select id="rol-usuarios" className="form-select" value={rol} onChange={(evento) => setRol(evento.target.value)}>
                <option value="">Todos los roles</option>
                <option value="cliente">Clientes</option>
                <option value="administrador">Administradores</option>
              </select>
            </div>
          </div>
          <p aria-live="polite">
            Mostrando {usuariosFiltrados.length} de {datos.usuarios.length} usuarios
          </p>
          <TablaUsuariosAdmin usuarios={usuariosFiltrados} onCambiarEstado={cambiarEstado} />
        </>
      )}
    </section>
  )
}

export default AdminUsuarios
