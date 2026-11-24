import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { ErrorApi, establecerToken } from '../../src/datos/api'
import {
  combinarCategorias,
  crearCategoria,
  eliminarCategoria,
  listarProductosCatalogo,
} from '../../src/datos/categoriasApi'
import type { Categoria } from '../../src/datos/categoriasApi'
import AdminCategorias from '../../src/paginas/AdminCategorias'
import type { Producto } from '../../src/tipos/Producto'

const guitarras: Categoria = { id: 1, nombre: 'Guitarras', descripcion: 'Acústicas y eléctricas' }
const pianos: Categoria = { id: 2, nombre: 'Pianos', descripcion: null }

const base: Producto = {
  codigo: 'GU001',
  categoria: 'Guitarras',
  nombre: 'Guitarra de prueba',
  marca: 'Marca Test',
  modelo: 'MT-1',
  stock: 3,
  precio: 10000,
  descripcion: 'Producto de prueba.',
  imagen: '/img/productos/prueba.jpg',
}

function respuestaJson(estado: number, datos: unknown) {
  return Promise.resolve({ ok: estado >= 200 && estado < 300, status: estado, json: () => Promise.resolve(datos) } as Response)
}

function escribir(campo: HTMLInputElement, valor: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(campo, valor)
  campo.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('Felipe — categorías conectadas a la API', () => {
  afterEach(() => {
    establecerToken(null)
  })

  it('combinarCategorias cuenta productos, stock y valor de cada categoría, incluso las vacías', () => {
    const filas = combinarCategorias([pianos, guitarras], [
      base,
      { ...base, codigo: 'GU002', categoria: 'guitarras', stock: 2, precio: 5000 },
    ])

    expect(filas.map((fila) => [fila.nombre, fila.productos, fila.stock, fila.valor])).toEqual([
      ['Guitarras', 2, 5, 40000],
      ['Pianos', 0, 0, 0],
    ])
  })

  it('listarProductosCatalogo convierte el precio del backend a número', async () => {
    spyOn(window, 'fetch').and.callFake(() => respuestaJson(200, [{ ...base, precio: '15990.00' }]))

    const productos = await listarProductosCatalogo()

    expect(productos[0].precio).toBe(15990)
  })

  it('crearCategoria envía un POST al gateway con el token', async () => {
    const espia = spyOn(window, 'fetch').and.callFake(() => respuestaJson(201, { id: 3, nombre: 'Baterías', descripcion: null }))
    establecerToken('token-admin')

    const creada = await crearCategoria({ nombre: 'Baterías', descripcion: null })

    const [url, opciones] = espia.calls.mostRecent().args
    expect(String(url)).toBe('http://localhost:8080/api/categorias')
    expect(opciones?.method).toBe('POST')
    expect(new Headers(opciones?.headers).get('Authorization')).toBe('Bearer token-admin')
    expect(JSON.parse(String(opciones?.body))).toEqual({ nombre: 'Baterías', descripcion: null })
    expect(creada.id).toBe(3)
  })

  it('eliminarCategoria muestra el mensaje 409 del backend', async () => {
    spyOn(window, 'fetch').and.callFake(() => respuestaJson(409, { mensaje: 'La categoría tiene productos asociados' }))

    await expectAsync(eliminarCategoria(1)).toBeRejectedWithError(ErrorApi, 'La categoría tiene productos asociados')
  })

  describe('AdminCategorias', () => {
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

    function simularApi(extra?: (url: string, opciones?: RequestInit) => Promise<Response> | undefined) {
      return spyOn(window, 'fetch').and.callFake((entrada: RequestInfo | URL, opciones?: RequestInit) => {
        const url = String(entrada)
        const respuesta = extra?.(url, opciones)
        if (respuesta) return respuesta
        if (url.endsWith('/categorias')) return respuestaJson(200, [guitarras, pianos])
        if (url.endsWith('/productos')) return respuestaJson(200, [base])
        return respuestaJson(404, null)
      })
    }

    async function esperarRespuestas() {
      await act(async () => {
        await new Promise((resolver) => setTimeout(resolver, 0))
      })
    }

    async function mostrar() {
      await act(async () => {
        root.render(<MemoryRouter><AdminCategorias /></MemoryRouter>)
      })
      await esperarRespuestas()
    }

    it('muestra las categorías de la API con sus productos', async () => {
      simularApi()
      await mostrar()

      expect(contenedor.querySelectorAll('tbody tr').length).toBe(2)
      expect(contenedor.textContent).toContain('2 categorías con 1 productos en total.')
      expect(contenedor.textContent).toContain('Acústicas y eléctricas')
    })

    it('crea una categoría y la agrega a la tabla', async () => {
      const espia = simularApi((_url, opciones) => (
        opciones?.method === 'POST' ? respuestaJson(201, { id: 3, nombre: 'Baterías', descripcion: null }) : undefined
      ))
      await mostrar()

      await act(async () => {
        escribir(contenedor.querySelector<HTMLInputElement>('#categoria-nombre')!, 'Baterías')
      })
      await act(async () => {
        contenedor.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      })
      await esperarRespuestas()

      const post = espia.calls.all().find((llamada) => llamada.args[1]?.method === 'POST')
      expect(post).toBeDefined()
      expect(contenedor.querySelectorAll('tbody tr').length).toBe(3)
      expect(contenedor.textContent).toContain('Categoría Baterías creada correctamente.')
    })

    it('no deja eliminar una categoría con productos', async () => {
      const espia = simularApi()
      await mostrar()

      await act(async () => {
        contenedor.querySelector<HTMLButtonElement>('[aria-label="Eliminar Guitarras"]')!.click()
      })

      expect(espia.calls.all().some((llamada) => llamada.args[1]?.method === 'DELETE')).toBeFalse()
      expect(contenedor.textContent).toContain('No puedes eliminar Guitarras: tiene 1 productos asociados.')
    })

    it('si el usuario no es administrador muestra el error 403', async () => {
      spyOn(window, 'fetch').and.callFake(() => respuestaJson(403, null))
      await mostrar()

      expect(contenedor.textContent).toContain('No tienes permisos para realizar esta acción.')
      expect(contenedor.querySelector('table')).toBeNull()
    })
  })
})
