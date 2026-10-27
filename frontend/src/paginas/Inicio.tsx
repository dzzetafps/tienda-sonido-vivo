import { Link } from 'react-router-dom'

function Inicio() {
  return (
    <section className="p-4 p-md-5 bg-white border rounded-3">
      <p className="text-uppercase text-secondary">Instrumentos y equipos musicales</p>
      <h1 className="display-5 fw-bold">Bienvenido a Sonido Vivo</h1>
      <p className="lead">Tu tienda de instrumentos, equipos de sonido y accesorios en Viña del Mar.</p>
      <Link className="btn btn-primary" to="/productos">Ver productos</Link>
    </section>
  )
}

export default Inicio
