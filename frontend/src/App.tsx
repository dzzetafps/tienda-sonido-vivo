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
        </Routes>
      </main>
    </>
  )
}

export default App
