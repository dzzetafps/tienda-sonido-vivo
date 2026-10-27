import { useState } from 'react'
import { Link } from 'react-router-dom'
import ItemCarritoCard from '../componentes/moleculas/ItemCarritoCard'
import ResumenCompra from '../componentes/organismos/ResumenCompra'
import {
  obtenerCarrito,
  modificarCantidad,
  eliminarProductoDelCarrito,
  vaciarCarrito,
  calcularSubtotal,
  calcularTotal,
  validarDisponibilidadCarrito,
} from '../datos/carritoService.js'
import { buscarProductoPorCodigo } from '../datos/productosService.js'
import type { ItemCarrito } from '../tipos/ItemCarrito'
import type { Producto } from '../tipos/Producto'

function cargarCarrito() {
  try {
    return { items: obtenerCarrito(), error: '' }
  } catch (error) {
    return { items: [], error: error instanceof Error ? error.message : 'No se pudo cargar el carrito.' }
  }
}

function Carrito() {
  const [carrito, setCarrito] = useState(cargarCarrito)
  const [errorOperacion, setErrorOperacion] = useState('')

  function ejecutarOperacion(operacion: () => ItemCarrito[]) {
    try {
      setCarrito({ items: operacion(), error: '' })
      setErrorOperacion('')
    } catch (error) {
      setCarrito(cargarCarrito())
      setErrorOperacion(error instanceof Error ? error.message : 'No se pudo actualizar el carrito.')
    }
  }

  function actualizarCarrito() {
    setCarrito(cargarCarrito())
    setErrorOperacion('')
  }

  const cantidadUnidades = carrito.items.reduce((total, item) => total + item.cantidad, 0)
  let total: number | null = null
  let errorResumen = ''
  if (!carrito.error) {
    try {
      total = calcularTotal()
      validarDisponibilidadCarrito()
    } catch (error) {
      errorResumen = error instanceof Error ? error.message : 'No se pudo comprobar el resumen de compra.'
    }
  }

  return (
    <section aria-labelledby="titulo-carrito">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h1 id="titulo-carrito">Carrito de compras</h1>
          <p className="text-secondary mb-0">Revisa tus instrumentos y equipos antes de comprar.</p>
        </div>
        <button type="button" className="btn btn-outline-secondary" onClick={actualizarCarrito}>
          Actualizar carrito
        </button>
      </div>

      {errorOperacion && <p className="alert alert-danger" role="alert">{errorOperacion}</p>}

      {carrito.error ? (
        <p className="alert alert-danger" role="alert">{carrito.error}</p>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-8">
            {carrito.items.length === 0 ? (
              <div className="bg-white border rounded-3 p-4 text-center">
                <h2 className="h4">Tu carrito está vacío</h2>
                <p>Explora los instrumentos y equipos de Sonido Vivo.</p>
                <Link className="btn btn-primary" to="/productos">Ver productos</Link>
              </div>
            ) : (
              <>
                <div className="d-flex flex-column gap-3">
                  {carrito.items.map((item) => {
                    let producto: Producto | undefined
                    let subtotal: number | null = null
                    let errorProducto = ''
                    try {
                      producto = buscarProductoPorCodigo(item.codigo)
                      subtotal = calcularSubtotal(item)
                    } catch (error) {
                      errorProducto = error instanceof Error ? error.message : 'No se pudo consultar este producto.'
                    }

                    return (
                      <ItemCarritoCard
                        key={item.codigo}
                        item={item}
                        producto={producto}
                        subtotal={subtotal}
                        error={errorProducto}
                        onModificarCantidad={(codigo, cantidad) => ejecutarOperacion(() => modificarCantidad(codigo, cantidad))}
                        onEliminar={(codigo) => ejecutarOperacion(() => eliminarProductoDelCarrito(codigo))}
                      />
                    )
                  })}
                </div>
                <div className="d-flex flex-wrap justify-content-between gap-3 mt-4">
                  <Link className="btn btn-outline-secondary" to="/productos">Seguir viendo productos</Link>
                  <button type="button" className="btn btn-outline-danger" onClick={() => ejecutarOperacion(vaciarCarrito)}>
                    Vaciar carrito
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="col-12 col-lg-4">
            <ResumenCompra cantidadUnidades={cantidadUnidades} total={total} error={errorResumen} />
          </div>
        </div>
      )}
    </section>
  )
}

export default Carrito
