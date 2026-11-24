import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ResumenCompra from '../componentes/organismos/ResumenCompra'

import {
  obtenerCarrito,
  modificarCantidad,
  eliminarProductoDelCarrito,
  vaciarCarrito,
} from '../datos/carritoApi'

import type { CarritoApi } from '../datos/carritoApi'

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function Carrito() {
  const [carrito, setCarrito] = useState<CarritoApi | null>(null)
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState('')
  const operacionEnCurso = useRef(false)

  useEffect(() => {
    let activo = true

    obtenerCarrito()
      .then((datos) => {
        if (activo) setCarrito(datos)
      })
      .catch((problema) => {
        if (activo) {
          setError(
            problema instanceof Error
              ? problema.message
              : 'No se pudo cargar el carrito.',
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

  async function ejecutarOperacion(
    operacion: () => Promise<CarritoApi>,
  ) {
    if (operacionEnCurso.current) return

    operacionEnCurso.current = true
    setProcesando(true)
    setError('')

    try {
      setCarrito(await operacion())
    } catch (problema) {
      setError(
        problema instanceof Error
          ? problema.message
          : 'No se pudo actualizar el carrito.',
      )
    } finally {
      operacionEnCurso.current = false
      setProcesando(false)
    }
  }

  const errorResumen = carrito?.items.some(
    (item) => !item.disponible,
  )
    ? 'Hay productos sin stock suficiente o no disponibles.'
    : ''

  return (
    <section aria-labelledby="titulo-carrito">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 id="titulo-carrito">Carrito de compras</h1>
          <p className="text-secondary mb-0">
            Revisa tus instrumentos y equipos antes de comprar.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={cargando || procesando}
          onClick={() => ejecutarOperacion(obtenerCarrito)}
        >
          Actualizar carrito
        </button>
      </div>

      {error && (
        <p className="alert alert-danger" role="alert">
          {error}
        </p>
      )}

      {cargando && <p role="status">Cargando carrito...</p>}

      {!cargando && carrito && (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            {carrito.items.length === 0 ? (
              <div className="bg-white border rounded-3 p-4 text-center">
                <h2 className="h4">Tu carrito está vacío</h2>
                <p>Explora los instrumentos y equipos de Sonido Vivo.</p>
                <Link className="btn btn-primary" to="/productos">
                  Ver productos
                </Link>
              </div>
            ) : (
              <>
                <div className="d-flex flex-column gap-3">
                  {carrito.items.map((item) => (
                    <article className="card shadow-sm" key={item.codigo}>
                      <div className="card-body">
                        <div className="row g-3 align-items-center">
                          <div className="col-4 col-sm-3">
                            {item.imagen && (
                              <img
                                src={item.imagen}
                                alt={item.nombre}
                                className="img-fluid"
                              />
                            )}
                          </div>

                          <div className="col">
                            <h2 className="h5">{item.nombre}</h2>

                            <p className="text-secondary mb-1">
                              Código: {item.codigo}
                            </p>

                            <p className="mb-1">
                              Precio: {formatoPrecio.format(item.precioUnitario)}
                            </p>

                            <p className="mb-1">Stock: {item.stock}</p>

                            {!item.disponible && (
                              <p className="text-danger">
                                Producto no disponible en la cantidad solicitada.
                              </p>
                            )}

                            <div className="d-flex flex-wrap align-items-center gap-2 my-3">
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={procesando || item.cantidad <= 1}
                                aria-label="Disminuir cantidad"
                                onClick={() =>
                                  ejecutarOperacion(() =>
                                    modificarCantidad(item.codigo, item.cantidad - 1),
                                  )
                                }
                              >
                                -
                              </button>

                              <span>{item.cantidad}</span>

                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                disabled={
                                  procesando ||
                                  item.cantidad >= item.stock ||
                                  item.cantidad >= 999
                                }
                                aria-label="Aumentar cantidad"
                                onClick={() =>
                                  ejecutarOperacion(() =>
                                    modificarCantidad(item.codigo, item.cantidad + 1),
                                  )
                                }
                              >
                                +
                              </button>

                              <button
                                type="button"
                                className="btn btn-outline-danger"
                                disabled={procesando}
                                onClick={() =>
                                  ejecutarOperacion(() =>
                                    eliminarProductoDelCarrito(item.codigo),
                                  )
                                }
                              >
                                Eliminar
                              </button>
                            </div>

                            <p className="fw-bold mb-0">
                              Subtotal: {formatoPrecio.format(item.subtotal)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="d-flex flex-wrap justify-content-between gap-3 mt-4">
                  <Link className="btn btn-outline-secondary" to="/productos">
                    Seguir viendo productos
                  </Link>

                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    disabled={procesando}
                    onClick={() => ejecutarOperacion(vaciarCarrito)}
                  >
                    Vaciar carrito
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="col-12 col-lg-4">
            <ResumenCompra
              cantidadUnidades={carrito.cantidadTotal}
              total={carrito.total}
              error={procesando ? 'Actualizando carrito...' : errorResumen}
            />

            <Link
              className="btn btn-outline-secondary w-100 mt-3"
              to="/mis-pedidos"
            >
              Mis pedidos
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}

export default Carrito