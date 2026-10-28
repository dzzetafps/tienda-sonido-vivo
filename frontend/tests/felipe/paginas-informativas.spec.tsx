import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import FormularioContacto from '../../src/componentes/organismos/FormularioContacto'
import Blogs from '../../src/paginas/Blogs'
import DetalleBlog from '../../src/paginas/DetalleBlog'

function escribir(campo: HTMLInputElement | HTMLTextAreaElement, valor: string) {
  const prototipo = campo instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototipo, 'value')!.set!.call(campo, valor)
  campo.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('Felipe — contacto y blogs', () => {
  let contenedor: HTMLDivElement
  let root: Root

  beforeEach(() => {
    contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    root = createRoot(contenedor)
  })

  afterEach(async () => {
    try {
      await act(async () => root.unmount())
    } finally {
      contenedor.remove()
    }
  })

  async function mostrarDetalle(id: string) {
    await act(async () => {
      root.render(
        <MemoryRouter key={id} initialEntries={[`/blogs/${id}`]}>
          <Routes>
            <Route path="/blogs/:id" element={<DetalleBlog />} />
          </Routes>
        </MemoryRouter>,
      )
    })
  }

  it('FormularioContacto vacío: muestra los errores de nombre y comentario y no envía', async () => {
    const enviar = jasmine.createSpy('enviar')
    await act(async () => {
      root.render(<FormularioContacto onEnviar={enviar} />)
    })

    await act(async () => {
      contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    })

    const mensajes = Array.from(contenedor.querySelectorAll('.invalid-feedback'), (mensaje) => mensaje.textContent)
    expect(mensajes).toEqual(['El nombre es obligatorio', 'El comentario es obligatorio'])
    expect(enviar).not.toHaveBeenCalled()
  })

  it('FormularioContacto válido: entrega el mensaje con el correo en minúsculas y limpia los campos', async () => {
    const enviar = jasmine.createSpy('enviar')
    await act(async () => {
      root.render(<FormularioContacto onEnviar={enviar} />)
    })
    const nombre = contenedor.querySelector<HTMLInputElement>('#contacto-nombre')!
    const comentario = contenedor.querySelector<HTMLTextAreaElement>('#contacto-comentario')!

    await act(async () => {
      escribir(nombre, ' Ana Rojas ')
      escribir(contenedor.querySelector<HTMLInputElement>('#contacto-correo')!, 'Ana@Correo.CL')
      escribir(comentario, '¿Tienen cuerdas para guitarra clásica?')
    })
    await act(async () => {
      contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    })

    expect(enviar).toHaveBeenCalledOnceWith({
      nombre: 'Ana Rojas',
      correo: 'ana@correo.cl',
      comentario: '¿Tienen cuerdas para guitarra clásica?',
    })
    expect(nombre.value).toBe('')
    expect(comentario.value).toBe('')
  })

  it('Blogs muestra una tarjeta por artículo con su enlace al detalle', async () => {
    await act(async () => {
      root.render(<MemoryRouter><Blogs /></MemoryRouter>)
    })
    const enlaces = Array.from(contenedor.querySelectorAll('article a'), (enlace) => enlace.getAttribute('href'))

    expect(contenedor.querySelectorAll('article').length).toBe(2)
    expect(enlaces).toEqual(['/blogs/como-elegir-tu-primera-guitarra', '/blogs/cuidado-de-instrumentos'])
  })

  it('DetalleBlog usa el parámetro de la ruta y avisa cuando el artículo no existe', async () => {
    await mostrarDetalle('cuidado-de-instrumentos')
    expect(contenedor.querySelector('h1')?.textContent).toBe('Consejos para cuidar tus instrumentos musicales')
    expect(contenedor.querySelectorAll('section h2').length).toBe(5)

    await mostrarDetalle('no-existe')
    expect(contenedor.querySelector('h1')?.textContent).toBe('Artículo no encontrado')
  })
})
