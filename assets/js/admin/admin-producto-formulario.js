"use strict";

let productoOriginal = null;
let formularioPreparado = false;

// Recuperamos los productos guardados
function leerProductosAdmin() {
    let productosAdmin = [];

    try {
        const productosGuardados = localStorage.getItem("sonidoVivoProductosAdmin");

        if (productosGuardados !== null) {
            productosAdmin = JSON.parse(productosGuardados);
        }
    } catch {
        productosAdmin = [];
    }

    if (!Array.isArray(productosAdmin)) {
        productosAdmin = [];
    }

    return productosAdmin;
}

// Guardamos el arreglo como texto
function guardarProductosAdmin(productosAdmin) {
    try {
        localStorage.setItem(
            "sonidoVivoProductosAdmin",
            JSON.stringify(productosAdmin)
        );
        return true;
    } catch {
        alert("No se pudo guardar el producto. Revisa que el almacenamiento esté disponible.");
        return false;
    }
}

// Cargamos las categorías oficiales
function cargarCategorias() {
    const campoCategoria = document.getElementById("categoria");
    const categorias = [];

    for (let i = 0; i < productos.length; i++) {
        const categoria = productos[i].categoria;

        if (typeof categoria === "string" && categoria.trim() !== "" && !categorias.includes(categoria)) {
            categorias.push(categoria);
        }
    }

    categorias.sort();
    campoCategoria.innerHTML = "";

    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = "Seleccione una categoría";
    campoCategoria.appendChild(opcionInicial);

    for (let i = 0; i < categorias.length; i++) {
        const opcion = document.createElement("option");
        opcion.value = categorias[i];
        opcion.textContent = categorias[i];
        campoCategoria.appendChild(opcion);
    }
}

function buscarProducto(codigo) {
    const productosAdmin = leerProductosAdmin();

    // La última versión coincide con la que muestra el listado.
    for (let i = productosAdmin.length - 1; i >= 0; i--) {
        if (productosAdmin[i] && productosAdmin[i].codigo === codigo) {
            return productosAdmin[i];
        }
    }

    for (let i = 0; i < productos.length; i++) {
        if (productos[i].codigo === codigo) {
            return productos[i];
        }
    }

    return null;
}

// Obtenemos los valores de los campos
function obtenerDatosFormulario() {
    const producto = {
        codigo: document.getElementById("codigo").value.trim(),
        categoria: document.getElementById("categoria").value,
        nombre: document.getElementById("nombre").value.trim(),
        marca: document.getElementById("marca").value.trim(),
        modelo: document.getElementById("modelo").value.trim(),
        precio: Number(document.getElementById("precio").value),
        stock: Number(document.getElementById("stock").value),
        descripcion: document.getElementById("descripcion").value.trim()
    };

    return producto;
}

function validarProducto(producto) {
    if (producto.codigo === "") {
        alert("Debe ingresar un código.");
        return false;
    }

    if (producto.nombre === "") {
        alert("Debe ingresar un nombre.");
        return false;
    }

    if (producto.categoria === "") {
        alert("Debe seleccionar una categoría.");
        return false;
    }

    if (producto.marca === "") {
        alert("Debe ingresar una marca.");
        return false;
    }

    if (producto.modelo === "") {
        alert("Debe ingresar un modelo.");
        return false;
    }

    if (document.getElementById("precio").value.trim() === "") {
        alert("Debe ingresar un precio.");
        return false;
    }

    if (!Number.isFinite(producto.precio) || producto.precio <= 0) {
        alert("El precio debe ser un número mayor que 0.");
        return false;
    }

    if (document.getElementById("stock").value.trim() === "") {
        alert("Debe ingresar el stock.");
        return false;
    }

    if (!Number.isInteger(producto.stock) || producto.stock < 0) {
        alert("El stock debe ser un número entero igual o mayor que 0.");
        return false;
    }

    if (document.getElementById("descripcion").required && producto.descripcion === "") {
        alert("Debe ingresar una descripción.");
        return false;
    }

    return true;
}

// Cargamos el producto que indica la URL
function cargarProductoEditar() {
    const parametros = new URLSearchParams(window.location.search);
    const codigoProducto = parametros.get("codigo");

    if (codigoProducto === null || codigoProducto.trim() === "") {
        alert("Debe indicar el código del producto en la URL.");
        return false;
    }

    productoOriginal = buscarProducto(codigoProducto);

    if (productoOriginal === null) {
        alert("No se encontró el producto.");
        return false;
    }

    const campoCategoria = document.getElementById("categoria");
    let categoriaEncontrada = false;

    for (let i = 0; i < campoCategoria.options.length; i++) {
        if (campoCategoria.options[i].value === productoOriginal.categoria) {
            categoriaEncontrada = true;
            break;
        }
    }

    // Conservamos una categoría administrativa que no esté en los oficiales.
    if (categoriaEncontrada === false && typeof productoOriginal.categoria === "string" && productoOriginal.categoria.trim() !== "") {
        const opcion = document.createElement("option");
        opcion.value = productoOriginal.categoria;
        opcion.textContent = productoOriginal.categoria;
        campoCategoria.appendChild(opcion);
    }

    document.getElementById("codigo").value = productoOriginal.codigo;
    document.getElementById("codigo").readOnly = true;
    campoCategoria.value = productoOriginal.categoria;
    document.getElementById("nombre").value = productoOriginal.nombre;
    document.getElementById("marca").value = productoOriginal.marca;
    document.getElementById("modelo").value = productoOriginal.modelo;
    document.getElementById("precio").value = productoOriginal.precio;
    document.getElementById("stock").value = productoOriginal.stock;
    document.getElementById("descripcion").value = productoOriginal.descripcion;

    return true;
}

function guardarNuevoProducto() {
    const nuevoProducto = obtenerDatosFormulario();

    if (validarProducto(nuevoProducto) === false) {
        return;
    }

    if (buscarProducto(nuevoProducto.codigo) !== null) {
        alert("Ya existe un producto con ese código.");
        return;
    }

    const productosAdmin = leerProductosAdmin();
    productosAdmin.push(nuevoProducto);

    if (guardarProductosAdmin(productosAdmin) === false) {
        return;
    }

    alert("Producto creado correctamente.");
    window.location.href = "productos.html";
}

function guardarProductoEditado() {
    if (productoOriginal === null) {
        alert("No se encontró el producto.");
        return;
    }

    const datosFormulario = obtenerDatosFormulario();
    datosFormulario.codigo = productoOriginal.codigo;

    if (validarProducto(datosFormulario) === false) {
        return;
    }

    // Creamos el producto con los datos actualizados.
    const productoActualizado = {
        codigo: productoOriginal.codigo,
        categoria: datosFormulario.categoria,
        nombre: datosFormulario.nombre,
        marca: datosFormulario.marca,
        modelo: datosFormulario.modelo,
        precio: datosFormulario.precio,
        stock: datosFormulario.stock,
        descripcion: datosFormulario.descripcion
    };

    // Conservamos la imagen si el producto ya tenía una.
    if (productoOriginal.imagen !== undefined) {
        productoActualizado.imagen = productoOriginal.imagen;
    }

    const productosAdmin = leerProductosAdmin();
    let encontrado = false;

    // Buscamos si ya existe una versión administrativa.
    for (let i = 0; i < productosAdmin.length; i++) {
        if (productosAdmin[i] && productosAdmin[i].codigo === productoActualizado.codigo) {
            productosAdmin[i] = productoActualizado;
            encontrado = true;
            break;
        }
    }

    // Si todavía no había sido editado, lo agregamos.
    if (encontrado === false) {
        productosAdmin.push(productoActualizado);
    }

    if (guardarProductosAdmin(productosAdmin) === false) {
        return;
    }

    alert("Producto actualizado correctamente.");
    window.location.href = "productos.html";
}

function guardarProducto(event) {
    event.preventDefault();

    if (formularioPreparado === false) {
        return;
    }

    const formulario = document.getElementById("formulario-producto");

    if (formulario.getAttribute("data-modo") === "editar") {
        guardarProductoEditado();
    } else {
        guardarNuevoProducto();
    }
}

function iniciarFormularioProducto() {
    const formulario = document.getElementById("formulario-producto");
    const botonGuardar = document.getElementById("guardar-producto");
    const mensaje = document.getElementById("mensaje-formulario");
    const aviso = document.getElementById("integracion-pendiente");

    if (!formulario || !botonGuardar) {
        return;
    }

    formularioPreparado = false;
    productoOriginal = null;
    botonGuardar.disabled = true;
    formulario.onsubmit = guardarProducto;

    const campos = ["codigo", "categoria", "nombre", "marca", "modelo", "precio", "stock", "descripcion"];

    for (let i = 0; i < campos.length; i++) {
        if (!document.getElementById(campos[i])) {
            if (mensaje) {
                mensaje.textContent = "Falta el campo " + campos[i] + " en el formulario.";
            }
            return;
        }
    }

    if (typeof productos === "undefined" || !Array.isArray(productos)) {
        if (mensaje) {
            mensaje.textContent = "No se pudo cargar el catálogo. Comprueba que productos.js se cargue primero.";
        }
        return;
    }

    cargarCategorias();
    const modo = formulario.getAttribute("data-modo");

    if (modo === "editar") {
        if (cargarProductoEditar() === false) {
            if (mensaje) {
                mensaje.textContent = "No se puede editar el producto. Revisa el código de la URL.";
            }
            return;
        }
    } else if (modo === "nuevo") {
        formulario.reset();
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
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarFormularioProducto, { once: true });
} else {
    iniciarFormularioProducto();
}
