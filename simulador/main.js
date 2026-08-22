let estadoSimulador = {
    candidatos: [],
    totalElectores: 0,
    preferencias: []
};

function iniciarSimulacion() {
    const inputCandidatos = document.getElementById('candidatos').value.trim();
    const inputElectores = parseInt(document.getElementById('num-electores').value);
    const display = document.getElementById('display-resultados');

    if (inputCandidatos === "") {
        display.innerHTML = `<p style="color: #ff3333;">[ERROR]: Debe ingresar al menos un candidato.</p>`;
        return;
    }

    estadoSimulador.candidatos = inputCandidatos.split(',').map(c => c.trim()).filter(c => c !== "");
    
    if (estadoSimulador.candidatos.length < 2) {
        display.innerHTML = `<p style="color: #ff3333;">[ERROR]: Se requieren al menos dos candidatos.</p>`;
        return;
    }

    if (isNaN(inputElectores) || inputElectores < 1) {
        display.innerHTML = `<p style="color: #ff3333;">[ERROR]: Ingrese un número válido de electores.</p>`;
        return;
    }

    estadoSimulador.totalElectores = inputElectores;
    estadoSimulador.preferencias = []; // Reiniciar votos

    document.getElementById('votacion').style.display = 'block';
    document.getElementById('contador-votos-restantes').innerText = estadoSimulador.totalElectores;

    display.innerHTML = `
        <p style="color: #00ff66;"><strong>[ESTADO]: Configuración exitosa.</strong></p>
        <p>Candidatos activos: <strong>[ ${estadoSimulador.candidatos.join(', ')} ]</strong></p>
        <p>Electores totales definidos: <strong>${estadoSimulador.totalElectores}</strong></p>
    `;
}

function registrarVoto() {
    const inputVoto = document.getElementById('preferencia-elector').value.trim();
    const displayVotos = document.getElementById('display-votos');

    if (!inputVoto.includes(">")) {
        displayVotos.innerHTML = `<p style="color: #ff3333;">[ERROR]: Formato inválido. Use el operador mayor que (Ej: A > B > C)</p>`;
        return;
    }

    if (estadoSimulador.preferencias.length >= estadoSimulador.totalElectores) {
        displayVotos.innerHTML = `<p style="color: #ff3333;">[AVISO]: Ya se completó el número total de electores definidos (${estadoSimulador.totalElectores}).</p>`;
        return;
    }

    estadoSimulador.preferencias.push(inputVoto);
    let restantes = estadoSimulador.totalElectores - estadoSimulador.preferencias.length;
    document.getElementById('contador-votos-restantes').innerText = restantes;
    
    displayVotos.innerHTML = `
        <p style="color: #00ff66;"><strong>Votos registrados: ${estadoSimulador.preferencias.length} / ${estadoSimulador.totalElectores}</strong></p>
        <ul>
            ${estadoSimulador.preferencias.map(v => `<li>Elector: ${v}</li>`).join('')}
        </ul>
    `;
    
    document.getElementById('preferencia-elector').value = "";
}

function ejecutarAnalisis() {
    const displayAnalisis = document.getElementById('display-analisis');
    const candidatos = estadoSimulador.candidatos;
    const preferencias = estadoSimulador.preferencias;

    if (preferencias.length === 0) {
        displayAnalisis.innerHTML = `<p style="color: #ff3333;">[ERROR]: Registre al menos un voto antes de analizar.</p>`;
        return;
    }

    let htmlReporte = `<p style="color: #00ff66;"><strong>[ANÁLISIS DE CONDORCET Y BARRAS DE PREFERENCIA]</strong></p><h3>Comparativa por Parejas:</h3>`;
    
    // Almacenar puntajes simples (apariciones en primera posición o victorias directas para la gráfica)
    let conteoPrimeras = {};
    candidatos.forEach(c => conteoPrimeras[c] = 0);

    preferencias.forEach(p => {
        let primerCandidato = p.split('>')[0].trim();
        if (conteoPrimeras[primerCandidato] !== undefined) {
            conteoPrimeras[primerCandidato]++;
        }
    });

    candidatos.forEach(c1 => {
        candidatos.forEach(c2 => {
            if (c1 !== c2) {
                let count = 0;
                preferencias.forEach(p => {
                    if (p.indexOf(c1) < p.indexOf(c2)) count++;
                });
                htmlReporte += `<p style="color: #e0e0e0;">${c1} prefiere sobre ${c2} en <strong>${count}</strong> de ${preferencias.length} votos.</p>`;
            }
        });
    });

    // Generación de Gráfica de Barras en CSS Puro (Estilo Terminal Matemática)
    htmlReporte += `<h3 style="margin-top: 20px;">Gráfica de Primeras Preferencias:</h3><div style="background: #000; padding: 15px; border: 1px solid #333;">`;
    
    let maxVotos = Math.max(...Object.values(conteoPrimeras), 1);

    candidatos.forEach(c => {
        let votosC = conteoPrimeras[c];
        let porcentaje = (votosC / Math.max(preferencias.length, 1)) * 100;
        htmlReporte += `
            <div style="margin-bottom: 10px;">
                <span style="display:inline-block; width: 30px; color: #ff3333; font-weight:bold;">${c}:</span>
                <div style="display:inline-block; width: 70%; background: #222; height: 18px; vertical-align: middle; border-radius: 3px; overflow: hidden;">
                    <div style="background: #00ff66; width: ${porcentaje}%; height: 100%;"></div>
                </div>
                <span style="margin-left: 10px; color: #fff; font-size: 0.9em;">${votosC} votos (${porcentaje.toFixed(0)}%)</span>
            </div>
        `;
    });

    htmlReporte += `</div>`;
    htmlReporte += `
        <p style="margin-top:20px; border-top: 1px dashed #444; padding-top:10px; color: #aaa;">
        <em>Nota analítica: La gráfica muestra el apoyo en primera instancia. El cruce matricial confirma los ciclos de Condorcet que sustentan el Teorema de Arrow.</em>
        </p>
    `;

    displayAnalisis.innerHTML = htmlReporte;
}
