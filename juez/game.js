let casoActual = 0;
let puntos = 0;
let casosResueltos = 0;
let rango = "JUEZ NOVATO";


/* =====================================================
   ACTUALIZAR RANGO
===================================================== */

function actualizarRango() {

    if (puntos >= 3000) {

        rango = "JUEZ SUPREMO";

    } else if (puntos >= 1500) {

        rango = "MAGISTRADO";

    } else {

        rango = "JUEZ NOVATO";

    }

}


/* =====================================================
   INICIAR JUICIO
===================================================== */

function iniciarJuicio() {

    let caso = casos[casoActual];

    if (!caso) {

        console.error("No se encontró el caso.");

        return;

    }


    const caja = document.querySelector(".box");


    if (!caja) {

        console.error("No se encontró el contenedor .box.");

        return;

    }


    // Eliminar cualquier animación que pudiera
    // ocultar la pantalla.

    caja.classList.remove("fade-out");


    // Mostrar el expediente

    caja.innerHTML = `

        <h1>EXPEDIENTE #${caso.id}</h1>

        <p>━━━━━━━━━━━━━━━━━━━━━</p>

        <h2>${caso.expediente}</h2>


        <p>

            <strong>TRIBUNAL:</strong>

            <br>

            ${caso.tribunal}

        </p>


        <p>

            <strong>NIVEL:</strong>

            <br>

            ${caso.nivel}

        </p>


        <p>

            <strong>MATERIA:</strong>

            <br>

            ${caso.materia}

        </p>


        <p>

            <strong>ÁREA JURÍDICA:</strong>

            <br>

            ${caso.areaJuridica}

        </p>


        <p>

            <strong>DIFICULTAD:</strong>

            <br>

            ${caso.dificultad}

        </p>


        <p>

            <strong>FECHA:</strong>

            <br>

            ${caso.fecha}

        </p>


        <p>━━━━━━━━━━━━━━━━━━━━━</p>


        <h2>PARTES</h2>


        <p>

            <strong>DEMANDANTE:</strong>

            <br>

            ${caso.demandante}

        </p>


        <p>

            <strong>DEMANDADO:</strong>

            <br>

            ${caso.demandado}

        </p>


        <p>━━━━━━━━━━━━━━━━━━━━━</p>


        <h2>${caso.titulo}</h2>


        <button onclick="abrirCaso()">

            ABRIR EXPEDIENTE

        </button>

    `;

}


/* =====================================================
   ABRIR CASO
===================================================== */

function abrirCaso() {

    let caso = casos[casoActual];


    if (!caso) {

        console.error("No se encontró el caso.");

        return;

    }


    const caja = document.querySelector(".box");


    caja.classList.remove("fade-out");


    caja.innerHTML = `

        <h1>CASO #${caso.id}</h1>


        <h2>${caso.titulo}</h2>


        <p>

            <strong>EXPEDIENTE:</strong>

            <br>

            ${caso.expediente}

        </p>


        <p>

            <strong>MATERIA:</strong>

            <br>

            ${caso.materia}

        </p>


        <p>

            <strong>DIFICULTAD:</strong>

            <br>

            ${caso.dificultad}

        </p>


        <p>━━━━━━━━━━━━━━━━━━━━━</p>


        <h2>PARTES</h2>


        <p>

            <strong>DEMANDANTE:</strong>

            <br>

            ${caso.demandante}

        </p>


        <p>

            <strong>DEMANDADO:</strong>

            <br>

            ${caso.demandado}

        </p>


        <p>━━━━━━━━━━━━━━━━━━━━━</p>


        <h2>ANTECEDENTES</h2>


        <p>

            ${caso.descripcion}

        </p>


        <h2>PRUEBAS</h2>


        <p>

            ${caso.pruebas.join("<br><br>")}

        </p>


        <p>━━━━━━━━━━━━━━━━━━━━━</p>


        <h2>⚖️ ¿CUÁL ES TU DECISIÓN?</h2>


        <button onclick="veredicto(1)">

            A) ${caso.opciones[0]}

        </button>


        <br><br>


        <button onclick="veredicto(2)">

            B) ${caso.opciones[1]}

        </button>


        <br><br>


        <button onclick="veredicto(3)">

            C) ${caso.opciones[2]}

        </button>

    `;

}


/* =====================================================
   VEREDICTO
===================================================== */

function veredicto(decision) {

    let caso = casos[casoActual];


    if (!caso) {

        console.error("No se encontró el caso.");

        return;

    }


    const caja = document.querySelector(".box");


    /* ---------------------------------------------
       DECISIÓN CORRECTA
    --------------------------------------------- */

    if (decision === caso.respuestaCorrecta) {

        puntos += 500;

        casosResueltos++;

        actualizarRango();


        caja.innerHTML = `

            <h1>VERDICT</h1>


            <h2>⚖️ DECISIÓN CORRECTA</h2>


            <p>

                EXPEDIENTE:

                <br>

                ${caso.expediente}

            </p>


            <p>

                PUNTUACIÓN:

                <br>

                ${puntos}

            </p>


            <p>

                CASOS RESUELTOS:

                <br>

                ${casosResueltos}

            </p>


            <p>

                RANGO:

                <br>

                ${rango}

            </p>


            <button onclick="siguienteCaso()">

                SIGUIENTE CASO

            </button>

        `;


    }


    /* ---------------------------------------------
       DECISIÓN INCORRECTA
    --------------------------------------------- */

    else {

        caja.innerHTML = `

            <h1>VERDICT</h1>


            <h2>DECISIÓN REVISABLE</h2>


            <p>

                EXPEDIENTE:

                <br>

                ${caso.expediente}

            </p>


            <p>

                La justicia requiere más análisis.

            </p>


            <p>

                PUNTUACIÓN:

                <br>

                ${puntos}

            </p>


            <p>

                RANGO:

                <br>

                ${rango}

            </p>


            <button onclick="siguienteCaso()">

                CONTINUAR

            </button>

        `;

    }

}


/* =====================================================
   SIGUIENTE CASO
===================================================== */

function siguienteCaso() {

    casoActual++;


    /* ---------------------------------------------
       FIN DE LOS CASOS
    --------------------------------------------- */

    if (casoActual >= casos.length) {

        document.querySelector(".box").innerHTML = `

            <h1>FIN DEL TURNO</h1>


            <h2>⚖️ JUEZ</h2>


            <p>

                Has revisado todos los expedientes disponibles.

            </p>


            <p>

                PUNTUACIÓN FINAL:

                <br>

                ${puntos}

            </p>


            <p>

                CASOS RESUELTOS:

                <br>

                ${casosResueltos}

            </p>


            <p>

                RANGO FINAL:

                <br>

                ${rango}

            </p>

        `;


    }


    /* ---------------------------------------------
       SIGUIENTE EXPEDIENTE
    --------------------------------------------- */

    else {

        iniciarJuicio();

    }

}
