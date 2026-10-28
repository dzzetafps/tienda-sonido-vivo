/// <reference types="jasmine" />
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import ItemCarritoCard from '../../src/componentes/moleculas/ItemCarritoCard'
import ResumenCompra from '../../src/componentes/organismos/ResumenCompra'
import type { Producto } from '../../src/tipos/Producto'
import type { ItemCarrito } from '../../src/tipos/ItemCarrito'

const producto: Producto = {
  codigo: 'TEST001',
  categoria: 'Guitarras Acústicas',
  nombre: 'Guitarra de prueba',
  marca: 'Marca de prueba',
  modelo: 'Modelo de prueba',
  stock: 5,
  precio: 129990,
  descripcion: 'Producto de prueba para comprobar el carrito.',
  imagen: '/img/productos/yamaha-f310-GA001.jpg',
}

describe('Sebastián — componentes del carrito', () => {
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

  it('ResumenCompra muestra unidades, subtotal y total en pesos chilenos', async () => {
    await act(async () => {
      root.render(<MemoryRouter><ResumenCompra cantidadUnidades={3} total={389970} error="" /></MemoryRouter>)
    })

    const totalCLP = new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(389970)
    const filas = Array.from(contenedor.querySelectorAll('dl > div'), (fila) => [
      fila.querySelector('dt')?.textContent,
      fila.querySelector('dd')?.textContent,
    ])

    expect(filas).toEqual([
      ['Unidades', '3'],
      ['Subtotal', totalCLP],
      ['Total', totalCLP],
    ])
  })

  it('ItemCarritoCard avisa el código y la nueva cantidad al presionar +', async () => {
    const item: ItemCarrito = { codigo: producto.codigo, cantidad: 2 }
    const modificarCantidad = jasmine.createSpy('modificarCantidad')
    const eliminar = jasmine.createSpy('eliminar')
    await act(async () => {
      root.render(
        <ItemCarritoCard
          item={item}
          producto={producto}
          subtotal={259980}
          error=""
          onModificarCantidad={modificarCantidad}
          onEliminar={eliminar}
        />,
      )
    })

    const boton = contenedor.querySelector<HTMLButtonElement>('button[aria-label^="Aumentar cantidad"]')!
    expect(boton.disabled).toBeFalse()
    expect(modificarCantidad).not.toHaveBeenCalled()

    await act(async () => {
      boton.click()
    })

    expect(modificarCantidad).toHaveBeenCalledOnceWith('TEST001', 3)
  })

  it('ItemCarritoCard deshabilita el aumento cuando la cantidad alcanza el stock', async () => {
    const item: ItemCarrito = { codigo: producto.codigo, cantidad: producto.stock }
    const modificarCantidad = jasmine.createSpy('modificarCantidad')
    const eliminar = jasmine.createSpy('eliminar')
    await act(async () => {
      root.render(
        <ItemCarritoCard
          item={item}
          producto={producto}
          subtotal={649950}
          error=""
          onModificarCantidad={modificarCantidad}
          onEliminar={eliminar}
        />,
      )
    })

    const boton = contenedor.querySelector<HTMLButtonElement>('button[aria-label^="Aumentar cantidad"]')!
    expect(boton.disabled).toBeTrue()
  })
})
