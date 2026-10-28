import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { crearPedido } from '../datos/pedidosService.js'
import { obtenerSesion } from '../datos/usuariosService.js'
import {
  obtenerCarrito,
  calcularSubtotal,
  calcularTotal,
  validarDisponibilidadCarrito,
} from '../datos/carritoService.js'
import { buscarProductoPorCodigo } from '../datos/productosService.js'
import type { ItemCarrito } from '../tipos/ItemCarrito'
import type { Producto } from '../tipos/Producto'

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

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function cargarResumen() {
  let productos: { item: ItemCarrito; producto: Producto | undefined; subtotal: number | null }[] = []
  let total: number | null = null
  let error = ''

  try {
    const items = obtenerCarrito()
    productos = items.map((item) => {
      let producto: Producto | undefined
      let subtotal: number | null = null

      try {
        producto = buscarProductoPorCodigo(item.codigo)
        subtotal = calcularSubtotal(item)
      } catch (problema) {
        error = problema instanceof Error ? problema.message : 'No se pudo consultar un producto del carrito.'
      }

      return { item, producto, subtotal }
    })
    total = calcularTotal()
    validarDisponibilidadCarrito()
    if (items.length === 0) error = 'Tu carrito está vacío. Agrega productos antes de continuar.'
  } catch (problema) {
    error = problema instanceof Error ? problema.message : 'No se pudo comprobar el carrito.'
  }

  return { productos, total, error }
}

function Checkout() {
  const navegar = useNavigate()
  const envioEnCurso = useRef(false)
  const [datos, setDatos] = useState<DatosCliente>({
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
  })
  const [errores, setErrores] = useState<Errores>({})
  const [resumen, setResumen] = useState(cargarResumen)
  const [confirmando, setConfirmando] = useState(false)
  const [errorCompra, setErrorCompra] = useState('')

  function actualizarCampo(campo: keyof DatosCliente, valor: string) {
    setDatos({ ...datos, [campo]: valor })
    setErrores({ ...errores, [campo]: undefined })
    setErrorCompra('')
  }

  function validarDatos(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (envioEnCurso.current) return
    setErrorCompra('')
    const nuevosErrores: Errores = {}

    if (!datos.nombre.trim()) nuevosErrores.nombre = 'Ingresa tu nombre.'
    if (!datos.apellido.trim()) nuevosErrores.apellido = 'Ingresa tu apellido.'
    if (!datos.correo.trim()) {
      nuevosErrores.correo = 'Ingresa tu correo electrónico.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
      nuevosErrores.correo = 'Ingresa un correo electrónico válido.'
    }

    if (datos.entrega === 'despacho') {
      if (!datos.calle.trim()) nuevosErrores.calle = 'Ingresa la calle de entrega.'
      if (!datos.numero.trim()) nuevosErrores.numero = 'Ingresa el número de la dirección.'
      if (!datos.region.trim()) nuevosErrores.region = 'Ingresa la región de entrega.'
      if (!datos.comuna.trim()) nuevosErrores.comuna = 'Ingresa la comuna de entrega.'
    }

    const resumenActual = cargarResumen()
    setResumen(resumenActual)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0 || resumenActual.error) return

    envioEnCurso.current = true
    setConfirmando(true)
    try {
      const despacho = datos.entrega === 'despacho'
      const pedido = crearPedido({
        usuarioId: obtenerSesion()?.usuarioId ?? null,
        comprador: { nombre: datos.nombre, apellido: datos.apellido, correo: datos.correo },
        entrega: {
          tipo: datos.entrega,
          calle: despacho ? datos.calle : '',
          numero: despacho ? datos.numero : '',
          complemento: despacho ? datos.complemento : '',
          region: despacho ? datos.region : '',
          comuna: despacho ? datos.comuna : '',
          indicaciones: despacho ? datos.indicaciones : '',
        },
      })
      navegar(`/compra-exitosa?pedido=${encodeURIComponent(pedido.id)}`, { replace: true })
    } catch (error) {
      setErrorCompra(error instanceof Error ? error.message : 'No se pudo confirmar la compra. Inténtalo nuevamente.')
      setResumen(cargarResumen())
      envioEnCurso.current = false
      setConfirmando(false)
    }
  }

  return (
    <section aria-labelledby="titulo-checkout">
      <h1 id="titulo-checkout">Datos para la compra</h1>
      <p className="text-secondary mb-4">Completa tus datos y elige cómo recibir tus productos.</p>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <form className="card shadow-sm" onSubmit={validarDatos} noValidate>
            <div className="card-body">
              <fieldset className="mb-4" disabled={confirmando}>
                <legend className="h4 mb-3">Datos del cliente</legend>
                <p className="small text-secondary">Los campos marcados con * son obligatorios.</p>
                <div className="row g-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="nombre">Nombre *</label>
                    <input
                      id="nombre" name="nombre" autoComplete="given-name" required
                      className={`form-control${errores.nombre ? ' is-invalid' : ''}`}
                      value={datos.nombre} onChange={(evento) => actualizarCampo('nombre', evento.target.value)}
                      aria-invalid={Boolean(errores.nombre)} aria-describedby={errores.nombre ? 'error-nombre' : undefined}
                    />
                    {errores.nombre && <div id="error-nombre" className="invalid-feedback">{errores.nombre}</div>}
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label" htmlFor="apellido">Apellido *</label>
                    <input
                      id="apellido" name="apellido" autoComplete="family-name" required
                      className={`form-control${errores.apellido ? ' is-invalid' : ''}`}
                      value={datos.apellido} onChange={(evento) => actualizarCampo('apellido', evento.target.value)}
                      aria-invalid={Boolean(errores.apellido)} aria-describedby={errores.apellido ? 'error-apellido' : undefined}
                    />
                    {errores.apellido && <div id="error-apellido" className="invalid-feedback">{errores.apellido}</div>}
                  </div>
                  <div className="col-12">
                    <label className="form-label" htmlFor="correo">Correo electrónico *</label>
                    <input
                      id="correo" name="correo" type="email" autoComplete="email" required
                      className={`form-control${errores.correo ? ' is-invalid' : ''}`}
                      value={datos.correo} onChange={(evento) => actualizarCampo('correo', evento.target.value)}
                      aria-invalid={Boolean(errores.correo)} aria-describedby={errores.correo ? 'error-correo' : undefined}
                    />
                    {errores.correo && <div id="error-correo" className="invalid-feedback">{errores.correo}</div>}
                  </div>
                </div>
              </fieldset>

              <fieldset className="mb-4" disabled={confirmando}>
                <legend className="h4 mb-3">Información de entrega</legend>
                <div className="mb-3">
                  <label className="form-label" htmlFor="entrega">Opción de entrega *</label>
                  <select
                    id="entrega" name="entrega" className="form-select" value={datos.entrega}
                    onChange={(evento) => {
                      actualizarCampo('entrega', evento.target.value)
                      setErrores({ nombre: errores.nombre, apellido: errores.apellido, correo: errores.correo })
                    }}
                  >
                    <option value="despacho">Despacho a domicilio</option>
                    <option value="retiro">Retiro en tienda</option>
                  </select>
                </div>

                {datos.entrega === 'despacho' ? (
                  <div className="row g-3">
                    <div className="col-12 col-sm-8">
                      <label className="form-label" htmlFor="calle">Calle *</label>
                      <input
                        id="calle" name="calle" required
                        className={`form-control${errores.calle ? ' is-invalid' : ''}`}
                        value={datos.calle} onChange={(evento) => actualizarCampo('calle', evento.target.value)}
                        aria-invalid={Boolean(errores.calle)} aria-describedby={errores.calle ? 'error-calle' : undefined}
                      />
                      {errores.calle && <div id="error-calle" className="invalid-feedback">{errores.calle}</div>}
                    </div>
                    <div className="col-12 col-sm-4">
                      <label className="form-label" htmlFor="numero">Número *</label>
                      <input
                        id="numero" name="numero" required
                        className={`form-control${errores.numero ? ' is-invalid' : ''}`}
                        value={datos.numero} onChange={(evento) => actualizarCampo('numero', evento.target.value)}
                        aria-invalid={Boolean(errores.numero)} aria-describedby={errores.numero ? 'error-numero' : undefined}
                      />
                      {errores.numero && <div id="error-numero" className="invalid-feedback">{errores.numero}</div>}
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="complemento">Departamento o complemento (opcional)</label>
                      <input
                        id="complemento" name="complemento" className="form-control" autoComplete="address-line2"
                        value={datos.complemento} onChange={(evento) => actualizarCampo('complemento', evento.target.value)}
                      />
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label" htmlFor="region">Región *</label>
                      <input
                        id="region" name="region" autoComplete="address-level1" required
                        className={`form-control${errores.region ? ' is-invalid' : ''}`}
                        value={datos.region} onChange={(evento) => actualizarCampo('region', evento.target.value)}
                        aria-invalid={Boolean(errores.region)} aria-describedby={errores.region ? 'error-region' : undefined}
                      />
                      {errores.region && <div id="error-region" className="invalid-feedback">{errores.region}</div>}
                    </div>
                    <div className="col-12 col-sm-6">
                      <label className="form-label" htmlFor="comuna">Comuna *</label>
                      <input
                        id="comuna" name="comuna" autoComplete="address-level2" required
                        className={`form-control${errores.comuna ? ' is-invalid' : ''}`}
                        value={datos.comuna} onChange={(evento) => actualizarCampo('comuna', evento.target.value)}
                        aria-invalid={Boolean(errores.comuna)} aria-describedby={errores.comuna ? 'error-comuna' : undefined}
                      />
                      {errores.comuna && <div id="error-comuna" className="invalid-feedback">{errores.comuna}</div>}
                    </div>
                    <div className="col-12">
                      <label className="form-label" htmlFor="indicaciones">Indicaciones de entrega (opcional)</label>
                      <textarea
                        id="indicaciones" name="indicaciones" className="form-control" rows={3}
                        value={datos.indicaciones} onChange={(evento) => actualizarCampo('indicaciones', evento.target.value)}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-secondary">Retirarás tus productos en la tienda Sonido Vivo.</p>
                )}
              </fieldset>

              {Object.values(errores).some(Boolean) && (
                <p className="alert alert-danger" role="alert">Revisa los campos indicados antes de continuar.</p>
              )}
              {errorCompra && <p className="alert alert-danger" role="alert">{errorCompra}</p>}
              <p className="small text-secondary">Compra simulada para fines académicos; no se realizará un pago bancario.</p>
              <button type="submit" className="btn btn-primary" disabled={confirmando}>
                {confirmando ? 'Confirmando...' : 'Confirmar compra'}
              </button>
            </div>
          </form>
        </div>

        <div className="col-12 col-lg-5">
          <aside className="card shadow-sm" aria-labelledby="titulo-resumen-checkout">
            <div className="card-body">
              <h2 className="h4 mb-3" id="titulo-resumen-checkout">Resumen de compra</h2>
              {resumen.error && (
                <div className="alert alert-warning" role="alert">
                  <p className="mb-1">{resumen.error}</p>
                  <p className="mb-0">Resuelve el problema en el carrito y vuelve a validar los datos.</p>
                </div>
              )}
              <ul className="list-group list-group-flush">
                {resumen.productos.map(({ item, producto, subtotal }) => (
                  <li className="list-group-item px-0" key={item.codigo}>
                    <h3 className="h6">{producto?.nombre ?? item.codigo}</h3>
                    <p className="mb-1">Precio unitario: {producto ? formatoPrecio.format(producto.precio) : 'No disponible'}</p>
                    <p className="mb-1">Cantidad: {item.cantidad}</p>
                    <p className="mb-0 fw-bold">Subtotal: {subtotal === null ? 'No disponible' : formatoPrecio.format(subtotal)}</p>
                  </li>
                ))}
              </ul>
              <p className="d-flex justify-content-between gap-3 border-top pt-3 mt-3 fw-bold">
                <span>Total (CLP)</span>
                <span>{resumen.total === null ? 'No disponible' : formatoPrecio.format(resumen.total)}</span>
              </p>
              <p className="small text-secondary mb-0">El total corresponde a los productos, sin costos de envío.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default Checkout
