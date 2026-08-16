document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    // CANTERMAP
    // Análisis geográfico del delito + Cadena de Márkov
    // ============================================================

    // Coordenadas iniciales: Ciudad de México
    const defaultCenter = [19.4326, -99.1332];
    const defaultZoom = 12;

    // ============================================================
    // VERIFICAR LEAFLET
    // ============================================================

    if (typeof L === 'undefined') {
        console.error('Leaflet no se ha cargado correctamente.');
        return;
    }

    // ============================================================
    // INICIALIZAR MAPA
    // ============================================================

    const map = L.map('map').setView(defaultCenter, defaultZoom);

    // Capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Actualizar tamaño del mapa
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    // ============================================================
    // VARIABLES DE ESTADO
    // ============================================================

    let crimeEvents = [];

    let markersLayer = L.layerGroup().addTo(map);

    let canterCircleLayer = L.layerGroup().addTo(map);

    // ============================================================
    // CONFIGURACIÓN DE ZONAS
    // ============================================================

    /*
        Dividimos el mapa en una cuadrícula.

        Cada zona tiene aproximadamente 0.05 grados.
        Esto permite convertir coordenadas geográficas
        en "estados" para la cadena de Márkov.

        Ejemplo:

        A1 → A2 → B2 → B3

        Cada zona representa un estado.
    */

    const GRID_SIZE = 0.05;

    // ============================================================
    // ELEMENTOS DE LA INTERFAZ
    // ============================================================

    const eventCountEl = document.getElementById('event-count');

    const estimatedRadiusEl = document.getElementById('estimated-radius');

    const centerCoordsEl = document.getElementById('center-coords');

    const clearEventsBtn = document.getElementById('clear-events');

    // ============================================================
    // CREAR PANEL DE MÁRKOV
    // ============================================================

    const markovPanel = document.createElement('div');

    markovPanel.id = 'markov-analysis';

    markovPanel.style.marginTop = '25px';
    markovPanel.style.paddingTop = '18px';
    markovPanel.style.borderTop = '1px solid #d1d5db';

    markovPanel.innerHTML = `
        <h3 style="
            margin: 0 0 15px 0;
            font-size: 16px;
            color: #1f2937;
        ">
            Análisis de Márkov
        </h3>

        <div style="margin-bottom: 12px;">
            <div style="
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                font-weight: bold;
            ">
                Zona actual
            </div>

            <div id="current-zone" style="
                font-size: 22px;
                font-weight: bold;
                color: #2563eb;
                margin-top: 3px;
            ">
                —
            </div>
        </div>

        <div style="margin-bottom: 12px;">
            <div style="
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                font-weight: bold;
            ">
                Siguiente zona probable
            </div>

            <div id="next-zone" style="
                font-size: 18px;
                font-weight: bold;
                color: #dc2626;
                margin-top: 3px;
            ">
                —
            </div>
        </div>

        <div style="margin-bottom: 15px;">
            <div style="
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                font-weight: bold;
            ">
                Probabilidad
            </div>

            <div id="next-probability" style="
                font-size: 20px;
                font-weight: bold;
                margin-top: 3px;
            ">
                0%
            </div>
        </div>

        <div>
            <div style="
                font-size: 11px;
                color: #64748b;
                text-transform: uppercase;
                font-weight: bold;
                margin-bottom: 8px;
            ">
                Transiciones
            </div>

            <div id="transition-list" style="
                font-size: 12px;
                line-height: 1.8;
            ">
                Sin datos suficientes
            </div>
        </div>

        <div style="
            margin-top: 15px;
            padding: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 5px;
            font-size: 11px;
            line-height: 1.5;
            color: #475569;
        ">
            <strong>Modelo:</strong><br>
            La cadena de Márkov analiza la secuencia de zonas
            registradas y calcula la probabilidad de transición
            hacia otra zona.
        </div>
    `;

    // Insertar el panel después del botón de limpiar
    if (clearEventsBtn && clearEventsBtn.parentElement) {
        clearEventsBtn.parentElement.appendChild(markovPanel);
    }

    // ============================================================
    // REFERENCIAS A LOS ELEMENTOS DEL PANEL DE MÁRKOV
    // ============================================================

    const currentZoneEl = document.getElementById('current-zone');

    const nextZoneEl = document.getElementById('next-zone');

    const nextProbabilityEl = document.getElementById('next-probability');

    const transitionListEl = document.getElementById('transition-list');

    // ============================================================
    // FUNCIÓN: OBTENER ZONA
    // ============================================================

    function getZone(lat, lng) {

        /*
            Convertimos las coordenadas en una cuadrícula.

            El resultado será algo como:

            A1
            A2
            B1
            B2
            C3

            La fila representa la latitud.
            La columna representa la longitud.
        */

        const row = Math.floor(
            (lat - defaultCenter[0]) / GRID_SIZE
        );

        const column = Math.floor(
            (lng - defaultCenter[1]) / GRID_SIZE
        );

        // Convertir fila a letra
        const rowLetter = numberToLetter(row);

        return `${rowLetter}${column}`;
    }

    // ============================================================
    // FUNCIÓN: CONVERTIR NÚMERO A LETRA
    // ============================================================

    function numberToLetter(number) {

        /*
            Permite obtener:

            0  → A
            1  → B
            2  → C
            -1 → Z
            -2 → Y
        */

        const index = number + 13;

        if (index >= 0 && index < 26) {
            return String.fromCharCode(65 + index);
        }

        return `R${number}`;
    }

    // ============================================================
    // FUNCIÓN: ACTUALIZAR PANEL PRINCIPAL
    // ============================================================

    function updatePanel() {

        eventCountEl.textContent = crimeEvents.length;

        // --------------------------------------------------------
        // SIN EVENTOS
        // --------------------------------------------------------

        if (crimeEvents.length === 0) {

            centerCoordsEl.textContent = 'Sin definir';

            estimatedRadiusEl.textContent = '0.00 km';

            currentZoneEl.textContent = '—';

            nextZoneEl.textContent = '—';

            nextProbabilityEl.textContent = '0%';

            transitionListEl.innerHTML = 'Sin datos suficientes';

            return;
        }

        // --------------------------------------------------------
        // CÁLCULO DEL CENTRO GEOGRÁFICO
        // --------------------------------------------------------

        let totalLat = 0;

        let totalLng = 0;

        crimeEvents.forEach(event => {

            totalLat += event.lat;

            totalLng += event.lng;

        });

        const centerLat = totalLat / crimeEvents.length;

        const centerLng = totalLng / crimeEvents.length;

        centerCoordsEl.textContent =
            `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`;

        // --------------------------------------------------------
        // CÁLCULO DEL RADIO
        // --------------------------------------------------------

        let maxDistance = 0;

        const centerPoint = L.latLng(
            centerLat,
            centerLng
        );

        crimeEvents.forEach(event => {

            const eventPoint = L.latLng(
                event.lat,
                event.lng
            );

            const distance =
                centerPoint.distanceTo(eventPoint) / 1000;

            if (distance > maxDistance) {
                maxDistance = distance;
            }

        });

        estimatedRadiusEl.textContent =
            `${maxDistance.toFixed(2)} km`;

        // --------------------------------------------------------
        // DIBUJAR CÍRCULO DE CANTER
        // --------------------------------------------------------

        canterCircleLayer.clearLayers();

        // Marcador del centro
        L.marker(
            [centerLat, centerLng],
            {
                icon: L.divIcon({

                    className: 'center-marker',

                    html: `
                        <div style="
                            background-color:#ef4444;
                            width:14px;
                            height:14px;
                            border-radius:50%;
                            border:2px solid white;
                            box-shadow:0 0 4px rgba(0,0,0,0.4);
                        "></div>
                    `,

                    iconSize: [14, 14],

                    iconAnchor: [7, 7]

                })
            }
        )
        .addTo(canterCircleLayer)
        .bindPopup(
            'Centro Geográfico / Áncora estimada'
        );

        // Dibujar círculo
        if (maxDistance > 0) {

            L.circle(
                [centerLat, centerLng],
                {

                    radius: maxDistance * 1000,

                    color: '#3b82f6',

                    fillColor: '#3b82f6',

                    fillOpacity: 0.15,

                    weight: 2

                }
            )
            .addTo(canterCircleLayer);

        }

        // --------------------------------------------------------
        // ACTUALIZAR MÁRKOV
        // --------------------------------------------------------

        updateMarkovAnalysis();
    }

    // ============================================================
    // FUNCIÓN: CONSTRUIR TRANSICIONES
    // ============================================================

    function buildTransitions() {

        const transitions = {};

        /*
            Ejemplo:

            A1 → A2
            A2 → B2
            B2 → B3

            Se cuentan las veces que ocurre cada transición.
        */

        for (
            let i = 0;
            i < crimeEvents.length - 1;
            i++
        ) {

            const current =
                crimeEvents[i].zone;

            const next =
                crimeEvents[i + 1].zone;

            // Crear estado actual
            if (!transitions[current]) {
                transitions[current] = {};
            }

            // Crear transición
            if (!transitions[current][next]) {
                transitions[current][next] = 0;
            }

            // Incrementar contador
            transitions[current][next]++;
        }

        return transitions;
    }

    // ============================================================
    // FUNCIÓN: CONSTRUIR MATRIZ DE MÁRKOV
    // ============================================================

    function buildMarkovMatrix(transitions) {

        const matrix = {};

        Object.keys(transitions).forEach(currentZone => {

            matrix[currentZone] = {};

            const total =
                Object.values(
                    transitions[currentZone]
                )
                .reduce(
                    (sum, value) => sum + value,
                    0
                );

            Object.keys(
                transitions[currentZone]
            )
            .forEach(nextZone => {

                matrix[currentZone][nextZone] =
                    transitions[currentZone][nextZone] /
                    total;

            });

        });

        return matrix;
    }

    // ============================================================
    // FUNCIÓN: ACTUALIZAR ANÁLISIS DE MÁRKOV
    // ============================================================

    function updateMarkovAnalysis() {

        // Necesitamos por lo menos dos eventos
        if (crimeEvents.length < 2) {

            currentZoneEl.textContent =
                crimeEvents.length === 1
                    ? crimeEvents[0].zone
                    : '—';

            nextZoneEl.textContent =
                'Se necesitan 2 eventos';

            nextProbabilityEl.textContent =
                '0%';

            transitionListEl.innerHTML =
                'Registra al menos dos eventos para calcular transiciones.';

            return;
        }

        // --------------------------------------------------------
        // OBTENER TRANSICIONES
        // --------------------------------------------------------

        const transitions =
            buildTransitions();

        // --------------------------------------------------------
        // OBTENER MATRIZ DE MÁRKOV
        // --------------------------------------------------------

        const markovMatrix =
            buildMarkovMatrix(transitions);

        // --------------------------------------------------------
        // ZONA ACTUAL
        // --------------------------------------------------------

        const currentZone =
            crimeEvents[
                crimeEvents.length - 1
            ].zone;

        currentZoneEl.textContent =
            currentZone;

        // --------------------------------------------------------
        // COMPROBAR SI EXISTE INFORMACIÓN
        // --------------------------------------------------------

        if (!markovMatrix[currentZone]) {

            nextZoneEl.textContent =
                'Sin datos';

            nextProbabilityEl.textContent =
                '0%';

            transitionListEl.innerHTML =
                'No existen transiciones registradas desde esta zona.';

            return;
        }

        // --------------------------------------------------------
        // OBTENER PROBABILIDADES
        // --------------------------------------------------------

        const probabilities =
            markovMatrix[currentZone];

        // --------------------------------------------------------
        // ORDENAR DE MAYOR A MENOR
        // --------------------------------------------------------

        const sortedTransitions =
            Object.entries(probabilities)
            .sort(
                (a, b) => b[1] - a[1]
            );

        // --------------------------------------------------------
        // SIGUIENTE ZONA MÁS PROBABLE
        // --------------------------------------------------------

        const mostLikely =
            sortedTransitions[0];

        const nextZone =
            mostLikely[0];

        const probability =
            mostLikely[1];

        nextZoneEl.textContent =
            nextZone;

        nextProbabilityEl.textContent =
            `${(probability * 100).toFixed(1)}%`;

        // --------------------------------------------------------
        // CONSTRUIR LISTA DE TRANSICIONES
        // --------------------------------------------------------

        let html = '';

        sortedTransitions.forEach(
            ([zone, probability]) => {

                html += `
                    <div style="
                        display:flex;
                        justify-content:space-between;
                        border-bottom:1px solid #e5e7eb;
                        padding:3px 0;
                    ">
                        <span>
                            ${currentZone} → ${zone}
                        </span>

                        <strong>
                            ${(probability * 100).toFixed(1)}%
                        </strong>
                    </div>
                `;

            }
        );

        transitionListEl.innerHTML = html;
    }

    // ============================================================
    // FUNCIÓN: MOSTRAR MATRIZ COMPLETA EN CONSOLA
    // ============================================================

    function showMarkovMatrixInConsole() {

        if (crimeEvents.length < 2) {
            console.log(
                'No hay suficientes eventos para construir la matriz.'
            );
            return;
        }

        const transitions =
            buildTransitions();

        const matrix =
            buildMarkovMatrix(transitions);

        console.log(
            '========================================'
        );

        console.log(
            'MATRIZ DE TRANSICIÓN DE MÁRKOV'
        );

        console.log(
            '========================================'
        );

        console.table(matrix);

        return matrix;
    }

    // ============================================================
    // REGISTRAR EVENTO AL HACER CLIC
    // ============================================================

    map.on('click', (e) => {

        const {
            lat,
            lng
        } = e.latlng;

        // --------------------------------------------------------
        // DETERMINAR ZONA
        // --------------------------------------------------------

        const zone =
            getZone(lat, lng);

        // --------------------------------------------------------
        // REGISTRAR FECHA Y HORA
        // --------------------------------------------------------

        const timestamp =
            new Date();

        // --------------------------------------------------------
        // CREAR EVENTO
        // --------------------------------------------------------

        const event = {

            id:
                crimeEvents.length + 1,

            lat:
                lat,

            lng:
                lng,

            zone:
                zone,

            timestamp:
                timestamp.toISOString()

        };

        // Agregar evento
        crimeEvents.push(event);

        // --------------------------------------------------------
        // CREAR MARCADOR
        // --------------------------------------------------------

        const marker =
            L.marker(
                [lat, lng]
            )
            .addTo(markersLayer);

        // --------------------------------------------------------
        // POPUP
        // --------------------------------------------------------

        marker.bindPopup(`
            <div style="
                font-family:Arial,sans-serif;
                min-width:180px;
            ">

                <strong>
                    Evento Delictivo #${event.id}
                </strong>

                <hr style="
                    border:0;
                    border-top:1px solid #ddd;
                    margin:8px 0;
                ">

                <div>
                    <strong>Zona:</strong>
                    ${zone}
                </div>

                <div>
                    <strong>Lat:</strong>
                    ${lat.toFixed(4)}
                </div>

                <div>
                    <strong>Lng:</strong>
                    ${lng.toFixed(4)}
                </div>

                <div>
                    <strong>Registro:</strong>
                    ${timestamp.toLocaleString()}
                </div>

            </div>
        `);

        // --------------------------------------------------------
        // ACTUALIZAR PANEL
        // --------------------------------------------------------

        updatePanel();

        // --------------------------------------------------------
        // MOSTRAR MATRIZ EN CONSOLA
        // --------------------------------------------------------

        showMarkovMatrixInConsole();

    });

    // ============================================================
    // BOTÓN LIMPIAR EVENTOS
    // ============================================================

    clearEventsBtn.addEventListener(
        'click',
        () => {

            // Vaciar eventos
            crimeEvents = [];

            // Limpiar marcadores
            markersLayer.clearLayers();

            // Limpiar círculo
            canterCircleLayer.clearLayers();

            // Actualizar panel
            updatePanel();

            console.clear();

            console.log(
                'CanterMap: todos los eventos han sido eliminados.'
            );

        }
    );

    // ============================================================
    // MENSAJE INICIAL
    // ============================================================

    console.log(
        '========================================'
    );

    console.log(
        'CANTERMAP INICIADO'
    );

    console.log(
        'Análisis espacial + Cadena de Márkov'
    );

    console.log(
        '========================================'
    );

});
