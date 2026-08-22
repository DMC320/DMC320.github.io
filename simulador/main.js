// Estructura base para el simulador de votación
let estadoSimulador = {
    candidatos: [],
    preferencias: []
};

function iniciarSimulacion() {
    const input = document.getElementById('candidatos').value.trim();
    const display = document.getElementById('display-resultados');

    // 1. Validación: Integridad de los datos
    if (input === "") {
        display.innerHTML = `<p style="color: #d9534f;"><strong>Error:</strong> Debe ingresar al menos un candidato.</p>`;
        return;
    }

    // 2. Organización: Estructuración interna
    estadoSimulador.candidatos = input.split(',').map(c => c.trim()).filter(c => c !== "");
    
    if (estadoSimulador.candidatos.length < 2) {
        display.innerHTML = `<p style="color: #d9534f;"><strong>Error:</strong> Ingrese al menos dos candidatos para poder comparar (ej. A, B).</p>`;
        return;
    }

    // 3. Generación de Outputs
    display.innerHTML = `
        <p style="color: #27ae60;"><strong>¡Configuración exitosa!</strong></p>
        <p>Candidatos registrados: <strong>${estadoSimulador.candidatos.join(', ')}</strong></p>
        <p><em>Siguiente paso: Definir las preferencias de los electores para las votaciones.</em></p>
    `;
    
    console.log("Estado actual del simulador:", estadoSimulador);
}
