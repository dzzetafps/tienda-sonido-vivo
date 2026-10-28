import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import FormularioUsuario from '../../src/componentes/organismos/FormularioUsuario'
import RutaAdmin from '../../src/componentes/organismos/RutaAdmin'
import TablaUsuariosAdmin from '../../src/componentes/organismos/TablaUsuariosAdmin'
import type { Usuario } from '../../src/tipos/Usuario'

const cliente: Usuario = {
  id: 'u-cliente-1',
  rut: '111111111',
  nombre: 'Ana',
  apellidos: 'Rojas',
  correo: 'ana@correo.cl',
  fechaNacimiento: '',
  region: 'Región de Valparaíso',
  comuna: 'Viña del Mar',
  direccion: 'Calle 1',
  rol: 'cliente',
  activo: true,
  fechaRegistro: '2026-10-20T10:00:00.000Z',
}

function escribir(campo: HTMLInputElement, valor: string) {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(campo, valor)
  campo.dispatchEvent(new Event('input', { bubbles: true }))
}

function elegir(lista: HTMLSelectElement, valor: string) {
  lista.value = valor
  lista.dispatchEvent(new Event('change', { bubbles: true }))
}

function simularSesion(sesion: { usuarioId: string; rol: string } | null) {
  spyOn(Storage.prototype, 'getItem').and.callFake((clave: string) =>
    clave === 'sonido-vivo-ep2-sesion' && sesion ? JSON.stringify(sesion) : null,
  )
}

describe('Felipe — administración de usuarios y acceso al panel', () => {
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

  async function mostrarPanel() {
    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route path="/login" element={<p>Pantalla de login</p>} />
            <Route element={<RutaAdmin />}>
              <Route path="/admin" element={<p>Contenido del panel</p>} />
            </Route>
          </Routes>
        </MemoryRouter>,
      )
    })
  }

  it('Validación de usuario: al enviar vacío muestra los 8 errores y no llama a onGuardar', async () => {
    const guardar = jasmine.createSpy('guardar')
    await act(async () => {
      root.render(<FormularioUsuario modo="nuevo" onGuardar={guardar} onCancelar={() => {}} />)
    })
    expect(contenedor.querySelectorAll('.invalid-feedback').length).toBe(0)

    await act(async () => {
      contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    })

    const mensajes = Array.from(contenedor.querySelectorAll('.invalid-feedback'), (mensaje) => mensaje.textContent)
    expect(mensajes.length).toBe(8)
    expect(mensajes).toContain('Ingresa el RUT')
    expect(mensajes).toContain('Selecciona una región')
    expect(mensajes).toContain('Ingresa una contraseña temporal')
    expect(guardar).not.toHaveBeenCalled()
  })

  it('Crear usuario desde el formulario: entrega los datos con región, comuna y la contraseña', async () => {
    const guardar = jasmine.createSpy('guardar')
    await act(async () => {
      root.render(<FormularioUsuario modo="nuevo" onGuardar={guardar} onCancelar={() => {}} />)
    })
    const campo = (id: string) => contenedor.querySelector<HTMLInputElement>(`#${id}`)!

    await act(async () => {
      escribir(campo('usuario-rut'), '11.111.111-1')
      escribir(campo('usuario-correo'), 'ana@correo.cl')
      escribir(campo('usuario-nombre'), 'Ana')
      escribir(campo('usuario-apellidos'), 'Rojas')
      escribir(campo('usuario-direccion'), 'Calle 1')
      escribir(campo('usuario-contrasena'), 'clave1')
      elegir(contenedor.querySelector<HTMLSelectElement>('#usuario-region')!, 'Región de Valparaíso')
    })
    await act(async () => {
      elegir(contenedor.querySelector<HTMLSelectElement>('#usuario-comuna')!, 'Viña del Mar')
    })
    await act(async () => {
      contenedor.querySelector<HTMLButtonElement>('button[type="submit"]')!.click()
    })

    expect(contenedor.querySelectorAll('.invalid-feedback').length).toBe(0)
    expect(guardar).toHaveBeenCalledOnceWith(
      {
        rut: '11.111.111-1',
        nombre: 'Ana',
        apellidos: 'Rojas',
        correo: 'ana@correo.cl',
        fechaNacimiento: '',
        region: 'Región de Valparaíso',
        comuna: 'Viña del Mar',
        direccion: 'Calle 1',
        rol: 'cliente',
      },
      'clave1',
    )
  })

  it('TablaUsuariosAdmin muestra el RUT formateado y avisa el id y el nuevo estado al desactivar', async () => {
    const cambiarEstado = jasmine.createSpy('cambiarEstado')
    const administrador: Usuario = { ...cliente, id: 'u-admin', rut: '222222222', nombre: 'Admin', rol: 'administrador' }
    await act(async () => {
      root.render(
        <MemoryRouter>
          <TablaUsuariosAdmin usuarios={[cliente, administrador]} onCambiarEstado={cambiarEstado} />
        </MemoryRouter>,
      )
    })

    expect(contenedor.querySelectorAll('tbody tr').length).toBe(2)
    expect(contenedor.textContent).toContain('11.111.111-1')
    expect(contenedor.textContent).toContain('Administrador')

    await act(async () => {
      contenedor.querySelector<HTMLButtonElement>('button[aria-label="Desactivar usuario 11.111.111-1"]')!.click()
    })

    expect(cambiarEstado).toHaveBeenCalledOnceWith('u-cliente-1', false)
  })

  it('RutaAdmin sin sesión: redirige a la pantalla de login', async () => {
    simularSesion(null)
    await mostrarPanel()

    expect(contenedor.textContent).toContain('Pantalla de login')
    expect(contenedor.textContent).not.toContain('Contenido del panel')
  })

  it('RutaAdmin con sesión de administrador: muestra el contenido del panel', async () => {
    simularSesion({ usuarioId: 'demo-admin', rol: 'administrador' })
    await mostrarPanel()

    expect(contenedor.textContent).toContain('Contenido del panel')
  })

  it('RutaAdmin con sesión de cliente: muestra acceso restringido', async () => {
    simularSesion({ usuarioId: 'demo-cliente-1', rol: 'cliente' })
    await mostrarPanel()

    expect(contenedor.textContent).toContain('Acceso restringido')
    expect(contenedor.textContent).not.toContain('Contenido del panel')
  })
})
