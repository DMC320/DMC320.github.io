```javascript
// ==========================================
// CANTERMAP
// Análisis geográfico del delito
// ==========================================


// ==========================================
// CONFIGURACIÓN INICIAL DEL MAPA
// ==========================================

// Coordenadas iniciales:
// Ciudad de México

const map = L.map("map").setView(
    [19.4326, -99.1332],
    12
);


// ==========================================
// MAPA BASE
// ==========================================

// Utilizamos OpenStreetMap como mapa base.

L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(map);


// ==========================================
// VARIABLES DEL SISTEMA
// ==========================================

// Aquí almacenaremos los eventos.

let events = [];


// Aquí almacenaremos los marcadores
// que aparecen en el mapa.

let markers = [];


// ==========================================
// AGREGAR EVENTO
// ==========================================

// Cuando el usuario haga clic en el mapa,
// registraremos ese punto como un evento.

map.on("click", function (e) {

    const latitude = e.latlng.lat;

    const longitude = e.latlng.lng;


    // Crear objeto del evento

    const event = {

        latitude: latitude,

        longitude: longitude

    };


    // Guardar evento

    events.push(event);


    // ======================================
    // CREAR MARCADOR
    // ======================================

    const marker = L.marker([
        latitude,
        longitude
    ]).addTo(map);


    // ======================================
    // INFORMACIÓN DEL MARCADOR
    // ======================================

    marker.bindPopup(

        `
        <strong>
            Evento ${events.length}
        </strong>

        <br><br>

        Latitud:
        ${latitude.toFixed(5)}

        <br>

        Longitud:
        ${longitude.toFixed(5)}
        `

    );


    // Guardar marcador

    markers.push(marker);


    // Actualizar estadísticas

    updateInterface();

});


// ==========================================
// ACTUALIZAR INTERFAZ
// ==========================================

function updateInterface() {


    // Número de eventos

    document.getElementById(
        "event-count"
    ).textContent = events.length;


    // Si no hay eventos

    if (events.length === 0) {

        document.getElementById(
            "radius"
        ).textContent = "—";


        document.getElementById(
            "center"
        ).textContent = "—";


        return;

    }


    // ======================================
    // CALCULAR CENTRO PROMEDIO
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


    // ======================================
    // MOSTRAR CENTRO
    // ======================================

    document.getElementById(
        "center"
    ).textContent =

        `${centerLatitude.toFixed(5)},
         ${centerLongitude.toFixed(5)}`;


    // ======================================
    // RADIO
    // ======================================

    // Todavía no calculamos el radio real
    // del círculo de Canter.

    document.getElementById(
        "radius"
    ).textContent = "Pendiente";

}


// ==========================================
// LIMPIAR TODOS LOS EVENTOS
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


            // Vaciar arrays

            markers = [];

            events = [];


            // Actualizar interfaz

            updateInterface();

        }
    );
```
