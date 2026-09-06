const formulario = document.getElementById("formulario-login");

const correo = document.getElementById("correo");
const contrasena = document.getElementById("contrasena");

const errorCorreo = document.getElementById("error-correo");
const errorContrasena = document.getElementById("error-contrasena");

formulario.addEventListener("submit", function (evento) {

    evento.preventDefault();

    let formularioValido = true;

    errorCorreo.textContent = "";
    errorContrasena.textContent = "";

    const correoIngresado = correo.value.trim().toLowerCase();

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(correoIngresado === ""){
    
        errorCorreo.textContent = "El correo es obligatorio"
        formularioValido = false;
    
    } else if (!formatoCorreo.test(correoIngresado)){
    
        errorCorreo.textContent = "Ingresa un correo electronico valido"
        formularioValido = false;
    
    } else if (correoIngresado.length > 100){
       
        errorCorreo.textContent = "El correo no puede superar los 100 caracteres"
        formularioValido = false;
    
    } else if (
        !correoIngresado.endsWith("@duoc.cl") &&
        !correoIngresado.endsWith("@profesor.duoc.cl") &&
        !correoIngresado.endsWith("@gmail.com")
    ) {
        errorCorreo.textContent = "El correo debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com";
        formularioValido = false;
    }


    if (contrasena.value.trim() === ""){
        errorContrasena.textContent = "La contraseña es obligatoria"
        
        formularioValido = false;

    } else if (
        
        contrasena.value.length < 4 ||
        contrasena.value.length > 10 
    ){
        errorContrasena.textContent = "Error la contraseña debe tener entre 4 y 10 caracteres ";
        formularioValido = false;
    }

    if (formularioValido){
        alert("Inicio de sesion Exitoso")

    }
}); 