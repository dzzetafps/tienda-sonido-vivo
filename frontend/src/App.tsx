import { Route, Routes } from 'react-router-dom'
import Navbar from './componentes/organismos/Navbar'
import Inicio from './paginas/Inicio'
import Productos from './paginas/Productos'
import Contacto from './paginas/Contacto'

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-5">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      </main>
    </>
  )
}

export default App
