// Inicializar el mapa
var map = L.map('map').setView([-33.04557, -77.61849], 5); // Ubicación inicial en Valparaiso

// Agregar capa de mapa base de OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Cargar datos GeoJSON desde un archivo externo
fetch('data.geojson')
    .then(response => response.json())
    .then(data => {
        // Función para definir el popup con imagen
        function onEachFeature(feature, layer) {
            if (feature.properties && feature.properties.nombre) {
                var popupContent = "<strong>" + feature.properties.nombre + "</strong><br>" +
                                   "<img src='" + feature.properties.imagen + "' alt='" + feature.properties.nombre + "' style='width:100px;height:auto;'><br>" +
                                   "Descripción: " + feature.properties.descripcion + "<br>" +
                                   "Información adicional: " + feature.properties.informacionAdicional;
                layer.bindPopup(popupContent);
            }
        }

        // Agregar el GeoJSON al mapa
        L.geoJSON(data, {
            onEachFeature: onEachFeature
        }).addTo(map);
    })
    .catch(error => console.error("Error cargando el archivo GeoJSON:", error));
