import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { obtenerCarrito } from '../datos/carritoApi'
import type { CarritoApi } from '../datos/carritoApi'

import {
  crearPedido,
  obtenerMisPedidos,
} from '../datos/pedidosClienteApi'

import type {
  PedidoCliente,
  DatosPedido,
} from '../datos/pedidosClienteApi'

interface DatosCliente {
  nombre: string
  apellido: string
  correo: string
  entrega: 'despacho' | 'retiro'
  calle: string
  numero: string
  complemento: string
  region: string
  comuna: string
  indicaciones: string
}

type Errores = Partial<Record<keyof DatosCliente, string>>

const datosIniciales: DatosCliente = {
  nombre: '',
  apellido: '',
  correo: '',
  entrega: 'despacho',
  calle: '',
  numero: '',
  complemento: '',
  region: '',
  comuna: '',
  indicaciones: '',
}

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function datosDesdePedido(pedido: PedidoCliente): DatosCliente {
  return {
    nombre: pedido.comprador.nombre,
    apellido: pedido.comprador.apellido,
    correo: pedido.comprador.correo,
    entrega: pedido.entrega.tipo,
    calle: pedido.entrega.calle ?? '',
    numero: pedido.entrega.numero ?? '',
    complemento: pedido.entrega.complemento ?? '',
    region: pedido.entrega.region ?? '',
    comuna: pedido.entrega.comuna ?? '',
    indicaciones: pedido.entrega.indicaciones ?? '',
  }
}

function Checkout() {
  const navegar = useNavigate()
  const envioEnCurso = useRef(false)

  const [datos, setDatos] = useState<DatosCliente>(datosIniciales)
  const [errores, setErrores] = useState<Errores>({})
  const [carrito, setCarrito] = useState<CarritoApi | null>(null)
  const [pendiente, setPendiente] = useState<PedidoCliente | null>(null)
  const [cargando, setCargando] = useState(true)
  const [confirmando, setConfirmando] = useState(false)
  const [errorCarga, setErrorCarga] = useState('')
  const [errorCompra, setErrorCompra] = useState('')

  useEffect(() => {
    let activo = true

    async function cargar() {
      try {
        const pedidos = await obtenerMisPedidos()

        if (!activo) return

        const pedidoPendiente = pedidos.find(
          (pedido) => pedido.estado === 'pendiente',
        )

        if (pedidoPendiente) {
          setPendiente(pedidoPendiente)
          setDatos(datosDesdePedido(pedidoPendiente))
          return
        }

        const carritoActual = await obtenerCarrito()

        if (activo) setCarrito(carritoActual)
      } catch (error) {
        if (activo) {
          setErrorCarga(
            error instanceof Error
              ? error.message
              : 'No se pudo cargar la compra.',
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargar()

    return () => {
      activo = false
    }
  }, [])

  function actualizarCampo(campo: keyof DatosCliente, valor: string) {
    setDatos((anterior) => ({
      ...anterior,
      [campo]: valor,
    }))

    setErrores((anterior) => ({
      ...anterior,
      [campo]: undefined,
    }))

    setErrorCompra('')
  }

  function validarFormulario(): Errores {
    const nuevosErrores: Errores = {}

    if (!datos.nombre.trim()) {
      nuevosErrores.nombre = 'Ingresa tu nombre.'
    }

    if (!datos.apellido.trim()) {
      nuevosErrores.apellido = 'Ingresa tu apellido.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
      nuevosErrores.correo = 'Ingresa un correo válido.'
    }

    if (datos.entrega === 'despacho') {
      if (!datos.calle.trim()) {
        nuevosErrores.calle = 'Ingresa la calle.'
      }

      if (!datos.numero.trim()) {
        nuevosErrores.numero = 'Ingresa el número.'
      }

      if (!datos.region.trim()) {
        nuevosErrores.region = 'Ingresa la región.'
      }

      if (!datos.comuna.trim()) {
        nuevosErrores.comuna = 'Ingresa la comuna.'
      }
    }

    return nuevosErrores
  }

  async function confirmarCompra(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (envioEnCurso.current || cargando || errorCarga) return

    setErrorCompra('')

    if (!pendiente) {
      const nuevosErrores = validarFormulario()
      setErrores(nuevosErrores)

      if (Object.keys(nuevosErrores).length > 0) return

      if (!carrito || carrito.items.length === 0) {
        setErrorCompra('Tu carrito está vacío.')
        return
      }

      if (carrito.items.some((item) => !item.disponible)) {
        setErrorCompra('Hay productos sin stock suficiente.')
        return
      }
    }

    envioEnCurso.current = true
    setConfirmando(true)

    try {
      const despacho = datos.entrega === 'despacho'

      const solicitud: DatosPedido = pendiente
        ? {
            comprador: pendiente.comprador,
            entrega: pendiente.entrega,
          }
        : {
            comprador: {
              nombre: datos.nombre.trim(),
              apellido: datos.apellido.trim(),
              correo: datos.correo.trim().toLowerCase(),
            },
            entrega: {
              tipo: datos.entrega,
              calle: despacho ? datos.calle.trim() : '',
              numero: despacho ? datos.numero.trim() : '',
              complemento: despacho ? datos.complemento.trim() : '',
              region: despacho ? datos.region.trim() : '',
              comuna: despacho ? datos.comuna.trim() : '',
              indicaciones: despacho ? datos.indicaciones.trim() : '',
            },
          }

      const pedido = await crearPedido(solicitud)

      if (pedido.estado === 'pendiente') {
        setPendiente(pedido)
        setDatos(datosDesdePedido(pedido))

        setErrorCompra(
          'El pedido quedó pendiente de confirmación. ' +
          'Puedes reintentar sin generar otro pedido.',
        )

        return
      }

      if (
        pedido.estado === 'pagado' ||
        pedido.estado === 'enviado' ||
        pedido.estado === 'entregado'
      ) {
        navegar(
          `/compra-exitosa?pedido=${encodeURIComponent(pedido.id)}`,
          { replace: true },
        )

        return
      }

      setErrorCompra('No fue posible confirmar el pedido.')
    } catch (error) {
      setErrorCompra(
        error instanceof Error
          ? error.message
          : 'No se pudo confirmar la compra.',
      )

      // Consultar el estado persistido antes de permitir otro intento.
      try {
        const pedidos = await obtenerMisPedidos()

        const recuperado = pedidos.find(
          (pedido) => pedido.estado === 'pendiente',
        )

        if (recuperado) {
          setPendiente(recuperado)
          setDatos(datosDesdePedido(recuperado))
        } else {
          setPendiente(null)
          setCarrito(await obtenerCarrito())
        }
      } catch {
        setErrorCarga(
          'No se pudo comprobar el estado del pedido. ' +
          'Recarga la página antes de volver a confirmar.',
        )
      }
    } finally {
      envioEnCurso.current = false
      setConfirmando(false)
    }
  }

  const campos = (
    campo: keyof DatosCliente,
    titulo: string,
    obligatorio = true,
    tipo = 'text',
    maxLength = 100,
  ) => (
    <div className="mb-3">
      <label className="form-label" htmlFor={campo}>
        {titulo}{obligatorio ? ' *' : ''}
      </label>

      <input
        id={campo}
        name={campo}
        type={tipo}
        required={obligatorio}
        maxLength={maxLength}
        className={`form-control${errores[campo] ? ' is-invalid' : ''}`}
        value={datos[campo]}
        onChange={(evento) =>
          actualizarCampo(campo, evento.target.value)
        }
        aria-invalid={Boolean(errores[campo])}
      />

      {errores[campo] && (
        <div className="invalid-feedback">
          {errores[campo]}
        </div>
      )}
    </div>
  )

  const productos = pendiente
    ? pendiente.items.map((item) => ({
        codigo: item.codigo,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.precioUnitario * item.cantidad,
      }))
    : carrito?.items ?? []

  const total = pendiente?.total ?? carrito?.total ?? 0

  const compraDisponible = Boolean(
    pendiente ||
    (
      carrito &&
      carrito.items.length > 0 &&
      carrito.items.every((item) => item.disponible)
    ),
  )

  if (cargando) {
    return <p role="status">Cargando datos de compra...</p>
  }

  return (
    <section aria-labelledby="titulo-checkout">
      <h1 id="titulo-checkout">Datos para la compra</h1>

      <p className="text-secondary mb-4">
        Completa tus datos y elige cómo recibir tus productos.
      </p>

      {errorCarga && (
        <div className="alert alert-danger" role="alert">
          {errorCarga}
        </div>
      )}

      {pendiente && (
        <div className="alert alert-warning" role="status">
          <strong>Pedido pendiente de confirmación</strong>
          <p className="text-break mb-1">{pendiente.id}</p>
          <p className="mb-0">
            Reintenta con los datos originales del pedido.
            No se descontará dos veces el mismo inventario
            cuando el servicio de stock confirme la operación.
          </p>
        </div>
      )}

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <form
            className="card shadow-sm"
            onSubmit={confirmarCompra}
            noValidate
          >
            <div className="card-body">
              <fieldset disabled={confirmando || Boolean(pendiente)}>
                <legend className="h4 mb-3">Datos del cliente</legend>

                {campos('nombre', 'Nombre', true, 'text', 50)}
                {campos('apellido', 'Apellido', true, 'text', 100)}
                {campos('correo', 'Correo electrónico', true, 'email', 100)}
              </fieldset>

              <fieldset disabled={confirmando || Boolean(pendiente)}>
                <legend className="h4 mb-3">
                  Información de entrega
                </legend>

                <div className="mb-3">
                  <label className="form-label" htmlFor="entrega">
                    Opción de entrega *
                  </label>

                  <select
                    id="entrega"
                    className="form-select"
                    value={datos.entrega}
                    onChange={(evento) =>
                      actualizarCampo('entrega', evento.target.value)
                    }
                  >
                    <option value="despacho">
                      Despacho a domicilio
                    </option>

                    <option value="retiro">
                      Retiro en tienda
                    </option>
                  </select>
                </div>

                {datos.entrega === 'despacho' ? (
                  <>
                    {campos('calle', 'Calle', true, 'text', 200)}
                    {campos('numero', 'Número', true, 'text', 20)}
                    {campos('complemento', 'Departamento o complemento', false)}
                    {campos('region', 'Región')}
                    {campos('comuna', 'Comuna')}

                    <div className="mb-3">
                      <label className="form-label" htmlFor="indicaciones">
                        Indicaciones de entrega
                      </label>

                      <textarea
                        id="indicaciones"
                        className="form-control"
                        rows={3}
                        maxLength={300}
                        value={datos.indicaciones}
                        onChange={(evento) =>
                          actualizarCampo('indicaciones', evento.target.value)
                        }
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-secondary">
                    Retirarás tus productos en la tienda Sonido Vivo.
                  </p>
                )}
              </fieldset>

              {errorCompra && (
                <p
                  className={`alert ${pendiente ? 'alert-warning' : 'alert-danger'}`}
                  role="alert"
                >
                  {errorCompra}
                </p>
              )}

              <p className="small text-secondary">
                Compra simulada para fines académicos.
                No se realizará un pago bancario.
              </p>

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    confirmando ||
                    !compraDisponible ||
                    Boolean(errorCarga)
                  }
                >
                  {confirmando
                    ? 'Confirmando...'
                    : pendiente
                      ? 'Reintentar confirmación'
                      : 'Confirmar compra'}
                </button>

                <Link className="btn btn-outline-secondary" to="/carrito">
                  Volver al carrito
                </Link>
              </div>
            </div>
          </form>
        </div>

        <div className="col-12 col-lg-5">
          <aside className="card shadow-sm">
            <div className="card-body">
              <h2 className="h4 mb-3">Resumen de compra</h2>

              {!compraDisponible && (
                <p className="alert alert-warning">
                  Tu carrito está vacío o contiene productos no disponibles.
                </p>
              )}

              <ul className="list-group list-group-flush">
                {productos.map((item) => (
                  <li className="list-group-item px-0" key={item.codigo}>
                    <h3 className="h6">{item.nombre}</h3>

                    <p className="mb-1">
                      Precio unitario: {formatoPrecio.format(item.precioUnitario)}
                    </p>

                    <p className="mb-1">
                      Cantidad: {item.cantidad}
                    </p>

                    <p className="mb-0 fw-bold">
                      Subtotal: {formatoPrecio.format(item.subtotal)}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="d-flex justify-content-between border-top pt-3 mt-3 fw-bold">
                <span>Total (CLP)</span>
                <span>{formatoPrecio.format(total)}</span>
              </p>

              <p className="small text-secondary">
                Total de productos, sin costos de envío.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Checkout