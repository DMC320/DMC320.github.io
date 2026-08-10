```javascript
// ==========================================
// CANTERMAP
// Análisis geográfico del delito
// ==========================================


// ==========================================
// INICIALIZAR MAPA
// ==========================================

const map = L.map("map").setView(
    [19.4326, -99.1332],
    12
);


// ==========================================
// MAPA BASE
// ==========================================

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution: "&copy; OpenStreetMap contributors"
    }
).addTo(map);


// ==========================================
// VARIABLES
// ==========================================

let events = [];

let markers = [];

let analysisCircle = null;


// ==========================================
// AGREGAR EVENTO
// ==========================================

map.on("click", function (e) {

    const latitude = e.latlng.lat;

    const longitude = e.latlng.lng;


    const event = {
        latitude: latitude,
        longitude: longitude
    };


    events.push(event);


    // Crear marcador

    const marker = L.marker([
        latitude,
        longitude
    ]).addTo(map);


    marker.bindPopup(
        `
        <strong>Evento ${events.length}</strong>
        <br><br>
        Latitud: ${latitude.toFixed(5)}
        <br>
        Longitud: ${longitude.toFixed(5)}
        `
    );


    markers.push(marker);


    updateInterface();

});


// ==========================================
// ACTUALIZAR INTERFAZ
// ==========================================

function updateInterface() {

    const eventCount =
        document.getElementById("event-count");

    const radiusElement =
        document.getElementById("radius");

    const centerElement =
        document.getElementById("center");


    eventCount.textContent =
        events.length;


    // Si no existen eventos

    if (events.length === 0) {

        radiusElement.textContent = "—";

        centerElement.textContent = "—";


        if (analysisCircle !== null) {

            map.removeLayer(analysisCircle);

            analysisCircle = null;

        }

        return;
    }


    // ======================================
    // CENTRO PROMEDIO
    // ======================================

    let latitudeSum = 0;

    let longitudeSum = 0;


    events.forEach(function (event) {

        latitudeSum += event.latitude;

        longitudeSum += event.longitude;

    });


    const centerLatitude =
        latitudeSum / events.length;


    const centerLongitude =
        longitudeSum / events.length;


    centerElement.textContent =
        centerLatitude.toFixed(5)
        + ", "
        + centerLongitude.toFixed(5);


    // ======================================
    // CALCULAR DISTANCIA MÁXIMA
    // ======================================

    let maximumDistance = 0;


    events.forEach(function (event) {

        const distance =
            map.distance(
                [
                    centerLatitude,
                    centerLongitude
                ],
                [
                    event.latitude,
                    event.longitude
                ]
            );


        if (distance > maximumDistance) {

            maximumDistance = distance;

        }

    });


    // ======================================
    // MOSTRAR RADIO
    // ======================================

    if (maximumDistance < 1000) {

        radiusElement.textContent =
            Math.round(maximumDistance)
            + " m";

    } else {

        radiusElement.textContent =
            (maximumDistance / 1000).toFixed(2)
            + " km";

    }


    // ======================================
    // DIBUJAR CÍRCULO
    // ==========================================

    if (analysisCircle !== null) {

        map.removeLayer(analysisCircle);

    }


    analysisCircle = L.circle(
        [
            centerLatitude,
            centerLongitude
        ],
        {
            radius: maximumDistance,

            fillOpacity: 0.12,

            weight: 2
        }
    ).addTo(map);

}


// ==========================================
// BOTÓN LIMPIAR
// ==========================================

document
    .getElementById("clear-btn")
    .addEventListener(
        "click",
        function () {


            // Eliminar marcadores

            markers.forEach(
                function (marker) {

                    map.removeLayer(marker);

                }
            );


            // Eliminar círculo

            if (analysisCircle !== null) {

                map.removeLayer(
                    analysisCircle
                );

                analysisCircle = null;

            }


            // Vaciar eventos

            events = [];

            markers = [];


            // Actualizar interfaz

            updateInterface();

        }
    );
```
