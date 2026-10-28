import { useState } from 'react'
import { Link } from 'react-router-dom'
import TablaCategoriasAdmin from '../componentes/organismos/TablaCategoriasAdmin'
import { leerCatalogo, resumirCategorias } from '../datos/catalogoAdmin'

function AdminCategorias() {
  const [catalogo] = useState(leerCatalogo)
  const categorias = resumirCategorias(catalogo.productos)

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

      {catalogo.error ? (
        <p className="alert alert-danger" role="alert">{catalogo.error}</p>
      ) : (
        <>
          <p>{categorias.length} categorías con {catalogo.productos.length} productos en total.</p>
          <TablaCategoriasAdmin categorias={categorias} />
        </>
      )}
    </section>
  )
}

export default AdminCategorias
