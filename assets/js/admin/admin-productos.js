"use strict";

const formatoPrecio = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});

// Recuperamos los productos guardados
function leerProductosAdmin() {
    let productosAdmin = [];

    try {
        const productosGuardados = localStorage.getItem("sonidoVivoProductosAdmin");

        if (productosGuardados !== null) {
            productosAdmin = JSON.parse(productosGuardados);
        }
    } catch {
        // Si los datos no se pueden leer, usamos solamente los oficiales.
        productosAdmin = [];
    }

    if (!Array.isArray(productosAdmin)) {
        productosAdmin = [];
    }

    return productosAdmin;
}

// Combinamos los productos oficiales
function combinarProductos(oficiales) {
    const listado = [];

    for (let i = 0; i < oficiales.length; i++) {
        listado.push(oficiales[i]);
    }

    const productosAdmin = leerProductosAdmin();

    for (let i = 0; i < productosAdmin.length; i++) {
        const producto = productosAdmin[i];

        if (!producto || typeof producto.codigo !== "string" || producto.codigo.trim() === "") {
            continue;
        }

        let encontrado = false;

        for (let j = 0; j < listado.length; j++) {
            if (listado[j].codigo === producto.codigo) {
                listado[j] = producto;
                encontrado = true;
                break;
            }
        }

        if (encontrado === false) {
            listado.push(producto);
        }
    }

    return listado;
}

function normalizarTexto(valor) {
    if (valor === null || valor === undefined) {
        return "";
    }

    return String(valor).trim().toLowerCase();
}

// Cargamos las categorías
function cargarCategorias(filtro, listado) {
    if (!filtro) {
        return;
    }

    const categorias = [];

    for (let i = 0; i < listado.length; i++) {
        const categoria = listado[i].categoria;

        if (typeof categoria === "string" && categoria.trim() !== "" && !categorias.includes(categoria)) {
            categorias.push(categoria);
        }
    }

    categorias.sort();
    filtro.innerHTML = "";

    const todas = document.createElement("option");
    todas.value = "";
    todas.textContent = "Todas las categorías";
    filtro.appendChild(todas);

    for (let i = 0; i < categorias.length; i++) {
        const opcion = document.createElement("option");
        opcion.value = categorias[i];
        opcion.textContent = categorias[i];
        filtro.appendChild(opcion);
    }
}

// Creamos una fila de la tabla
function crearFila(producto) {
    const fila = document.createElement("tr");

    let precio = "—";
    if (Number.isFinite(producto.precio)) {
        precio = formatoPrecio.format(producto.precio);
    }

    let stock = producto.stock;
    if (stock === 0) {
        stock = "Sin stock";
    }

    const valores = [
        producto.codigo,
        producto.nombre,
        producto.categoria,
        producto.marca,
        producto.modelo,
        precio,
        stock
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
    const enlace = document.createElement("a");
    enlace.href = "editar-producto.html?codigo=" + encodeURIComponent(producto.codigo);
    enlace.textContent = "Editar";
    enlace.setAttribute("aria-label", "Editar producto " + producto.codigo);
    acciones.appendChild(enlace);
    fila.appendChild(acciones);

    return fila;
}

function iniciarListado() {
    const tabla = document.getElementById("tabla-productos");
    const buscador = document.getElementById("buscar-productos");
    const filtro = document.getElementById("filtro-categoria");
    const estado = document.getElementById("estado-productos");
    const sinResultados = document.getElementById("sin-resultados-productos");
    const aviso = document.getElementById("integracion-pendiente");

    if (!tabla) {
        if (estado) {
            estado.textContent = "No se encontró la tabla de productos.";
        }
        return;
    }

    if (typeof productos === "undefined" || !Array.isArray(productos)) {
        if (estado) {
            estado.textContent = "No se pudo cargar el catálogo de productos.";
        }
        return;
    }

    const listado = combinarProductos(productos);
    cargarCategorias(filtro, listado);

    // Filtramos los productos
    function actualizarListado() {
        let texto = "";
        if (buscador) {
            texto = normalizarTexto(buscador.value);
        }

        let categoria = "";
        if (filtro) {
            categoria = filtro.value;
        }

        const coincidencias = [];

        for (let i = 0; i < listado.length; i++) {
            const producto = listado[i];

            const coincideTexto =
                normalizarTexto(producto.codigo).includes(texto) ||
                normalizarTexto(producto.nombre).includes(texto) ||
                normalizarTexto(producto.marca).includes(texto) ||
                normalizarTexto(producto.modelo).includes(texto);

            let coincideCategoria = true;

            if (categoria !== "") {
                coincideCategoria = producto.categoria === categoria;
            }

            if (coincideTexto && coincideCategoria) {
                coincidencias.push(producto);
            }
        }

        tabla.innerHTML = "";

        for (let i = 0; i < coincidencias.length; i++) {
            tabla.appendChild(crearFila(coincidencias[i]));
        }

        if (estado) {
            estado.textContent = "Mostrando " + coincidencias.length + " de " + listado.length + " productos.";
        }

        if (sinResultados) {
            sinResultados.hidden = coincidencias.length > 0;
            sinResultados.textContent = "No se encontraron productos que coincidan con la búsqueda y la categoría seleccionadas.";
        }
    }

    if (aviso) {
        aviso.textContent = "Catálogo cargado. Busca por código, nombre, marca o modelo y filtra por categoría.";
        aviso.hidden = true;
    }

    if (buscador) {
        buscador.oninput = actualizarListado;
    }

    if (filtro) {
        filtro.onchange = actualizarListado;
    }

    actualizarListado();
}

// Esperamos al HTML si todavía se está cargando.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarListado, { once: true });
} else {
    iniciarListado();
}
