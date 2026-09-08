"use strict";

const CLAVE_PRODUCTOS = "sonidoVivoProductosAdmin";
const CLAVE_USUARIOS = "sonidoVivoUsuariosAdmin";

const formatoPrecio = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});

const usuariosIniciales = [
    {
        run: "111111111",
        nombre: "Administrador",
        apellidos: "Sonido Vivo",
        correo: "admin@duoc.cl",
        fechaNacimiento: "1990-01-01",
        rol: "administrador",
        region: "Región de Valparaíso",
        comuna: "Viña del Mar",
        direccion: "Sonido Vivo"
    },
    {
        run: "222222222",
        nombre: "Vendedor",
        apellidos: "Sonido Vivo",
        correo: "vendedor@duoc.cl",
        fechaNacimiento: "1995-01-01",
        rol: "vendedor",
        region: "Región de Valparaíso",
        comuna: "Viña del Mar",
        direccion: "Sonido Vivo"
    },
    {
        run: "123456785",
        nombre: "Cliente",
        apellidos: "Demo",
        correo: "cliente@gmail.com",
        fechaNacimiento: "2000-01-01",
        rol: "cliente",
        region: "Región Metropolitana",
        comuna: "Santiago",
        direccion: "Santiago"
    }
];

const regiones = [
    {
        nombre: "Región de Valparaíso",
        comunas: [
            "Valparaíso",
            "Viña del Mar",
            "Quilpué",
            "Villa Alemana",
            "Concón"
        ]
    },
    {
        nombre: "Región Metropolitana",
        comunas: [
            "Santiago",
            "Providencia",
            "Las Condes",
            "Ñuñoa",
            "Maipú",
            "La Florida",
            "Puente Alto",
            "Colina"
        ]
    },
    {
        nombre: "Región del Maule",
        comunas: [
            "Talca",
            "Curicó",
            "Linares"
        ]
    },
    {
        nombre: "Región del Biobío",
        comunas: [
            "Concepción",
            "Talcahuano",
            "San Pedro de la Paz",
            "Los Ángeles"
        ]
    }
];

function obtenerProductos() {
    const guardados = localStorage.getItem(CLAVE_PRODUCTOS);

    if (guardados) {
        try {
            const lista = JSON.parse(guardados);

            if (Array.isArray(lista)) {
                return lista;
            }
        } catch (error) {
            console.error("Error al cargar productos");
        }
    }

    if (
        typeof productos !== "undefined" &&
        Array.isArray(productos)
    ) {
        const copia = productos.map(function (producto) {
            return { ...producto };
        });

        guardarProductos(copia);

        return copia;
    }

    return [];
}

function guardarProductos(lista) {
    localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(lista)
    );
}

function obtenerUsuarios() {
    const guardados = localStorage.getItem(CLAVE_USUARIOS);

    if (guardados) {
        try {
            const lista = JSON.parse(guardados);

            if (Array.isArray(lista)) {
                return lista;
            }
        } catch (error) {
            console.error("Error al cargar usuarios");
        }
    }

    const copia = usuariosIniciales.map(function (usuario) {
        return { ...usuario };
    });

    guardarUsuarios(copia);

    return copia;
}

function guardarUsuarios(lista) {
    localStorage.setItem(
        CLAVE_USUARIOS,
        JSON.stringify(lista)
    );
}

function ocultarAviso() {
    const aviso = document.getElementById("integracion-pendiente");

    if (aviso) {
        aviso.hidden = true;
    }
}

function iniciarProductos() {
    const tabla = document.getElementById("tabla-productos");

    if (!tabla) {
        return;
    }

    ocultarAviso();

    const buscador = document.getElementById("buscar-productos");
    const filtro = document.getElementById("filtro-categoria");
    const estado = document.getElementById("estado-productos");
    const sinResultados = document.getElementById("sin-resultados-productos");

    const categorias = [
        ...new Set(
            obtenerProductos().map(function (producto) {
                return producto.categoria;
            })
        )
    ].sort();

    categorias.forEach(function (categoria) {
        const opcion = document.createElement("option");

        opcion.value = categoria;
        opcion.textContent = categoria;

        filtro.appendChild(opcion);
    });

    function mostrarProductos() {
        const busqueda = buscador.value.trim().toLowerCase();
        const categoria = filtro.value;

        const lista = obtenerProductos().filter(function (producto) {
            const texto = (
                producto.codigo + " " +
                producto.nombre + " " +
                producto.marca + " " +
                producto.modelo
            ).toLowerCase();

            const coincideBusqueda = texto.includes(busqueda);

            const coincideCategoria =
                categoria === "" ||
                producto.categoria === categoria;

            return coincideBusqueda && coincideCategoria;
        });

        tabla.innerHTML = "";

        lista.forEach(function (producto) {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td>${producto.marca}</td>
                <td>${producto.modelo}</td>
                <td>${formatoPrecio.format(producto.precio)}</td>
                <td>${producto.stock}</td>

                <td>
                    <a
                        class="boton"
                        href="./editar-producto.html?codigo=${encodeURIComponent(producto.codigo)}">
                        Editar
                    </a>

                    <button
                        type="button"
                        class="boton"
                        data-eliminar="${producto.codigo}">
                        Eliminar
                    </button>
                </td>
            `;

            tabla.appendChild(fila);
        });

        estado.textContent =
            lista.length === 1
                ? "1 producto encontrado"
                : lista.length + " productos encontrados";

        sinResultados.hidden = lista.length !== 0;
    }

    tabla.addEventListener("click", function (evento) {
        const boton = evento.target.closest("[data-eliminar]");

        if (!boton) {
            return;
        }

        const codigo = boton.dataset.eliminar;

        const confirmar = confirm(
            "¿Quieres eliminar este producto?"
        );

        if (!confirmar) {
            return;
        }

        const nuevaLista = obtenerProductos().filter(
            function (producto) {
                return producto.codigo !== codigo;
            }
        );

        guardarProductos(nuevaLista);

        mostrarProductos();
    });

    buscador.addEventListener("input", mostrarProductos);
    filtro.addEventListener("change", mostrarProductos);

    mostrarProductos();
}

function iniciarFormularioProducto() {
    const formulario = document.getElementById("formulario-producto");

    if (!formulario) {
        return;
    }

    ocultarAviso();

    const modo = formulario.dataset.modo;

    const codigo = document.getElementById("codigo");
    const categoria = document.getElementById("categoria");
    const nombre = document.getElementById("nombre");
    const marca = document.getElementById("marca");
    const modelo = document.getElementById("modelo");
    const precio = document.getElementById("precio");
    const stock = document.getElementById("stock");
    const descripcion = document.getElementById("descripcion");
    const guardar = document.getElementById("guardar-producto");

    guardar.disabled = false;

    const categorias = [
        ...new Set(
            obtenerProductos().map(function (producto) {
                return producto.categoria;
            })
        )
    ].sort();

    categorias.forEach(function (nombreCategoria) {
        const opcion = document.createElement("option");

        opcion.value = nombreCategoria;
        opcion.textContent = nombreCategoria;

        categoria.appendChild(opcion);
    });

    let productoEditando = null;

    if (modo === "editar") {
        const parametros = new URLSearchParams(window.location.search);
        const codigoURL = parametros.get("codigo");

        productoEditando = obtenerProductos().find(
            function (producto) {
                return producto.codigo === codigoURL;
            }
        );

        if (!productoEditando) {
            alert("Producto no encontrado");

            window.location.href = "./productos.html";

            return;
        }

        codigo.value = productoEditando.codigo;
        categoria.value = productoEditando.categoria;
        nombre.value = productoEditando.nombre;
        marca.value = productoEditando.marca;
        modelo.value = productoEditando.modelo;
        precio.value = productoEditando.precio;
        stock.value = productoEditando.stock;
        descripcion.value = productoEditando.descripcion;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const codigoNuevo = codigo.value.trim().toUpperCase();
        const nombreNuevo = nombre.value.trim();
        const marcaNueva = marca.value.trim();
        const modeloNuevo = modelo.value.trim();
        const descripcionNueva = descripcion.value.trim();

        const precioNuevo = Number(precio.value);
        const stockNuevo = Number(stock.value);

        if (
            codigoNuevo === "" ||
            categoria.value === "" ||
            nombreNuevo === "" ||
            marcaNueva === "" ||
            modeloNuevo === "" ||
            descripcionNueva === ""
        ) {
            alert("Debes completar todos los campos");

            return;
        }

        if (
            !Number.isInteger(precioNuevo) ||
            precioNuevo < 0
        ) {
            alert("El precio debe ser mayor o igual a 0");

            return;
        }

        if (
            !Number.isInteger(stockNuevo) ||
            stockNuevo < 0
        ) {
            alert("El stock debe ser mayor o igual a 0");

            return;
        }

        const lista = obtenerProductos();

        if (modo === "nuevo") {
            const existe = lista.some(function (producto) {
                return producto.codigo === codigoNuevo;
            });

            if (existe) {
                alert("Ya existe un producto con ese código");

                return;
            }

            lista.push({
                codigo: codigoNuevo,
                categoria: categoria.value,
                nombre: nombreNuevo,
                marca: marcaNueva,
                modelo: modeloNuevo,
                precio: precioNuevo,
                stock: stockNuevo,
                descripcion: descripcionNueva,
                imagen: ""
            });
        } else {
            const indice = lista.findIndex(function (producto) {
                return producto.codigo === productoEditando.codigo;
            });

            lista[indice] = {
                ...lista[indice],
                categoria: categoria.value,
                nombre: nombreNuevo,
                marca: marcaNueva,
                modelo: modeloNuevo,
                precio: precioNuevo,
                stock: stockNuevo,
                descripcion: descripcionNueva
            };
        }

        guardarProductos(lista);

        alert(
            modo === "nuevo"
                ? "Producto agregado correctamente"
                : "Producto actualizado correctamente"
        );

        window.location.href = "./productos.html";
    });
}

function iniciarUsuarios() {
    const tabla = document.getElementById("tabla-usuarios");

    if (!tabla) {
        return;
    }

    ocultarAviso();

    const buscador = document.getElementById("buscar-usuarios");
    const estado = document.getElementById("estado-usuarios");
    const sinResultados = document.getElementById("sin-resultados-usuarios");

    function mostrarUsuarios() {
        const busqueda = buscador.value.trim().toLowerCase();

        const lista = obtenerUsuarios().filter(function (usuario) {
            const texto = (
                usuario.run + " " +
                usuario.nombre + " " +
                usuario.apellidos + " " +
                usuario.correo
            ).toLowerCase();

            return texto.includes(busqueda);
        });

        tabla.innerHTML = "";

        lista.forEach(function (usuario) {
            const fila = document.createElement("tr");

            fila.innerHTML = `
                <td>${usuario.run}</td>
                <td>${usuario.nombre}</td>
                <td>${usuario.apellidos}</td>
                <td>${usuario.correo}</td>
                <td>${usuario.rol}</td>
                <td>${usuario.region}</td>
                <td>${usuario.comuna}</td>

                <td>
                    <a
                        class="boton"
                        href="./editar-usuario.html?run=${encodeURIComponent(usuario.run)}">
                        Editar
                    </a>

                    <button
                        type="button"
                        class="boton"
                        data-eliminar-usuario="${usuario.run}">
                        Eliminar
                    </button>
                </td>
            `;

            tabla.appendChild(fila);
        });

        estado.textContent =
            lista.length === 1
                ? "1 usuario encontrado"
                : lista.length + " usuarios encontrados";

        sinResultados.hidden = lista.length !== 0;
    }

    tabla.addEventListener("click", function (evento) {
        const boton = evento.target.closest(
            "[data-eliminar-usuario]"
        );

        if (!boton) {
            return;
        }

        const run = boton.dataset.eliminarUsuario;

        if (!confirm("¿Quieres eliminar este usuario?")) {
            return;
        }

        const nuevaLista = obtenerUsuarios().filter(
            function (usuario) {
                return usuario.run !== run;
            }
        );

        guardarUsuarios(nuevaLista);

        mostrarUsuarios();
    });

    buscador.addEventListener("input", mostrarUsuarios);

    mostrarUsuarios();
}

function validarRun(runIngresado) {
    const run = runIngresado
        .replace(/\./g, "")
        .replace(/-/g, "")
        .toUpperCase();

    if (!/^[0-9]{7,8}[0-9K]$/.test(run)) {
        return false;
    }

    const cuerpo = run.slice(0, -1);
    const digito = run.slice(-1);

    let suma = 0;
    let multiplicador = 2;

    for (
        let i = cuerpo.length - 1;
        i >= 0;
        i--
    ) {
        suma += Number(cuerpo[i]) * multiplicador;

        multiplicador++;

        if (multiplicador > 7) {
            multiplicador = 2;
        }
    }

    const resultado = 11 - (suma % 11);

    let digitoCalculado;

    if (resultado === 11) {
        digitoCalculado = "0";
    } else if (resultado === 10) {
        digitoCalculado = "K";
    } else {
        digitoCalculado = String(resultado);
    }

    return digito === digitoCalculado;
}

function iniciarFormularioUsuario() {
    const formulario = document.getElementById("formulario-usuario");

    if (!formulario) {
        return;
    }

    ocultarAviso();

    const modo = formulario.dataset.modo;

    const run = document.getElementById("run");
    const nombre = document.getElementById("nombre");
    const apellidos = document.getElementById("apellidos");
    const correo = document.getElementById("correo");
    const fecha = document.getElementById("fecha-nacimiento");
    const rol = document.getElementById("rol");
    const region = document.getElementById("region");
    const comuna = document.getElementById("comuna");
    const direccion = document.getElementById("direccion");
    const guardar = document.getElementById("guardar-usuario");

    guardar.disabled = false;

    if (
        !Array.from(rol.options).some(function (opcion) {
            return opcion.value === "vendedor";
        })
    ) {
        const opcion = document.createElement("option");

        opcion.value = "vendedor";
        opcion.textContent = "Vendedor";

        rol.appendChild(opcion);
    }

    regiones.forEach(function (item) {
        const opcion = document.createElement("option");

        opcion.value = item.nombre;
        opcion.textContent = item.nombre;

        region.appendChild(opcion);
    });

    function cargarComunas(
        regionSeleccionada,
        comunaSeleccionada = ""
    ) {
        comuna.innerHTML =
            '<option value="">Seleccione una comuna</option>';

        const encontrada = regiones.find(function (item) {
            return item.nombre === regionSeleccionada;
        });

        if (!encontrada) {
            comuna.disabled = true;

            return;
        }

        comuna.disabled = false;

        encontrada.comunas.forEach(function (nombreComuna) {
            const opcion = document.createElement("option");

            opcion.value = nombreComuna;
            opcion.textContent = nombreComuna;

            comuna.appendChild(opcion);
        });

        comuna.value = comunaSeleccionada;
    }

    region.addEventListener("change", function () {
        cargarComunas(region.value);
    });

    let usuarioEditando = null;

    if (modo === "editar") {
        const parametros = new URLSearchParams(window.location.search);
        const runURL = parametros.get("run");

        usuarioEditando = obtenerUsuarios().find(
            function (usuario) {
                return usuario.run === runURL;
            }
        );

        if (!usuarioEditando) {
            alert("Usuario no encontrado");

            window.location.href = "./usuarios.html";

            return;
        }

        run.value = usuarioEditando.run;
        nombre.value = usuarioEditando.nombre;
        apellidos.value = usuarioEditando.apellidos;
        correo.value = usuarioEditando.correo;
        fecha.value = usuarioEditando.fechaNacimiento;
        rol.value = usuarioEditando.rol;
        region.value = usuarioEditando.region;

        cargarComunas(
            usuarioEditando.region,
            usuarioEditando.comuna
        );

        direccion.value = usuarioEditando.direccion;
    }

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const runNuevo = run.value
            .replace(/\./g, "")
            .replace(/-/g, "")
            .toUpperCase();

        if (!validarRun(runNuevo)) {
            alert("El RUN ingresado no es válido");

            return;
        }

        if (
            nombre.value.trim() === "" ||
            apellidos.value.trim() === "" ||
            correo.value.trim() === "" ||
            fecha.value === "" ||
            rol.value === "" ||
            region.value === "" ||
            comuna.value === "" ||
            direccion.value.trim() === ""
        ) {
            alert("Debes completar todos los campos");

            return;
        }

        const lista = obtenerUsuarios();

        if (modo === "nuevo") {
            const existe = lista.some(function (usuario) {
                return usuario.run === runNuevo;
            });

            if (existe) {
                alert("Ya existe un usuario con ese RUN");

                return;
            }

            lista.push({
                run: runNuevo,
                nombre: nombre.value.trim(),
                apellidos: apellidos.value.trim(),
                correo: correo.value.trim().toLowerCase(),
                fechaNacimiento: fecha.value,
                rol: rol.value,
                region: region.value,
                comuna: comuna.value,
                direccion: direccion.value.trim()
            });
        } else {
            const indice = lista.findIndex(function (usuario) {
                return usuario.run === usuarioEditando.run;
            });

            lista[indice] = {
                ...lista[indice],
                nombre: nombre.value.trim(),
                apellidos: apellidos.value.trim(),
                correo: correo.value.trim().toLowerCase(),
                fechaNacimiento: fecha.value,
                rol: rol.value,
                region: region.value,
                comuna: comuna.value,
                direccion: direccion.value.trim()
            };
        }

        guardarUsuarios(lista);

        alert(
            modo === "nuevo"
                ? "Usuario creado correctamente"
                : "Usuario actualizado correctamente"
        );

        window.location.href = "./usuarios.html";
    });
}

iniciarProductos();
iniciarFormularioProducto();
iniciarUsuarios();
iniciarFormularioUsuario(); 