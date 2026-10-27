import { useState } from 'react'
import { Link } from 'react-router-dom'
import GrillaProductos from '../componentes/organismos/GrillaProductos'
import { obtenerProductos } from '../datos/productosService.js'

function Inicio() {
  const [catalogo] = useState(() => {
    try {
      return { destacados: obtenerProductos().slice(0, 4), error: '' }
    } catch (error) {
      return { destacados: [], error: error instanceof Error ? error.message : 'No se pudieron cargar los productos destacados.' }
    }
  })

  return (
    <>
      <section className="p-4 p-md-5 bg-white border rounded-3">
        <p className="text-uppercase text-secondary">Instrumentos y equipos musicales</p>
        <h1 className="display-5 fw-bold">Bienvenido a Sonido Vivo</h1>
        <p className="lead">Tu tienda de instrumentos, equipos de sonido y accesorios en Viña del Mar.</p>
        <Link className="btn btn-primary" to="/productos">Ver productos</Link>
      </section>
      <section className="mt-5" aria-labelledby="titulo-destacados">
        <h2 id="titulo-destacados" className="mb-4">Productos destacados</h2>
        {catalogo.error ? (
          <p className="alert alert-danger" role="alert">{catalogo.error}</p>
        ) : catalogo.destacados.length === 0 ? (
          <p className="alert alert-light border">No hay productos disponibles para mostrar.</p>
        ) : (
          <GrillaProductos productos={catalogo.destacados} />
        )}
      </section>
    </>
  )
}

export default Inicio
