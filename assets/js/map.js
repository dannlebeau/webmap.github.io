//=======================================OPCIONES DE MAPA=========================================================//

// Inicializar el mapa centrado en un punto de referencia en Valparaíso
var map = L.map('map').setView([-33.03159, -71.61676], 15);

// Mapa Base
var openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
});

var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 20,
    attribution: '&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a> &copy; OpenMapTiles &copy; OpenStreetMap contributors',
    ext: 'png'
});

var cartoDBPositronLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; CartoDB | © OpenStreetMap',
    maxZoom: 19
});

var esriWorldImageryLayer = L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri & GIS User Community',
    maxZoom: 18
}).addTo(map); // Esri World Imagery es el mapa base por defecto

var ESRItopo = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Nokia',
    maxZoom: 18
});

//===========================CONTROL DE CAPAS==============================//
// Crear el control de capas solo para mapas base
var baseMaps = {
    "OpenStreetMap": openStreetMapLayer,
    "Stadia": Stadia_AlidadeSmooth,
    "CartoDB Positron": cartoDBPositronLayer,
    "ESRI": esriWorldImageryLayer,
    "Topographic": ESRItopo,
};

// Control de capas
L.control.layers(baseMaps, null, { position: 'topright', collapsed: true }).addTo(map);

//==========================CARGA DE ARCHIVOS GEOJSON===========================================================================//

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
            
            // Crear la capa GeoJSON con estilo personalizado para polígonos
            var geojsonLayer = L.geoJSON(data, {
                style: function(feature) {
                    return {
                        color: "#ff0000",       // Color del borde de los polígonos
                        fillColor: "#0000ff",   // Color de relleno de los polígonos
                        fillOpacity: 0.5,       // Opacidad del relleno
                        weight: 2,              // Grosor de la línea
                        opacity: 0.7            // Opacidad de la línea
                    };
                },
                onEachFeature: function(feature, layer) {
                    // Crear el contenido del popup con la información del proyecto
                    var popupContent = `
                        <div style="width: 250px;">
                            <h4><strong>${feature.properties.Layer || 'Nombre del Proyecto'}</strong></h4>
                            <p><strong>Descripción:</strong> ${feature.properties.descripcion || 'N/A'}</p>
                            <p><strong>Foto del Proyecto:</strong><br>
                            <a href="${feature.properties.image_1}" target="_blank">
                                <img src="${feature.properties.image_1}" alt="${feature.properties.name}" width="250px">
                            </a><br>
                            <a href="${feature.properties.image_2}" target="_blank">
                                <img src="${feature.properties.image_2}" alt="${feature.properties.name}" width="250px">
                            </a>
                            </p>
                        </div>
                    `;

                    // Asociar el popup a la capa GeoJSON
                    layer.bindPopup(popupContent);
                }
            }).addTo(map); // Añadir la capa directamente al mapa
        })
        .catch(error => {
            console.error("Error cargando el archivo GeoJSON:", error);
        });
});
