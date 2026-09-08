"use strict";

let usuarioOriginal = null;
let formularioPreparado = false;

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

    return usuarios;
}

function guardarUsuarios(usuarios) {
    try {
        localStorage.setItem("sonidoVivoUsuarios", JSON.stringify(usuarios));
        return true;
    } catch {
        alert("No se pudo guardar el usuario.");
        return false;
    }
}

function buscarUsuario(run) {
    const usuarios = leerUsuarios();

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i] && usuarios[i].run === run) {
            return usuarios[i];
        }
    }

    return null;
}

// Comprobamos el formato y el dígito verificador
function validarRun(run) {
    if (run === "") {
        return false;
    }

    if (run.includes(".")) {
        return false;
    }

    if (run.includes("-")) {
        return false;
    }

    if (run.length < 2) {
        return false;
    }

    const cuerpo = run.substring(0, run.length - 1);
    const digitoIngresado = run.charAt(run.length - 1).toUpperCase();
    const numeros = "0123456789";

    for (let i = 0; i < cuerpo.length; i++) {
        if (!numeros.includes(cuerpo.charAt(i))) {
            return false;
        }
    }

    let suma = 0;
    let factor = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        const numero = Number(cuerpo.charAt(i));
        suma = suma + (numero * factor);
        factor++;

        if (factor > 7) {
            factor = 2;
        }
    }

    const resultado = 11 - (suma % 11);
    let digitoCalculado = "";

    if (resultado === 11) {
        digitoCalculado = "0";
    } else if (resultado === 10) {
        digitoCalculado = "K";
    } else {
        digitoCalculado = String(resultado);
    }

    return digitoCalculado === digitoIngresado;
}

function obtenerDatosFormulario() {
    const usuario = {
        run: document.getElementById("run").value.trim().toUpperCase(),
        nombre: document.getElementById("nombre").value.trim(),
        apellidos: document.getElementById("apellidos").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        fechaNacimiento: document.getElementById("fecha-nacimiento").value,
        rol: document.getElementById("rol").value,
        region: document.getElementById("region").value,
        comuna: document.getElementById("comuna").value,
        direccion: document.getElementById("direccion").value.trim()
    };

    return usuario;
}

function validarUsuario(usuario) {
    if (usuario.run === "") {
        alert("Debe ingresar el RUN.");
        return false;
    }

    if (usuario.run.includes(".")) {
        alert("El RUN debe ingresarse sin puntos.");
        return false;
    }

    if (usuario.run.includes("-")) {
        alert("El RUN debe ingresarse sin guion.");
        return false;
    }

    if (validarRun(usuario.run) === false) {
        alert("El RUN ingresado no es válido.");
        return false;
    }

    if (usuario.nombre === "") {
        alert("Debe ingresar el nombre.");
        return false;
    }

    if (usuario.nombre.length > 50) {
        alert("El nombre no puede superar los 50 caracteres.");
        return false;
    }

    if (usuario.apellidos === "") {
        alert("Debe ingresar los apellidos.");
        return false;
    }

    if (usuario.apellidos.length > 100) {
        alert("Los apellidos no pueden superar los 100 caracteres.");
        return false;
    }

    if (usuario.correo === "") {
        alert("Debe ingresar el correo.");
        return false;
    }

    if (usuario.correo.length > 100) {
        alert("El correo no puede superar los 100 caracteres.");
        return false;
    }

    const campoCorreo = document.getElementById("correo");

    if (campoCorreo.validity.typeMismatch) {
        alert("Debe ingresar un correo válido.");
        return false;
    }

    if (usuario.rol === "") {
        alert("Debe seleccionar un rol.");
        return false;
    }

    if (usuario.region === "") {
        alert("Debe seleccionar una región.");
        return false;
    }

    if (usuario.comuna === "") {
        alert("Debe seleccionar una comuna.");
        return false;
    }

    if (usuario.direccion === "") {
        alert("Debe ingresar la dirección.");
        return false;
    }

    if (usuario.direccion.length > 300) {
        alert("La dirección no puede superar los 300 caracteres.");
        return false;
    }

    return true;
}

// Cargamos las regiones desde regiones.js
function cargarRegiones() {
    const campoRegion = document.getElementById("region");
    campoRegion.innerHTML = "";

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Seleccione una región";
    campoRegion.appendChild(opcionInicial);

    for (let i = 0; i < regiones.length; i++) {
        const opcion = document.createElement("option");
        opcion.value = regiones[i].nombre;
        opcion.textContent = regiones[i].nombre;
        campoRegion.appendChild(opcion);
    }
}

// Reemplazamos las comunas cuando cambia la región
function cargarComunas() {
    const regionSeleccionada = document.getElementById("region").value;
    const campoComuna = document.getElementById("comuna");
    campoComuna.innerHTML = "";
    campoComuna.disabled = true;

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Seleccione una comuna";
    campoComuna.appendChild(opcionInicial);

    for (let i = 0; i < regiones.length; i++) {
        if (regiones[i].nombre === regionSeleccionada) {
            for (let j = 0; j < regiones[i].comunas.length; j++) {
                const opcion = document.createElement("option");
                opcion.value = regiones[i].comunas[j];
                opcion.textContent = regiones[i].comunas[j];
                campoComuna.appendChild(opcion);
            }

            campoComuna.disabled = false;
            break;
        }
    }
}

function guardarNuevoUsuario() {
    const nuevoUsuario = obtenerDatosFormulario();

    if (validarUsuario(nuevoUsuario) === false) {
        return;
    }

    if (buscarUsuario(nuevoUsuario.run) !== null) {
        alert("Ya existe un usuario con ese RUN.");
        return;
    }

    const usuarios = leerUsuarios();
    usuarios.push(nuevoUsuario);

    if (guardarUsuarios(usuarios) === false) {
        return;
    }

    alert("Usuario creado correctamente.");
    window.location.href = "usuarios.html";
}

function cargarUsuarioEditar() {
    const parametros = new URLSearchParams(window.location.search);
    const runUsuario = parametros.get("run");

    if (runUsuario === null || runUsuario.trim() === "") {
        alert("Debe indicar el RUN del usuario en la URL.");
        return false;
    }

    usuarioOriginal = buscarUsuario(runUsuario.trim().toUpperCase());

    if (usuarioOriginal === null) {
        alert("No se encontró el usuario.");
        return false;
    }

    document.getElementById("region").value = usuarioOriginal.region;
    cargarComunas();
    document.getElementById("comuna").value = usuarioOriginal.comuna;

    document.getElementById("run").value = usuarioOriginal.run;
    document.getElementById("run").readOnly = true;
    document.getElementById("nombre").value = usuarioOriginal.nombre;
    document.getElementById("apellidos").value = usuarioOriginal.apellidos;
    document.getElementById("correo").value = usuarioOriginal.correo;
    document.getElementById("rol").value = usuarioOriginal.rol;
    document.getElementById("direccion").value = usuarioOriginal.direccion;

    let fechaNacimiento = "";
    if (usuarioOriginal.fechaNacimiento !== null && usuarioOriginal.fechaNacimiento !== undefined) {
        fechaNacimiento = usuarioOriginal.fechaNacimiento;
    }

    document.getElementById("fecha-nacimiento").value = fechaNacimiento;

    return true;
}

function guardarUsuarioEditado() {
    if (usuarioOriginal === null) {
        alert("No se encontró el usuario.");
        return;
    }

    const datosFormulario = obtenerDatosFormulario();
    datosFormulario.run = usuarioOriginal.run;

    if (validarUsuario(datosFormulario) === false) {
        return;
    }

    const usuarioActualizado = {
        run: usuarioOriginal.run,
        nombre: datosFormulario.nombre,
        apellidos: datosFormulario.apellidos,
        correo: datosFormulario.correo,
        fechaNacimiento: datosFormulario.fechaNacimiento,
        rol: datosFormulario.rol,
        region: datosFormulario.region,
        comuna: datosFormulario.comuna,
        direccion: datosFormulario.direccion
    };

    const usuarios = leerUsuarios();
    let encontrado = false;

    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i] && usuarios[i].run === usuarioActualizado.run) {
            usuarios[i] = usuarioActualizado;
            encontrado = true;
            break;
        }
    }

    if (encontrado === false) {
        alert("No se encontró el usuario.");
        return;
    }

    if (guardarUsuarios(usuarios) === false) {
        return;
    }

    alert("Usuario actualizado correctamente.");
    window.location.href = "usuarios.html";
}

function guardarUsuario(event) {
    event.preventDefault();

    if (formularioPreparado === false) {
        return;
    }

    const formulario = document.getElementById("formulario-usuario");

    if (formulario.getAttribute("data-modo") === "editar") {
        guardarUsuarioEditado();
    } else {
        guardarNuevoUsuario();
    }
}

function iniciarFormularioUsuario() {
    const formulario = document.getElementById("formulario-usuario");
    const botonGuardar = document.getElementById("guardar-usuario");
    const mensaje = document.getElementById("mensaje-formulario");
    const aviso = document.getElementById("integracion-pendiente");
    const ayudaComuna = document.getElementById("ayuda-comuna");

    if (!formulario || !botonGuardar) {
        return;
    }

    usuarioOriginal = null;
    formularioPreparado = false;
    botonGuardar.disabled = true;
    formulario.onsubmit = guardarUsuario;

    const campos = [
        "run",
        "nombre",
        "apellidos",
        "correo",
        "fecha-nacimiento",
        "rol",
        "region",
        "comuna",
        "direccion"
    ];

    for (let i = 0; i < campos.length; i++) {
        if (!document.getElementById(campos[i])) {
            if (mensaje) {
                mensaje.textContent = "Falta el campo " + campos[i] + " en el formulario.";
            }

            return;
        }
    }

    if (typeof regiones === "undefined" || !Array.isArray(regiones)) {
        if (mensaje) {
            mensaje.textContent = "No se pudieron cargar las regiones. Comprueba que regiones.js se cargue primero.";
        }

        return;
    }

    // La fecha es opcional y las validaciones se realizan en validarUsuario.
    document.getElementById("fecha-nacimiento").required = false;
    formulario.noValidate = true;

    cargarRegiones();
    document.getElementById("region").onchange = cargarComunas;

    const modo = formulario.getAttribute("data-modo");

    if (modo === "editar") {
        if (cargarUsuarioEditar() === false) {
            if (mensaje) {
                mensaje.textContent = "No se puede editar el usuario. Revisa el RUN de la URL.";
            }

            return;
        }
    } else if (modo === "nuevo") {
        formulario.reset();
        cargarComunas();
    } else {
        if (mensaje) {
            mensaje.textContent = "No se pudo identificar el modo del formulario.";
        }

        return;
    }

    formularioPreparado = true;
    botonGuardar.disabled = false;

    if (mensaje) {
        mensaje.textContent = "Formulario preparado para guardar.";
    }

    if (aviso) {
        aviso.textContent = "Completa los datos y presiona guardar.";
        aviso.hidden = true;
    }

    if (ayudaComuna) {
        ayudaComuna.textContent = "Seleccione una región para habilitar sus comunas.";
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarFormularioUsuario);
} else {
    iniciarFormularioUsuario();
}