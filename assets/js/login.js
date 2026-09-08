"use strict";

const formulario = document.getElementById("formulario-login");

const correo = document.getElementById("correo");
const contrasena = document.getElementById("contrasena");

const errorCorreo = document.getElementById("error-correo");
const errorContrasena = document.getElementById("error-contrasena");


//   USUARIOS DE PRUEBA //

const USUARIOS_LOGIN = [
    {
        correo: "admin@duoc.cl",
        contrasena: "admin123",
        nombre: "Administrador",
        rol: "administrador"
    },
    {
        correo: "vendedor@duoc.cl",
        contrasena: "vend123",
        nombre: "Vendedor",
        rol: "vendedor"
    },
    {
        correo: "cliente@gmail.com",
        contrasena: "cliente1",
        nombre: "Cliente",
        rol: "cliente"
    }
];


   // LOGIN //

formulario.addEventListener("submit", function (evento) {

    evento.preventDefault();

    let formularioValido = true;

    errorCorreo.textContent = "";
    errorContrasena.textContent = "";

    const correoIngresado =
        correo.value.trim().toLowerCase();

    const contrasenaIngresada =
        contrasena.value;

    const formatoCorreo =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    /* VALIDAR CORREO */

    if (correoIngresado === "") {

        errorCorreo.textContent =
            "El correo es obligatorio";

        formularioValido = false;

    } else if (!formatoCorreo.test(correoIngresado)) {

        errorCorreo.textContent =
            "Ingresa un correo electrónico válido";

        formularioValido = false;

    } else if (correoIngresado.length > 100) {

        errorCorreo.textContent =
            "El correo no puede superar los 100 caracteres";

        formularioValido = false;

    } else if (
        !correoIngresado.endsWith("@duoc.cl") &&
        !correoIngresado.endsWith("@profesor.duoc.cl") &&
        !correoIngresado.endsWith("@gmail.com")
    ) {

        errorCorreo.textContent =
            "El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com";

        formularioValido = false;
    }


    /* VALIDAR CONTRASEÑA */

    if (contrasenaIngresada.trim() === "") {

        errorContrasena.textContent =
            "La contraseña es obligatoria";

        formularioValido = false;

    } else if (
        contrasenaIngresada.length < 4 ||
        contrasenaIngresada.length > 10
    ) {

        errorContrasena.textContent =
            "La contraseña debe tener entre 4 y 10 caracteres";

        formularioValido = false;
    }


    if (!formularioValido) {
        return;
    }

    // BUSCAR USUARIO //

    const usuarioEncontrado =
        USUARIOS_LOGIN.find(function (usuario) {

            return (
                usuario.correo === correoIngresado &&
                usuario.contrasena === contrasenaIngresada
            );

        });


    if (!usuarioEncontrado) {

        errorContrasena.textContent =
            "Correo o contraseña incorrectos";

        return;
    }


    //  GUARDAR SESIÓN //

    const sesion = {
        correo: usuarioEncontrado.correo,
        nombre: usuarioEncontrado.nombre,
        rol: usuarioEncontrado.rol
    };


    localStorage.setItem(
        "sesionSonidoVivo",
        JSON.stringify(sesion)
    );


    //  REDIRECCIÓN SEGÚN ROL //

    if (usuarioEncontrado.rol === "administrador") {

        alert(
            "Bienvenido al panel de administración"
        );

        window.location.href =
            "../admin/index.html";

    } else {

        alert(
            "Inicio de sesión exitoso"
        );

        window.location.href =
            "../index.html";
    }

});