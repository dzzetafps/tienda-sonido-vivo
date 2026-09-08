"use strict";

// Recuperamos los usuarios guardados
function leerUsuarios() {
    let usuarios = [];

    try {
        const usuariosGuardados = localStorage.getItem("sonidoVivoUsuarios");

        if (usuariosGuardados !== null) {
            usuarios = JSON.parse(usuariosGuardados);
        }
    } catch {
        usuarios = [];
    }

    if (!Array.isArray(usuarios)) {
        usuarios = [];
    }

    // Ignoramos entradas que no sean objetos de usuario.
    const usuariosValidos = [];

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i] !== null && typeof usuarios[i] === "object" && !Array.isArray(usuarios[i])) {
            usuariosValidos.push(usuarios[i]);
        }
    }

    return usuariosValidos;
}

function normalizarTexto(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor).trim().toLowerCase();
}

// Creamos una fila con las columnas del HTML
function crearFila(usuario) {
    const fila = document.createElement("tr");
    const valores = [
        usuario.run,
        usuario.nombre,
        usuario.apellidos,
        usuario.correo,
        usuario.rol,
        usuario.region,
        usuario.comuna
    ];

    for (let i = 0; i < valores.length; i++) {
        let texto = "—";

        if (valores[i] !== null && valores[i] !== undefined && valores[i] !== "") {
            texto = String(valores[i]);
        }

        const celda = document.createElement("td");
        celda.textContent = texto;
        fila.appendChild(celda);
    }

    const acciones = document.createElement("td");

    if (normalizarTexto(usuario.run) !== "") {
        const enlace = document.createElement("a");
        enlace.href = "editar-usuario.html?run=" + encodeURIComponent(usuario.run);
        enlace.textContent = "Editar";
        enlace.setAttribute("aria-label", "Editar usuario " + usuario.run);
        acciones.appendChild(enlace);
    } else {
        acciones.textContent = "—";
    }

    fila.appendChild(acciones);
    return fila;
}

function iniciarListadoUsuarios() {
    const tabla = document.getElementById("tabla-usuarios");
    const buscador = document.getElementById("buscar-usuarios");
    const estado = document.getElementById("estado-usuarios");
    const sinResultados = document.getElementById("sin-resultados-usuarios");
    const aviso = document.getElementById("integracion-pendiente");

    if (!tabla) {
        if (estado) {
            estado.textContent = "No se encontró la tabla de usuarios.";
        }
        return;
    }

    const usuarios = leerUsuarios();

    // Buscamos por RUN, nombre, apellidos o correo
    function actualizarListado() {
        let texto = "";

        if (buscador) {
            texto = normalizarTexto(buscador.value);
        }

        const coincidencias = [];

        for (let i = 0; i < usuarios.length; i++) {
            const usuario = usuarios[i];
            const coincideTexto =
                normalizarTexto(usuario.run).includes(texto) ||
                normalizarTexto(usuario.nombre).includes(texto) ||
                normalizarTexto(usuario.apellidos).includes(texto) ||
                normalizarTexto(usuario.correo).includes(texto);

            if (coincideTexto) {
                coincidencias.push(usuario);
            }
        }

        tabla.innerHTML = "";

        for (let i = 0; i < coincidencias.length; i++) {
            tabla.appendChild(crearFila(coincidencias[i]));
        }

        if (estado) {
            estado.textContent = "Mostrando " + coincidencias.length + " de " + usuarios.length + " usuarios.";
        }

        if (sinResultados) {
            sinResultados.hidden = coincidencias.length > 0;

            if (usuarios.length === 0) {
                sinResultados.textContent = "No hay usuarios registrados.";
            } else {
                sinResultados.textContent = "No se encontraron usuarios.";
            }
        }
    }

    if (aviso) {
        aviso.textContent = "Listado preparado. Busca por RUN, nombre, apellidos o correo.";
        aviso.hidden = true;
    }

    if (buscador) {
        buscador.oninput = actualizarListado;
    }

    actualizarListado();
}

// Esperamos al HTML si todavía se está cargando.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarListadoUsuarios);
} else {
    iniciarListadoUsuarios();
}
