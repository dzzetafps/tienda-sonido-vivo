"use strict";

const CLAVE_CARRITO = "sonidoVivoCarrito";

const formatoPrecioCarrito = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});


/* =========================================
   OBTENER CARRITO
========================================= */

function obtenerCarrito() {
    const carritoGuardado = localStorage.getItem(CLAVE_CARRITO);

    if (carritoGuardado === null) {
        return [];
    }

    try {
        const carrito = JSON.parse(carritoGuardado);

        if (Array.isArray(carrito)) {
            return carrito;
        }
    } catch (error) {
        console.error("No se pudo leer el carrito.");
    }

    return [];
}


/* =========================================
   GUARDAR CARRITO
========================================= */

function guardarCarrito(carrito) {
    localStorage.setItem(
        CLAVE_CARRITO,
        JSON.stringify(carrito)
    );

    actualizarContadorCarrito();
}


/* =========================================
   BUSCAR PRODUCTO
========================================= */

function buscarProductoPorCodigo(codigoProducto) {

    if (
        typeof productos === "undefined" ||
        !Array.isArray(productos)
    ) {
        return null;
    }

    const productoEncontrado = productos.find(function (producto) {

        return (
            producto !== null &&
            typeof producto === "object" &&
            producto.codigo === codigoProducto
        );

    });

    return productoEncontrado || null;
}


/* =========================================
   AGREGAR PRODUCTO AL CARRITO
========================================= */



/* =========================================
   BOTÓN DEL DETALLE DE PRODUCTO
========================================= */

function agregarAlCarrito() {

    const parametros =
        new URLSearchParams(window.location.search);


    const codigoProducto =
        parametros.get("codigo");


    if (
        codigoProducto === null ||
        codigoProducto.trim() === ""
    ) {

        alert("No se indicó un producto.");

        return;
    }


    agregarProductoAlCarrito(
        codigoProducto.trim()
    );
}


/* =========================================
   CONTADOR DEL HEADER
========================================= */

function actualizarContadorCarrito() {

    const carrito =
        obtenerCarrito();


    let cantidadTotal = 0;


    carrito.forEach(function (producto) {

        cantidadTotal +=
            Number(producto.cantidad) || 0;

    });


    const enlacesCarrito =
        document.querySelectorAll(
            'a[href$="carrito.html"]'
        );


    enlacesCarrito.forEach(function (enlace) {

        let contador =
            enlace.querySelector(
                ".contador-carrito"
            );


        if (contador === null) {

            contador =
                document.createElement("span");

            contador.className =
                "contador-carrito";

            enlace.appendChild(contador);

        }


        contador.textContent =
            cantidadTotal;


        contador.hidden =
            cantidadTotal === 0;

    });
}


/* =========================================
   MOSTRAR CARRITO
========================================= */

function mostrarCarrito() {

    const listaCarrito =
        document.getElementById(
            "lista-carrito"
        );


    /*
        carrito.js también se carga en catálogo,
        login, inicio, etc.

        Si no estamos en carrito.html,
        solo actualizamos el contador.
    */

    if (listaCarrito === null) {

        actualizarContadorCarrito();

        return;
    }


    const carritoVacio =
        document.getElementById(
            "carrito-vacio"
        );


    const totalCarrito =
        document.getElementById(
            "total-carrito"
        );


    const subtotalCarrito =
        document.getElementById(
            "subtotal-carrito"
        );


    const cantidadProductos =
        document.getElementById(
            "cantidad-productos"
        );


    const carrito =
        obtenerCarrito();


    listaCarrito.innerHTML = "";


    let total = 0;

    let cantidadTotal = 0;


    if (carrito.length === 0) {

        if (carritoVacio !== null) {

            carritoVacio.hidden = false;

        }

    } else {

        if (carritoVacio !== null) {

            carritoVacio.hidden = true;

        }

    }


    carrito.forEach(function (productoCarrito) {


        const productoOriginal =
            buscarProductoPorCodigo(
                productoCarrito.codigo
            );


        let imagenProducto =
            productoCarrito.imagen;


        if (
            (!imagenProducto ||
            imagenProducto.trim() === "") &&
            productoOriginal !== null
        ) {

            imagenProducto =
                productoOriginal.imagen;

        }


        const subtotal =
            productoCarrito.precio *
            productoCarrito.cantidad;


        total += subtotal;

        cantidadTotal +=
            productoCarrito.cantidad;


        const articulo =
            document.createElement(
                "article"
            );


        articulo.className =
            "carrito__item";


        articulo.innerHTML = `

            <div class="carrito__item-imagen">

                <img
                    src="${imagenProducto || ""}"
                    alt="${productoCarrito.nombre}"
                >

            </div>


            <div class="carrito__item-info">

                <p class="carrito__item-codigo">
                    ${productoCarrito.codigo}
                </p>


                <h3>
                    ${productoCarrito.nombre}
                </h3>


                <p class="carrito__item-precio">
                    ${formatoPrecioCarrito.format(
                        productoCarrito.precio
                    )}
                </p>


                <div class="carrito__controles">

                    <div class="carrito__cantidad">

                        <button
                            type="button"
                            aria-label="Disminuir cantidad"
                            onclick="disminuirCantidad('${productoCarrito.codigo}')">

                            −

                        </button>


                        <span>
                            ${productoCarrito.cantidad}
                        </span>


                        <button
                            type="button"
                            aria-label="Aumentar cantidad"
                            onclick="aumentarCantidad('${productoCarrito.codigo}')">

                            +

                        </button>

                    </div>


                    <button
                        type="button"
                        class="carrito__eliminar"
                        onclick="eliminarProducto('${productoCarrito.codigo}')">

                        Eliminar

                    </button>

                </div>

            </div>


            <div class="carrito__item-subtotal">

                <span>
                    Subtotal
                </span>


                <strong>

                    ${formatoPrecioCarrito.format(
                        subtotal
                    )}

                </strong>

            </div>

        `;


        listaCarrito.appendChild(
            articulo
        );

    });


    if (totalCarrito !== null) {

        totalCarrito.textContent =
            formatoPrecioCarrito.format(
                total
            );

    }


    if (subtotalCarrito !== null) {

        subtotalCarrito.textContent =
            formatoPrecioCarrito.format(
                total
            );

    }


    if (cantidadProductos !== null) {

        cantidadProductos.textContent =
            cantidadTotal;

    }


    actualizarContadorCarrito();
}


/* =========================================
   AUMENTAR CANTIDAD
========================================= */

function aumentarCantidad(codigoProducto) {

    const carrito =
        obtenerCarrito();


    const productoCarrito =
        carrito.find(function (producto) {

            return producto.codigo ===
                codigoProducto;

        });


    if (!productoCarrito) {

        return;
    }


    const productoOriginal =
        buscarProductoPorCodigo(
            codigoProducto
        );


    const stockDisponible =
        productoOriginal !== null
            ? productoOriginal.stock
            : productoCarrito.stock;


    if (
        Number.isInteger(stockDisponible) &&
        productoCarrito.cantidad >=
        stockDisponible
    ) {

        alert(
            "No hay más unidades disponibles."
        );

        return;
    }


    productoCarrito.cantidad += 1;


    guardarCarrito(carrito);

    mostrarCarrito();
}


/* =========================================
   DISMINUIR CANTIDAD
========================================= */

function disminuirCantidad(codigoProducto) {

    let carrito =
        obtenerCarrito();


    const productoCarrito =
        carrito.find(function (producto) {

            return producto.codigo ===
                codigoProducto;

        });


    if (!productoCarrito) {

        return;
    }


    productoCarrito.cantidad -= 1;


    if (
        productoCarrito.cantidad <= 0
    ) {

        carrito =
            carrito.filter(
                function (producto) {

                    return (
                        producto.codigo !==
                        codigoProducto
                    );

                }
            );

    }


    guardarCarrito(carrito);

    mostrarCarrito();
}


/* =========================================
   ELIMINAR PRODUCTO
========================================= */

function eliminarProducto(codigoProducto) {

    const carrito =
        obtenerCarrito().filter(
            function (producto) {

                return (
                    producto.codigo !==
                    codigoProducto
                );

            }
        );


    guardarCarrito(carrito);

    mostrarCarrito();
}


/* =========================================
   VACIAR CARRITO
========================================= */

const botonVaciarCarrito =
    document.getElementById(
        "vaciar-carrito"
    );


if (botonVaciarCarrito !== null) {

    botonVaciarCarrito.addEventListener(
        "click",
        function () {


            const carrito =
                obtenerCarrito();


            if (carrito.length === 0) {

                return;

            }


            const confirmacion =
                confirm(
                    "¿Quieres vaciar todo el carrito?"
                );


            if (confirmacion) {

                localStorage.removeItem(
                    CLAVE_CARRITO
                );


                mostrarCarrito();

            }

        }
    );

}


/* =========================================
   PAGAR
========================================= */

const botonPagar =
    document.getElementById(
        "boton-pagar"
    );


if (botonPagar !== null) {

    botonPagar.addEventListener(
        "click",
        function () {


            const carrito =
                obtenerCarrito();


            if (carrito.length === 0) {

                alert(
                    "Tu carrito está vacío."
                );

                return;

            }


            alert(
                "Compra lista para continuar al pago."
            );

        }
    );

}


/* =========================================
   INICIALIZAR
========================================= */

actualizarContadorCarrito();

mostrarCarrito();

function agregarProductoAlCarrito(codigoProducto) {

    if (
        typeof productos === "undefined" ||
        !Array.isArray(productos)
    ) {
        alert("No fue posible cargar los productos.");
        return;
    }

    const productoSeleccionado = productos.find(function (producto) {
        return producto.codigo === codigoProducto;
    });

    if (!productoSeleccionado) {
        alert("No se encontró el producto.");
        return;
    }

    if (
        !Number.isInteger(productoSeleccionado.stock) ||
        productoSeleccionado.stock <= 0
    ) {
        alert("Este producto no tiene stock disponible.");
        return;
    }

    const carrito = obtenerCarrito();

    const productoExistente = carrito.find(function (producto) {
        return producto.codigo === codigoProducto;
    });

    if (productoExistente) {

        if (
            productoExistente.cantidad >=
            productoSeleccionado.stock
        ) {
            alert("No hay más unidades disponibles.");
            return;
        }

        productoExistente.cantidad++;

    } else {

        carrito.push({
            codigo: productoSeleccionado.codigo,
            nombre: productoSeleccionado.nombre,
            precio: productoSeleccionado.precio,
            stock: productoSeleccionado.stock,
            imagen: productoSeleccionado.imagen,
            cantidad: 1
        });
    }

    guardarCarrito(carrito);

    if (typeof actualizarContadorCarrito === "function") {
        actualizarContadorCarrito();
    }

    alert("Producto agregado al carrito.");
}