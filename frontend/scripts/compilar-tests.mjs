import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const frontend = fileURLToPath(new URL('../', import.meta.url))
const carpetaTests = fileURLToPath(new URL('../tests/', import.meta.url))
const archivos = readdirSync(carpetaTests, { recursive: true })
  .filter((archivo) => /\.spec\.tsx?$/.test(archivo))
  .map((archivo) => './tests/' + archivo.replaceAll('\\', '/'))
  .sort()

if (archivos.length === 0) throw new Error('No se encontraron archivos .spec.ts o .spec.tsx en tests/.')

// Una entrada compartida: agregar nuevos specs no requiere editar este script.
const imports = ['./tests/setup.ts', ...archivos]
  .map((archivo) => `import ${JSON.stringify(archivo)}`)
  .join('\n')

await build({
  absWorkingDir: frontend,
  stdin: { contents: imports, resolveDir: frontend, sourcefile: 'tests-entry.ts', loader: 'ts' },
  outfile: '.karma/tests.bundle.js',
  bundle: true,
  platform: 'browser',
  format: 'iife',
  jsx: 'automatic',
  target: 'es2023',
  sourcemap: 'inline',
  define: { 'process.env.NODE_ENV': '"development"' },
  logLevel: 'info',
})
