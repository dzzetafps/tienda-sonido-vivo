import { useState } from 'react'
import { obtenerProductos } from '../datos/productosService'

function Productos() {
  const [catalogo] = useState(() => {
    try {
      return { total: obtenerProductos().length, error: '' }
    } catch (error) {
      return { total: 0, error: error instanceof Error ? error.message : 'No se pudo cargar el catálogo.' }
    }
  })

  return (
    <section>
      <h1>Productos</h1>
      <p>Instrumentos y equipos para acompañar tu música.</p>
      {catalogo.error ? (
        <p className="alert alert-danger" role="alert">{catalogo.error}</p>
      ) : (
        <p className="alert alert-light border">Nuestro catálogo cuenta con {catalogo.total} productos.</p>
      )}
      <p>Próximamente podrás explorar aquí el catálogo y los detalles de cada producto.</p>
    </section>
  )
}

export default Productos
