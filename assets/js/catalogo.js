function iniciarCatalogo() {
    "use strict";

    const listaProductos = document.getElementById("lista-productos");
    const buscador = document.getElementById("busqueda-catalogo");
    const filtroCategoria = document.getElementById("categoria-catalogo");
    const contador = document.getElementById("contador-resultados");
    const estado = document.getElementById("estado-catalogo");

    if (!listaProductos || !buscador || !filtroCategoria || !contador || !estado) {
        console.error("No se encontraron los elementos necesarios para mostrar el catálogo.");
        return;
    }

    const formateadorPrecioCLP = new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });

    // Evita mostrar valores faltantes como undefined o null.
    function obtenerTexto(valor, alternativa = "No informado") {
        if (typeof valor === "string" && valor.trim() !== "") {
            return valor.trim();
        }
        return alternativa;
    }

    function normalizarBusqueda(valor) {
        const texto = obtenerTexto(valor, "");
        return texto.toLocaleLowerCase("es-CL");
    }

    function formatearPrecio(precio) {
        if (Number.isFinite(precio) && precio >= 0) {
            return formateadorPrecioCLP.format(precio);
        }
        return "Precio no disponible";
    }

    function formatearStock(stock) {
        if (!Number.isInteger(stock) || stock < 0) {
            return "Stock no informado";
        }

        if (stock === 0) {
            return "Sin stock";
        }
        return "Stock: " + stock;
    }

    function agregarDatoProducto(listaDatos, etiqueta, valor) {
        const tituloDato = document.createElement("dt");
        tituloDato.textContent = etiqueta;

        const contenidoDato = document.createElement("dd");
        contenidoDato.textContent = obtenerTexto(valor);

        listaDatos.appendChild(tituloDato);
        listaDatos.appendChild(contenidoDato);
    }

    function crearTarjetaProducto(producto) {
        const tarjetaProducto = document.createElement("article");
        tarjetaProducto.className = "catalogo__tarjeta";
        tarjetaProducto.dataset.codigo = obtenerTexto(producto.codigo, "");

        const categoria = document.createElement("p");
        categoria.className = "catalogo__categoria";
        categoria.textContent = obtenerTexto(producto.categoria, "Categoría no informada");

        const nombre = document.createElement("h3");
        nombre.className = "catalogo__nombre";
        nombre.textContent = obtenerTexto(producto.nombre, "Producto sin nombre");

        const listaDatos = document.createElement("dl");
        listaDatos.className = "catalogo__datos";
        agregarDatoProducto(listaDatos, "Marca", producto.marca);
        agregarDatoProducto(listaDatos, "Modelo", producto.modelo);
        agregarDatoProducto(listaDatos, "Código", producto.codigo);

        tarjetaProducto.appendChild(categoria);
        tarjetaProducto.appendChild(nombre);
        tarjetaProducto.appendChild(listaDatos);

        const textoDescripcion = obtenerTexto(producto.descripcion, "");
        if (textoDescripcion !== "") {
            const descripcion = document.createElement("p");
            descripcion.className = "catalogo__descripcion";
            descripcion.textContent = textoDescripcion;
            tarjetaProducto.appendChild(descripcion);
        }

        const pieTarjeta = document.createElement("div");
        pieTarjeta.className = "catalogo__pie-tarjeta";

        const precio = document.createElement("p");
        precio.className = "catalogo__precio";
        precio.textContent = formatearPrecio(producto.precio);

        const stock = document.createElement("p");
        stock.className = "catalogo__stock";
        stock.textContent = formatearStock(producto.stock);

        pieTarjeta.appendChild(precio);
        pieTarjeta.appendChild(stock);
        tarjetaProducto.appendChild(pieTarjeta);
        return tarjetaProducto;
    }

    // Obtiene las categorías sin repetir y las ordena alfabéticamente en español.
    function obtenerCategorias(coleccionProductos) {
        const listaCategorias = [];

        coleccionProductos.forEach(function (producto) {
            const categoria = obtenerTexto(producto.categoria, "");
            if (categoria !== "" && !listaCategorias.includes(categoria)) {
                listaCategorias.push(categoria);
            }
        });

        listaCategorias.sort(function (primeraCategoria, segundaCategoria) {
            return primeraCategoria.localeCompare(segundaCategoria, "es");
        });

        return listaCategorias;
    }

    function cargarCategorias(coleccionProductos) {
        const listaCategorias = obtenerCategorias(coleccionProductos);

        listaCategorias.forEach(function (categoria) {
            const opcion = document.createElement("option");
            opcion.value = categoria;
            opcion.textContent = categoria;
            filtroCategoria.appendChild(opcion);
        });
    }

    // Limpia el listado y crea una tarjeta para cada producto encontrado.
    function renderizarProductos(productosFiltrados) {
        listaProductos.textContent = "";

        productosFiltrados.forEach(function (producto) {
            const tarjetaProducto = crearTarjetaProducto(producto);
            listaProductos.appendChild(tarjetaProducto);
        });

        if (productosFiltrados.length === 1) {
            contador.textContent = "1 producto";
        } else {
            contador.textContent = productosFiltrados.length + " productos";
        }

        estado.textContent = "No se encontraron productos con los filtros seleccionados.";
        if (productosFiltrados.length === 0) {
            estado.hidden = false;
        } else {
            estado.hidden = true;
        }
    }

    function mostrarErrorDatos() {
        listaProductos.textContent = "";
        contador.textContent = "Catálogo no disponible";
        estado.textContent = "No fue posible cargar los productos. Intenta recargar la página más tarde.";
        estado.hidden = false;
        buscador.disabled = true;
        filtroCategoria.disabled = true;
        console.error("La fuente del catálogo debe contener un arreglo de productos no vacío.");
    }

    // productos.js debe cargarse antes que este archivo.
    if (typeof productos === "undefined" || !Array.isArray(productos) || productos.length === 0) {
        mostrarErrorDatos();
        return;
    }

    const coleccionProductos = productos.filter(function (producto) {
        if (producto === null || typeof producto !== "object" || Array.isArray(producto)) {
            return false;
        }
        return true;
    });

    if (coleccionProductos.length === 0) {
        mostrarErrorDatos();
        return;
    }

    // Conserva solo los productos que cumplen la búsqueda y la categoría.
    function aplicarFiltros() {
        const textoBusqueda = normalizarBusqueda(buscador.value);
        const categoriaSeleccionada = filtroCategoria.value;

        const productosFiltrados = coleccionProductos.filter(function (producto) {
            const nombre = normalizarBusqueda(producto.nombre);
            const marca = normalizarBusqueda(producto.marca);
            const modelo = normalizarBusqueda(producto.modelo);
            const codigo = normalizarBusqueda(producto.codigo);

            const coincideBusqueda = nombre.includes(textoBusqueda) ||
                marca.includes(textoBusqueda) ||
                modelo.includes(textoBusqueda) ||
                codigo.includes(textoBusqueda);

            let coincideCategoria = true;
            if (categoriaSeleccionada !== "") {
                coincideCategoria = obtenerTexto(producto.categoria, "") === categoriaSeleccionada;
            }

            return coincideBusqueda && coincideCategoria;
        });

        renderizarProductos(productosFiltrados);
    }

    cargarCategorias(coleccionProductos);
    buscador.disabled = false;
    filtroCategoria.disabled = false;
    buscador.addEventListener("input", aplicarFiltros);
    filtroCategoria.addEventListener("change", aplicarFiltros);
    aplicarFiltros();
}

iniciarCatalogo();
