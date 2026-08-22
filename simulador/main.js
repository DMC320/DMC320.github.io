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
