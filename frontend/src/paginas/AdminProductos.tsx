import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FiltrosProductos from '../componentes/moleculas/FiltrosProductos'
import TablaProductosAdmin from '../componentes/organismos/TablaProductosAdmin'
import { eliminarProducto, obtenerProductos } from '../datos/productosService.js'
import type { Producto } from '../tipos/Producto'

interface Aviso {
  tipo: 'success' | 'danger'
  texto: string
}

function leerCatalogo(): { productos: Producto[]; error: string } {
  try {
    return { productos: obtenerProductos(), error: '' }
  } catch (error) {
    return { productos: [], error: error instanceof Error ? error.message : 'No se pudo cargar el catálogo.' }
  }
}

function leerAvisoRecibido(estado: unknown): Aviso | null {
  if (estado && typeof estado === 'object' && 'mensaje' in estado && typeof estado.mensaje === 'string') {
    return { tipo: 'success', texto: estado.mensaje }
  }
  return null
}

function AdminProductos() {
  const location = useLocation()
  const [catalogo, setCatalogo] = useState(leerCatalogo)
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [aviso, setAviso] = useState<Aviso | null>(() => leerAvisoRecibido(location.state))

  const categorias = [...new Set(catalogo.productos.map((producto) => producto.categoria))]
    .sort((primera, segunda) => primera.localeCompare(segunda, 'es'))
  const textoBusqueda = busqueda.trim().toLocaleLowerCase('es-CL')
  const productosFiltrados = catalogo.productos.filter((producto) => {
    const coincideCategoria = categoria === '' || producto.categoria === categoria
    const coincideBusqueda = [producto.nombre, producto.marca, producto.modelo, producto.codigo]
      .some((valor) => valor.toLocaleLowerCase('es-CL').includes(textoBusqueda))
    return coincideCategoria && coincideBusqueda
  })

  function eliminar(codigo: string) {
    const producto = catalogo.productos.find((actual) => actual.codigo === codigo)
    const descripcion = producto ? `${codigo} (${producto.nombre})` : codigo
    if (!window.confirm(`¿Eliminar el producto ${descripcion}? Esta acción no se puede deshacer.`)) return

    try {
      eliminarProducto(codigo)
      setCatalogo(leerCatalogo()) 
      setAviso({ tipo: 'success', texto: `Producto ${codigo} eliminado correctamente.` })
    } catch (error) {
      setAviso({ tipo: 'danger', texto: error instanceof Error ? error.message : 'No se pudo eliminar el producto.' })
    }
  }

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Panel</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Productos</li>
        </ol>
      </nav>

      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <h1 className="mb-0">Administrar productos</h1>
        <Link className="btn btn-primary" to="/admin/productos/nuevo">Nuevo producto</Link>
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

      {catalogo.error ? (
        <p className="alert alert-danger" role="alert">{catalogo.error}</p>
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
            Mostrando {productosFiltrados.length} de {catalogo.productos.length} productos
          </p>
          <TablaProductosAdmin productos={productosFiltrados} onEliminar={eliminar} />
        </>
      )}
    </section>
  )
}

export default AdminProductos
