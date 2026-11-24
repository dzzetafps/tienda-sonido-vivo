import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import FormularioContacto from '../../src/componentes/organismos/FormularioContacto'
import { articulos } from '../../src/datos/articulos'
import Blogs from '../../src/paginas/Blogs'
import DetalleBlog from '../../src/paginas/DetalleBlog'

function escribir(campo: HTMLInputElement | HTMLTextAreaElement, valor: string) {
  const prototipo = campo instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototipo, 'value')!.set!.call(campo, valor)
  campo.dispatchEvent(new Event('input', { bubbles: true }))
}

function respuestaJson(estado: number, datos: unknown) {
  return Promise.resolve({ ok: estado >= 200 && estado < 300, status: estado, json: () => Promise.resolve(datos) } as Response)
}

async function esperarRespuestas() {
  await act(async () => {
    await new Promise((resolver) => setTimeout(resolver, 0))
  })
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
    await esperarRespuestas()
  }

  it('FormularioContacto vacío: muestra los errores de nombre y comentario y no envía', async () => {
    const enviar = jasmine.createSpy('enviar').and.resolveTo(true)
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

  it('FormularioContacto válido: entrega el mensaje con el correo en minúsculas y limpia los campos si se guardó', async () => {
    const enviar = jasmine.createSpy('enviar').and.resolveTo(true)
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
    await esperarRespuestas()

    expect(enviar).toHaveBeenCalledOnceWith({
      nombre: 'Ana Rojas',
      correo: 'ana@correo.cl',
      comentario: '¿Tienen cuerdas para guitarra clásica?',
    })
    expect(nombre.value).toBe('')
    expect(comentario.value).toBe('')
  })

  it('FormularioContacto: si el backend falla no borra lo escrito', async () => {
    const enviar = jasmine.createSpy('enviar').and.resolveTo(false)
    await act(async () => {
      root.render(<FormularioContacto onEnviar={enviar} />)
    })
    const nombre = contenedor.querySelector<HTMLInputElement>('#contacto-nombre')!

    await act(async () => {
      escribir(nombre, 'Ana')
      escribir(contenedor.querySelector<HTMLTextAreaElement>('#contacto-comentario')!, 'Hola')
    })
    await act(async () => {
      contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    })
    await esperarRespuestas()

    expect(enviar).toHaveBeenCalled()
    expect(nombre.value).toBe('Ana')
  })

  it('Blogs pide los artículos a la API y muestra una tarjeta por artículo', async () => {
    const espia = spyOn(window, 'fetch').and.callFake(() => respuestaJson(200, articulos))
    await act(async () => {
      root.render(<MemoryRouter><Blogs /></MemoryRouter>)
    })
    await esperarRespuestas()
    const enlaces = Array.from(contenedor.querySelectorAll('article a'), (enlace) => enlace.getAttribute('href'))

    expect(String(espia.calls.mostRecent().args[0])).toBe('http://localhost:8080/api/blogs')
    expect(contenedor.querySelectorAll('article').length).toBe(2)
    expect(enlaces).toEqual(['/blogs/como-elegir-tu-primera-guitarra', '/blogs/cuidado-de-instrumentos'])
  })

  it('Blogs sin sesión: muestra el aviso y el enlace para iniciar sesión', async () => {
    spyOn(window, 'fetch').and.callFake(() => respuestaJson(401, null))
    await act(async () => {
      root.render(<MemoryRouter><Blogs /></MemoryRouter>)
    })
    await esperarRespuestas()

    expect(contenedor.textContent).toContain('Debes iniciar sesión para continuar.')
    expect(contenedor.querySelector('a[href="/login"]')).not.toBeNull()
  })

  it('DetalleBlog usa el parámetro de la ruta y avisa cuando el artículo no existe', async () => {
    spyOn(window, 'fetch').and.callFake((entrada) => {
      const id = String(entrada).split('/').pop()
      const articulo = articulos.find((actual) => actual.id === id)
      return articulo
        ? respuestaJson(200, articulo)
        : respuestaJson(404, { mensaje: 'No se encontró el artículo solicitado.' })
    })

    await mostrarDetalle('cuidado-de-instrumentos')
    expect(contenedor.querySelector('h1')?.textContent).toBe('Consejos para cuidar tus instrumentos musicales')
    expect(contenedor.querySelectorAll('section h2').length).toBe(5)

    await mostrarDetalle('no-existe')
    expect(contenedor.querySelector('h1')?.textContent).toBe('Artículo no encontrado')
  })
})
