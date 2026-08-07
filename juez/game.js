function iniciarJuicio() {

    document.querySelector(".box").innerHTML = `

        <h1>CASO #001</h1>

        <h2>EL CONTRATO PERDIDO</h2>

        <p>
        Un ciudadano demanda a una empresa
        por incumplimiento de contrato.
        </p>

        <p>
        PRUEBAS:
        <br>
        📄 Contrato firmado
        <br>
        👤 Testimonio
        <br>
        💰 Registro de pago
        </p>

        <h2>
        ¿Cuál es tu decisión?
        </h2>

        <button onclick="veredicto('correcto')">
        A) Dar la razón al demandante
        </button>

        <br><br>

        <button onclick="veredicto('incorrecto')">
        B) Absolver al acusado
        </button>

        <br><br>

        <button onclick="veredicto('pruebas')">
        C) Pedir más pruebas
        </button>

    `;

}


function veredicto(resultado){

    if(resultado === "correcto"){

        document.querySelector(".box").innerHTML = `

        <h1>VERDICT</h1>

        <h2>DECISIÓN CORRECTA</h2>

        <p>
        PUNTUACIÓN: +500
        </p>

        <p>
        RANGO:
        <br>
        JUEZ NOVATO
        </p>

        `;

    } else {

        document.querySelector(".box").innerHTML = `

        <h1>VERDICT</h1>

        <h2>DECISIÓN REVISABLE</h2>

        <p>
        La justicia requiere más análisis.
        </p>

        `;

    }

}
