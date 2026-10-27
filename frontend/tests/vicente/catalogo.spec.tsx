import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import TarjetaProducto from '../../src/componentes/moleculas/TarjetaProducto'
import FiltrosProductos from '../../src/componentes/moleculas/FiltrosProductos'
import GrillaProductos from '../../src/componentes/organismos/GrillaProductos'
import type { Producto } from '../../src/tipos/Producto'

const producto: Producto = {
  codigo: 'GA001',
  categoria: 'Guitarras Acústicas',
  nombre: 'Guitarra Acústica Folk',
  marca: 'Yamaha',
  modelo: 'F310',
  stock: 8,
  precio: 129990,
  descripcion: 'Guitarra de prueba para comprobar la presentación del catálogo.',
  imagen: '/img/productos/yamaha-f310-GA001.jpg',
}

describe('Vicente — componentes del catálogo', () => {
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

  it('TarjetaProducto muestra nombre, precio CLP y enlace al detalle', async () => {
    await act(async () => {
      root.render(<MemoryRouter><TarjetaProducto producto={producto} /></MemoryRouter>)
    })

    expect(contenedor.querySelector('h3')?.textContent).toBe('Guitarra Acústica Folk')
    const precioCLP = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(129990)
    const textos = Array.from(contenedor.querySelectorAll('p'), (elemento) => elemento.textContent)
    expect(textos).toContain(precioCLP)
    expect(contenedor.querySelector('a')?.getAttribute('href')).toBe('/producto/GA001')
  })

  it('FiltrosProductos muestra las categorías recibidas y avisa al seleccionar una', async () => {
    const categorias = ['Guitarras Acústicas', 'Teclados y Pianos']
    const cambiarCategoria = jasmine.createSpy('cambiarCategoria')
    const cambiarBusqueda = jasmine.createSpy('cambiarBusqueda')
    await act(async () => {
      root.render(
        <FiltrosProductos
          busqueda=""
          categoria=""
          categorias={categorias}
          onBusquedaChange={cambiarBusqueda}
          onCategoriaChange={cambiarCategoria}
        />,
      )
    })

    const selector = contenedor.querySelector('select')!
    expect(Array.from(selector.options, (opcion) => opcion.textContent))
      .toEqual(['Todas las categorías', ...categorias])
    expect(Array.from(selector.options, (opcion) => opcion.value)).toEqual(['', ...categorias])
    expect(cambiarCategoria).not.toHaveBeenCalled()

    await act(async () => {
      selector.value = 'Teclados y Pianos'
      selector.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(cambiarCategoria).toHaveBeenCalledOnceWith('Teclados y Pianos')
  })

  it('GrillaProductos presenta exactamente dos tarjetas con sus nombres', async () => {
    const segundoProducto: Producto = {
      ...producto,
      codigo: 'GA002',
      nombre: 'Guitarra Acústica Dreadnought',
      marca: 'Fender',
      modelo: 'CD-60S',
      precio: 189990,
      imagen: '/img/productos/fender-cd-60s-GA002.jpg',
    }
    await act(async () => {
      root.render(
        <MemoryRouter>
          <GrillaProductos productos={[producto, segundoProducto]} />
        </MemoryRouter>,
      )
    })

    const tarjetas = contenedor.querySelectorAll('article')
    expect(tarjetas.length).toBe(2)
    expect(Array.from(tarjetas, (tarjeta) => tarjeta.querySelector('h3')?.textContent))
      .toEqual(['Guitarra Acústica Folk', 'Guitarra Acústica Dreadnought'])
  })
})
