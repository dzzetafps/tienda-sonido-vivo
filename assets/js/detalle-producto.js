function iniciarDetalleProducto() {
    "use strict";

    const detalleProducto = document.getElementById("detalle-producto");
    const estadoDetalle = document.getElementById("estado-detalle");
    const categoriaProducto = document.getElementById("producto-categoria");
    const nombreProducto = document.getElementById("producto-nombre");
    const marcaProducto = document.getElementById("producto-marca");
    const modeloProducto = document.getElementById("producto-modelo");
    const codigoProductoTexto = document.getElementById("producto-codigo");
    const descripcionProducto = document.getElementById("producto-descripcion");
    const precioProducto = document.getElementById("producto-precio");
    const stockProducto = document.getElementById("producto-stock");

    if (!detalleProducto || !estadoDetalle || !categoriaProducto || !nombreProducto ||
        !marcaProducto || !modeloProducto || !codigoProductoTexto || !descripcionProducto ||
        !precioProducto || !stockProducto) {
        console.error("No se encontraron los elementos necesarios para mostrar el detalle.");
        return;
    }

    function mostrarError(mensaje) {
        detalleProducto.hidden = true;
        estadoDetalle.textContent = mensaje;
        estadoDetalle.hidden = false;
    }

    function obtenerTexto(valor) {
        if (typeof valor === "string" && valor.trim() !== "") {
            return valor.trim();
        }
        return "No informado";
    }

    // Obtiene el código desde la URL.
    const parametros = new URLSearchParams(window.location.search);
    const codigoProducto = parametros.get("codigo");

    if (codigoProducto === null || codigoProducto.trim() === "") {
        mostrarError("No se indicó un producto para mostrar.");
        return;
    }

    if (typeof productos === "undefined" || !Array.isArray(productos) || productos.length === 0) {
        mostrarError("No fue posible cargar los productos. Intenta recargar la página más tarde.");
        console.error("La fuente del detalle debe contener un arreglo de productos no vacío.");
        return;
    }

    // Busca el producto por código en la fuente compartida.
    const productoEncontrado = productos.find(function (producto) {
        if (producto === null || typeof producto !== "object" || Array.isArray(producto)) {
            return false;
        }
        return producto.codigo === codigoProducto.trim();
    });

    if (!productoEncontrado) {
        mostrarError("El producto solicitado no fue encontrado.");
        return;
    }

    // Muestra los datos del producto como texto.
    categoriaProducto.textContent = obtenerTexto(productoEncontrado.categoria);
    nombreProducto.textContent = obtenerTexto(productoEncontrado.nombre);
    marcaProducto.textContent = obtenerTexto(productoEncontrado.marca);
    modeloProducto.textContent = obtenerTexto(productoEncontrado.modelo);
    codigoProductoTexto.textContent = obtenerTexto(productoEncontrado.codigo);
    descripcionProducto.textContent = obtenerTexto(productoEncontrado.descripcion);

    const formateadorPrecioCLP = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });

    if (Number.isFinite(productoEncontrado.precio) && productoEncontrado.precio >= 0) {
        precioProducto.textContent = formateadorPrecioCLP.format(productoEncontrado.precio);
    } else {
        precioProducto.textContent = "Precio no disponible";
    }

    if (!Number.isInteger(productoEncontrado.stock) || productoEncontrado.stock < 0) {
        stockProducto.textContent = "Stock no informado";
    } else if (productoEncontrado.stock === 0) {
        stockProducto.textContent = "Sin stock";
    } else {
        stockProducto.textContent = "Stock disponible: " + productoEncontrado.stock;
    }

    estadoDetalle.textContent = "";
    estadoDetalle.hidden = true;
    detalleProducto.hidden = false;
}

iniciarDetalleProducto();
