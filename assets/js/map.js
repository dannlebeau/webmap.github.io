// Inicializar el mapa centrado en Valparaíso
var map = L.map('map').setView([-33.03159, -71.61676], 15);

// Definir el mapa base de OpenStreetMap activado por defecto
var openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

// Definir otras capas base
var stamenTonerLayer = L.tileLayer('https://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://stamen.com">Stamen Design</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
});

var cartoDBPositronLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
});

var esriWorldImageryLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18
});

// Lista de archivos GeoJSON que quieres cargar
var geojsonFiles = [
    'data/geojson/4.Mejoramiento_Muelle_Prat.geojson',
    'data/geojson/5.Ampliacion_Muelle_Prat.geojson',
    'data/geojson/18.Estacionamientos_Plan.geojson'
];

// Crear un objeto para almacenar las capas GeoJSON
var geojsonLayers = {};

// Definir el sistema de coordenadas EPSG:32719 (UTM zona 19S)
proj4.defs("EPSG:32719", "+proj=utm +zone=19 +south +datum=WGS84 +units=m +no_defs");
var projUTM = proj4("EPSG:32719");

// Función para cargar cada archivo GeoJSON y agregarlo al mapa
function cargarGeoJSON() {
    var cargasCompletadas = 0;
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
                
                function onEachFeature(feature, layer) {
                    if (feature.geometry.type === "MultiLineString" || feature.geometry.type === "LineString") {
                        feature.geometry.coordinates = feature.geometry.coordinates.map(function(segment) {
                            return segment.map(function(coord) {
                                if (Array.isArray(coord) && coord.length === 2 && isFinite(coord[0]) && isFinite(coord[1])) {
                                    var lonLat = projUTM.inverse(coord);
                                    return isFinite(lonLat[0]) && isFinite(lonLat[1]) ? lonLat : null;
                                } else {
                                    return null;
                                }
                            }).filter(coord => coord !== null);
                        }).filter(segment => segment.length > 0);
                    }

                    if (feature.properties && feature.properties.Layer) {
                        var popupContent = "<strong>" + feature.properties.Layer + "</strong><br>" +
                                           "Información adicional: " + (feature.properties.informacionAdicional || 'N/A');
                        layer.bindPopup(popupContent);
                    }
                }

                var geojsonLayer = L.geoJSON(data, {
                    style: function (feature) {
                        return {
                            color: "#ff0000",
                            weight: 3,
                            opacity: 1
                        };
                    },
                    onEachFeature: onEachFeature
                });

                geojsonLayers[file] = geojsonLayer;
                geojsonLayer.addTo(map);

                // Aumentar el contador de cargas completas
                cargasCompletadas++;
                if (cargasCompletadas === geojsonFiles.length) {
                    actualizarControlCapas();
                }
            })
            .catch(error => {
                console.error("Error cargando el archivo GeoJSON:", error);
            });
    });
}

// Función para actualizar el control de capas de GeoJSON una vez que todas las capas están listas
function actualizarControlCapas() {
    // Control de capas en la esquina superior izquierda para las capas GeoJSON
    L.control.layers(
        null,
        geojsonLayers,
        { position: 'topleft', collapsed: true } // El control se puede expandir y contraer
    ).addTo(map);
}

// Control de capas base en la esquina superior derecha
L.control.layers(
    {
        "OpenStreetMap": openStreetMapLayer,
        "Stamen Toner": stamenTonerLayer,
        "CartoDB Positron": cartoDBPositronLayer,
        "Esri World Imagery": esriWorldImageryLayer
    },
    null,
    { position: 'topright' }
).addTo(map);

// Cargar los archivos GeoJSON
cargarGeoJSON();
