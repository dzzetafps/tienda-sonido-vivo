const formulario = document.getElementById("formulario-contacto");

const nombre = document.getElementById("nombre");
const correo = document.getElementById("correo");
const comentario = document.getElementById("comentario");

const errorNombre = document.getElementById("error-nombre")
const errorCorreo = document.getElementById("error-correo")
const errorComentario = document.getElementById("error-comentario")

formulario.addEventListener("submit",function(evento){
    
    evento.preventDefault();

    let formularioValido = true;

    errorNombre.textContent = "";
    errorCorreo.textContent = "";
    errorComentario.textContent = "";

    const nombreIngresado = nombre.value.trim();
    

    if(nombreIngresado === ""){

        errorNombre.textContent = "El nombre es Obligatorio";
        formularioValido = false;

    } else if (nombreIngresado.length > 100){
        
        errorNombre.textContent = "El nombre no puede tener mas de 100 caracteres";
        formularioValido = false;
    }

    const correoIngresado = correo.value.trim().toLowerCase();
    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(correoIngresado === ""){
        errorCorreo.textContent = "El correo es Obligatorio"
        formularioValido = false;

    } else if (!formatoCorreo.test(correoIngresado)){
        errorCorreo.textContent = "Ingrese un correo electronico valido"
        formularioValido = false;

    } else if (correoIngresado.length > 100){
        errorCorreo.textContent = "El correo no puede tener mas de 100 caracteres"
        formularioValido = false;
    } else if (
        !correoIngresado.endsWith("@duocuc.cl") &&
        !correoIngresado.endsWith("@profesor.duoc.cl") &&
        !correoIngresado.endsWith("@gmail.com") 

    ){
        errorCorreo.textContent = "El correo debe ser @duocuc.cl, @profesor.duoc.cl o @gmail.com"
        formularioValido = false;
    }

    const comentarioIngresado = comentario.value.trim();

    if (comentarioIngresado === "") {
        errorComentario.textContent = "El comentario es Obligatorio"
        formularioValido = false;
    
    } else if (comentarioIngresado.length > 500) {
        errorComentario.textContent = "El comentario no puede tener mas de 500 caracteres"
        formularioValido = false;
    }
    if(formularioValido){
        alert("Comentario registrado con exito")
    }
})