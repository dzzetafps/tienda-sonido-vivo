import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import GrillaProductos from '../componentes/organismos/GrillaProductos'
import { obtenerProductos } from '../datos/productosApi'
import { obtenerNovedadesActivas } from '../datos/novedadesApi'
import type { Novedad } from '../datos/novedadesApi'
import type { Producto } from '../tipos/Producto'
import { mensajeError } from '../datos/api'
import { useAuth } from '../context/useAuth'

function Inicio() {
  const { usuario, cargando } = useAuth()

  const [productos, setProductos] = useState<Producto[]>([])
  const [novedades, setNovedades] = useState<Novedad[]>([])
  const [errorProductos, setErrorProductos] = useState('')
  const [errorNovedades, setErrorNovedades] = useState('')
  const [cargandoDatos, setCargandoDatos] = useState(false)

  useEffect(() => {
    if (cargando || !usuario) return

    let activo = true

    setCargandoDatos(true)
    setErrorProductos('')
    setErrorNovedades('')

    const cargarProductos = obtenerProductos()
      .then((datos) => {
        if (activo) {
          setProductos(
            datos.filter((producto) => producto.stock > 0).slice(0, 4),
          )
        }
      })
      .catch((error) => {
        if (activo) {
          setErrorProductos(
            mensajeError(error, 'No se pudieron cargar los productos.'),
          )
        }
      })

    const cargarNovedades = obtenerNovedadesActivas()
      .then((datos) => {
        if (activo) setNovedades(datos)
      })
      .catch((error) => {
        if (activo) {
          setErrorNovedades(
            mensajeError(error, 'No se pudieron cargar las novedades.'),
          )
        }
      })

    void Promise.all([cargarProductos, cargarNovedades])
      .finally(() => {
        if (activo) setCargandoDatos(false)
      })

    return () => {
      activo = false
    }
  }, [usuario, cargando])

  return (
    <>
      <section className="p-4 p-md-5 bg-white border rounded-3">
        <p className="text-uppercase text-secondary">
          Instrumentos y equipos musicales
        </p>

        <h1 className="display-5 fw-bold">
          Bienvenido a Sonido Vivo
        </h1>

        <p className="lead">
          Tu tienda de instrumentos, equipos de sonido
          y accesorios en Viña del Mar.
        </p>

        <Link className="btn btn-primary" to="/productos">
          Ver productos
        </Link>
      </section>

      {cargando ? (
        <p className="mt-4" role="status">
          Recuperando sesión...
        </p>
      ) : !usuario ? (
        <section className="mt-4">
          <p>Inicia sesión para consultar nuestro catálogo y novedades.</p>

          <Link className="btn btn-outline-primary" to="/login">
            Iniciar sesión
          </Link>
        </section>
      ) : cargandoDatos ? (
        <p className="mt-4" role="status">
          Cargando catálogo y novedades...
        </p>
      ) : (
        <>
          <section className="mt-5">
            <h2 className="mb-4">Novedades y promociones</h2>

            {errorNovedades ? (
              <p className="alert alert-danger" role="alert">
                {errorNovedades}
              </p>
            ) : novedades.length === 0 ? (
              <p>No hay novedades disponibles.</p>
            ) : (
              <div className="row g-4">
                {novedades.map((novedad) => (
                  <div
                    className="col-12 col-md-6 col-lg-4"
                    key={novedad.id}
                  >
                    <article className="card h-100 shadow-sm">
                      <img
                        src={novedad.imagen}
                        alt={novedad.titulo}
                        className="card-img-top object-fit-contain"
                        style={{ height: 200 }}
                      />

                      <div className="card-body">
                        <span className="badge text-bg-primary mb-2">
                          {novedad.tipo}
                        </span>

                        <h3 className="h5">{novedad.titulo}</h3>

                        <p>{novedad.descripcion}</p>

                        {novedad.codigoProducto && (
                          <Link
                            className="btn btn-outline-primary"
                            to={`/producto/${encodeURIComponent(novedad.codigoProducto)}`}
                          >
                            Ver producto
                          </Link>
                        )}
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-5">
            <h2 className="mb-4">Productos destacados</h2>

            {errorProductos ? (
              <p className="alert alert-danger" role="alert">
                {errorProductos}
              </p>
            ) : productos.length === 0 ? (
              <p>No hay productos disponibles para mostrar.</p>
            ) : (
              <GrillaProductos productos={productos} />
            )}
          </section>
        </>
      )}
    </>
  )
}

export default Inicio