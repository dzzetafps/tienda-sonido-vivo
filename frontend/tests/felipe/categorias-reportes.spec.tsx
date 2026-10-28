import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import AdminReportes from '../../src/paginas/AdminReportes'
import { calcularValorInventario, productosConStockBajo, resumirCategorias } from '../../src/datos/catalogoAdmin'
import type { Producto } from '../../src/tipos/Producto'

const base: Producto = {
  codigo: 'AC001',
  categoria: 'Accesorios',
  nombre: 'Cable de prueba',
  marca: 'Marca Test',
  modelo: 'MT-1',
  stock: 4,
  precio: 1000,
  descripcion: 'Producto de prueba.',
  imagen: '/img/productos/prueba.jpg',
}

const productos: Producto[] = [
  base,
  { ...base, codigo: 'AC002', nombre: 'Atril de prueba', stock: 1, precio: 5000 },
  { ...base, codigo: 'MI001', categoria: 'Micrófonos', nombre: 'Micrófono de prueba', stock: 10, precio: 20000 },
]

describe('Felipe — categorías y reportes de productos', () => {
  it('resumirCategorias agrupa los productos y suma stock y valor por categoría', () => {
    const categorias = resumirCategorias(productos)

    expect(categorias).toEqual([
      { categoria: 'Accesorios', productos: 2, stock: 5, valor: 9000 },
      { categoria: 'Micrófonos', productos: 1, stock: 10, valor: 200000 },
    ])
  })

  it('productosConStockBajo devuelve solo los productos bajo el límite, de menor a mayor stock', () => {
    const resultado = productosConStockBajo(productos, 4)

    expect(resultado.map((producto) => producto.codigo)).toEqual(['AC002', 'AC001'])
  })

  it('calcularValorInventario suma precio por stock de todos los productos', () => {
    expect(calcularValorInventario(productos)).toBe(209000)
    expect(calcularValorInventario([])).toBe(0)
  })

  describe('AdminReportes', () => {
    let contenedor: HTMLDivElement
    let root: Root

    beforeEach(() => {
      spyOn(Storage.prototype, 'getItem').and.returnValue(null)
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

    function filasStockBajo() {
      const tabla = Array.from(contenedor.querySelectorAll('table'))
        .find((actual) => actual.caption?.textContent === 'Productos con stock bajo')
      return tabla ? tabla.querySelectorAll('tbody tr').length : 0
    }

    it('al cambiar el límite se actualiza la tabla de stock bajo', async () => {
      await act(async () => {
        root.render(<MemoryRouter><AdminReportes /></MemoryRouter>)
      })
      expect(filasStockBajo()).toBe(16)

      await act(async () => {
        const selector = contenedor.querySelector<HTMLSelectElement>('#limite-stock')!
        selector.value = '2'
        selector.dispatchEvent(new Event('change', { bubbles: true }))
      })

      expect(filasStockBajo()).toBe(11)
      expect(contenedor.textContent).toContain('11 productos con stock igual o menor a 2 unidades')
    })
  })
})
