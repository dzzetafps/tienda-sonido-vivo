import {
  actualizarProducto,
  buscarProductoPorCodigo,
  crearProducto,
  eliminarProducto,
  obtenerProductos,
} from '../../src/datos/productosService.js'
import type { Producto } from '../../src/tipos/Producto'

const productoDePrueba: Producto = {
  codigo: 'TEST01',
  categoria: 'Accesorios',
  nombre: 'Cable de prueba',
  marca: 'Marca Test',
  modelo: 'MT-1',
  stock: 5,
  precio: 9990,
  descripcion: 'Producto creado solo para las pruebas.',
  imagen: '/img/productos/prueba.jpg',
}

describe('Felipe — CRUD del servicio de productos', () => {
  let almacen: Record<string, string>

  beforeEach(() => {
    almacen = {}
    spyOn(Storage.prototype, 'getItem').and.callFake((clave: string) => almacen[clave] ?? null)
    spyOn(Storage.prototype, 'setItem').and.callFake((clave: string, valor: string) => {
      almacen[clave] = valor
    })
  })

  it('Leer: obtenerProductos devuelve los 51 productos del catálogo inicial', () => {
    const productos = obtenerProductos()

    expect(productos.length).toBe(51)
    expect(productos[0].codigo).toBe('GA001')
  })

  it('Crear: crearProducto agrega el producto y queda guardado', () => {
    crearProducto(productoDePrueba)

    expect(obtenerProductos().length).toBe(52)
    expect(buscarProductoPorCodigo('TEST01')?.nombre).toBe('Cable de prueba')
    expect(Storage.prototype.setItem).toHaveBeenCalledTimes(1)
  })

  it('Actualizar: actualizarProducto cambia el precio sin agregar productos', () => {
    const original = buscarProductoPorCodigo('GA001')!

    actualizarProducto('GA001', { ...original, precio: 99990 })

    expect(buscarProductoPorCodigo('GA001')?.precio).toBe(99990)
    expect(obtenerProductos().length).toBe(51)
  })

  it('Eliminar: eliminarProducto quita el producto del catálogo', () => {
    eliminarProducto('GA001')

    expect(buscarProductoPorCodigo('GA001')).toBeUndefined()
    expect(obtenerProductos().length).toBe(50)
  })
})
