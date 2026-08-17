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

    // Capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Forzar actualización del tamaño del mapa
    setTimeout(() => {
        map.invalidateSize();
    }, 100);

    // ============================================================
    // VARIABLES DE ESTADO
    // ============================================================

    let crimeEvents = [];

    // Marcadores de eventos
    let markersLayer = L.layerGroup().addTo(map);

    // Círculo de Canter y centro geográfico
    let canterCircleLayer = L.layerGroup().addTo(map);

    // NUEVA CAPA:
    // Visualización de la zona probable según Márkov
    let markovZoneLayer = L.layerGroup().addTo(map);

    // ============================================================
    // CONFIGURACIÓN DE ZONAS
    // ============================================================

    /*
        Dividimos el mapa en una cuadrícula.

        Cada zona funciona como un "estado"
        dentro de la cadena de Márkov.

        Ejemplo:

        M-2 → M-1 → N-1 → N-2

        La zona depende de la latitud y longitud
        donde se registra el evento.
    */

    const GRID_SIZE = 0.05;

    // ============================================================
    // ELEMENTOS DE LA INTERFAZ
    // ============================================================

    const eventCountEl =
        document.getElementById('event-count');

    const estimatedRadiusEl =
        document.getElementById('estimated-radius');

    const centerCoordsEl =
        document.getElementById('center-coords');

    const clearEventsBtn =
        document.getElementById('clear-events');

    // ============================================================
    // CREAR PANEL DE MÁRKOV
    // ============================================================

    const markovPanel =
        document.createElement('div');

    markovPanel.id =
        'markov-analysis';

    markovPanel.style.marginTop =
        '25px';

    markovPanel.style.paddingTop =
        '18px';

    markovPanel.style.borderTop =
        '1px solid #d1d5db';

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

            La cadena de Márkov analiza la secuencia
            de zonas registradas y calcula la probabilidad
            de transición hacia otra zona.

        </div>

    `;

    // Insertar panel después del botón
    if (
        clearEventsBtn &&
        clearEventsBtn.parentElement
    ) {

        clearEventsBtn.parentElement
            .appendChild(markovPanel);

    }

    // ============================================================
    // REFERENCIAS A ELEMENTOS DEL PANEL
    // ============================================================

    const currentZoneEl =
        document.getElementById('current-zone');

    const nextZoneEl =
        document.getElementById('next-zone');

    const nextProbabilityEl =
        document.getElementById('next-probability');

    const transitionListEl =
        document.getElementById('transition-list');

    // ============================================================
    // FUNCIÓN: OBTENER ZONA
    // ============================================================

    function getZone(lat, lng) {

        const row =
            Math.floor(
                (lat - defaultCenter[0]) /
                GRID_SIZE
            );

        const column =
            Math.floor(
                (lng - defaultCenter[1]) /
                GRID_SIZE
            );

        const rowLetter =
            numberToLetter(row);

        return `${rowLetter}${column}`;
    }

    // ============================================================
    // FUNCIÓN: CONVERTIR NÚMERO A LETRA
    // ============================================================

    function numberToLetter(number) {

        const index =
            number + 13;

        if (
            index >= 0 &&
            index < 26
        ) {

            return String.fromCharCode(
                65 + index
            );

        }

        return `R${number}`;
    }

    // ============================================================
    // NUEVA FUNCIÓN:
    // OBTENER LÍMITES GEOGRÁFICOS DE UNA ZONA
    // ============================================================

    function getZoneBounds(zone) {

        /*
            Convierte una zona como:

            M-2
            M-1
            N0
            N1

            en límites geográficos
            para poder dibujarla en Leaflet.
        */

        const match =
            zone.match(/^([A-Z]+)(-?\d+)$/);

        if (!match) {
            return null;
        }

        const letter =
            match[1];

        const column =
            parseInt(
                match[2],
                10
            );

        const row =
            letter.charCodeAt(0) -
            65 -
            13;

        const south =
            defaultCenter[0] +
            (row * GRID_SIZE);

        const north =
            south +
            GRID_SIZE;

        const west =
            defaultCenter[1] +
            (column * GRID_SIZE);

        const east =
            west +
            GRID_SIZE;

        return [
            [south, west],
            [north, east]
        ];
    }

    // ============================================================
    // NUEVA FUNCIÓN:
    // VISUALIZAR ZONA PROBABLE
    // ============================================================

    function visualizePredictedZone(
        zone,
        probability
    ) {

        // Limpiar cualquier predicción anterior
        markovZoneLayer.clearLayers();

        if (!zone) {
            return;
        }

        // Obtener límites
        const bounds =
            getZoneBounds(zone);

        if (!bounds) {
            console.warn(
                'No se pudieron calcular los límites de la zona:',
                zone
            );

            return;
        }

        // ========================================================
        // DIBUJAR RECTÁNGULO DE LA ZONA
        // ========================================================

        const predictedRectangle =
            L.rectangle(
                bounds,
                {

                    color: '#16a34a',

                    weight: 4,

                    fillColor: '#22c55e',

                    fillOpacity: 0.25,

                    dashArray: '8, 6'

                }
            )
            .addTo(markovZoneLayer);

        // ========================================================
        // OBTENER CENTRO DE LA ZONA
        // ========================================================

        const zoneCenter =
            predictedRectangle
                .getBounds()
                .getCenter();

        // ========================================================
        // MARCADOR DE LA ZONA PROBABLE
        // ========================================================

        L.marker(
            zoneCenter,
            {

                icon: L.divIcon({

                    className:
                        'predicted-zone-marker',

                    html: `

                        <div style="
                            background:#15803d;
                            color:white;
                            padding:8px 12px;
                            border-radius:6px;
                            border:2px solid white;
                            box-shadow:0 2px 8px rgba(0,0,0,.35);
                            font-family:Arial,sans-serif;
                            font-size:12px;
                            font-weight:bold;
                            text-align:center;
                            line-height:1.3;
                            white-space:nowrap;
                        ">

                            ZONA PROBABLE<br>

                            <span style="
                                font-size:15px;
                            ">
                                ${zone}
                            </span>

                            <br>

                            <span style="
                                font-size:11px;
                            ">
                                ${(probability * 100).toFixed(1)}%
                            </span>

                        </div>

                    `,

                    iconSize:
                        [130, 65],

                    iconAnchor:
                        [65, 32]

                })

            }
        )
        .addTo(markovZoneLayer)
        .bindPopup(`

            <div style="
                font-family:Arial,sans-serif;
                text-align:center;
            ">

                <strong>
                    Zona con mayor probabilidad
                </strong>

                <hr>

                <div>
                    <strong>Zona:</strong>
                    ${zone}
                </div>

                <div>
                    <strong>Probabilidad:</strong>
                    ${(probability * 100).toFixed(1)}%
                </div>

                <div style="
                    margin-top:8px;
                    font-size:11px;
                    color:#64748b;
                ">
                    Resultado del modelo de Márkov
                    con los eventos registrados.
                </div>

            </div>

        `);

        // ========================================================
        // LÍNEA DESDE EL ÚLTIMO EVENTO
        // HACIA LA ZONA PROBABLE
        // ========================================================

        if (crimeEvents.length > 0) {

            const currentEvent =
                crimeEvents[
                    crimeEvents.length - 1
                ];

            L.polyline(
                [

                    [
                        currentEvent.lat,
                        currentEvent.lng
                    ],

                    [
                        zoneCenter.lat,
                        zoneCenter.lng
                    ]

                ],
                {

                    color: '#16a34a',

                    weight: 3,

                    dashArray: '6, 8',

                    opacity: 0.8

                }
            )
            .addTo(markovZoneLayer);

        }

    }

    // ============================================================
    // ACTUALIZAR PANEL PRINCIPAL
    // ============================================================

    function updatePanel() {

        eventCountEl.textContent =
            crimeEvents.length;

        // ========================================================
        // SIN EVENTOS
        // ========================================================

        if (
            crimeEvents.length === 0
        ) {

            centerCoordsEl.textContent =
                'Sin definir';

            estimatedRadiusEl.textContent =
                '0.00 km';

            currentZoneEl.textContent =
                '—';

            nextZoneEl.textContent =
                '—';

            nextProbabilityEl.textContent =
                '0%';

            transitionListEl.innerHTML =
                'Sin datos suficientes';

            // IMPORTANTE:
            // eliminar predicción anterior
            markovZoneLayer.clearLayers();

            return;
        }

        // ========================================================
        // CENTRO GEOGRÁFICO
        // ========================================================

        let totalLat = 0;
        let totalLng = 0;

        crimeEvents.forEach(
            event => {

                totalLat +=
                    event.lat;

                totalLng +=
                    event.lng;

            }
        );

        const centerLat =
            totalLat /
            crimeEvents.length;

        const centerLng =
            totalLng /
            crimeEvents.length;

        centerCoordsEl.textContent =
            `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`;

        // ========================================================
        // RADIO
        // ========================================================

        let maxDistance = 0;

        const centerPoint =
            L.latLng(
                centerLat,
                centerLng
            );

        crimeEvents.forEach(
            event => {

                const eventPoint =
                    L.latLng(
                        event.lat,
                        event.lng
                    );

                const distance =
                    centerPoint
                        .distanceTo(
                            eventPoint
                        ) / 1000;

                if (
                    distance >
                    maxDistance
                ) {

                    maxDistance =
                        distance;

                }

            }
        );

        estimatedRadiusEl.textContent =
            `${maxDistance.toFixed(2)} km`;

        // ========================================================
        // DIBUJAR CÍRCULO DE CANTER
        // ========================================================

        canterCircleLayer
            .clearLayers();

        // Centro geográfico
        L.marker(
            [
                centerLat,
                centerLng
            ],
            {

                icon: L.divIcon({

                    className:
                        'center-marker',

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

                    iconSize:
                        [14, 14],

                    iconAnchor:
                        [7, 7]

                })

            }
        )
        .addTo(
            canterCircleLayer
        )
        .bindPopup(
            'Centro Geográfico / Áncora estimada'
        );

        // ========================================================
        // CÍRCULO
        // ========================================================

        if (
            maxDistance > 0
        ) {

            L.circle(
                [
                    centerLat,
                    centerLng
                ],
                {

                    radius:
                        maxDistance * 1000,

                    color:
                        '#3b82f6',

                    fillColor:
                        '#3b82f6',

                    fillOpacity:
                        0.15,

                    weight:
                        2

                }
            )
            .addTo(
                canterCircleLayer
            );

        }

        // ========================================================
        // ACTUALIZAR MÁRKOV
        // ========================================================

        updateMarkovAnalysis();

    }

    // ============================================================
    // CONSTRUIR TRANSICIONES
    // ============================================================

    function buildTransitions() {

        const transitions = {};

        /*
            Ejemplo:

            M-2 → M-2
            M-2 → N-2
            N-2 → N-3

            Se cuentan las veces que ocurre
            cada transición.
        */

        for (
            let i = 0;
            i <
            crimeEvents.length - 1;
            i++
        ) {

            const current =
                crimeEvents[i].zone;

            const next =
                crimeEvents[i + 1].zone;

            // Crear estado actual
            if (
                !transitions[current]
            ) {

                transitions[current] =
                    {};

            }

            // Crear transición
            if (
                !transitions[current][next]
            ) {

                transitions[current][next] =
                    0;

            }

            // Incrementar contador
            transitions[current][next]++;

        }

        return transitions;
    }

    // ============================================================
    // CONSTRUIR MATRIZ DE MÁRKOV
    // ============================================================

    function buildMarkovMatrix(
        transitions
    ) {

        const matrix = {};

        Object.keys(
            transitions
        )
        .forEach(
            currentZone => {

                matrix[currentZone] =
                    {};

                const total =
                    Object.values(
                        transitions[
                            currentZone
                        ]
                    )
                    .reduce(
                        (
                            sum,
                            value
                        ) =>
                            sum + value,
                        0
                    );

                Object.keys(
                    transitions[
                        currentZone
                    ]
                )
                .forEach(
                    nextZone => {

                        matrix[
                            currentZone
                        ][
                            nextZone
                        ] =
                            transitions[
                                currentZone
                            ][
                                nextZone
                            ] / total;

                    }
                );

            }
        );

        return matrix;
    }

    // ============================================================
    // ACTUALIZAR ANÁLISIS DE MÁRKOV
    // ============================================================

    function updateMarkovAnalysis() {

        // ========================================================
        // MENOS DE DOS EVENTOS
        // ========================================================

        if (
            crimeEvents.length < 2
        ) {

            markovZoneLayer
                .clearLayers();

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

        // ========================================================
        // TRANSICIONES
        // ========================================================

        const transitions =
            buildTransitions();

        // ========================================================
        // MATRIZ
        // ========================================================

        const markovMatrix =
            buildMarkovMatrix(
                transitions
            );

        // ========================================================
        // ZONA ACTUAL
        // ========================================================

        const currentZone =
            crimeEvents[
                crimeEvents.length - 1
            ].zone;

        currentZoneEl.textContent =
            currentZone;

        // ========================================================
        // COMPROBAR INFORMACIÓN
        // ========================================================

        if (
            !markovMatrix[
                currentZone
            ]
        ) {

            markovZoneLayer
                .clearLayers();

            nextZoneEl.textContent =
                'Sin datos';

            nextProbabilityEl.textContent =
                '0%';

            transitionListEl.innerHTML =
                'No existen transiciones registradas desde esta zona.';

            return;
        }

        // ========================================================
        // PROBABILIDADES
        // ========================================================

        const probabilities =
            markovMatrix[
                currentZone
            ];

        // ========================================================
        // ORDENAR PROBABILIDADES
        // ========================================================

        const sortedTransitions =
            Object.entries(
                probabilities
            )
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );

        // ========================================================
        // SIGUIENTE ZONA MÁS PROBABLE
        // ========================================================

        const mostLikely =
            sortedTransitions[0];

        const nextZone =
            mostLikely[0];

        const probability =
            mostLikely[1];

        // ========================================================
        // ACTUALIZAR PANEL
        // ========================================================

        nextZoneEl.textContent =
            nextZone;

        nextProbabilityEl.textContent =
            `${(
                probability * 100
            ).toFixed(1)}%`;

        // ========================================================
        // NUEVO:
        // VISUALIZAR ZONA PROBABLE EN EL MAPA
        // ========================================================

        visualizePredictedZone(
            nextZone,
            probability
        );

        // ========================================================
        // CONSTRUIR LISTA DE TRANSICIONES
        // ========================================================

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
                            ${currentZone}
                            →
                            ${zone}
                        </span>

                        <strong>
                            ${(
                                probability * 100
                            ).toFixed(1)}%
                        </strong>

                    </div>

                `;

            }
        );

        transitionListEl.innerHTML =
            html;

    }

    // ============================================================
    // MOSTRAR MATRIZ COMPLETA EN CONSOLA
    // ============================================================

    function showMarkovMatrixInConsole() {

        if (
            crimeEvents.length < 2
        ) {

            console.log(
                'No hay suficientes eventos para construir la matriz.'
            );

            return;
        }

        const transitions =
            buildTransitions();

        const matrix =
            buildMarkovMatrix(
                transitions
            );

        console.log(
            '========================================'
        );

        console.log(
            'MATRIZ DE TRANSICIÓN DE MÁRKOV'
        );

        console.log(
            '========================================'
        );

        console.table(
            matrix
        );

        return matrix;
    }

    // ============================================================
    // REGISTRAR EVENTO AL HACER CLIC
    // ============================================================

    map.on(
        'click',
        (e) => {

            const {
                lat,
                lng
            } = e.latlng;

            // ====================================================
            // DETERMINAR ZONA
            // ====================================================

            const zone =
                getZone(
                    lat,
                    lng
                );

            // ====================================================
            // FECHA Y HORA
            // ====================================================

            const timestamp =
                new Date();

            // ====================================================
            // CREAR EVENTO
            // ====================================================

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

            // ====================================================
            // AGREGAR EVENTO
            // ====================================================

            crimeEvents.push(
                event
            );

            // ====================================================
            // MARCADOR
            // ====================================================

            const marker =
                L.marker(
                    [
                        lat,
                        lng
                    ]
                )
                .addTo(
                    markersLayer
                );

            // ====================================================
            // POPUP
            // ====================================================

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

            // ====================================================
            // ACTUALIZAR PANEL
            // ====================================================

            updatePanel();

            // ====================================================
            // MATRIZ EN CONSOLA
            // ====================================================

            showMarkovMatrixInConsole();

        }
    );

    // ============================================================
    // BOTÓN LIMPIAR EVENTOS
    // ============================================================

    if (clearEventsBtn) {

        clearEventsBtn.addEventListener(
            'click',
            () => {

                // Vaciar eventos
                crimeEvents = [];

                // Limpiar marcadores
                markersLayer
                    .clearLayers();

                // Limpiar círculo
                canterCircleLayer
                    .clearLayers();

                // NUEVO:
                // Limpiar zona probable
                markovZoneLayer
                    .clearLayers();

                // Actualizar panel
                updatePanel();

                console.clear();

                console.log(
                    'CanterMap: todos los eventos han sido eliminados.'
                );

            }
        );

    }

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
