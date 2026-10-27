# Sonido Vivo — base compartida EP2

Proyecto React + Vite + TypeScript con Bootstrap y React Router. Trabajar desde `frontend/`:

```sh
npm ci
npm run dev
npm run build
npm run lint
```

`npm run build` comprueba TypeScript y genera `dist/`. No subir `node_modules/` ni `dist/`.

## Estructura y navegación

- `src/componentes/atomos/`: elementos pequeños reutilizables; reservado con `.gitkeep`.
- `src/componentes/moleculas/`: combinaciones de átomos; reservado con `.gitkeep`.
- `src/componentes/organismos/Navbar.tsx`: navegación Bootstrap responsiva con `Link` y estado React para abrir/cerrar el menú móvil.
- `src/paginas/Inicio.tsx`, `Productos.tsx`, `Contacto.tsx`: páginas iniciales.
- `src/datos/productos.js`: 51 productos originales, exportación nombrada `productos`.
- `src/datos/productosService.js`: consultas y CRUD compartidos en JavaScript con persistencia y tipos mediante JSDoc.
- `src/tipos/Producto.ts`: contrato común de productos.
- `src/App.tsx`: rutas `/`, `/productos` y `/contacto`.
- `src/main.tsx`: único `BrowserRouter`, Bootstrap y estilos generales.

Las páginas son una base inicial: Productos muestra el número de registros mediante el servicio. El catálogo visual, los formularios, el carrito y el panel administrativo se desarrollarán en sus módulos correspondientes. Se conservan los colores de la Evaluación 1.

## Modelo Producto

```ts
import type { Producto } from '../tipos/Producto'
```

| Campo | Tipo |
| --- | --- |
| codigo, categoria, nombre, marca, modelo | string |
| descripcion, imagen | string |
| stock, precio | number |

Todos los campos son obligatorios. El stock debe ser entero y no negativo; el precio debe ser finito y no negativo. Los textos no pueden estar vacíos. El código es único, distingue mayúsculas/minúsculas y no admite espacios en sus extremos. No se cambia durante una actualización.

`productos.js` conserva todos los valores del catálogo de `../assets/js/data/productos.js`, incluida la inconsistencia ya documentada de AM004. Solo se adaptó `imagen` a `/img/productos/...`. Las 51 imágenes se copiaron a `public/img/productos/`. Los archivos de la Evaluación 1 permanecen intactos.

`allowJs` permite importar el catálogo y el servicio JavaScript desde TypeScript. `checkJs`, junto con las anotaciones JSDoc, comprueba los datos y las funciones del servicio usando la interfaz `Producto`, que permanece en `src/tipos/Producto.ts` para los componentes React. El servicio importa ese tipo solo en un comentario JSDoc; se ejecuta como JavaScript sin depender de TypeScript en tiempo de ejecución.

## Servicio compartido

Importar las funciones desde `../datos/productosService.js` (ajustar la ruta relativa según el componente). Usar siempre este servicio para consultar los cambios persistidos, en lugar de importar directamente el catálogo inicial.

| Función | Resultado |
| --- | --- |
| `obtenerProductos()` | `Producto[]`; devuelve copias del catálogo inicial cuando aún no hay datos guardados. |
| `buscarProductoPorCodigo(codigo)` | `Producto` o `undefined` si no existe. |
| `crearProducto(producto)` | Guarda y devuelve el producto; rechaza códigos duplicados. |
| `actualizarProducto(codigo, producto)` | Recibe el objeto completo, lo guarda y lo devuelve; rechaza códigos inexistentes o cambios de código. |
| `eliminarProducto(codigo)` | Elimina el producto; devuelve `void` y rechaza códigos inexistentes. |

Ejemplo para un futuro formulario de edición:

```ts
import type { Producto } from '../tipos/Producto'
import { buscarProductoPorCodigo, actualizarProducto } from '../datos/productosService.js'

try {
  const actual = buscarProductoPorCodigo('GA001')
  if (actual) {
    const editado: Producto = { ...actual, stock: actual.stock + 1 }
    actualizarProducto(actual.codigo, editado)
  }
} catch (error) {
  // En el formulario, mostrar este mensaje mediante estado React.
  console.error(error instanceof Error ? error.message : 'No se pudo guardar.')
}
```

Las operaciones son síncronas y arrojan `Error` ante datos inválidos o problemas de almacenamiento. Capturar esos errores en las futuras interfaces. Después de una escritura, actualizar el estado del componente, por ejemplo `setProductos(obtenerProductos())`; LocalStorage no actualiza por sí solo una vista React.

La clave es `sonido-vivo-ep2-productos`, independiente de la Evaluación 1. Se guarda la lista completa en cada creación, actualización o eliminación. Una lista vacía guardada sigue vacía al recargar. Los cambios persisten por navegador y origen (incluido el puerto); no se comparten entre equipos ni constituyen un backend. Las escrituras concurrentes entre pestañas no se sincronizan.

Si el JSON almacenado está dañado o contiene productos inválidos, el servicio informa el problema y conserva el contenido para poder revisarlo. Para restablecer voluntariamente el catálogo inicial durante desarrollo, respaldar primero cualquier cambio que se necesite y ejecutar en la consola del navegador:

```js
localStorage.removeItem('sonido-vivo-ep2-productos')
location.reload()
```

Las rutas de imágenes están preparadas para servir la aplicación en la raíz del dominio. En un alojamiento real, configurar la redirección de rutas como `/productos` hacia `index.html` para BrowserRouter.

## Integración del equipo

Después de revisar y fusionar el PR en `evaluacion-2-react`, Sebastián y Felipe deben actualizar esa rama y crear sus ramas de trabajo desde ella. Para revisar esta base antes del merge, pueden obtener `feature/vicente-navegacion` del remoto.

- Vicente: Inicio, catálogo, detalle, categorías, ofertas y navegación.
- Sebastián: carrito, checkout, resultados de compra, login y registro.
- Felipe: administración, CRUD visual, categorías, usuarios, órdenes y reportes.

Crear las páginas y componentes de cada módulo en archivos propios y reutilizar `Producto` y `productosService`. Acordar con el equipo cualquier cambio al contrato compartido. Concentrar la integración de rutas en cambios pequeños de `App.tsx` para reducir conflictos.

Para integrar una página futura, crear primero su archivo, importarlo en `App.tsx` y agregar un `Route` dentro del `Routes` existente. Por ejemplo, una vez creado el módulo de Sebastián:

```tsx
import Carrito from './paginas/Carrito'

// Dentro de <Routes>:
<Route path="/carrito" element={<Carrito />} />
```

Agregar el enlace correspondiente en `Navbar.tsx` cuando el módulo esté listo. No agregar otro `BrowserRouter`.

## Alcance académico pendiente

Esta entrega prepara navegación, estado del menú, datos y persistencia. Los componentes con props se incorporarán cuando haya componentes reutilizables que los necesiten. Las pruebas unitarias deben implementarse posteriormente con Jasmine y Karma; no se agregó Vitest ni otra dependencia. También quedan pendientes ERS V2 y el documento de cobertura.

La fuente de datos simulada (`productos.js`) y las operaciones CRUD (`productosService.js`) son módulos JavaScript, conforme a la pauta. El servicio conserva la comprobación de tipos mediante JSDoc y la interfaz compartida `Producto.ts`.
