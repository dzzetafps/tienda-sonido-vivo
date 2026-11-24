import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DetalleProducto from '../../src/paginas/DetalleProducto'
import { AuthContext } from '../../src/context/authContextBase'
import type { AuthContextType } from '../../src/context/authContextBase'
import type { RolUsuario } from '../../src/tipos/Usuario'

describe('Sebastián — integración detalle y carrito REST', () => {
  let contenedor: HTMLDivElement
  let root: Root
  let peticiones: jasmine.Spy
  let stock: number
  let agregar: () => Promise<Response>

  beforeEach(() => {
    stock = 5
    agregar = async () => new Response('{}', { status: 200 })
    peticiones = spyOn(window, 'fetch').and.callFake(async (url, opciones) => {
      if (opciones?.method === 'POST') return agregar()
      expect(String(url)).toContain('/productos/QA001')
      return new Response(JSON.stringify({ codigo: 'QA001', nombre: 'Producto QA', categoria: 'Prueba',
        marca: 'QA', modelo: 'QA', descripcion: 'Prueba', imagen: '', precio: 1000, stock }), { status: 200 })
    })
    contenedor = document.createElement('div')
    document.body.appendChild(contenedor)
    root = createRoot(contenedor)
  })
  afterEach(async () => { await act(async () => root.unmount()); contenedor.remove() })
  async function esperar(condicion: () => boolean) {
    const limite = Date.now() + 2000
    while (Date.now() < limite) {
      await act(async () => { await new Promise<void>((resolver) => setTimeout(resolver, 10)) })
      if (condicion()) return
    }
    throw new Error('No terminó el detalle: ' + contenedor.textContent)
  }
  async function montar(rol: RolUsuario | null = 'cliente') {
    const sesion = rol ? { usuarioId: 'qa', rol } : null
    const contexto: AuthContextType = { sesion, usuario: null, cargando: false, autenticado: Boolean(sesion),
      login: async () => ({ usuarioId: 'qa', rol: 'cliente' }), logout: async () => {} }
    await act(async () => root.render(<AuthContext.Provider value={contexto}>
      <MemoryRouter initialEntries={['/producto/QA001']}><Routes>
        <Route path="/producto/:codigo" element={<DetalleProducto />} />
      </Routes></MemoryRouter></AuthContext.Provider>))
    await esperar(() => Boolean(contenedor.querySelector('button')))
  }
  for (const rol of [null, 'administrador', 'vendedor'] as const) {
    it(`impide comprar con rol ${rol ?? 'sin sesión'}`, async () => {
      await montar(rol)
      const boton = contenedor.querySelector('button')!
      expect(boton.disabled).toBeTrue()
      await act(async () => boton.click())
      expect(peticiones.calls.allArgs().some(([, opciones]) => opciones?.method === 'POST')).toBeFalse()
    })
  }
  it('agrega por REST una sola vez ante clics simultáneos', async () => {
    let resolver!: (valor: Response) => void
    agregar = () => new Promise<Response>((resolve) => { resolver = resolve })
    await montar()
    const boton = contenedor.querySelector('button')!
    await act(async () => { boton.click(); boton.click() })
    const posts = peticiones.calls.allArgs().filter(([, opciones]) => opciones?.method === 'POST')
    expect(posts.length).toBe(1)
    expect(posts[0][0]).toBe('http://localhost:8080/api/carrito/items')
    expect(JSON.parse(String(posts[0][1]?.body))).toEqual({ codigo: 'QA001', cantidad: 1 })
    expect(boton.disabled).toBeTrue()
    await act(async () => resolver(new Response('{}', { status: 200 })))
    await esperar(() => contenedor.textContent!.includes('Producto agregado al carrito.'))
  })
  it('muestra el conflicto de stock y permite intentar después', async () => {
    agregar = async () => new Response(JSON.stringify({ mensaje: 'Stock insuficiente' }), { status: 409 })
    await montar()
    await act(async () => contenedor.querySelector('button')!.click())
    await esperar(() => Boolean(contenedor.querySelector('[role="alert"]')))
    expect(contenedor.textContent).toContain('Stock insuficiente')
    expect(contenedor.querySelector('button')!.disabled).toBeFalse()
  })
  it('deshabilita compra de producto agotado', async () => {
    stock = 0
    await montar()
    expect(contenedor.querySelector('button')!.disabled).toBeTrue()
    expect(contenedor.textContent).toContain('Sin stock')
  })
})
