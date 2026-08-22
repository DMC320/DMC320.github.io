// Estructura de estado global del simulador
let estadoSimulador = {
    candidatos: [],
    preferencias: []
};

function iniciarSimulacion() {
    const input = document.getElementById('candidatos').value.trim();
    const display = document.getElementById('display-resultados');

    // 1. Validación de integridad de datos
    if (input === "") {
        display.innerHTML = `<p style="color: #ff3333;">[ERROR]: Debe ingresar al menos un candidato.</p>`;
        return;
    }

    // 2. Procesamiento y limpieza de candidatos
    estadoSimulador.candidatos = input.split(',').map(c => c.trim()).filter(c => c !== "");
    
    if (estadoSimulador.candidatos.length < 2) {
        display.innerHTML = `<p style="color: #ff3333;">[ERROR]: Se requieren al menos dos candidatos para comparar (ej. A, B).</p>`;
        return;
    }

    // 3. Activación de interfaz de votación y confirmación
    document.getElementById('votacion').style.display = 'block';

    display.innerHTML = `
        <p style="color: #00ff66;"><strong>[ESTADO]: Configuración exitosa.</strong></p>
        <p>Candidatos activos: <strong>[ ${estadoSimulador.candidatos.join(', ')} ]</strong></p>
        <p><em>Proceda a registrar las preferencias de los electores en el módulo superior.</em></p>
    `;
    
    console.log("Estado inicializado:", estadoSimulador);
}

function registrarVoto() {
    const inputVoto = document.getElementById('preferencia-elector').value.trim();
    const displayVotos = document.getElementById('display-votos');

    // Validación básica de sintaxis de preferencia
    if (!inputVoto.includes(">")) {
        displayVotos.innerHTML = `<p style="color: #ff3333;">[ERROR]: Formato inválido. Use el operador mayor que (Ej: A > B > C)</p>`;
        return;
    }

    // Registrar preferencia en el estado
    estadoSimulador.preferencias.push(inputVoto);
    
    // Renderizar lista acumulada de votos
    displayVotos.innerHTML = `
        <p style="color: #00ff66;"><strong>Electores registrados: ${estadoSimulador.preferencias.length}</strong></p>
        <ul>
            ${estadoSimulador.preferencias.map(v => `<li>Elector: ${v}</li>`).join('')}
        </ul>
    `;
    
    // Limpiar input de voto
    document.getElementById('preferencia-elector').value = "";
    console.log("Preferencias acumuladas:", estadoSimulador.preferencias);
}
function ejecutarAnalisis() {
    const displayAnalisis = document.getElementById('display-analisis');
    const candidatos = estadoSimulador.candidatos;
    const preferencias = estadoSimulador.preferencias;

    if (preferencias.length === 0) {
        displayAnalisis.innerHTML = `<p style="color: #ff3333;">[ERROR]: Registre al menos un voto primero.</p>`;
        return;
    }

    // Inicializar matriz de victorias
    let victorias = {};
    candidatos.forEach(c => victorias[c] = 0);

    // Procesamiento simplificado (Contar cuántas veces aparece un candidato antes que otro)
    displayAnalisis.innerHTML = `<h3>Reporte de Resultados:</h3>`;
    
    candidatos.forEach(c1 => {
        candidatos.forEach(c2 => {
            if (c1 !== c2) {
                let count = 0;
                preferencias.forEach(p => {
                    if (p.indexOf(c1) < p.indexOf(c2)) count++;
                });
                displayAnalisis.innerHTML += `<p style="color: #00ff66;">${c1} prefiere sobre ${c2} en ${count} votos.</p>`;
            }
        });
    });
    
    displayAnalisis.innerHTML += `
        <p style="margin-top:20px; border-top: 1px solid #444; padding-top:10px;">
        <em>Nota: El análisis muestra la preferencia colectiva. Si A>B, B>C y C>A, se ha detectado una Paradoja de Condorcet, confirmando la tesis del Teorema de Arrow.</em>
        </p>
    `;
}
