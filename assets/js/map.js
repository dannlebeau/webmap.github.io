// Inicializar el mapa centrado en un punto de referencia en Valparaíso
var map = L.map('map').setView([-33.03159, -71.61676], 15);

// Definir el mapa base de OpenStreetMap activado por defecto
var openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Otros mapas base
var stamenTonerLayer = L.tileLayer('https://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://stamen.com">Stamen Design</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
});

var cartoDBPositronLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
});

// Crear el control de capas para mapas base
var baseMaps = {
    "OpenStreetMap": openStreetMapLayer,
    "Stamen Toner": stamenTonerLayer,
    "CartoDB Positron": cartoDBPositronLayer
};

// Control de capas
var layerControl = L.control.layers(baseMaps, null, { position: 'topright', collapsed: true }).addTo(map);

// Definir los sistemas de coordenadas EPSG:32719 (UTM zona 19S) y EPSG:4326 (Lat/Lon)
proj4.defs("EPSG:32719", "+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

var projUTM = proj4("EPSG:32719");
var projWGS84 = proj4("EPSG:4326");

// Archivos GeoJSON
var geojsonFiles = [
    'data/geojson/4.Mejoramiento_Muelle_Prat.geojson',
    'data/geojson/5.Ampliacion_Muelle_Prat.geojson',
    'data/geojson/18.Estacionamientos_Plan.geojson',
    'data/geojson/5.Ampliacion_Muelle_Prat_4326.geojson'
];

// Función para cargar y convertir cada archivo GeoJSON
geojsonFiles.forEach(function(file) {
    fetch(file)
        .then(response => {
            if (!response.ok) {
                console.error(`Error al cargar el archivo ${file}:`, response.statusText);
                throw new Error('Error en la carga del archivo');
            }
            return response.json();
        })
        .then(data => {
            console.log(`Archivo cargado correctamente: ${file}`);
            console.log(data);  // Mostrar el archivo GeoJSON completo en consola para depuración

            // Verificar si el archivo tiene características GeoJSON válidas
            if (!data.features || data.features.length === 0) {
                console.error(`El archivo ${file} no tiene características GeoJSON válidas.`);
                return;
            }

            // Verificar el sistema de coordenadas del archivo GeoJSON
            var isUTM = data.crs && data.crs.properties.name === "EPSG:32719";

            // Convertir las coordenadas de UTM a lat/long si es necesario
            var bounds = L.latLngBounds();  // Para ajustar el centro del mapa
            data.features.forEach(function(feature) {
                if (feature.geometry && (feature.geometry.type === "MultiLineString" || feature.geometry.type === "LineString")) {
                    feature.geometry.coordinates = feature.geometry.coordinates.map(function(segment) {
                        return segment.map(function(coord) {
                            var latLng;
                            // Si el archivo es UTM, convertir las coordenadas
                            if (isUTM) {
                                latLng = projUTM.inverse(coord);  // Convertir coordenadas UTM a lat/long
                                console.log("Coordenada convertida UTM:", latLng);
                            } else {
                                latLng = coord; // Si ya está en EPSG:4326, usar las coordenadas directamente
                            }

                            // Verificar que las coordenadas sean válidas
                            if (latLng[0] < -90 || latLng[0] > 90 || latLng[1] < -180 || latLng[1] > 180) {
                                console.warn("Coordenada fuera de rango:", latLng);
                            }

                            bounds.extend([latLng[0], latLng[1]]);  // Agregar las coordenadas al límite de la capa
                            return [latLng[0], latLng[1]]; // Leaflet usa formato [lat, lng]
                        });
                    });
                }
            });

            // Crear la capa GeoJSON con un estilo más visible
            var geojsonLayer = L.geoJSON(data, {
                style: {
                    color: "#ff0000",  // Color rojo
                    weight: 5,         // Grosor de la línea
                    opacity: 0.7       // Opacidad moderada
                },
                onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.Layer) {
                        var popupContent = "<strong>" + feature.properties.Layer + "</strong><br>" +
                                           "Información adicional: " + (feature.properties.informacionAdicional || 'N/A');
                        layer.bindPopup(popupContent);
                    }
                }
            }).addTo(map); // Añadir la capa directamente al mapa

            // Añadir la capa al control de capas
            layerControl.addOverlay(geojsonLayer, file);

            // **No modificar el zoom y centro actual**: No usamos `map.fitBounds()`
            // Dejar el control de zoom y centro como están actualmente en el mapa
        })
        .catch(error => {
            console.error("Error cargando el archivo GeoJSON:", error);
        });
});
