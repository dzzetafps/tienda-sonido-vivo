import { useEffect, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import FiltrosProductos from '../componentes/moleculas/FiltrosProductos'
import TablaProductosAdmin from '../componentes/organismos/TablaProductosAdmin'
import { leerAvisoRecibido } from '../datos/avisos'
import type { Aviso } from '../datos/avisos'
import { obtenerProductos, eliminarProducto } from '../datos/productosApi'
import { mensajeError } from '../datos/api'
import type { Producto } from '../tipos/Producto'

function AdminProductos() {
  const location = useLocation()
  const [parametros] = useSearchParams()

  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [eliminando, setEliminando] = useState(false)

  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState(
    parametros.get('categoria') ?? '',
  )

  const [aviso, setAviso] = useState<Aviso | null>(
    () => leerAvisoRecibido(location.state),
  )

  useEffect(() => {
    let activo = true

    obtenerProductos()
      .then((datos) => {
        if (activo) setProductos(datos)
      })
      .catch((problema) => {
        if (activo) {
          setError(
            mensajeError(problema, 'No se pudo cargar el catálogo.'),
          )
        }
      })
      .finally(() => {
        if (activo) setCargando(false)
      })

    return () => {
      activo = false
    }
  }, [])

  const categorias = [
    ...new Set(productos.map((producto) => producto.categoria)),
  ].sort((primera, segunda) =>
    primera.localeCompare(segunda, 'es'),
  )

  const textoBusqueda = busqueda.trim().toLocaleLowerCase('es-CL')

  const productosFiltrados = productos.filter((producto) => {
    const coincideCategoria =
      categoria === '' || producto.categoria === categoria

    const coincideBusqueda = [
      producto.nombre,
      producto.marca,
      producto.modelo,
      producto.codigo,
    ].some((valor) =>
      valor.toLocaleLowerCase('es-CL').includes(textoBusqueda),
    )

    return coincideCategoria && coincideBusqueda
  })

  async function eliminar(codigo: string) {
    if (eliminando) return

    const producto = productos.find(
      (actual) => actual.codigo === codigo,
    )

    const descripcion = producto
      ? `${codigo} (${producto.nombre})`
      : codigo

    if (!window.confirm(
      `¿Eliminar el producto ${descripcion}? Esta acción no se puede deshacer.`,
    )) return

    setEliminando(true)

    try {
      await eliminarProducto(codigo)

      setProductos((actuales) =>
        actuales.filter((actual) => actual.codigo !== codigo),
      )

      setAviso({
        tipo: 'success',
        texto: `Producto ${codigo} eliminado correctamente.`,
      })
    } catch (problema) {
      setAviso({
        tipo: 'danger',
        texto: mensajeError(
          problema,
          'No se pudo eliminar el producto.',
        ),
      })
    } finally {
      setEliminando(false)
    }
  }

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin">Panel</Link>
          </li>

          <li
            className="breadcrumb-item active"
            aria-current="page"
          >
            Productos
          </li>
        </ol>
      </nav>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h1 className="mb-0">Administrar productos</h1>

        <Link
          className="btn btn-primary"
          to="/admin/productos/nuevo"
        >
          Nuevo producto
        </Link>
      </div>

      {aviso && (
        <div
          className={`alert alert-${aviso.tipo} d-flex justify-content-between align-items-start gap-3`}
          role={aviso.tipo === 'danger' ? 'alert' : 'status'}
        >
          <span>{aviso.texto}</span>

          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar aviso"
            onClick={() => setAviso(null)}
          />
        </div>
      )}

      {cargando ? (
        <p role="status">Cargando productos...</p>
      ) : error ? (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      ) : (
        <>
          <FiltrosProductos
            busqueda={busqueda}
            categoria={categoria}
            categorias={categorias}
            onBusquedaChange={setBusqueda}
            onCategoriaChange={setCategoria}
          />

          <p aria-live="polite">
            Mostrando {productosFiltrados.length} de {productos.length} productos
          </p>

          <TablaProductosAdmin
            productos={productosFiltrados}
            onEliminar={eliminar}
          />
        </>
      )}
    </section>
  )
}

export default AdminProductos