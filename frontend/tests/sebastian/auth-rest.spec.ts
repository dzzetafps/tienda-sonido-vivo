import { apiFetch, configurarRenovacion, establecerToken, obtenerToken } from '../../src/datos/api'
import { iniciarSesion, renovarSesion, cerrarSesion } from '../../src/datos/authService'

const sesion = { accessToken: 'jwt-unitario', tokenType: 'Bearer', expiresIn: 900, usuarioId: 'u1', rol: 'cliente' }
describe('Sebastián — sesión REST y renovación', () => {
  let limpiar: (() => void) | undefined
  afterEach(() => { limpiar?.(); limpiar = undefined; establecerToken(null) })
  it('login mantiene JWT en memoria, usa cookie y cabecera CSRF sin LocalStorage', async () => {
    const storage = spyOn(Storage.prototype, 'setItem')
    const fetch = spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify(sesion), { status: 200 }))
    await iniciarSesion({ correo: 'qa@example.test', contrasena: 'Prueba1' })
    expect(obtenerToken()).toBe('jwt-unitario')
    const [, opciones] = fetch.calls.mostRecent().args
    expect(new Headers(opciones?.headers).get('X-CSRF-Protection')).toBe('1')
    expect(opciones?.credentials).toBe('include')
    expect(storage).not.toHaveBeenCalled()
  })
  it('comparte una rotación de refresh entre llamadas concurrentes', async () => {
    const fetch = spyOn(window, 'fetch').and.callFake(async () => new Response(JSON.stringify(sesion), { status: 200 }))
    await Promise.all([renovarSesion(), renovarSesion()])
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(obtenerToken()).toBe(sesion.accessToken)
  })
  it('reintenta una vez tras 401 y comparte renovación de solicitudes concurrentes', async () => {
    establecerToken('anterior')
    const renovar = jasmine.createSpy('renovar').and.callFake(async () => { establecerToken('renovado') })
    limpiar = configurarRenovacion(renovar, () => {})
    spyOn(window, 'fetch').and.callFake(async (_url, opciones) =>
      new Headers(opciones?.headers).get('Authorization') === 'Bearer anterior'
        ? new Response('{}', { status: 401 }) : new Response('[]', { status: 200 }))
    await Promise.all([apiFetch('/carrito'), apiFetch('/pedidos/mis-pedidos')])
    expect(renovar).toHaveBeenCalledTimes(1)
  })
  it('un segundo 401 limpia sesión y no entra en bucle', async () => {
    establecerToken('anterior')
    const perdida = jasmine.createSpy('sesionPerdida')
    limpiar = configurarRenovacion(async () => { establecerToken('renovado') }, perdida)
    const fetch = spyOn(window, 'fetch').and.callFake(async () => new Response('{}', { status: 401 }))
    await expectAsync(apiFetch('/carrito')).toBeRejected()
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(perdida).toHaveBeenCalledTimes(1)
    expect(obtenerToken()).toBeNull()
  })
  it('logout elimina el JWT y solicita revocación con CSRF', async () => {
    establecerToken('anterior')
    const fetch = spyOn(window, 'fetch').and.resolveTo(new Response(null, { status: 204 }))
    await cerrarSesion()
    expect(obtenerToken()).toBeNull()
    const [url, opciones] = fetch.calls.mostRecent().args
    expect(String(url)).toContain('/auth/logout')
    expect(new Headers(opciones?.headers).get('X-CSRF-Protection')).toBe('1')
  })
})
