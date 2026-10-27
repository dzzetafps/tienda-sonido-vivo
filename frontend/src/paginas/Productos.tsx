import { useState } from 'react'
import FiltrosProductos from '../componentes/moleculas/FiltrosProductos'
import GrillaProductos from '../componentes/organismos/GrillaProductos'
import { obtenerProductos } from '../datos/productosService.js'

function Productos() {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('')
  const [catalogo] = useState(() => {
    try {
      return { productos: obtenerProductos(), error: '' }
    } catch (error) {
      return { productos: [], error: error instanceof Error ? error.message : 'No se pudo cargar el catálogo.' }
    }
  })

  const categorias = [...new Set(catalogo.productos.map((producto) => producto.categoria))]
    .sort((primera, segunda) => primera.localeCompare(segunda, 'es'))
  const textoBusqueda = busqueda.trim().toLocaleLowerCase('es-CL')
  const productosFiltrados = catalogo.productos.filter((producto) => {
    const coincideCategoria = categoria === '' || producto.categoria === categoria
    const coincideBusqueda = [producto.nombre, producto.marca, producto.modelo, producto.codigo]
      .some((valor) => valor.toLocaleLowerCase('es-CL').includes(textoBusqueda))
    return coincideCategoria && coincideBusqueda
  })

  return (
    <section>
      <h1>Productos</h1>
      <p>Instrumentos y equipos para acompañar tu música.</p>
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
          <p role="status" aria-live="polite">
            {productosFiltrados.length} de {catalogo.productos.length} productos
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
