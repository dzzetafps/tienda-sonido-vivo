import { useEffect, useState } from 'react'
import FiltrosProductos from '../componentes/moleculas/FiltrosProductos'
import GrillaProductos from '../componentes/organismos/GrillaProductos'
import { obtenerProductos } from '../datos/productosApi'
import { mensajeError } from '../datos/api'
import type { Producto } from '../tipos/Producto'

function Productos() {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <section>
      <h1>Productos</h1>

      <p>Instrumentos y equipos para acompañar tu música.</p>

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

          <p role="status" aria-live="polite">
            {productosFiltrados.length} de {productos.length} productos
          </p>

          {productosFiltrados.length === 0 ? (
            <p className="alert alert-light border">
              No se encontraron productos. Prueba otra búsqueda o categoría.
            </p>
          ) : (
            <GrillaProductos productos={productosFiltrados} />
          )}
        </>
      )}
    </section>
  )
}

export default Productos