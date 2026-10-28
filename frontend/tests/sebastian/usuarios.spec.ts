import {
  cambiarEstadoUsuario,
  cerrarSesion,
  iniciarSesion,
  obtenerSesion,
  obtenerUsuarios,
  registrarCliente,
} from '../../src/datos/usuariosService.js'
import type { Sesion, Usuario } from '../../src/tipos/Usuario'

const CLAVE_USUARIOS = 'sonido-vivo-ep2-usuarios'
const CLAVE_CREDENCIALES = 'sonido-vivo-ep2-credenciales'
const CLAVE_SESION = 'sonido-vivo-ep2-sesion'

// Identidad ficticia con RUT válido según módulo 11.
const datosCliente = {
  rut: '900000049',
  nombre: 'Cliente de prueba',
  apellidos: 'Demostración',
  correo: 'nuevo@sonidovivo.example',
  fechaNacimiento: '',
  region: 'Región de Valparaíso',
  comuna: 'Valparaíso',
  direccion: 'Dirección ficticia 400',
}
const contrasena = 'DemoTest1!'
const correoDemo = 'cliente1@sonidovivo.example'
const contrasenaDemo = 'DemoCli1!'
const sesionDemo: Sesion = { usuarioId: 'demo-cliente-1', rol: 'cliente' }

interface CredencialGuardada {
  usuarioId: string
  salt: string
  verificador: string
  iteraciones: number
}

describe('Sebastián — autenticación del servicio de usuarios', () => {
  let almacen: Record<string, string>

  beforeEach(() => {
    almacen = {}
    spyOn(Storage.prototype, 'getItem').and.callFake((clave: string) => almacen[clave] ?? null)
    spyOn(Storage.prototype, 'setItem').and.callFake((clave: string, valor: string) => {
      almacen[clave] = valor
    })
    spyOn(Storage.prototype, 'removeItem').and.callFake((clave: string) => {
      delete almacen[clave]
    })
  })

  it('Registra un cliente activo y guarda su credencial PBKDF2 sin contraseña en texto plano', async () => {
    const anteriores = obtenerUsuarios()
    const usuario = await registrarCliente(datosCliente, contrasena)

    expect(anteriores.some((actual) => actual.id === usuario.id)).toBeFalse()
    expect(usuario.rol).toBe('cliente')
    expect(usuario.activo).toBeTrue()
    expect(usuario.rut).toBe(datosCliente.rut)
    expect(usuario.correo).toBe(datosCliente.correo)
    expect(obtenerUsuarios().length).toBe(anteriores.length + 1)
    expect(obtenerUsuarios()).toContain(usuario)

    const guardados: Usuario[] = JSON.parse(almacen[CLAVE_USUARIOS])
    expect(guardados).toEqual([...anteriores, usuario])
    const credenciales: CredencialGuardada[] = JSON.parse(almacen[CLAVE_CREDENCIALES])
    const vinculadas = credenciales.filter((actual) => actual.usuarioId === usuario.id)
    expect(vinculadas.length).toBe(1)
    const credencial = vinculadas[0]
    expect(Object.keys(credencial).sort()).toEqual(['iteraciones', 'salt', 'usuarioId', 'verificador'])
    expect(credencial.salt).toMatch(/^[0-9a-f]{32}$/)
    expect(credencial.verificador).toMatch(/^[0-9a-f]{64}$/)
    expect(credencial.iteraciones).toBe(600000)
    expect(JSON.stringify(almacen)).not.toContain(contrasena)
    expect(JSON.stringify(usuario)).not.toContain(contrasena)

    const salt = new Uint8Array(credencial.salt.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)))
    const clave = await crypto.subtle.importKey('raw', new TextEncoder().encode(contrasena), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 600000 }, clave, 256)
    const verificador = Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('')
    expect(credencial.verificador).toBe(verificador)
  })

  it('Rechaza RUT y correo duplicados normalizados sin alterar usuarios ni credenciales', async () => {
    await registrarCliente(datosCliente, contrasena)
    const usuariosAnteriores = obtenerUsuarios()
    const almacenAnterior = { ...almacen }

    await expectAsync(registrarCliente({
      ...datosCliente, rut: '90.000.004-9', correo: 'otro@sonidovivo.example',
    }, contrasena)).toBeRejectedWithError('Ya existe un usuario con ese rut.')
    expect(obtenerUsuarios()).toEqual(usuariosAnteriores)
    expect(almacen).toEqual(almacenAnterior)

    await expectAsync(registrarCliente({
      ...datosCliente, rut: '900000057', correo: 'NUEVO@SONIDOVIVO.EXAMPLE',
    }, contrasena)).toBeRejectedWithError('Ya existe un usuario con ese correo.')
    expect(obtenerUsuarios()).toEqual(usuariosAnteriores)
    expect(almacen).toEqual(almacenAnterior)
  })

  it('Inicia sesión con la cuenta ficticia y guarda su ID y rol', async () => {
    const sesion = await iniciarSesion(correoDemo, contrasenaDemo)

    expect(sesion).toEqual(sesionDemo)
    expect(JSON.parse(almacen[CLAVE_SESION])).toEqual(sesionDemo)
    expect(obtenerSesion()).toEqual(sesionDemo)
  })

  it('Rechaza una contraseña incorrecta sin crear sesión ni modificar usuarios o credenciales', async () => {
    await registrarCliente(datosCliente, contrasena)
    const usuariosAnteriores = obtenerUsuarios()
    const almacenAnterior = { ...almacen }

    await expectAsync(iniciarSesion(correoDemo, 'Incorrecta')).toBeRejectedWithError(/No se pudo iniciar sesión/)

    expect(localStorage.getItem(CLAVE_SESION)).toBeNull()
    expect(obtenerSesion()).toBeNull()
    expect(obtenerUsuarios()).toEqual(usuariosAnteriores)
    expect(almacen).toEqual(almacenAnterior)
  })

  it('Cierra la sesión y conserva la cuenta del usuario', async () => {
    const usuariosAnteriores = obtenerUsuarios()
    await iniciarSesion(correoDemo, contrasenaDemo)
    expect(obtenerSesion()).toEqual(sesionDemo)
    expect(JSON.parse(almacen[CLAVE_SESION])).toEqual(sesionDemo)

    cerrarSesion()

    expect(Storage.prototype.removeItem).toHaveBeenCalledOnceWith(CLAVE_SESION)
    expect(Object.hasOwn(almacen, CLAVE_SESION)).toBeFalse()
    expect(obtenerSesion()).toBeNull()
    expect(obtenerUsuarios()).toEqual(usuariosAnteriores)
    expect(obtenerUsuarios().some((usuario) => usuario.id === sesionDemo.usuarioId)).toBeTrue()
  })

  it('Invalida la sesión de un usuario desactivado y rechaza un nuevo inicio de sesión', async () => {
    await iniciarSesion(correoDemo, contrasenaDemo)
    expect(obtenerSesion()).toEqual(sesionDemo)

    const usuario = cambiarEstadoUsuario(sesionDemo.usuarioId, false)

    expect(usuario.activo).toBeFalse()
    expect(obtenerUsuarios().find((actual) => actual.id === sesionDemo.usuarioId)?.activo).toBeFalse()
    expect(obtenerSesion()).toBeNull()
    await expectAsync(iniciarSesion(correoDemo, contrasenaDemo)).toBeRejectedWithError(/No se pudo iniciar sesión/)
    expect(obtenerSesion()).toBeNull()
  })
})
