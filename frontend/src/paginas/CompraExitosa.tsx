import { Link } from 'react-router-dom'

interface CompraVisualizacion {
  confirmada: boolean
  identificador: string
  cliente: {
    nombre: string
    apellido: string
    correo: string
  }
  entrega: {
    tipo: 'despacho' | 'retiro'
    calle?: string
    numero?: string
    complemento?: string
    region?: string
    comuna?: string
    indicaciones?: string
  }
  productos: {
    codigo: string
    nombre: string
    cantidad: number
    precioUnitario: number
  }[]
  total: number
}

interface CompraExitosaProps {
  compra?: CompraVisualizacion
}

const formatoPrecio = new Intl.NumberFormat('es-CL', {
  style: 'currency',
  currency: 'CLP',
  maximumFractionDigits: 0,
})

function textoValido(valor: unknown): valor is string {
  return typeof valor === 'string' && valor.trim().length > 0
}

function CompraExitosa({ compra }: CompraExitosaProps) {
  const clienteValido = textoValido(compra?.cliente?.nombre) &&
    textoValido(compra?.cliente?.apellido) &&
    textoValido(compra?.cliente?.correo) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compra.cliente.correo.trim())

  const entregaValida = compra?.entrega?.tipo === 'retiro' || (
    compra?.entrega?.tipo === 'despacho' &&
    textoValido(compra.entrega.calle) &&
    textoValido(compra.entrega.numero) &&
    textoValido(compra.entrega.region) &&
    textoValido(compra.entrega.comuna)
  )

  const productosValidos = Array.isArray(compra?.productos) &&
    compra.productos.length > 0 &&
    compra.productos.every((producto) =>
      textoValido(producto?.codigo) &&
      textoValido(producto?.nombre) &&
      Number.isSafeInteger(producto?.cantidad) && producto.cantidad > 0 &&
      Number.isFinite(producto?.precioUnitario) && producto.precioUnitario >= 0
    ) &&
    new Set(compra.productos.map((producto) => producto.codigo)).size === compra.productos.length

  const totalValido = productosValidos && Number.isFinite(compra?.total) &&
    compra.total >= 0 &&
    compra.total === compra.productos.reduce((total, producto) => total + producto.precioUnitario * producto.cantidad, 0)

  if (!compra || compra.confirmada !== true || !textoValido(compra.identificador) ||
    !clienteValido || !entregaValida || !productosValidos || !totalValido) {
    return (
      <section className="row justify-content-center" aria-labelledby="titulo-sin-compra">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-4 p-md-5">
              <h1 className="h2 mb-4" id="titulo-sin-compra">Información de compra</h1>
              <p className="alert alert-warning" role="status">No hay una compra confirmada disponible.</p>
              <Link className="btn btn-primary" to="/productos">Volver al catálogo</Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="titulo-compra-exitosa">
      <h1 id="titulo-compra-exitosa">Compra realizada con éxito</h1>
      <p className="text-secondary text-break mb-4">Identificador de compra: <strong>{compra.identificador}</strong></p>

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body text-break">
              <h2 className="h4 mb-3">Datos del cliente</h2>
              <dl className="mb-0">
                <dt>Nombre</dt>
                <dd>{compra.cliente.nombre} {compra.cliente.apellido}</dd>
                <dt>Correo electrónico</dt>
                <dd className="mb-0">{compra.cliente.correo}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body text-break">
              <h2 className="h4 mb-3">Información de entrega</h2>
              {compra.entrega.tipo === 'retiro' ? (
                <p className="mb-0">Retiro en tienda Sonido Vivo.</p>
              ) : (
                <>
                  <p>Despacho a domicilio</p>
                  <p className="mb-1">{compra.entrega.calle} {compra.entrega.numero}</p>
                  {textoValido(compra.entrega.complemento) && <p className="mb-1">{compra.entrega.complemento}</p>}
                  <p className="mb-0">{compra.entrega.comuna}, {compra.entrega.region}</p>
                  {textoValido(compra.entrega.indicaciones) && (
                    <p className="mt-3 mb-0"><strong>Indicaciones:</strong> {compra.entrega.indicaciones}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h2 className="h4 mb-3">Resumen de productos</h2>
          <div className="table-responsive">
            <table className="table align-middle">
              <caption>Productos de la compra confirmada. Precios en pesos chilenos.</caption>
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col" className="text-end">Precio unitario</th>
                  <th scope="col" className="text-end">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {compra.productos.map((producto) => (
                  <tr key={producto.codigo}>
                    <th scope="row" className="fw-normal text-break">{producto.nombre}</th>
                    <td>{producto.cantidad}</td>
                    <td className="text-end text-nowrap">{formatoPrecio.format(producto.precioUnitario)}</td>
                    <td className="text-end text-nowrap">{formatoPrecio.format(producto.precioUnitario * producto.cantidad)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={3}>Total (CLP)</th>
                  <td className="text-end text-nowrap fw-bold">{formatoPrecio.format(compra.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <Link className="btn btn-primary" to="/productos">Volver al catálogo</Link>
    </section>
  )
}

export default CompraExitosa
