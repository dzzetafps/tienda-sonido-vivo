/** @typedef {import('../tipos/Usuario').Usuario} Usuario */
/** @typedef {import('../tipos/Usuario').Sesion} Sesion */
/** @typedef {Pick<Usuario, 'rut' | 'nombre' | 'apellidos' | 'correo' | 'fechaNacimiento' | 'region' | 'comuna' | 'direccion'>} DatosRegistro */
/** @typedef {{ usuarioId: string, salt: string, verificador: string, iteraciones: number }} Credencial */

const CLAVE_USUARIOS = 'sonido-vivo-ep2-usuarios'
const CLAVE_SESION = 'sonido-vivo-ep2-sesion'
const CLAVE_CREDENCIALES = 'sonido-vivo-ep2-credenciales'
const ITERACIONES = 600000
const ERROR_LOGIN = 'No se pudo iniciar sesión. Revisa tus credenciales y que tu cuenta esté habilitada.'
const CAMPOS_USUARIO = ['id', 'rut', 'nombre', 'apellidos', 'correo', 'fechaNacimiento', 'region', 'comuna', 'direccion', 'rol', 'activo', 'fechaRegistro']

// Datos ficticios para la simulación local; no representan personas reales.
/** @type {Usuario[]} */
const usuariosIniciales = [
  {
    id: 'demo-admin', rut: '900000014', nombre: 'Administrador', apellidos: 'Demostración',
    correo: 'admin@sonidovivo.example', fechaNacimiento: '', region: 'Región de Valparaíso',
    comuna: 'Viña del Mar', direccion: 'Dirección ficticia 100', rol: 'administrador',
    activo: true, fechaRegistro: '2026-10-28T00:00:00.000Z',
  },
  {
    id: 'demo-cliente-1', rut: '900000022', nombre: 'Cliente Uno', apellidos: 'Demostración',
    correo: 'cliente1@sonidovivo.example', fechaNacimiento: '', region: 'Región de Valparaíso',
    comuna: 'Valparaíso', direccion: 'Dirección ficticia 200', rol: 'cliente',
    activo: true, fechaRegistro: '2026-10-28T00:00:00.000Z',
  },
  {
    id: 'demo-cliente-2', rut: '900000030', nombre: 'Cliente Dos', apellidos: 'Demostración',
    correo: 'cliente2@sonidovivo.example', fechaNacimiento: '', region: 'Región Metropolitana de Santiago',
    comuna: 'Santiago', direccion: 'Dirección ficticia 300', rol: 'cliente',
    activo: true, fechaRegistro: '2026-10-28T00:00:00.000Z',
  },
]

// Verificadores de demostración: PBKDF2, SHA-256, salt de 16 bytes y resultado de 32 bytes.
/** @type {Credencial[]} */
const credencialesIniciales = [
  {
    usuarioId: 'demo-admin', salt: 'ad312da118a0446670b7f58c2b8e151a', iteraciones: ITERACIONES,
    verificador: 'e62fed0969e90f3336a7a36a74147411f28d6e8f6d6b4610af6eb2781b9191ba',
  },
  {
    usuarioId: 'demo-cliente-1', salt: 'd38dcb313df8ce9792c38e634947c8b2', iteraciones: ITERACIONES,
    verificador: '595c7404e822b25f6cfbdd647c0f29c37fd7ed119c18c0033bf7cfa32b38977e',
  },
  {
    usuarioId: 'demo-cliente-2', salt: '9652f1329b33acd1a312b0ed40b0e0e1', iteraciones: ITERACIONES,
    verificador: '1019a2446b66d7a325c9f91b5e0a6d41f1a4dcfa29dc28ce78f40963671cb4da',
  },
]

/** @param {string} clave @returns {string | null} */
function leerTexto(clave) {
  try {
    return localStorage.getItem(clave)
  } catch {
    throw new Error('No se pudo leer el almacenamiento local. Revisa los permisos del navegador.')
  }
}

/** @param {string} clave @param {unknown} datos */
function guardar(clave, datos) {
  try {
    localStorage.setItem(clave, JSON.stringify(datos))
  } catch {
    throw new Error('No se pudieron guardar los datos. Revisa el espacio y los permisos del navegador.')
  }
}

/** @param {unknown} valor @returns {valor is Record<string, unknown>} */
function esObjeto(valor) {
  return valor !== null && typeof valor === 'object' && !Array.isArray(valor)
}

/** @param {unknown} valor @returns {valor is string} */
function esTexto(valor) {
  return typeof valor === 'string' && valor.trim().length > 0
}

/** @param {string} rut @returns {string} */
function normalizarRut(rut) {
  const limpio = rut.trim().replace(/[.-]/g, '').toUpperCase()
  if (!/^\d{1,8}[\dK]$/.test(limpio)) throw new Error('El RUT no es válido.')
  const cuerpo = limpio.slice(0, -1)
  if (Number(cuerpo) === 0) throw new Error('El RUT no es válido.')
  let suma = 0
  let multiplicador = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplicador
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1
  }
  const resto = 11 - (suma % 11)
  const digito = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  if (digito !== limpio.slice(-1)) throw new Error('El dígito verificador del RUT no es válido.')
  return String(Number(cuerpo)) + digito
}

/** @param {unknown} usuario @returns {asserts usuario is Usuario} */
function validarUsuario(usuario) {
  if (!esObjeto(usuario)) throw new Error('El usuario debe ser un objeto.')
  if (Object.keys(usuario).some((campo) => !CAMPOS_USUARIO.includes(campo))) {
    throw new Error('El usuario solo debe contener los campos del modelo, sin contraseñas.')
  }
  for (const campo of ['id', 'rut', 'nombre', 'apellidos', 'correo', 'region', 'comuna', 'direccion', 'fechaRegistro']) {
    if (!esTexto(usuario[campo])) throw new Error(`El campo ${campo} es obligatorio y debe ser texto.`)
  }
  const datos = /** @type {Usuario} */ (/** @type {unknown} */ (usuario))
  if (datos.id !== datos.id.trim()) throw new Error('El ID no debe tener espacios en sus extremos.')
  normalizarRut(datos.rut)
  if (datos.nombre.trim().length > 50 || datos.apellidos.trim().length > 100 || datos.direccion.trim().length > 300) {
    throw new Error('Revisa los máximos: nombre 50, apellidos 100 y dirección 300 caracteres.')
  }
  if (datos.correo.trim().length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo.trim())) {
    throw new Error('El correo debe ser válido y no superar los 100 caracteres.')
  }
  if (datos.rol !== 'cliente' && datos.rol !== 'administrador') throw new Error('El rol no es válido.')
  if (typeof datos.activo !== 'boolean') throw new Error('El estado activo debe ser booleano.')
  if (typeof datos.fechaNacimiento !== 'string') throw new Error('La fecha de nacimiento debe ser texto o una cadena vacía.')
  if (datos.fechaNacimiento !== '') {
    const fecha = new Date(datos.fechaNacimiento)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fechaNacimiento) || !Number.isFinite(fecha.getTime()) ||
      fecha.toISOString().slice(0, 10) !== datos.fechaNacimiento) {
      throw new Error('La fecha de nacimiento no es válida.')
    }
  }
  const registro = new Date(datos.fechaRegistro)
  if (!Number.isFinite(registro.getTime()) || registro.toISOString() !== datos.fechaRegistro) {
    throw new Error('La fecha de registro debe estar en formato ISO.')
  }
}

/** @param {Usuario} usuario @returns {Usuario} */
function normalizarUsuario(usuario) {
  validarUsuario(usuario)
  return {
    ...usuario,
    rut: normalizarRut(usuario.rut), correo: usuario.correo.trim().toLowerCase(),
    nombre: usuario.nombre.trim(), apellidos: usuario.apellidos.trim(),
    region: usuario.region.trim(), comuna: usuario.comuna.trim(), direccion: usuario.direccion.trim(),
  }
}

/** @param {Usuario[]} usuarios */
function validarUnicidad(usuarios) {
  for (const campo of /** @type {const} */ (['id', 'rut', 'correo'])) {
    if (new Set(usuarios.map((usuario) => usuario[campo])).size !== usuarios.length) {
      throw new Error(`Ya existe un usuario con ese ${campo}.`)
    }
  }
}

/** @returns {Usuario[]} */
export function obtenerUsuarios() {
  const guardados = leerTexto(CLAVE_USUARIOS)
  if (guardados === null) return usuariosIniciales.map((usuario) => ({ ...usuario }))
  try {
    /** @type {unknown} */
    const datos = JSON.parse(guardados)
    if (!Array.isArray(datos)) throw new Error('Los usuarios deben ser una lista.')
    const usuarios = datos.map(normalizarUsuario)
    validarUnicidad(usuarios)
    return usuarios
  } catch {
    throw new Error('Los usuarios guardados no son válidos. Revisa LocalStorage; no se han sobrescrito.')
  }
}

/** @param {string} id @returns {Usuario | undefined} */
export function buscarUsuarioPorId(id) {
  return obtenerUsuarios().find((usuario) => usuario.id === id)
}

/** @param {Usuario} usuario @returns {Usuario} */
export function crearUsuario(usuario) {
  const nuevo = normalizarUsuario(usuario)
  const usuarios = [...obtenerUsuarios(), nuevo]
  validarUnicidad(usuarios)
  guardar(CLAVE_USUARIOS, usuarios)
  return { ...nuevo }
}

/** @param {string} id @param {Usuario} usuario @returns {Usuario} */
export function actualizarUsuario(id, usuario) {
  const actualizado = normalizarUsuario(usuario)
  if (actualizado.id !== id) throw new Error('No se puede cambiar el ID de un usuario.')
  const usuarios = obtenerUsuarios()
  const indice = usuarios.findIndex((actual) => actual.id === id)
  if (indice === -1) throw new Error('El usuario no existe.')
  usuarios[indice] = actualizado
  validarUnicidad(usuarios)
  guardar(CLAVE_USUARIOS, usuarios)
  return { ...actualizado }
}

/** @param {string} id @param {boolean} activo @returns {Usuario} */
export function cambiarEstadoUsuario(id, activo) {
  if (typeof activo !== 'boolean') throw new Error('El estado activo debe ser booleano.')
  const usuario = buscarUsuarioPorId(id)
  if (!usuario) throw new Error('El usuario no existe.')
  return actualizarUsuario(id, { ...usuario, activo })
}

/** @returns {Credencial[]} */
function obtenerCredenciales() {
  const guardadas = leerTexto(CLAVE_CREDENCIALES)
  if (guardadas === null) return credencialesIniciales.map((credencial) => ({ ...credencial }))
  try {
    /** @type {unknown} */
    const datos = JSON.parse(guardadas)
    if (!Array.isArray(datos)) throw new Error('Las credenciales deben ser una lista.')
    for (const dato of datos) {
      if (!esObjeto(dato) || Object.keys(dato).some((campo) => !['usuarioId', 'salt', 'verificador', 'iteraciones'].includes(campo)) ||
        !esTexto(dato.usuarioId) || dato.usuarioId !== dato.usuarioId.trim() ||
        typeof dato.salt !== 'string' || !/^[0-9a-f]{32}$/.test(dato.salt) ||
        typeof dato.verificador !== 'string' || !/^[0-9a-f]{64}$/.test(dato.verificador) || dato.iteraciones !== ITERACIONES) {
        throw new Error('Credencial no válida.')
      }
    }
    const credenciales = /** @type {Credencial[]} */ (datos)
    if (new Set(credenciales.map((credencial) => credencial.usuarioId)).size !== credenciales.length) {
      throw new Error('Hay credenciales duplicadas.')
    }
    return credenciales
  } catch {
    throw new Error('Las credenciales guardadas no son válidas. Revisa LocalStorage; no se han sobrescrito.')
  }
}

/** @param {unknown} contrasena @returns {asserts contrasena is string} */
function validarContrasena(contrasena) {
  if (typeof contrasena !== 'string' || !contrasena.trim() || contrasena.length < 4 || contrasena.length > 10) {
    throw new Error('La contraseña debe tener entre 4 y 10 caracteres y no estar vacía.')
  }
}

function comprobarCrypto() {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.randomUUID) {
    throw new Error('Web Crypto no está disponible. Usa HTTPS o localhost para esta simulación.')
  }
}

/** @param {Uint8Array} bytes @returns {string} */
function aHexadecimal(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

/** @param {string} contrasena @param {string} salt @returns {Promise<string>} */
async function derivar(contrasena, salt) {
  comprobarCrypto()
  const bytesSalt = new Uint8Array(16)
  for (let i = 0; i < bytesSalt.length; i++) bytesSalt[i] = parseInt(salt.slice(i * 2, i * 2 + 2), 16)
  try {
    const clave = await crypto.subtle.importKey('raw', new TextEncoder().encode(contrasena), 'PBKDF2', false, ['deriveBits'])
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: bytesSalt, iterations: ITERACIONES }, clave, 256)
    return aHexadecimal(new Uint8Array(bits))
  } catch {
    throw new Error('No se pudo preparar la credencial con Web Crypto.')
  }
}

/** @param {string} usuarioId @param {string} contrasena @returns {Promise<Credencial>} */
async function crearCredencial(usuarioId, contrasena) {
  validarContrasena(contrasena)
  comprobarCrypto()
  const salt = aHexadecimal(crypto.getRandomValues(new Uint8Array(16)))
  return { usuarioId, salt, iteraciones: ITERACIONES, verificador: await derivar(contrasena, salt) }
}

/** @param {string} usuarioId @param {string} contrasena @returns {Promise<void>} */
export async function asignarContrasena(usuarioId, contrasena) {
  if (!buscarUsuarioPorId(usuarioId)) throw new Error('El usuario no existe.')
  const credencial = await crearCredencial(usuarioId, contrasena)
  if (!buscarUsuarioPorId(usuarioId)) throw new Error('El usuario ya no existe.')
  const credenciales = obtenerCredenciales().filter((actual) => actual.usuarioId !== usuarioId)
  guardar(CLAVE_CREDENCIALES, [...credenciales, credencial])
}

/** @param {DatosRegistro} datos @param {string} contrasena @returns {Promise<Usuario>} */
export async function registrarCliente(datos, contrasena) {
  if (!esObjeto(datos)) throw new Error('Los datos del registro deben ser un objeto.')
  comprobarCrypto()
  const usuario = normalizarUsuario({
    id: crypto.randomUUID(), rut: datos.rut, nombre: datos.nombre, apellidos: datos.apellidos,
    correo: datos.correo, fechaNacimiento: datos.fechaNacimiento, region: datos.region,
    comuna: datos.comuna, direccion: datos.direccion, rol: 'cliente', activo: true,
    fechaRegistro: new Date().toISOString(),
  })
  validarUnicidad([...obtenerUsuarios(), usuario])
  const credencial = await crearCredencial(usuario.id, contrasena)
  // Se relee después de la derivación para conservar cambios realizados mientras se esperaba.
  const usuarios = [...obtenerUsuarios(), usuario]
  validarUnicidad(usuarios)
  const credenciales = obtenerCredenciales()
  if (credenciales.some((actual) => actual.usuarioId === usuario.id)) throw new Error('El ID generado ya tiene credenciales.')
  const credencialesAnteriores = leerTexto(CLAVE_CREDENCIALES)
  guardar(CLAVE_CREDENCIALES, [...credenciales, credencial])
  try {
    guardar(CLAVE_USUARIOS, usuarios)
  } catch (error) {
    try {
      if (credencialesAnteriores === null) localStorage.removeItem(CLAVE_CREDENCIALES)
      else localStorage.setItem(CLAVE_CREDENCIALES, credencialesAnteriores)
    } catch {
      throw new Error('No se guardó el usuario y no se pudo restaurar la lista de credenciales. Revisa LocalStorage antes de reintentar.')
    }
    throw error
  }
  return { ...usuario }
}

/** @param {string} correo @param {string} contrasena @returns {Promise<Sesion>} */
export async function iniciarSesion(correo, contrasena) {
  if (!esTexto(correo)) throw new Error(ERROR_LOGIN)
  try {
    validarContrasena(contrasena)
  } catch {
    throw new Error(ERROR_LOGIN)
  }
  const correoNormalizado = correo.trim().toLowerCase()
  const usuario = obtenerUsuarios().find((actual) => actual.correo === correoNormalizado)
  const credencial = obtenerCredenciales().find((actual) => actual.usuarioId === usuario?.id)
  if (!usuario || !usuario.activo || !credencial) throw new Error(ERROR_LOGIN)
  const verificador = await derivar(contrasena, credencial.salt)
  if (verificador !== credencial.verificador) throw new Error(ERROR_LOGIN)
  const actual = buscarUsuarioPorId(usuario.id)
  const credencialActual = obtenerCredenciales().find((dato) => dato.usuarioId === usuario.id)
  if (!actual?.activo || actual.correo !== correoNormalizado ||
    credencialActual?.salt !== credencial.salt || credencialActual?.verificador !== verificador) {
    throw new Error(ERROR_LOGIN)
  }
  /** @type {Sesion} */
  const sesion = { usuarioId: actual.id, rol: actual.rol }
  guardar(CLAVE_SESION, sesion)
  return { ...sesion }
}

/** @returns {Sesion | null} */
export function obtenerSesion() {
  try {
    const guardada = leerTexto(CLAVE_SESION)
    if (guardada === null) return null
    /** @type {unknown} */
    const sesion = JSON.parse(guardada)
    if (!esObjeto(sesion) || Object.keys(sesion).some((campo) => !['usuarioId', 'rol'].includes(campo)) ||
      !esTexto(sesion.usuarioId) || (sesion.rol !== 'cliente' && sesion.rol !== 'administrador')) return null
    const usuario = buscarUsuarioPorId(sesion.usuarioId)
    if (!usuario?.activo || usuario.rol !== sesion.rol) return null
    return { usuarioId: usuario.id, rol: usuario.rol }
  } catch {
    return null
  }
}

/** @returns {void} */
export function cerrarSesion() {
  try {
    localStorage.removeItem(CLAVE_SESION)
  } catch {
    throw new Error('No se pudo cerrar la sesión. Revisa los permisos del almacenamiento local.')
  }
}
