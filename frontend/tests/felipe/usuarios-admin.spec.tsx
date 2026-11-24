import { act } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'

import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom'

import FormularioUsuario from '../../src/componentes/organismos/FormularioUsuario'
import RutaAdmin from '../../src/componentes/organismos/RutaAdmin'
import TablaUsuariosAdmin from '../../src/componentes/organismos/TablaUsuariosAdmin'

import {
  AuthContext,
} from '../../src/context/authContextBase'

import type {
  AuthContextType,
} from '../../src/context/authContextBase'

import type {
  Usuario,
  Sesion,
} from '../../src/tipos/Usuario'

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

function escribir(
  campo: HTMLInputElement,
  valor: string,
) {
  Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  )!.set!.call(campo, valor)

  campo.dispatchEvent(
    new Event('input', { bubbles: true }),
  )
}

function elegir(
  lista: HTMLSelectElement,
  valor: string,
) {
  lista.value = valor

  lista.dispatchEvent(
    new Event('change', { bubbles: true }),
  )
}

// Simular el nuevo contexto de autenticacion
function simularSesion(
  sesion: Sesion | null,
  cargando = false,
): AuthContextType {
  return {
    sesion,

    usuario: sesion
      ? {
          ...cliente,
          id: sesion.usuarioId,
          rol: sesion.rol,
        }
      : null,

    cargando,

    autenticado: sesion !== null,

    login: jasmine.createSpy('login'),

    logout: jasmine
      .createSpy('logout')
      .and.resolveTo(undefined),
  }
}

describe(
  'Felipe — administración de usuarios y acceso al panel',
  () => {
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

    async function mostrarPanel(
      sesion: Sesion | null,
      cargando = false,
    ) {
      await act(async () => {
        root.render(
          <AuthContext.Provider
            value={simularSesion(sesion, cargando)}
          >
            <MemoryRouter initialEntries={['/admin']}>
              <Routes>
                <Route
                  path="/login"
                  element={<p>Pantalla de login</p>}
                />

                <Route element={<RutaAdmin />}>
                  <Route
                    path="/admin"
                    element={<p>Contenido del panel</p>}
                  />
                </Route>
              </Routes>
            </MemoryRouter>
          </AuthContext.Provider>,
        )
      })
    }

    it(
      'Validación de usuario: al enviar vacío muestra los 8 errores y no llama a onGuardar',
      async () => {
        const guardar = jasmine.createSpy('guardar')

        await act(async () => {
          root.render(
            <FormularioUsuario
              modo="nuevo"
              onGuardar={guardar}
              onCancelar={() => {}}
            />,
          )
        })

        expect(
          contenedor.querySelectorAll(
            '.invalid-feedback',
          ).length,
        ).toBe(0)

        await act(async () => {
          contenedor
            .querySelector<HTMLButtonElement>(
              'button[type="submit"]',
            )!
            .click()
        })

        const mensajes = Array.from(
          contenedor.querySelectorAll(
            '.invalid-feedback',
          ),
          (mensaje) => mensaje.textContent,
        )

        expect(mensajes.length).toBe(8)
        expect(mensajes).toContain('Ingresa el RUT')

        expect(mensajes).toContain(
          'Selecciona una región',
        )

        expect(mensajes).toContain(
          'Ingresa una contraseña temporal',
        )

        expect(guardar).not.toHaveBeenCalled()
      },
    )

    it(
      'Crear usuario desde el formulario: entrega los datos con región, comuna y la contraseña',
      async () => {
        const guardar = jasmine.createSpy('guardar')

        await act(async () => {
          root.render(
            <FormularioUsuario
              modo="nuevo"
              onGuardar={guardar}
              onCancelar={() => {}}
            />,
          )
        })

        const campo = (id: string) =>
          contenedor.querySelector<HTMLInputElement>(
            `#${id}`,
          )!

        await act(async () => {
          escribir(
            campo('usuario-rut'),
            '11.111.111-1',
          )

          escribir(
            campo('usuario-correo'),
            'ana@correo.cl',
          )

          escribir(campo('usuario-nombre'), 'Ana')

          escribir(
            campo('usuario-apellidos'),
            'Rojas',
          )

          escribir(
            campo('usuario-direccion'),
            'Calle 1',
          )

          escribir(
            campo('usuario-contrasena'),
            'clave1',
          )

          elegir(
            contenedor.querySelector<HTMLSelectElement>(
              '#usuario-region',
            )!,
            'Región de Valparaíso',
          )
        })

        await act(async () => {
          elegir(
            contenedor.querySelector<HTMLSelectElement>(
              '#usuario-comuna',
            )!,
            'Viña del Mar',
          )
        })

        await act(async () => {
          contenedor
            .querySelector<HTMLButtonElement>(
              'button[type="submit"]',
            )!
            .click()
        })

        expect(
          contenedor.querySelectorAll(
            '.invalid-feedback',
          ).length,
        ).toBe(0)

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
      },
    )

    it(
      'Validación de fecha: no acepta una fecha de nacimiento futura ni un año imposible',
      async () => {
        const guardar = jasmine.createSpy('guardar')

        await act(async () => {
          root.render(
            <FormularioUsuario
              modo="nuevo"
              onGuardar={guardar}
              onCancelar={() => {}}
            />,
          )
        })

        const fecha =
          contenedor.querySelector<HTMLInputElement>(
            '#usuario-fecha',
          )!

        await act(async () => {
          escribir(fecha, '2999-01-01')
        })

        await act(async () => {
          contenedor
            .querySelector<HTMLButtonElement>(
              'button[type="submit"]',
            )!
            .click()
        })

        expect(contenedor.textContent).toContain(
          'La fecha de nacimiento no puede ser futura',
        )

        await act(async () => {
          escribir(fecha, '1313-03-31')
        })

        await act(async () => {
          contenedor
            .querySelector<HTMLButtonElement>(
              'button[type="submit"]',
            )!
            .click()
        })

        expect(contenedor.textContent).toContain(
          'Ingresa una fecha desde el año 1900',
        )

        expect(guardar).not.toHaveBeenCalled()
      },
    )

    it(
      'TablaUsuariosAdmin muestra el RUT formateado y avisa el id y el nuevo estado al desactivar',
      async () => {
        const cambiarEstado =
          jasmine.createSpy('cambiarEstado')

        const administrador: Usuario = {
          ...cliente,
          id: 'u-admin',
          rut: '222222222',
          nombre: 'Admin',
          rol: 'administrador',
        }

        await act(async () => {
          root.render(
            <MemoryRouter>
              <TablaUsuariosAdmin
                usuarios={[cliente, administrador]}
                onCambiarEstado={cambiarEstado}
              />
            </MemoryRouter>,
          )
        })

        expect(
          contenedor.querySelectorAll('tbody tr').length,
        ).toBe(2)

        expect(contenedor.textContent).toContain(
          '11.111.111-1',
        )

        expect(contenedor.textContent).toContain(
          'Administrador',
        )

        await act(async () => {
          contenedor
            .querySelector<HTMLButtonElement>(
              'button[aria-label="Desactivar usuario 11.111.111-1"]',
            )!
            .click()
        })

        expect(
          cambiarEstado,
        ).toHaveBeenCalledOnceWith(
          'u-cliente-1',
          false,
        )
      },
    )

    // Pruebas adaptadas al AuthContext

    it(
      'RutaAdmin sin sesión: redirige a la pantalla de login',
      async () => {
        await mostrarPanel(null)

        expect(contenedor.textContent).toContain(
          'Pantalla de login',
        )

        expect(contenedor.textContent).not.toContain(
          'Contenido del panel',
        )
      },
    )

    it(
      'RutaAdmin con sesión de administrador: muestra el contenido del panel',
      async () => {
        await mostrarPanel({
          usuarioId: 'demo-admin',
          rol: 'administrador',
        })

        expect(contenedor.textContent).toContain(
          'Contenido del panel',
        )
      },
    )

    it(
      'RutaAdmin con sesión de cliente: muestra acceso restringido',
      async () => {
        await mostrarPanel({
          usuarioId: 'demo-cliente-1',
          rol: 'cliente',
        })

        expect(contenedor.textContent).toContain(
          'Acceso restringido',
        )

        expect(contenedor.textContent).not.toContain(
          'Contenido del panel',
        )
      },
    )

    // Nuevas pruebas de seguridad

    it(
      'RutaAdmin con sesión de vendedor: muestra acceso restringido',
      async () => {
        await mostrarPanel({
          usuarioId: 'demo-vendedor',
          rol: 'vendedor',
        })

        expect(contenedor.textContent).toContain(
          'Acceso restringido',
        )

        expect(contenedor.textContent).not.toContain(
          'Contenido del panel',
        )
      },
    )

    it(
      'RutaAdmin durante la recuperación de sesión: espera sin mostrar el panel ni redirigir al login',
      async () => {
        await mostrarPanel(null, true)

        expect(contenedor.textContent).toContain(
          'Verificando permisos...',
        )

        expect(contenedor.textContent).not.toContain(
          'Pantalla de login',
        )

        expect(contenedor.textContent).not.toContain(
          'Contenido del panel',
        )
      },
    )
  },
)