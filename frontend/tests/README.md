# Pruebas compartidas — Jasmine y Karma

Desde `frontend/`:

```powershell
npm ci
npm test
```

`npm test` comprueba los tipos con `tsconfig.tests.json`, compila los specs TS/TSX con esbuild en `.karma/tests.bundle.js` y ejecuta Jasmine con Karma en ChromeHeadless. Termina con código distinto de cero si falla alguna etapa. No necesita iniciar Vite.

En Windows, `karma.conf.cjs` busca Chrome en Program Files, Program Files (x86) y LocalAppData. Para una ubicación personalizada, definirla antes de ejecutar las pruebas:

```powershell
$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm test
```

## Las tres pruebas de Vicente

En `vicente/catalogo.spec.tsx`:

1. TarjetaProducto muestra nombre, precio CLP y enlace al detalle.
2. FiltrosProductos muestra las categorías recibidas y avisa al seleccionar una.
3. GrillaProductos presenta exactamente dos tarjetas con sus nombres.

Se renderizan los componentes reales mediante `createRoot`, con `MemoryRouter` cuando hay enlaces. Se utiliza `await act(...)` de React para renderizar, interactuar con el formulario y desmontar el árbol. Cada caso tiene su propio contenedor y lo elimina en `afterEach`. Los datos de prueba no modifican el catálogo ni LocalStorage.

## Incorporar las pruebas del equipo

- Sebastián: agregar sus tres casos en `tests/sebastian/*.spec.tsx`.
- Felipe: agregar sus cuatro casos en `tests/felipe/*.spec.tsx`.
- El compilador descubre automáticamente todos los archivos `.spec.ts` y `.spec.tsx` dentro de `tests/`, incluidas las subcarpetas. No es necesario modificar Karma ni una lista de imports.
- Usar `describe` e `it` de Jasmine, props tipadas y limpieza del DOM, tomando como referencia el archivo de Vicente. Cada archivo debe importar lo que utiliza y cada caso debe funcionar de forma independiente.
- `tests/setup.ts` habilita el entorno de `act` para todas las pruebas. No duplicar esa configuración. Evitar `fit` y `fdescribe`, porque excluirían los casos de los compañeros.
- Ejecutar `npm test`, `npm run build` y `npm run lint` antes de integrar los cambios. Actualmente existen tres casos; el total llegará a diez cuando se agreguen los siete pendientes.

Los bundles de `.karma/` y los directorios de resultados `coverage/` y `test-results/` están ignorados por Git. Esta configuración **no instrumenta ni mide cobertura**; ignorar esas carpetas no implica que se hayan generado reportes.

Referencias: [configuración de Karma](https://karma-runner.github.io/6.4/config/configuration-file.html), [API de esbuild](https://esbuild.github.io/api/#stdin) y [act de React](https://react.dev/reference/react/act).
