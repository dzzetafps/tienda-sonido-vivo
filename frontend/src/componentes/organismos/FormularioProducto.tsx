import { useState } from 'react'
import type { SubmitEvent } from 'react'
import CampoFormulario from '../moleculas/CampoFormulario'
import type { Producto } from '../../tipos/Producto'

// Un mensaje de error posible por cada campo del producto.
type ErroresProducto = Partial<Record<keyof Producto, string>>

interface FormularioProductoProps {
  modo: 'nuevo' | 'editar'
  categorias: string[]
  productoInicial?: Producto
  onGuardar: (producto: Producto) => void
  onCancelar: () => void
}

function FormularioProducto({ modo, categorias, productoInicial, onGuardar, onCancelar }: FormularioProductoProps) {
  // Un estado por campo: React controla lo que muestra cada input.
  const [codigo, setCodigo] = useState(productoInicial?.codigo ?? '')
  const [categoria, setCategoria] = useState(productoInicial?.categoria ?? '')
  const [nombre, setNombre] = useState(productoInicial?.nombre ?? '')
  const [marca, setMarca] = useState(productoInicial?.marca ?? '')
  const [modelo, setModelo] = useState(productoInicial?.modelo ?? '')
  const [precio, setPrecio] = useState(productoInicial ? String(productoInicial.precio) : '')
  const [stock, setStock] = useState(productoInicial ? String(productoInicial.stock) : '')
  const [descripcion, setDescripcion] = useState(productoInicial?.descripcion ?? '')
  const [imagen, setImagen] = useState(productoInicial?.imagen ?? '')
  const [errores, setErrores] = useState<ErroresProducto>({})

  // Si el producto editado tiene una categoría que no está en la lista, se conserva como opción.
  const categoriaInicial = productoInicial?.categoria ?? ''
  const opcionesCategoria = categoriaInicial !== '' && !categorias.includes(categoriaInicial)
    ? [...categorias, categoriaInicial]
    : categorias

  function validar(): ErroresProducto {
    const nuevosErrores: ErroresProducto = {}

    if (codigo.trim() === '') nuevosErrores.codigo = 'Ingresa el código'
    if (categoria === '') nuevosErrores.categoria = 'Selecciona una categoría'
    if (nombre.trim() === '') nuevosErrores.nombre = 'Ingresa el nombre'
    if (marca.trim() === '') nuevosErrores.marca = 'Ingresa la marca'
    if (modelo.trim() === '') nuevosErrores.modelo = 'Ingresa el modelo'

    if (precio.trim() === '') {
      nuevosErrores.precio = 'Ingresa el precio'
    } else if (!Number.isFinite(Number(precio)) || Number(precio) <= 0) {
      nuevosErrores.precio = 'El precio debe ser mayor que 0'
    }

    if (stock.trim() === '') {
      nuevosErrores.stock = 'Ingresa el stock'
    } else if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
      nuevosErrores.stock = 'El stock debe ser un número entero mayor o igual a 0'
    }

    if (descripcion.trim() === '') nuevosErrores.descripcion = 'Ingresa la descripción'
    if (imagen.trim() === '') nuevosErrores.imagen = 'Ingresa la ruta de la imagen'

    return nuevosErrores
  }

  function manejarEnvio(evento: SubmitEvent<HTMLFormElement>) {
    evento.preventDefault() // Evita que la página se recargue

    const nuevosErrores = validar()
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    // Los textos se limpian y los números se convierten antes de entregar el producto.
    onGuardar({
      codigo: codigo.trim(),
      categoria,
      nombre: nombre.trim(),
      marca: marca.trim(),
      modelo: modelo.trim(),
      stock: Number(stock),
      precio: Number(precio),
      descripcion: descripcion.trim(),
      imagen: imagen.trim(),
    })
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <CampoFormulario
            etiqueta="Código"
            id="producto-codigo"
            tipo="text"
            valor={codigo}
            alCambiar={setCodigo}
            error={errores.codigo}
            soloLectura={modo === 'editar'}
            ayuda={modo === 'editar' ? 'El código no se puede modificar.' : ''}
          />
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label" htmlFor="producto-categoria">Categoría</label>
          <select
            id="producto-categoria"
            className={errores.categoria ? 'form-select is-invalid' : 'form-select'}
            value={categoria}
            aria-invalid={Boolean(errores.categoria)}
            onChange={(evento) => setCategoria(evento.target.value)}
          >
            <option value="">Seleccione una categoría</option>
            {opcionesCategoria.map((opcion) => <option key={opcion} value={opcion}>{opcion}</option>)}
          </select>
          {errores.categoria && <div className="invalid-feedback">{errores.categoria}</div>}
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario etiqueta="Nombre" id="producto-nombre" tipo="text" valor={nombre} alCambiar={setNombre} error={errores.nombre} />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario etiqueta="Marca" id="producto-marca" tipo="text" valor={marca} alCambiar={setMarca} error={errores.marca} />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario etiqueta="Modelo" id="producto-modelo" tipo="text" valor={modelo} alCambiar={setModelo} error={errores.modelo} />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario etiqueta="Precio" id="producto-precio" tipo="number" valor={precio} alCambiar={setPrecio} error={errores.precio} ayuda="En pesos chilenos, sin puntos." />
        </div>

        <div className="col-12 col-md-6">
          <CampoFormulario etiqueta="Stock" id="producto-stock" tipo="number" valor={stock} alCambiar={setStock} error={errores.stock} />
        </div>

        <div className="col-12">
          <label className="form-label" htmlFor="producto-descripcion">Descripción</label>
          <textarea
            id="producto-descripcion"
            className={errores.descripcion ? 'form-control is-invalid' : 'form-control'}
            rows={3}
            value={descripcion}
            aria-invalid={Boolean(errores.descripcion)}
            onChange={(evento) => setDescripcion(evento.target.value)}
          />
          {errores.descripcion && <div className="invalid-feedback">{errores.descripcion}</div>}
        </div>

        <div className="col-12">
          <CampoFormulario
            etiqueta="Ruta de imagen"
            id="producto-imagen"
            tipo="text"
            valor={imagen}
            alCambiar={setImagen}
            error={errores.imagen}
            ayuda="Ejemplo: /img/productos/archivo.jpg"
          />
        </div>
      </div>

      <div className="d-flex flex-wrap gap-2 mt-4">
        <button type="submit" className="btn btn-primary">
          {modo === 'nuevo' ? 'Crear producto' : 'Guardar cambios'}
        </button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}

export default FormularioProducto
