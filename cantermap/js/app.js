document.addEventListener('DOMContentLoaded', () => {
    // Coordenadas iniciales: Ciudad de México
    const defaultCenter = [19.4326, -99.1332];
    const defaultZoom = 12;

    // Inicializar el mapa de Leaflet
    const map = L.map('map').setView(defaultCenter, defaultZoom);

    // Agregar capa base de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Variables de estado para los eventos delictivos y elementos visuales
    let crimeEvents = [];
    let markersLayer = L.layerGroup().addTo(map);
    let canterCircleLayer = L.layerGroup().addTo(map);

    // Elementos de la interfaz
    const eventCountEl = document.getElementById('event-count');
    const estimatedRadiusEl = document.getElementById('estimated-radius');
    const centerCoordsEl = document.getElementById('center-coords');
    const clearEventsBtn = document.getElementById('clear-events');

    // Función para actualizar la interfaz del panel
    function updatePanel() {
        eventCountEl.textContent = crimeEvents.length;

        if (crimeEvents.length === 0) {
            centerCoordsEl.textContent = 'Sin definir';
            estimatedRadiusEl.textContent = '0.00 km';
            return;
        }

        // Cálculo del centro geográfico (Centroide simple)
        let totalLat = 0;
        let totalLng = 0;

        crimeEvents.forEach(event => {
            totalLat += event.lat;
            totalLng += event.lng;
        });

        const centerLat = totalLat / crimeEvents.length;
        const centerLng = totalLng / crimeEvents.length;

        centerCoordsEl.textContent = `${centerLat.toFixed(4)}, ${centerLng.toFixed(4)}`;

        // Cálculo preliminar del radio (Distancia máxima desde el centroide a los eventos)
        let maxDistance = 0;
        const centerPoint = L.latLng(centerLat, centerLng);

        crimeEvents.forEach(event => {
            const eventPoint = L.latLng(event.lat, event.lng);
            const distance = centerPoint.distanceTo(eventpoint = eventPoint) / 1000; // en kilómetros
            if (distance > maxDistance) {
                maxDistance = distance;
            }
        });

        estimatedRadiusEl.textContent = `${maxDistance.toFixed(2)} km`;

        // Dibujar círculo de Canter y centroide en el mapa
        canterCircleLayer.clearLayers();

        // Marcador del centro geográfico
        L.marker([centerLat, centerLng], {
            icon: L.divIcon({
                className: 'center-marker',
                html: '<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
            })
        }).addTo(canterCircleLayer).bindPopup('Centro Geográfico / Áncora estimada');

        // Círculo de Canter basado en la distancia máxima (radio)
        if (maxDistance > 0) {
            L.circle([centerLat, centerLng], {
                radius: maxDistance * 1000, // Leaflet usa metros
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.15,
                weight: 2
            }).addTo(canterCircleLayer);
        }
    }

    // Manejador de clics en el mapa para registrar eventos
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        crimeEvents.push({ lat, lng });

        // Agregar marcador al mapa
        L.marker([lat, lng]).addTo(markersLayer)
            .bindPopup(`Evento Delictivo<br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`);

        updatePanel();
    });

    // Botón para limpiar eventos
    clearEventsBtn.addEventListener('click', () => {
        crimeEvents = [];
        markersLayer.clearLayers();
        canterCircleLayer.clearLayers();
        updatePanel();
    });
});
