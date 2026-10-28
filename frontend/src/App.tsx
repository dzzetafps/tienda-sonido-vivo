import { Route, Routes } from 'react-router-dom'
import Navbar from './componentes/organismos/Navbar'
import Inicio from './paginas/Inicio'
import Productos from './paginas/Productos'
import Contacto from './paginas/Contacto'
import DetalleProducto from './paginas/DetalleProducto'
import Carrito from './paginas/Carrito'
import Checkout from './paginas/Checkout'
import CompraError from './paginas/CompraError'
import CompraExitosa from './paginas/CompraExitosa'
import Login from './paginas/Login'
import Registro from './paginas/Registro'
import AdminInicio from './paginas/AdminInicio'
import AdminProductos from './paginas/AdminProductos'
import AdminFormularioProducto from './paginas/AdminFormularioProducto'
import AdminCategorias from './paginas/AdminCategorias'
import AdminReportes from './paginas/AdminReportes'

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-5">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/producto/:codigo" element={<DetalleProducto />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/compra-error" element={<CompraError />} />
          <Route path="/compra-exitosa" element={<CompraExitosa />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/admin" element={<AdminInicio />} />
          <Route path="/admin/productos" element={<AdminProductos />} />
          <Route path="/admin/productos/nuevo" element={<AdminFormularioProducto modo="nuevo" />} />
          <Route path="/admin/productos/editar/:codigo" element={<AdminFormularioProducto modo="editar" />} />
          <Route path="/admin/categorias" element={<AdminCategorias />} />
          <Route path="/admin/reportes" element={<AdminReportes />} />
        </Routes>
      </main>
    </>
  )
}

export default App
