/*
 * ============================================================
 * BILLAR MANAGER
 * Módulo de gestión de mesas de billar
 * Evidencia: AA4-EV03
 * ============================================================
 *
 * Funcionalidades:
 * - Gestión de mesas
 * - Cronómetro independiente por mesa
 * - Cálculo del valor del tiempo
 * - Registro de consumos
 * - Mesa Común
 * - Historial de tiempos
 * - Facturación
 * - Persistencia mediante localStorage
 *
 * Tecnologías:
 * - JavaScript
 * - Bootstrap 5
 * - HTML5
 * - CSS3
 */

// ============================================================
// CONFIGURACIÓN
// ============================================================

// Tarifa por una hora de servicio.
const TARIFA_HORA = 20000;


// ============================================================
// ESTADO INICIAL
// ============================================================

const ESTADO_INICIAL = {
    1: {
        activa: false,
        inicio: null,
        segundosAcumulados: 0,
        consumos: [],
        historial: []
    },

    2: {
        activa: false,
        inicio: null,
        segundosAcumulados: 0,
        consumos: [],
        historial: []
    },

    3: {
        activa: false,
        inicio: null,
        segundosAcumulados: 0,
        consumos: [],
        historial: []
    }
};


// ============================================================
// VARIABLES GLOBALES
// ============================================================

let mesas = cargarMesas();

let mesaSeleccionada = 1;

let mesaComunGeneral = JSON.parse(
    localStorage.getItem("billarManagerMesaComunGeneral") || "[]"
);

let personaEditandoId = null;


// ============================================================
// CARGA Y GUARDADO DE DATOS
// ============================================================

/**
 * Carga las mesas almacenadas en localStorage.
 *
 * Si no existen datos almacenados, se crea el estado inicial.
 */
function cargarMesas() {

    const guardado = localStorage.getItem("billarManagerMesas");

    if (!guardado) {

        localStorage.setItem(
            "billarManagerMesas",
            JSON.stringify(ESTADO_INICIAL)
        );

        return JSON.parse(JSON.stringify(ESTADO_INICIAL));
    }

    return JSON.parse(guardado);
}


/**
 * Guarda el estado actual de las mesas.
 */
function guardarMesas() {

    localStorage.setItem(
        "billarManagerMesas",
        JSON.stringify(mesas)
    );
}


/**
 * Guarda la información de Mesa Común.
 */
function guardarMesaComunGeneral() {

    localStorage.setItem(
        "billarManagerMesaComunGeneral",
        JSON.stringify(mesaComunGeneral)
    );
}


// ============================================================
// LOGIN
// ============================================================

/**
 * Ingresa al sistema.
 *
 * Actualmente funciona como prototipo de autenticación.
 * Posteriormente puede conectarse con una API.
 */
function irMesas() {

    const usuario = document.getElementById("usuario").value.trim();

    const password = document.getElementById("password").value.trim();


    if (!usuario || !password) {

        alert("Ingrese usuario y contraseña.");

        return;
    }


    document
        .getElementById("login")
        .classList.remove("activa");


    document
        .getElementById("mesas")
        .classList.add("activa");


    renderizarMesas();
}


// ============================================================
// NAVEGACIÓN PRINCIPAL
// ============================================================

/**
 * Muestra el menú principal de mesas.
 */
function mostrarMenuMesas() {

    document
        .getElementById("mesaComunGeneral")
        .classList.remove("activa");


    document
        .getElementById("detalleMesa")
        .classList.remove("activa");


    document
        .getElementById("mesas")
        .classList.add("activa");


    renderizarMesas();
}


/**
 * Muestra la sección Mesa Común.
 */
function mostrarMesaComunGeneral() {

    document
        .getElementById("mesas")
        .classList.remove("activa");


    document
        .getElementById("detalleMesa")
        .classList.remove("activa");


    document
        .getElementById("mesaComunGeneral")
        .classList.add("activa");


    actualizarMesaComunGeneral();
}


/**
 * Cierra la sesión.
 *
 * Los datos almacenados no se eliminan.
 */
function cerrarSesion() {

    document
        .getElementById("mesas")
        .classList.remove("activa");


    document
        .getElementById("detalleMesa")
        .classList.remove("activa");


    document
        .getElementById("mesaComunGeneral")
        .classList.remove("activa");


    document
        .getElementById("login")
        .classList.add("activa");
}


// ============================================================
// MENÚ DE MESAS
// ============================================================

/**
 * Abre el detalle de una mesa.
 *
 * @param {number} numero Número de la mesa.
 */
function irDetalleMesa(numero) {

    if (!mesas[numero]) {
        return;
    }


    mesaSeleccionada = Number(numero);


    document
        .getElementById("mesas")
        .classList.remove("activa");


    document
        .getElementById("mesaComunGeneral")
        .classList.remove("activa");


    document
        .getElementById("detalleMesa")
        .classList.add("activa");


    document
        .getElementById("mesaActual")
        .textContent = `MESA ${mesaSeleccionada}`;


    mostrarTiempo();
}


/**
 * Regresa al menú de mesas.
 */
function volverMesas() {

    document
        .getElementById("detalleMesa")
        .classList.remove("activa");


    document
        .getElementById("mesaComunGeneral")
        .classList.remove("activa");


    document
        .getElementById("mesas")
        .classList.add("activa");


    renderizarMesas();
}


// ============================================================
// PANEL DE TIEMPO
// ============================================================

/**
 * Muestra el panel del cronómetro.
 */
function mostrarTiempo() {

    document
        .getElementById("panelConsumo")
        .style.display = "none";


    document
        .getElementById("panelTiempo")
        .style.display = "block";


    actualizarDetalle();
}


/**
 * Activa el cronómetro de la mesa.
 */
function activarMesa() {

    const mesa = mesas[mesaSeleccionada];


    if (mesa.activa) {
        return;
    }


    mesa.activa = true;

    mesa.inicio = Date.now();


    guardarMesas();

    actualizarDetalle();

    renderizarMesas();
}


/**
 * Desactiva el cronómetro.
 *
 * IMPORTANTE:
 * Se corrige el error que existía en la versión anterior.
 * Ahora no se suma dos veces el tiempo acumulado.
 */
function pausarMesa() {

    const mesa = mesas[mesaSeleccionada];


    if (!mesa.activa) {
        return;
    }


    // Guarda exactamente el tiempo transcurrido.
    mesa.segundosAcumulados =
        obtenerSegundosActuales(mesa);


    mesa.activa = false;

    mesa.inicio = null;


    guardarMesas();

    actualizarDetalle();

    renderizarMesas();
}


/**
 * Obtiene los segundos actuales de una mesa.
 */
function obtenerSegundosActuales(mesa) {

    if (!mesa.activa || !mesa.inicio) {

        return mesa.segundosAcumulados;
    }


    return mesa.segundosAcumulados +
        Math.floor(
            (Date.now() - mesa.inicio) / 1000
        );
}


// ============================================================
// CÁLCULOS
// ============================================================

/**
 * Calcula el valor del tiempo utilizado.
 */
function calcularValorTiempo(mesa) {

    const segundos =
        obtenerSegundosActuales(mesa);


    return Math.floor(
        (segundos / 3600) * TARIFA_HORA
    );
}


/**
 * Calcula el total de consumos.
 */
function calcularTotalConsumo(mesa) {

    return mesa.consumos.reduce(
        (total, producto) => {

            return total +
                (producto.precio * producto.cantidad);

        },
        0
    );
}


/**
 * Calcula el total final de una mesa.
 */
function calcularTotalMesa(mesa) {

    return calcularValorTiempo(mesa) +
        calcularTotalConsumo(mesa);
}


// ============================================================
// ACTUALIZACIÓN DEL DETALLE
// ============================================================

/**
 * Actualiza toda la información de la mesa seleccionada.
 */
function actualizarDetalle() {

    const mesa = mesas[mesaSeleccionada];


    if (!mesa) {
        return;
    }


    const segundos =
        obtenerSegundosActuales(mesa);


    document
        .getElementById("cronometro")
        .textContent =
        formatearTiempo(segundos);


    document
        .getElementById("valorTiempo")
        .textContent =
        formatoMoneda(
            calcularValorTiempo(mesa)
        );


    document
        .getElementById("valorConsumoTiempo")
        .textContent =
        formatoMoneda(
            calcularTotalConsumo(mesa)
        );


    document
        .getElementById("totalPagarTiempo")
        .textContent =
        formatoMoneda(
            calcularTotalMesa(mesa)
        );


    document
        .getElementById("totalConsumo")
        .textContent =
        formatoMoneda(
            calcularTotalConsumo(mesa)
        );


    document
        .getElementById("estadoTiempo")
        .textContent =
        mesa.activa
            ? "ACTIVA"
            : "DESACTIVADA";


    document
        .getElementById("btnActivar")
        .disabled =
        mesa.activa;


    document
        .getElementById("btnPausar")
        .disabled =
        !mesa.activa;


    renderizarConsumos(mesa);

    renderizarHistorial(mesa);
}


// ============================================================
// CONSUMOS
// ============================================================

/**
 * Muestra el panel de consumos.
 */
function mostrarConsumo() {

    document
        .getElementById("panelTiempo")
        .style.display = "none";


    document
        .getElementById("panelConsumo")
        .style.display = "block";


    actualizarDetalle();
}


/**
 * Agrega un producto a la mesa.
 */
function agregarProducto() {

    const nombre =
        document
            .getElementById("productoNombre")
            .value
            .trim();


    const precio =
        Number(
            document
                .getElementById("productoPrecio")
                .value
        );


    const cantidad =
        Number(
            document
                .getElementById("productoCantidad")
                .value
        );


    if (!nombre || precio <= 0 || cantidad <= 0) {

        alert(
            "Ingrese nombre, precio y cantidad válidos."
        );

        return;
    }


    mesas[mesaSeleccionada].consumos.push({

        id: Date.now(),

        nombre: nombre,

        precio: precio,

        cantidad: cantidad

    });


    guardarMesas();


    document
        .getElementById("productoNombre")
        .value = "";


    document
        .getElementById("productoPrecio")
        .value = "";


    document
        .getElementById("productoCantidad")
        .value = "1";


    actualizarDetalle();
}


/**
 * Elimina un producto.
 */
function eliminarProducto(idProducto) {

    const mesa =
        mesas[mesaSeleccionada];


    mesa.consumos =
        mesa.consumos.filter(
            producto =>
                producto.id !== idProducto
        );


    guardarMesas();

    actualizarDetalle();
}


/**
 * Renderiza los consumos.
 */
function renderizarConsumos(mesa) {

    const contenedor =
        document.getElementById("listaConsumos");


    if (mesa.consumos.length === 0) {

        contenedor.innerHTML =
            '<div class="registro">' +
            '<span>No hay consumos registrados.</span>' +
            '</div>';

        return;
    }


    contenedor.innerHTML =
        mesa.consumos.map(producto => `

            <div class="registro">

                <span>
                    ${producto.nombre}
                    x${producto.cantidad}
                    <br>
                    ${formatoMoneda(
                        producto.precio *
                        producto.cantidad
                    )}
                </span>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="eliminarProducto(${producto.id})"
                >
                    ELIMINAR
                </button>

            </div>

        `).join("");
}


// ============================================================
// HISTORIAL
// ============================================================

/**
 * Muestra el historial de tiempos anteriores.
 */
function renderizarHistorial(mesa) {

    const contenedor =
        document.getElementById("historialTiempos");


    if (mesa.historial.length === 0) {

        contenedor.innerHTML =
            '<div class="registro">' +
            '<span>No hay tiempos anteriores.</span>' +
            '</div>';

        return;
    }


    contenedor.innerHTML =
        mesa.historial.map(registro => `

            <div class="registro">

                <span>
                    ${formatearTiempo(
                        registro.segundos
                    )}
                </span>

                <span>
                    ${formatoMoneda(
                        registro.valor
                    )}
                </span>

            </div>

        `).join("");
}


// ============================================================
// RENDERIZADO DE MESAS
// ============================================================

/**
 * Muestra las tres mesas en el menú principal.
 */
function renderizarMesas() {

    const contenedor =
        document.getElementById("listaMesas");


    if (!contenedor) {
        return;
    }


    contenedor.innerHTML =
        Object.keys(mesas).map(numero => {

            const mesa = mesas[numero];


            const estado =
                mesa.activa
                    ? "OCUPADA"
                    : "LIBRE";


            const claseEstado =
                mesa.activa
                    ? "estado-ocupada"
                    : "estado-libre";


            const boton =
                mesa.activa
                    ? "VER MESA"
                    : "INICIAR";


            return `

                <div class="mesa-card">

                    <div class="info">

                        <span>
                            MESA ${numero}
                        </span>

                        <span
                            class="${claseEstado}"
                        >
                            ${estado}
                        </span>

                        <button
                            class="btn btn-success btn-sm"
                            onclick="irDetalleMesa(${numero})"
                        >
                            ${boton}
                        </button>

                    </div>

                </div>

            `;

        }).join("");


    const total =
        Object.keys(mesas).length;


    const ocupadas =
        Object.values(mesas)
            .filter(mesa => mesa.activa)
            .length;


    document
        .getElementById("totalMesas")
        .textContent = total;


    document
        .getElementById("mesasOcupadas")
        .textContent = ocupadas;


    document
        .getElementById("mesasLibres")
        .textContent =
        total - ocupadas;
}


// ============================================================
// FACTURACIÓN
// ============================================================

/**
 * Finaliza una sesión de mesa y genera el total.
 */
function finalizarMesa() {

    const mesa =
        mesas[mesaSeleccionada];


    const segundosFinales =
        obtenerSegundosActuales(mesa);


    const valorTiempoFinal =
        Math.floor(
            (segundosFinales / 3600) *
            TARIFA_HORA
        );


    const valorConsumoFinal =
        calcularTotalConsumo(mesa);


    const totalFinal =
        valorTiempoFinal +
        valorConsumoFinal;


    // Guarda el tiempo de la sesión.
    if (segundosFinales > 0) {

        mesa.historial.push({

            segundos: segundosFinales,

            valor: valorTiempoFinal,

            fecha:
                new Date()
                    .toLocaleString("es-CO")

        });
    }


    alert(

        `Mesa ${mesaSeleccionada} finalizada.\n\n` +

        `Tiempo: ${
            formatoMoneda(valorTiempoFinal)
        }\n` +

        `Consumos: ${
            formatoMoneda(valorConsumoFinal)
        }\n` +

        `TOTAL A PAGAR: ${
            formatoMoneda(totalFinal)
        }`

    );


    // Reinicia la mesa.
    mesa.activa = false;

    mesa.inicio = null;

    mesa.segundosAcumulados = 0;

    mesa.consumos = [];


    guardarMesas();


    volverMesas();
}


// ============================================================
// MESA COMÚN
// ============================================================

/**
 * Agrega una persona a Mesa Común.
 */
function agregarPersonaMesaComunGeneral() {

    const nombre =
        document
            .getElementById("personaNombreGeneral")
            .value
            .trim();


    if (!nombre) {

        alert(
            "Ingrese el nombre de la persona."
        );

        return;
    }


    mesaComunGeneral.push({

        id: Date.now(),

        nombre: nombre,

        productos: []

    });


    guardarMesaComunGeneral();


    document
        .getElementById("personaNombreGeneral")
        .value = "";


    actualizarMesaComunGeneral();
}


/**
 * Abre la cuenta individual de una persona.
 */
function abrirCuentaPersona(idPersona) {

    const persona =
        mesaComunGeneral.find(
            p => p.id === idPersona
        );


    if (!persona) {
        return;
    }


    persona.productos =
        persona.productos || [];


    personaEditandoId =
        idPersona;


    document
        .getElementById("editorCuentaPersona")
        .style.display = "block";


    document
        .getElementById("nombrePersonaEditando")
        .textContent =
        `CUENTA DE ${
            persona.nombre.toUpperCase()
        }`;


    actualizarCuentaPersona();
}


/**
 * Cierra una cuenta individual.
 */
function cerrarCuentaPersona() {

    document
        .getElementById("editorCuentaPersona")
        .style.display = "none";


    personaEditandoId = null;


    actualizarMesaComunGeneral();
}


/**
 * Agrega un producto a una cuenta individual.
 */
function agregarProductoPersona() {

    const persona =
        mesaComunGeneral.find(
            p => p.id === personaEditandoId
        );


    if (!persona) {
        return;
    }


    const nombre =
        document
            .getElementById("productoPersonaNombre")
            .value
            .trim();


    const precio =
        Number(
            document
                .getElementById("productoPersonaPrecio")
                .value
        );


    if (!nombre || precio <= 0) {

        alert(
            "Ingrese un producto y un precio válido."
        );

        return;
    }


    persona.productos.push({

        id: Date.now(),

        nombre: nombre,

        precio: precio

    });


    guardarMesaComunGeneral();


    document
        .getElementById("productoPersonaNombre")
        .value = "";


    document
        .getElementById("productoPersonaPrecio")
        .value = "";


    actualizarCuentaPersona();

    actualizarMesaComunGeneral();
}


/**
 * Elimina un producto de una cuenta individual.
 */
function eliminarProductoPersona(idProducto) {

    const persona =
        mesaComunGeneral.find(
            p => p.id === personaEditandoId
        );


    if (!persona) {
        return;
    }


    persona.productos =
        (persona.productos || [])
            .filter(
                producto =>
                    producto.id !== idProducto
            );


    guardarMesaComunGeneral();

    actualizarCuentaPersona();

    actualizarMesaComunGeneral();
}


/**
 * Calcula el total de una persona.
 */
function calcularTotalPersona(persona) {

    return (persona.productos || [])
        .reduce(
            (total, producto) =>
                total + producto.precio,
            0
        );
}


/**
 * Actualiza la cuenta individual.
 */
function actualizarCuentaPersona() {

    const persona =
        mesaComunGeneral.find(
            p => p.id === personaEditandoId
        );


    if (!persona) {
        return;
    }


    const lista =
        document.getElementById(
            "listaProductosPersona"
        );


    document
        .getElementById(
            "totalPersonaGeneral"
        )
        .textContent =
        formatoMoneda(
            calcularTotalPersona(persona)
        );


    if (!persona.productos.length) {

        lista.innerHTML =
            '<div class="registro">' +
            '<span>Cuenta sin productos.</span>' +
            '</div>';

        return;
    }


    lista.innerHTML =
        persona.productos.map(producto => `

            <div class="registro">

                <span>

                    ${producto.nombre}
                    <br>

                    ${formatoMoneda(
                        producto.precio
                    )}

                </span>

                <button
                    class="btn btn-danger btn-sm"
                    onclick="eliminarProductoPersona(${producto.id})"
                >
                    QUITAR
                </button>

            </div>

        `).join("");
}


/**
 * Actualiza Mesa Común.
 */
function actualizarMesaComunGeneral() {

    const lista =
        document.getElementById(
            "listaMesaComunGeneral"
        );


    const total =
        mesaComunGeneral.reduce(
            (suma, persona) =>
                suma +
                calcularTotalPersona(persona),
            0
        );


    document
        .getElementById(
            "totalMesaComunGeneral"
        )
        .textContent =
        formatoMoneda(total);


    if (!mesaComunGeneral.length) {

        lista.innerHTML =
            '<div class="registro">' +
            '<span>No hay personas registradas.</span>' +
            '</div>';

        return;
    }


    lista.innerHTML =
        mesaComunGeneral.map(persona => `

            <div class="registro">

                <span>

                    <strong>
                        ${persona.nombre}
                    </strong>

                    <br>

                    Cuenta:
                    ${formatoMoneda(
                        calcularTotalPersona(persona)
                    )}

                </span>


                <span>

                    <button
                        class="btn btn-success btn-sm"
                        onclick="abrirCuentaPersona(${persona.id})"
                    >
                        ABRIR
                    </button>


                    <button
                        class="btn btn-danger btn-sm"
                        onclick="eliminarPersonaMesaComunGeneral(${persona.id})"
                    >
                        ELIMINAR
                    </button>

                </span>

            </div>

        `).join("");
}


/**
 * Elimina una persona de Mesa Común.
 */
function eliminarPersonaMesaComunGeneral(idPersona) {

    const persona =
        mesaComunGeneral.find(
            p => p.id === idPersona
        );


    if (!persona) {
        return;
    }


    const confirmar =
        confirm(
            `¿Desea eliminar la cuenta de ${persona.nombre}?`
        );


    if (!confirmar) {
        return;
    }


    mesaComunGeneral =
        mesaComunGeneral.filter(
            p => p.id !== idPersona
        );


    if (personaEditandoId === idPersona) {

        cerrarCuentaPersona();
    }


    guardarMesaComunGeneral();

    actualizarMesaComunGeneral();
}


// ============================================================
// UTILIDADES
// ============================================================

/**
 * Convierte segundos a HH:MM:SS.
 */
function formatearTiempo(segundos) {

    const horas =
        Math.floor(segundos / 3600);


    const minutos =
        Math.floor(
            (segundos % 3600) / 60
        );


    const segundosRestantes =
        segundos % 60;


    return [

        horas
            .toString()
            .padStart(2, "0"),

        minutos
            .toString()
            .padStart(2, "0"),

        segundosRestantes
            .toString()
            .padStart(2, "0")

    ].join(":");
}


/**
 * Formatea valores en pesos colombianos.
 */
function formatoMoneda(valor) {

    return valor.toLocaleString(
        "es-CO",
        {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        }
    );
}


// ============================================================
// ACTUALIZACIÓN AUTOMÁTICA
// ============================================================

/*
 * Actualiza el cronómetro y el estado de las mesas
 * cada segundo.
 */
setInterval(() => {

    if (
        document
            .getElementById("detalleMesa")
            ?.classList
            .contains("activa")
    ) {

        actualizarDetalle();
    }


    if (
        document
            .getElementById("mesas")
            ?.classList
            .contains("activa")
    ) {

        renderizarMesas();
    }

}, 1000);


// ============================================================
// INICIALIZACIÓN
// ============================================================

renderizarMesas();