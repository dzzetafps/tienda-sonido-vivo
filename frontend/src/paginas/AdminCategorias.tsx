import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import TablaCategoriasAdmin from '../componentes/organismos/TablaCategoriasAdmin'
import { mensajeError } from '../datos/api'
import type { Aviso } from '../datos/avisos'
import {
  actualizarCategoria,
  combinarCategorias,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
  listarProductosCatalogo,
} from '../datos/categoriasApi'
import type { Categoria, FilaCategoria } from '../datos/categoriasApi'
import type { Producto } from '../tipos/Producto'

function AdminCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [aviso, setAviso] = useState<Aviso | null>(null)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    let activo = true
    Promise.all([listarCategorias(), listarProductosCatalogo()])
      .then(([listaCategorias, listaProductos]) => {
        if (!activo) return
        setCategorias(listaCategorias)
        setProductos(listaProductos)
      })
      .catch((e) => {
        if (activo) setError(mensajeError(e, 'No se pudieron cargar las categorías.'))
      })
      .finally(() => {
        if (activo) setCargando(false)
      })
    return () => {
      activo = false
    }
  }, [])

  const filas = combinarCategorias(categorias, productos)

  function limpiarFormulario() {
    setEditando(null)
    setNombre('')
    setDescripcion('')
  }

  function editar(categoria: FilaCategoria) {
    setEditando(categoria)
    setNombre(categoria.nombre)
    setDescripcion(categoria.descripcion ?? '')
    setAviso(null)
  }

  async function guardar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const datos = { nombre: nombre.trim(), descripcion: descripcion.trim() || null }
    if (!datos.nombre) {
      setAviso({ tipo: 'danger', texto: 'El nombre de la categoría es obligatorio.' })
      return
    }

    setGuardando(true)
    try {
      if (editando) {
        const anterior = editando.nombre
        const actualizada = await actualizarCategoria(editando.id, datos)
        setCategorias((actuales) => actuales.map((actual) => (actual.id === actualizada.id ? actualizada : actual)))
        // Los productos guardan el nombre de la categoría: se renombra también en la lista local.
        setProductos((actuales) => actuales.map((producto) => (
          producto.categoria === anterior ? { ...producto, categoria: actualizada.nombre } : producto
        )))
        setAviso({ tipo: 'success', texto: `Categoría ${actualizada.nombre} actualizada correctamente.` })
      } else {
        const creada = await crearCategoria(datos)
        setCategorias((actuales) => [...actuales, creada])
        setAviso({ tipo: 'success', texto: `Categoría ${creada.nombre} creada correctamente.` })
      }
      limpiarFormulario()
    } catch (e) {
      setAviso({ tipo: 'danger', texto: mensajeError(e, 'No se pudo guardar la categoría.') })
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(categoria: FilaCategoria) {
    if (categoria.productos > 0) {
      setAviso({
        tipo: 'danger',
        texto: `No puedes eliminar ${categoria.nombre}: tiene ${categoria.productos} productos asociados.`,
      })
      return
    }
    if (!window.confirm(`¿Eliminar la categoría ${categoria.nombre}?`)) return

    try {
      await eliminarCategoria(categoria.id)
      setCategorias((actuales) => actuales.filter((actual) => actual.id !== categoria.id))
      if (editando?.id === categoria.id) limpiarFormulario()
      setAviso({ tipo: 'success', texto: `Categoría ${categoria.nombre} eliminada correctamente.` })
    } catch (e) {
      setAviso({ tipo: 'danger', texto: mensajeError(e, 'No se pudo eliminar la categoría.') })
    }
  }

  return (
    <section>
      <nav aria-label="Ruta de navegación">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/admin">Panel</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Categorías</li>
        </ol>
      </nav>

      <h1>Categorías</h1>
      <p className="lead">Cantidad de productos, stock y valor del inventario de cada categoría.</p>

      {aviso && (
        <div
          className={`alert alert-${aviso.tipo} d-flex justify-content-between align-items-start gap-3`}
          role={aviso.tipo === 'danger' ? 'alert' : 'status'}
        >
          <span>{aviso.texto}</span>
          <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => setAviso(null)} />
        </div>
      )}

      {cargando ? (
        <p className="text-secondary" role="status">Cargando categorías...</p>
      ) : error ? (
        <p className="alert alert-danger" role="alert">{error}</p>
      ) : (
        <>
          <form className="card card-body mb-4" onSubmit={guardar} noValidate>
            <h2 className="h5">{editando ? `Editar ${editando.nombre}` : 'Nueva categoría'}</h2>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="categoria-nombre">Nombre</label>
                <input
                  id="categoria-nombre"
                  className="form-control"
                  maxLength={100}
                  required
                  value={nombre}
                  onChange={(evento) => setNombre(evento.target.value)}
                />
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label" htmlFor="categoria-descripcion">Descripción (opcional)</label>
                <input
                  id="categoria-descripcion"
                  className="form-control"
                  maxLength={255}
                  value={descripcion}
                  onChange={(evento) => setDescripcion(evento.target.value)}
                />
              </div>
            </div>
            <div className="d-flex gap-2 mt-3">
              <button type="submit" className="btn btn-primary" disabled={guardando}>
                {guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear categoría'}
              </button>
              {editando && (
                <button type="button" className="btn btn-outline-secondary" onClick={limpiarFormulario}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <p>{filas.length} categorías con {productos.length} productos en total.</p>
          <TablaCategoriasAdmin categorias={filas} onEditar={editar} onEliminar={eliminar} />
        </>
      )}
    </section>
  )
}

export default AdminCategorias
