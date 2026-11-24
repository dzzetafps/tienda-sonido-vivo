// React necesita esta bandera para comprobar las actualizaciones dentro de act.
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

// Ninguna prueba unitaria puede alcanzar el inventario ni las sesiones reales.
// Cada caso REST debe instalar su propio spy sobre este reemplazo.
const fetchOriginal = window.fetch
beforeEach(() => {
  window.fetch = async () => {
    fail('Solicitud HTTP sin mock en una prueba unitaria')
    throw new Error('Red deshabilitada durante pruebas unitarias')
  }
})
afterEach(() => { window.fetch = fetchOriginal })
