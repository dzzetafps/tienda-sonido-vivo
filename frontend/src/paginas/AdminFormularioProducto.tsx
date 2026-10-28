import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import FormularioProducto from '../componentes/organismos/FormularioProducto'
import {
  actualizarProducto,
  buscarProductoPorCodigo,
  crearProducto,
  obtenerProductos,
} from '../datos/productosService.js'
import type { Producto } from '../tipos/Producto'

interface AdminFormularioProductoProps {
  modo: 'nuevo' | 'editar'
}

function leerDatos(modo: 'nuevo' | 'editar', codigo: string) {
  try {
    const categorias = [...new Set(obtenerProductos().map((producto) => producto.categoria))]
      .sort((primera, segunda) => primera.localeCompare(segunda, 'es'))

    if (modo === 'nuevo') return { categorias, producto: undefined, error: '' }

    const producto = buscarProductoPorCodigo(codigo)
    if (!producto) return { categorias, producto: undefined, error: `No se encontró el producto con código ${codigo}.` }
    return { categorias, producto, error: '' }
  } catch (error) {
    return {
      categorias: [],
      producto: undefined,
      error: error instanceof Error ? error.message : 'No se pudo cargar el catálogo.',
    }
  }
}

function AdminFormularioProducto({ modo }: AdminFormularioProductoProps) {
  const { codigo = '' } = useParams<{ codigo: string }>()
  const navigate = useNavigate()
  const [errorGuardar, setErrorGuardar] = useState('')
  const datos = leerDatos(modo, codigo)
  const titulo = modo === 'nuevo' ? 'Nuevo producto' : `Editar producto ${codigo}`

  function guardar(producto: Producto) {
    try {
      if (modo === 'nuevo') {
        crearProducto(producto)
      } else {
        actualizarProducto(codigo, producto)
      }
      const accion = modo === 'nuevo' ? 'creado' : 'actualizado'
      navigate('/admin/productos', { state: { mensaje: `Producto ${producto.codigo} ${accion} correctamente.` } })
    } catch (error) {
      setErrorGuardar(error instanceof Error ? error.message : 'No se pudo guardar el producto.')
    }
  }

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Panel</Link></li>
          <li className="breadcrumb-item"><Link to="/admin/productos">Productos</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{titulo}</li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="card shadow-sm p-3 p-md-4">
            <h1 className="h2 mb-4">{titulo}</h1>

            {errorGuardar && <p className="alert alert-danger" role="alert">{errorGuardar}</p>}

            {datos.error ? (
              <>
                <p className="alert alert-danger" role="alert">{datos.error}</p>
                <Link className="btn btn-outline-secondary align-self-start" to="/admin/productos">
                  Volver al listado
                </Link>
              </>
            ) : (
              <FormularioProducto
                key={`${modo}-${codigo}`}
                modo={modo}
                categorias={datos.categorias}
                productoInicial={datos.producto}
                onGuardar={guardar}
                onCancelar={() => navigate('/admin/productos')}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default AdminFormularioProducto
