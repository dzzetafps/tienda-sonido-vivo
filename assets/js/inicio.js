(() => {
"use strict";

const DESTACADOS_HOME = [
    {
        codigo: "GA001",
        imagen: "./assets/img/productos/GA001.png",
        textoAlternativo: "Ilustración referencial de una guitarra acústica folk"
    },
    {
        codigo: "GE001",
        imagen: "./assets/img/productos/GE001.png",
        textoAlternativo: "Ilustración referencial de una guitarra eléctrica tipo Stratocaster"
    },
    {
        codigo: "MI001",
        imagen: "./assets/img/productos/MI001.png",
        textoAlternativo: "Ilustración referencial de un micrófono dinámico para voz"
    },
    {
        codigo: "ES001",
        imagen: "./assets/img/productos/ES001.png",
        textoAlternativo: "Ilustración referencial de una interfaz de audio USB"
    }
];

const FORMATEADOR_PRECIO_CLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});

function formatearPrecioCLP(precio) {
    return FORMATEADOR_PRECIO_CLP.format(precio);
}

function obtenerProductosDestacados() {
    if (typeof productos === "undefined" || !Array.isArray(productos)) {
        console.error("No fue posible cargar la fuente de productos.");
        return [];
    }

    return DESTACADOS_HOME.map((seleccion) => {
        const producto = productos.find((item) => item.codigo === seleccion.codigo);

        if (!producto) {
            console.warn(`No se encontró el producto destacado ${seleccion.codigo}.`);
            return null;
        }

        return { ...producto, ...seleccion };
    }).filter(Boolean);
}

function crearTarjetaProducto(producto) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta-producto";

    const imagen = document.createElement("img");
    imagen.className = "tarjeta-producto__imagen";
    imagen.src = producto.imagen;
    imagen.alt = producto.textoAlternativo;
    imagen.width = 1448;
    imagen.height = 1086;
    imagen.loading = "lazy";

    const contenido = document.createElement("div");
    contenido.className = "tarjeta-producto__contenido";

    const categoria = document.createElement("p");
    categoria.className = "tarjeta-producto__categoria";
    categoria.textContent = producto.categoria;

    const nombre = document.createElement("h3");
    nombre.textContent = producto.nombre;

    const marcaModelo = document.createElement("p");
    marcaModelo.className = "tarjeta-producto__marca";
    marcaModelo.textContent = `${producto.marca} · ${producto.modelo}`;

    const pie = document.createElement("div");
    pie.className = "tarjeta-producto__pie";

    const precio = document.createElement("p");
    precio.className = "tarjeta-producto__precio";
    precio.textContent = formatearPrecioCLP(producto.precio);

    const stock = document.createElement("p");
    stock.className = "tarjeta-producto__stock";
    stock.textContent = `${producto.stock} unidades`;

    pie.append(precio, stock);
    contenido.append(categoria, nombre, marcaModelo, pie);
    tarjeta.append(imagen, contenido);

    return tarjeta;
}

function renderizarProductosDestacados() {
    const contenedor = document.querySelector("#lista-destacados");

    if (!contenedor) {
        return;
    }

    const destacados = obtenerProductosDestacados();

    if (destacados.length === 0) {
        const mensaje = document.createElement("p");
        mensaje.className = "aviso";
        mensaje.textContent = "No fue posible cargar los productos destacados.";
        contenedor.replaceChildren(mensaje);
        return;
    }

    const fragmento = document.createDocumentFragment();
    destacados.forEach((producto) => fragmento.append(crearTarjetaProducto(producto)));
    contenedor.replaceChildren(fragmento);
}

renderizarProductosDestacados();
})();
