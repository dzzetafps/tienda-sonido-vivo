import { Link } from 'react-router-dom'
import { formatearRut } from '../../datos/rut'
import type { Usuario } from '../../tipos/Usuario'

interface TablaUsuariosAdminProps {
  usuarios: Usuario[]
  onCambiarEstado: (id: string, activo: boolean) => void
}

function TablaUsuariosAdmin({ usuarios, onCambiarEstado }: TablaUsuariosAdminProps) {
  if (usuarios.length === 0) {
    return <p className="alert alert-light border">No hay usuarios que coincidan con la búsqueda.</p>
  }

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover align-middle bg-white">
        <caption className="visually-hidden">Usuarios de la tienda</caption>
        <thead className="table-dark">
          <tr>
            <th scope="col" className="d-none d-sm-table-cell">RUT</th>
            <th scope="col">Nombre</th>
            <th scope="col" className="d-none d-md-table-cell">Correo</th>
            <th scope="col" className="d-none d-sm-table-cell">Rol</th>
            <th scope="col">Estado</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td className="text-nowrap d-none d-sm-table-cell">{formatearRut(usuario.rut)}</td>
              <td>{usuario.nombre} {usuario.apellidos}</td>
              <td className="d-none d-md-table-cell">{usuario.correo}</td>
              <td className="d-none d-sm-table-cell">
                <span className={usuario.rol === 'administrador' ? 'badge text-bg-dark' : 'badge text-bg-light border'}>
                  {usuario.rol === 'administrador' ? 'Administrador' : 'Cliente'}
                </span>
              </td>
              <td>
                <span className={usuario.activo ? 'badge text-bg-success' : 'badge text-bg-secondary'}>
                  {usuario.activo ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    className="btn btn-sm btn-primary"
                    to={`/admin/usuarios/editar/${encodeURIComponent(usuario.id)}`}
                    aria-label={`Editar usuario ${formatearRut(usuario.rut)}`}
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    className={usuario.activo ? 'btn btn-sm btn-outline-danger' : 'btn btn-sm btn-outline-success'}
                    aria-label={`${usuario.activo ? 'Desactivar' : 'Activar'} usuario ${formatearRut(usuario.rut)}`}
                    onClick={() => onCambiarEstado(usuario.id, !usuario.activo)}
                  >
                    {usuario.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TablaUsuariosAdmin
