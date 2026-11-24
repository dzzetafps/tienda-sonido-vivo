import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormularioProducto from '../componentes/organismos/FormularioProducto'
import {
  actualizarProducto,
  buscarProductoPorCodigo,
  crearProducto,
  obtenerCategorias,
} from '../datos/productosApi'
import { mensajeError } from '../datos/api'
import type { Producto } from '../tipos/Producto'

interface AdminFormularioProductoProps {
  modo: 'nuevo' | 'editar'
}

function AdminFormularioProducto({
  modo,
}: AdminFormularioProductoProps) {
  const { codigo = '' } = useParams<{ codigo: string }>()
  const navigate = useNavigate()

  const [categorias, setCategorias] = useState<string[]>([])
  const [productoInicial, setProductoInicial] = useState<Producto>()
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [errorGuardar, setErrorGuardar] = useState('')

  const titulo =
    modo === 'nuevo'
      ? 'Nuevo producto'
      : `Editar producto ${codigo}`

  useEffect(() => {
    let activo = true

    setCargando(true)
    setError('')
    setErrorGuardar('')
    setProductoInicial(undefined)

    async function cargarDatos() {
      try {
        const datosCategorias = await obtenerCategorias()

        const nombres = datosCategorias
          .map((categoria) => categoria.nombre)
          .sort((primera, segunda) =>
            primera.localeCompare(segunda, 'es'),
          )

        const producto =
          modo === 'editar'
            ? await buscarProductoPorCodigo(codigo)
            : undefined

        if (activo) {
          setCategorias(nombres)
          setProductoInicial(producto)
        }
      } catch (problema) {
        if (activo) {
          setError(
            mensajeError(
              problema,
              'No se pudieron cargar los datos del formulario.',
            ),
          )
        }
      } finally {
        if (activo) setCargando(false)
      }
    }

    void cargarDatos()

    return () => {
      activo = false
    }
  }, [modo, codigo])

  async function guardar(producto: Producto) {
    if (guardando) return

    setGuardando(true)
    setErrorGuardar('')

    try {
      if (modo === 'nuevo') {
        await crearProducto(producto)
      } else {
        await actualizarProducto(codigo, producto)
      }

      const accion =
        modo === 'nuevo' ? 'creado' : 'actualizado'

      navigate('/admin/productos', {
        state: {
          mensaje: `Producto ${producto.codigo} ${accion} correctamente.`,
        },
      })
    } catch (problema) {
      setErrorGuardar(
        mensajeError(problema, 'No se pudo guardar el producto.'),
      )
    } finally {
      setGuardando(false)
    }
  }

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/admin">Panel</Link>
          </li>

          <li className="breadcrumb-item">
            <Link to="/admin/productos">Productos</Link>
          </li>

          <li
            className="breadcrumb-item active"
            aria-current="page"
          >
            {titulo}
          </li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm p-3 p-md-4">
            <h1 className="h2 mb-4">{titulo}</h1>

            {errorGuardar && (
              <p className="alert alert-danger" role="alert">
                {errorGuardar}
              </p>
            )}

            {cargando ? (
              <p role="status">Cargando formulario...</p>
            ) : error ? (
              <>
                <p className="alert alert-danger" role="alert">
                  {error}
                </p>

                <Link
                  className="btn btn-outline-secondary align-self-start"
                  to="/admin/productos"
                >
                  Volver al listado
                </Link>
              </>
            ) : (
              <>
                {guardando && (
                  <p role="status">Guardando producto...</p>
                )}

                <fieldset disabled={guardando}>
                  <FormularioProducto
                    key={`${modo}-${codigo}`}
                    modo={modo}
                    categorias={categorias}
                    productoInicial={productoInicial}
                    onGuardar={guardar}
                    onCancelar={() => navigate('/admin/productos')}
                  />
                </fieldset>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminFormularioProducto