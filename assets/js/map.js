//=======================================OPCIONES DE MAPA=========================================================//

// Inicializar el mapa centrado en un punto de referencia en Valparaíso
var map = L.map('map').setView([-33.03159, -71.61676], 15);  // Mantener coordenada en Valparaíso

// Mapa Base
var openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
});

var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'png'
});

var cartoDBPositronLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a> | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
});

var esriWorldImageryLayer = L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxZoom: 18
}).addTo(map); //  addTo define el mapa base por defecto

var ESRItopo = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Nokia',
    maxZoom: 18
});


//===========================CONTROL DE CAPAS==============================//
// Crear el control de capas para mapas base
var baseMaps = {
    "OpenStreetMap": openStreetMapLayer,
    "Stadia": Stadia_AlidadeSmooth,
    "CartoDB Positron": cartoDBPositronLayer,
    "ESRI": esriWorldImageryLayer,
    "Topographic": ESRItopo,
};

// Control de capas
var layerControl = L.control.layers(baseMaps, null, { position: 'topright', collapsed: true }).addTo(map);

//==========================CARGA DE ARCHIVOS===========================================================================//

// Archivos GeoJSON
var geojsonFiles = [
    'data/geojson/1.Mejoramiento_Sector_Las_Torpederas.geojson',
    'data/geojson/2.Renovacion_Playa_Carvallo.geojson',
    'data/geojson/3.Balneario_San_Mateo.geojson',
    'data/geojson/4.Mejoramiento_Muelle_Prat.geojson',
    'data/geojson/5.Ampliacion_Muelle_Prat_4326.geojson',
    'data/geojson/6.Construccion_Parque_Baron.geojson',
    'data/geojson/7.Paseo_Costero.geojson',
    'data/geojson/8.Paseo_Juan_de_Saavedra.geojson',
    'data/geojson/9.Nuevos_miradores.geojson',
    'data/geojson/10.Equipamiento_Mirador_viento_sur.geojson',
    'data/geojson/11.Caleta_El_Membrillo.geojson',
    'data/geojson/12.Plaza_Sotomayor.geojson',
    'data/geojson/13.Port_Center.geojson',
    'data/geojson/14.Mejoramiento_Avenida_Brasil.geojson',
    'data/geojson/15.Avenida_Brasil_Argentina.geojson',
    'data/geojson/16.Compra_Terreno.geojson',
    'data/geojson/17.Viviendas_Edificio_Tassara.geojson',
    'data/geojson/18.Estacionamientos_Plan.geojson',
    'data/geojson/19.Bodega_Simon_Bolivar.geojson',
    'data/geojson/20.Equipamiento_Nautico_Baron.geojson',
    'data/geojson/21.Tornamesa.geojson',
    'data/geojson/22.Renovacion_Quebrada_Los_Placeres.geojson',
    'data/geojson/23.Caleta_Joya_del_Pacifico.geojson',
    'data/geojson/24.Ampliacion_Portuaria.geojson',
    'data/geojson/25.Molo_de_abrigo.geojson',
    'data/geojson/26.Caleta_Portales.geojson',
    'data/geojson/27.Reparacion_naves_Muelle_Prat.geojson',
    'data/geojson/28.Intermodal_Ferroviaria_Yolanda.geojson',
    'data/geojson/29.Paseo_Altamirano.geojson',
    'data/geojson/30.Rehabilitacion_ascensores.geojson',
    'data/geojson/31.Paseo_Errazuriz_España.geojson',
    'data/geojson/32.Rutas_seguras_boulevares.geojson',
    'data/geojson/33.Paisajes_Barrio_Puerto.geojson',
    'data/geojson/34.Intermodal_Baron.geojson',
    'data/geojson/35.Soterramiento_Estaciones.geojson',
    'data/geojson/36.Accesibildiad_Estacion_Portales.geojson',
    'data/geojson/37.Soterramiento_Red_Ferroviaria.geojson'
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
                    //fill: "#white",        //////// ver relleno
                    weight: 3.5,         // Grosor de la línea
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
                                <p><strong>Descripción:</strong> ${feature.properties.descripcion || 'N/A'}</p>
                                <p><strong>Foto del Proyecto:</strong><br>
                                <a href="${feature.properties.image_1}" target= "_blank">
                                    <img src="${feature.properties.image_1}" alt="${feature.properties.name}" width="250px">
                                </a><br>
                                <a href="${feature.properties.image_2}" target= "_blank">
                                    <img src="${feature.properties.image_2}" alt="${feature.properties.name}" width="250px">
                                </a>
                                    
                                </p>
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
