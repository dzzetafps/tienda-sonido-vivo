import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import FormularioProducto from '../../src/componentes/organismos/FormularioProducto'
import AdminProductos from '../../src/paginas/AdminProductos'

function escribir(campo: HTMLInputElement | HTMLTextAreaElement, valor: string) {
  const prototipo = campo instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
  Object.getOwnPropertyDescriptor(prototipo, 'value')!.set!.call(campo, valor)
  campo.dispatchEvent(new Event('input', { bubbles: true }))
}

describe('Felipe — formulario y administración de productos', () => {
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

  it('Validación: los errores aparecen solo al enviar vacío y no se llama a onGuardar', async () => {
    const guardar = jasmine.createSpy('guardar')
    await act(async () => {
      root.render(<FormularioProducto modo="nuevo" categorias={['Accesorios']} onGuardar={guardar} onCancelar={() => {}} />)
    })
    expect(contenedor.querySelectorAll('.invalid-feedback').length).toBe(0)

    await act(async () => {
      contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    })

    const mensajes = Array.from(contenedor.querySelectorAll('.invalid-feedback'), (mensaje) => mensaje.textContent)
    expect(mensajes.length).toBe(9)
    expect(mensajes).toContain('Ingresa el código')
    expect(mensajes).toContain('Selecciona una categoría')
    expect(mensajes).toContain('Ingresa el precio')
    expect(guardar).not.toHaveBeenCalled()
  })

  it('Crear desde el formulario: con datos válidos entrega el producto con precio y stock numéricos', async () => {
    const guardar = jasmine.createSpy('guardar')
    await act(async () => {
      root.render(<FormularioProducto modo="nuevo" categorias={['Accesorios', 'Micrófonos']} onGuardar={guardar} onCancelar={() => {}} />)
    })
    const campo = (id: string) => contenedor.querySelector<HTMLInputElement>(`#${id}`)!

    await act(async () => {
      escribir(campo('producto-codigo'), 'TEST01')
      const categoria = contenedor.querySelector<HTMLSelectElement>('#producto-categoria')!
      categoria.value = 'Accesorios'
      categoria.dispatchEvent(new Event('change', { bubbles: true }))
      escribir(campo('producto-nombre'), 'Cable de prueba')
      escribir(campo('producto-marca'), 'Marca Test')
      escribir(campo('producto-modelo'), 'MT-1')
      escribir(campo('producto-precio'), '9990')
      escribir(campo('producto-stock'), '5')
      escribir(contenedor.querySelector<HTMLTextAreaElement>('#producto-descripcion')!, 'Producto de prueba.')
      escribir(campo('producto-imagen'), '/img/productos/prueba.jpg')
    })
    await act(async () => {
      contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    })

    expect(contenedor.querySelectorAll('.invalid-feedback').length).toBe(0)
    expect(guardar).toHaveBeenCalledOnceWith({
      codigo: 'TEST01',
      categoria: 'Accesorios',
      nombre: 'Cable de prueba',
      marca: 'Marca Test',
      modelo: 'MT-1',
      stock: 5,
      precio: 9990,
      descripcion: 'Producto de prueba.',
      imagen: '/img/productos/prueba.jpg',
    })
  })

  it('Eliminar desde la página: al confirmar, la fila desaparece y se muestra el mensaje', async () => {
    const producto = { codigo: 'GA001', categoria: 'Guitarras', nombre: 'Guitarra de prueba',
      marca: 'Prueba', modelo: 'QA', stock: 5, precio: 129990, descripcion: '', imagen: '' }
    const peticiones = spyOn(window, 'fetch').and.callFake(async (_url, opciones) => {
      if (opciones?.method === 'DELETE') return new Response(null, { status: 204 })
      return new Response(JSON.stringify([producto]), { status: 200 })
    })
    async function esperar(condicion: () => boolean) {
      const limite = Date.now() + 2000
      while (Date.now() < limite) {
        await act(async () => { await new Promise<void>((resolver) => setTimeout(resolver, 10)) })
        if (condicion()) return
      }
      throw new Error('No terminó la operación REST de productos: ' + contenedor.textContent)
    }
    const confirmar = spyOn(window, 'confirm').and.returnValue(true)
    await act(async () => {
      root.render(<MemoryRouter><AdminProductos /></MemoryRouter>)
    })
    await esperar(() => Boolean(contenedor.querySelector('button[aria-label="Eliminar producto GA001"]')))
    expect(contenedor.querySelectorAll('tbody tr').length).toBe(1)

    await act(async () => {
      contenedor.querySelector<HTMLButtonElement>('button[aria-label="Eliminar producto GA001"]')!.click()
    })

    await esperar(() => contenedor.textContent!.includes('Producto GA001 eliminado correctamente.'))
    expect(confirmar).toHaveBeenCalledTimes(1)
    expect(peticiones.calls.mostRecent().args[0]).toBe('http://localhost:8080/api/productos/GA001')
    expect(peticiones.calls.mostRecent().args[1]?.method).toBe('DELETE')
    expect(contenedor.querySelector('button[aria-label="Eliminar producto GA001"]')).toBeNull()
    expect(contenedor.textContent).toContain('Mostrando 0 de 0 productos')
    expect(contenedor.textContent).toContain('Producto GA001 eliminado correctamente.')
  })
})
