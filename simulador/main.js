// Estructura base para el simulador de votación
let estadoSimulador = {
    candidatos: [],
    preferencias: []
};

function iniciarSimulacion() {
    const input = document.getElementById('candidatos').value.trim();
    const display = document.getElementById('display-resultados');

    // 1. Validación: Integridad de los datos (Paso clave del sistema)
    if (input === "") {
        display.innerHTML = `<p style="color: red;">Error: Debe ingresar al menos un candidato.</p>`;
        return;
    }

    // 2. Organización: Estructuración interna de los candidatos
    estadoSimulador.candidatos = input.split(',').map(c => c.trim()).filter(c => c !== "");
    
    if (estadoSimulador.candidatos.length < 2) {
        display.innerHTML = `<p style="color: red;">Error: Ingrese al menos dos candidatos para poder comparar (ej. A, B).</p>`;
        return;
    }

    // 3. Generación de Outputs iniciales de confirmación
    display.innerHTML = `
        <p style="color: green;"><strong>¡Configuración exitosa!</strong></p>
        <p>Candidatos registrados: <strong>${estadoSimulador.candidatos.join(', ')}</strong></p>
        <p><em>Siguiente paso: Definir las preferencias de los electores para las votaciones.</em></p>
    `;
    
    console.log("Estado actual del simulador:", estadoSimulador);
}
