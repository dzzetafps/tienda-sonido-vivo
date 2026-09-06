"use strict";

const formatoPrecioCarrito = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});

// Recuperamos el carrito guardado.
function obtenerCarrito() {
    let carrito = [];
    const carritoGuardado = localStorage.getItem("sonidoVivoCarrito");

    if (carritoGuardado !== null) {
        carrito = JSON.parse(carritoGuardado);
    }

    if (!Array.isArray(carrito)) {
        carrito = [];
    }

    return carrito;
}

// Guardamos el carrito en LocalStorage.
function guardarCarrito(carrito) {
    localStorage.setItem("sonidoVivoCarrito", JSON.stringify(carrito));
}

function agregarAlCarrito() {
    const parametros = new URLSearchParams(window.location.search);
    const codigoProducto = parametros.get("codigo");

    if (codigoProducto === null || codigoProducto.trim() === "") {
        alert("No se indicó un producto para agregar.");
        return;
    }

    if (typeof productos === "undefined" || !Array.isArray(productos)) {
        alert("No fue posible cargar los productos.");
        return;
    }

    // Buscamos el producto seleccionado en el arreglo oficial.
    let productoSeleccionado;

    for (let i = 0; i < productos.length; i++) {
        if (productos[i] !== null && typeof productos[i] === "object" &&
            productos[i].codigo === codigoProducto.trim()) {
            productoSeleccionado = productos[i];
            break;
        }
    }

    if (productoSeleccionado === undefined) {
        alert("No se encontró el producto.");
        return;
    }

    if (productoSeleccionado.stock === 0) {
        alert("Este producto no tiene stock disponible.");
        return;
    }

    if (!Number.isInteger(productoSeleccionado.stock) || productoSeleccionado.stock < 0) {
        alert("El stock de este producto no está disponible.");
        return;
    }

    if (!Number.isFinite(productoSeleccionado.precio) || productoSeleccionado.precio < 0) {
        alert("El precio de este producto no está disponible.");
        return;
    }

    const carrito = obtenerCarrito();

    let indiceProducto = -1;

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo === productoSeleccionado.codigo) {
            indiceProducto = i;
            break;
        }
    }

    if (indiceProducto === -1) {
        let nombreProducto = "No informado";
        if (typeof productoSeleccionado.nombre === "string" && productoSeleccionado.nombre.trim() !== "") {
            nombreProducto = productoSeleccionado.nombre.trim();
        }

        const nuevoProducto = {
            codigo: productoSeleccionado.codigo,
            nombre: nombreProducto,
            precio: productoSeleccionado.precio,
            cantidad: 1,
            stock: productoSeleccionado.stock
        };

        // Agregamos el producto al arreglo.
        carrito.push(nuevoProducto);
    } else {
        if (carrito[indiceProducto].cantidad >= productoSeleccionado.stock) {
            alert("No hay más unidades disponibles.");
            return;
        }

        carrito[indiceProducto].stock = productoSeleccionado.stock;
        carrito[indiceProducto].cantidad++;
    }

    guardarCarrito(carrito);
    alert("Producto agregado al carrito.");
}

// Mostramos los productos en el HTML.
function mostrarCarrito() {
    const listaCarrito = document.getElementById("lista-carrito");

    if (listaCarrito === null) {
        return;
    }

    const carritoVacio = document.getElementById("carrito-vacio");
    const totalCarrito = document.getElementById("total-carrito");
    const estadoCarrito = document.getElementById("estado-carrito");
    const carrito = obtenerCarrito();

    listaCarrito.innerHTML = "";
    estadoCarrito.textContent = "";
    estadoCarrito.hidden = true;

    if (carrito.length === 0) {
        carritoVacio.hidden = false;
    } else {
        carritoVacio.hidden = true;
    }

    let total = 0;

    for (let i = 0; i < carrito.length; i++) {
        const productoCarrito = carrito[i];
        const subtotal = productoCarrito.precio * productoCarrito.cantidad;
        total = total + subtotal;

        listaCarrito.innerHTML += `
            <article class="carrito__producto">
                <h2>${productoCarrito.nombre}</h2>
                <p>Precio: ${formatoPrecioCarrito.format(productoCarrito.precio)}</p>
                <p>Cantidad: ${productoCarrito.cantidad}</p>
                <p class="carrito__subtotal">Subtotal: ${formatoPrecioCarrito.format(subtotal)}</p>
                <div class="carrito__controles">
                    <button type="button" class="boton carrito__cantidad"
                        aria-label='Disminuir cantidad de ${productoCarrito.nombre}'
                        onclick="disminuirCantidad('${productoCarrito.codigo}')">−</button>
                    <button type="button" class="boton boton--primario carrito__cantidad"
                        aria-label='Aumentar cantidad de ${productoCarrito.nombre}'
                        onclick="aumentarCantidad('${productoCarrito.codigo}')">+</button>
                    <button type="button" class="boton carrito__eliminar"
                        aria-label='Eliminar ${productoCarrito.nombre} del carrito'
                        onclick="eliminarProducto('${productoCarrito.codigo}')">Eliminar</button>
                </div>
            </article>
        `;
    }

    // Mostramos la suma de los subtotales.
    totalCarrito.textContent = formatoPrecioCarrito.format(total);
}

function aumentarCantidad(codigoProducto) {
    const carrito = obtenerCarrito();

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo === codigoProducto) {
            if (carrito[i].cantidad < carrito[i].stock) {
                carrito[i].cantidad++;
            } else {
                alert("No hay más unidades disponibles.");
                return;
            }

            guardarCarrito(carrito);
            mostrarCarrito();
            return;
        }
    }
}

function disminuirCantidad(codigoProducto) {
    const carrito = obtenerCarrito();

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo === codigoProducto) {
            if (carrito[i].cantidad > 1) {
                carrito[i].cantidad--;
            } else {
                alert("La cantidad mínima es 1.");
                return;
            }

            guardarCarrito(carrito);
            mostrarCarrito();
            return;
        }
    }
}

function eliminarProducto(codigoProducto) {
    const carrito = obtenerCarrito();

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].codigo === codigoProducto) {
            carrito.splice(i, 1);

            guardarCarrito(carrito);
            mostrarCarrito();
            return;
        }
    }
}

mostrarCarrito();
