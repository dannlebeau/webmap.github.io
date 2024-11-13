// Inicializar el mapa centrado en un punto de referencia en Valparaíso
var map = L.map('map').setView([-33.03159, -71.61676], 15);  // Mantener coordenada en Valparaíso

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
                            } else {
                                latLng = coord; // Si ya está en EPSG:4326, usar las coordenadas directamente
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
                        // Calcular el centroide para ubicar el punto
                        var centroid = layer.getBounds().getCenter();

                        // Crear el contenido del popup con una estructura fija y cerrado por defecto
                        var popupContent = `
                            <div style="width: 250px;">
                                <h4><strong>${feature.properties.Layer || 'Nombre del Proyecto'}</strong></h4>
                                <p><strong>Año:</strong> ${feature.properties.year || 'N/A'}</p>
                                <p><strong>Monto:</strong> ${feature.properties.amount || 'N/A'}</p>
                                <p><strong>Foto del Proyecto:</strong><br>
                                    <input type="file" accept="image/*" onchange="previewImage(event)">
                                    <br><img id="imagePreview" src="" alt="Vista previa" style="width: 100%; height: auto; display: none;"/>
                                </p>
                                <button onclick="expandPopup('${feature.properties.Layer || 'Nombre del Proyecto'}')">Ampliar</button>
                            </div>
                        `;

                        // Crear el nuevo pin azul para el centroide con el icono estándar de Leaflet
                        var blueIcon = new L.Icon({
                            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png', // Pin azul estándar de Leaflet
                            iconSize: [25, 41],  // Tamaño estándar del pin
                            iconAnchor: [12, 41], // Anclaje del pin
                            popupAnchor: [0, -41] // Ajuste del popup respecto al pin
                        });

                        var marker = L.marker(centroid, {
                            icon: blueIcon  // Usamos el pin azul estándar
                        }).addTo(map);

                        // Asociar el contenido del popup al marcador, con el popup cerrado por defecto
                        marker.bindPopup(popupContent);

                        // Abrir el popup solo cuando se haga clic en el botón "Ampliar"
                        marker.on('popupopen', function() {
                            var expandButton = marker.getPopup().getElement().querySelector('button');
                            expandButton.addEventListener('click', function() {
                                marker.openPopup(); // Al hacer clic, se expande el popup
                            });
                        });
                    }
                }
            }).addTo(map); // Añadir la capa directamente al mapa

            // Añadir la capa al control de capas
            layerControl.addOverlay(geojsonLayer, file);
        })
        .catch(error => {
            console.error("Error cargando el archivo GeoJSON:", error);
        });
});

// Función para mostrar la imagen cargada desde la carpeta assets/img
function previewImage(event) {
    var reader = new FileReader();
    reader.onload = function() {
        var image = document.getElementById("imagePreview");
        image.src = reader.result;
        image.style.display = "block";
    };
    reader.readAsDataURL(event.target.files[0]);
}

// Función para expandir el popup
function expandPopup(name) {
    alert('Ampliando información del proyecto: ' + name);
    // Aquí puedes agregar más lógica para mostrar más detalles o cambiar el estilo de la ventana emergente
}
