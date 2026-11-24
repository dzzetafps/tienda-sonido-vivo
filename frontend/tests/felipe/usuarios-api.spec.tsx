import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { ErrorApi, establecerToken } from '../../src/datos/api'
import { crearUsuario, listarUsuarios } from '../../src/datos/usuariosApi'
import AdminUsuarios from '../../src/paginas/AdminUsuarios'
import type { Usuario } from '../../src/tipos/Usuario'

const vendedor: Usuario = {
  id: 'u-1',
  rut: '111111111',
  nombre: 'Ana',
  apellidos: 'Rojas',
  correo: 'ana@correo.cl',
  fechaNacimiento: '',
  region: 'Región de Valparaíso',
  comuna: 'Viña del Mar',
  direccion: 'Calle 1',
  rol: 'vendedor',
  activo: true,
  fechaRegistro: '2026-11-24T03:00:00Z',
}

function respuestaJson(estado: number, datos: unknown) {
  return Promise.resolve({ ok: estado >= 200 && estado < 300, status: estado, json: () => Promise.resolve(datos) } as Response)
}

describe('Felipe — usuarios conectados a la API', () => {
  afterEach(() => {
    establecerToken(null)
  })

  it('envía la petición al gateway con el token como Bearer', async () => {
    const espia = spyOn(window, 'fetch').and.callFake(() => respuestaJson(200, [vendedor]))
    establecerToken('token-de-prueba')

    const usuarios = await listarUsuarios()

    const [url, opciones] = espia.calls.mostRecent().args
    expect(String(url)).toBe('http://localhost:8080/api/usuarios')
    expect(new Headers(opciones?.headers).get('Authorization')).toBe('Bearer token-de-prueba')
    expect(usuarios[0].rol).toBe('vendedor')
  })

  it('cuando el backend responde 409 muestra su mensaje', async () => {
    spyOn(window, 'fetch').and.callFake(() => respuestaJson(409, { mensaje: 'Ya existe un usuario con ese RUT.' }))
    const nuevo = {
      rut: '11.111.111-1', nombre: 'Ana', apellidos: 'Rojas', correo: 'ana@correo.cl', fechaNacimiento: '',
      region: 'Región de Valparaíso', comuna: 'Viña del Mar', direccion: 'Calle 1', rol: 'cliente' as const,
      contrasena: 'clave1',
    }

    await expectAsync(crearUsuario(nuevo)).toBeRejectedWithError(ErrorApi, 'Ya existe un usuario con ese RUT.')
  })

  it('si el backend no está encendido avisa que no hay conexión', async () => {
    spyOn(window, 'fetch').and.callFake(() => Promise.reject(new TypeError('Failed to fetch')))

    await expectAsync(listarUsuarios())
      .toBeRejectedWithError(ErrorApi, 'No se pudo conectar con el servidor. Revisa que el backend esté encendido.')
  })

  describe('AdminUsuarios', () => {
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

    async function mostrar() {
      await act(async () => {
        root.render(<MemoryRouter><AdminUsuarios /></MemoryRouter>)
      })
      await act(async () => {
        await new Promise((resolver) => setTimeout(resolver, 0))
      })
    }

    it('muestra los usuarios que entrega la API', async () => {
      spyOn(window, 'fetch').and.callFake(() => respuestaJson(200, [vendedor]))
      await mostrar()

      expect(contenedor.querySelectorAll('tbody tr').length).toBe(1)
      expect(contenedor.textContent).toContain('Vendedor')
    })

    it('con un rol sin permisos muestra el error 403', async () => {
      spyOn(window, 'fetch').and.callFake(() => respuestaJson(403, null))
      await mostrar()

      expect(contenedor.textContent).toContain('No tienes permisos para realizar esta acción.')
      expect(contenedor.querySelector('table')).toBeNull()
    })
  })
})
