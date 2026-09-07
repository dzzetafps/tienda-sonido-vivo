const formulario = document.getElementById("formulario-registro");

const run = document.getElementById("run");
const nombre = document.getElementById("nombre");
const apellidos = document.getElementById("apellidos");
const correo = document.getElementById("correo");
const fechaNacimiento = document.getElementById("fecha-nacimiento");
const region  = document.getElementById("region");
const comuna  = document.getElementById("comuna");
const direccion  = document.getElementById("direccion");  


const errorRun = document.getElementById("error-run");
const errorNombre = document.getElementById("error-nombre");
const errorApellidos = document.getElementById("error-apellidos");
const errorCorreo = document.getElementById("error-correo");
const errorRegion = document.getElementById("error-region");
const errorComuna = document.getElementById("error-comuna");
const errorDireccion = document.getElementById("error-direccion");



const regionesComunas = [
    {
        region: "Region de Valparaiso",
        comunas:[
            "Valparaiso",
            "Viña del Mar",
            "Quilpue",
            "Villa Alemana",
            "Concon",
            "Quillota",
            "San Antonio",
        ]

    },
    {
        region: "Region Metropolitana",
        comunas: [
            "Santiago",
            "Providencia",
            "Las Condes",
            "Ñuñoa",
            "Maipu",
            "Puente Alto",
            "La Florida",
            "Quilicura",
            "Colina"
            
        ]
    },
    {
        region: "Region del Maule",
        comunas: [
            "Talca",
            "Curico",
            "Linares",
            "Cauquenes",

        ]
    },

    {
        region: "Region del BioBio",
        comunas: [
            "Concepcion",
            "Talcahuano",
            "San Pedro de la Paz",
            "Los Angeles",
            "Coronel"       
        ]
    }
];

function cargarRegiones(){
        regionesComunas.forEach(function(item){

            const opcion = document.createElement("option");
            opcion.value = item.region
            opcion.textContent = item.region;

            region.appendChild(opcion);
        });
}
    cargarRegiones();

    region.addEventListener("change", function (){

        comuna.innerHTML = '<option value="">Selecciona una comuna</option>';
        const regionSeleccionada = regionesComunas.find(
            function (item){
                return item.region === region.value;
            }
        );

        if(!regionSeleccionada){
            return;
        }
        regionSeleccionada.comunas.forEach(function(nombreComuna){
            
            const opcion = document.createElement("option");
            
            opcion.value = nombreComuna;
            opcion.textContent= nombreComuna;
            
            comuna.appendChild(opcion);

        });
    });


    formulario.addEventListener("submit",function(evento){
        evento.preventDefault();
        
        let formularioValido = true;

        errorRun.textContent = "";
        errorNombre.textContent = "";
        errorApellidos.textContent = "";
        errorCorreo.textContent = "";
        errorRegion.textContent = "";
        errorComuna.textContent = "";
        errorDireccion.textContent = "";
        
        const runIngresado = run.value.trim().toUpperCase();

        if(runIngresado === ""){
            errorRun.textContent = "El rut es Obligatorio"
            formularioValido = false;

        } else if (!validarRun(runIngresado)){
            errorRun.textContent = "El rut ingresado no es valido"
            formularioValido = false;
        }

        function validarRun(runIngresado){

        const runLimpio = runIngresado.trim().toUpperCase();

        if(runLimpio.length < 7 ||  runLimpio.length > 9){
            return false;
        }

        const formatoRun = /^[0-9]+[0-9K]$/;
        
        if(!formatoRun.test(runLimpio)){
            return false;
        }

        const cuerpo = runLimpio.slice(0, -1);
        const digitoIngresado = runLimpio.slice(-1);

        let suma = 0;
        let multiplicador = 2;

        for(let i = cuerpo.length - 1; i >= 0; i--){

            suma += Number(cuerpo[i]) * multiplicador;

            multiplicador++;

            if(multiplicador > 7){
                multiplicador = 2;
            }
        }
        const resto = 11 - (suma % 11);

        let digitoCalculado;

        if(resto === 11){
            digitoCalculado = "0";
            
        } else if (resto === 10) {

            digitoCalculado = "K";
        
        } else {

            digitoCalculado = String(resto);
        }

        return digitoCalculado === digitoIngresado;
        
    }

    const nombreIngresado  = nombre.value.trim(); 
    
    if(nombreIngresado === ""){

        errorNombre.textContent = "El nombre es Obligatorio"
        formularioValido = false;

    } else if (nombreIngresado.length > 50){
        
        errorNombre.textContent = "El nombre no puede ser mayor a 50 caracteres";
        formularioValido = false;
    }

    const apellidoIngresado = apellidos.value.trim();

    if(apellidoIngresado === ""){
        errorApellidos.textContent = "Los apellido es Obligatorio"
        formularioValido = false;

    } else if (apellidoIngresado.length > 100){
        errorApellidos.textContent = "El apellido no puede ser mayor a 100 caracteres"
        formularioValido = false;
    }

    const correoIngresado = correo.value.trim().toLowerCase()

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(correoIngresado === "") {
        errorCorreo.textContent = "El correo es Obligatorio"
        formularioValido = false;
    
    } else if (!formatoCorreo.test(correoIngresado)){
        errorCorreo.textContent = "Ingrese un correo electronico valido"
        formularioValido = false;

    } else if (correoIngresado.length > 100){
        errorCorreo.textContent = "El correo no puede superar los 100 caracteres"
        formularioValido = false;

    } else if (
        !correoIngresado.endsWith("@duocuc.cl") &&
        !correoIngresado.endsWith("@profesor.duoc.cl") &&
        !correoIngresado.endsWith("@gmail.com") 
        
    ) {
        errorCorreo.textContent = "El correo debe ser @duocuc.cl, @profesor.duoc.cl o @gmail.com"
        formularioValido = false;
    }
     
    if(region.value === ""){
        errorRegion.textContent = "Debes seleccionar una region"
        formularioValido = false;
    
    }

    if(comuna.value === ""){
        errorComuna.textContent = "Debe seleccionar una comuna"
        formularioValido = false;
    }

    const direccionIngresada = direccion.value.trim();

    if(direccionIngresada === ""){
        errorDireccion.textContent = "La direccion es Obligatoria"
        formularioValido = false;

    } else if (direccionIngresada.length > 300){
        errorDireccion.textContent = "La direccion no puede ser mayor a 300 caracteres"
        formularioValido = false;   
    }

    if(formularioValido){
        alert("Usuario registrado con exito")
    }
});
    

