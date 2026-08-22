// Estructura base para el simulador de votación
let estadoSimulador = {
    candidatos: [],
    preferencias: []
};

function iniciarSimulacion() {
    const input = document.getElementById('candidatos').value;
    estadoSimulador.candidatos = input.split(',').map(c => c.trim());
    
    console.log("Candidatos registrados:", estadoSimulador.candidatos);
    
    // Mostrar un aviso visual temporal en la interfaz
    const display = document.getElementById('display-resultados');
    display.innerHTML = `<p>Candidatos configurados: <strong>${estadoSimulador.candidatos.join(', ')}</strong></p>`;
}
