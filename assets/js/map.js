//=======================================OPCIONES DE MAPA=========================================================//

// Inicializar el mapa centrado en un punto de referencia en Valparaíso
var map = L.map ('map').setView([-33.03159, -71.61676], 15);

// Mapa Base
var openStreetMapLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© Dann LeBeau'
});

// var Stadia_AlidadeSmooth = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.{ext}', {
//     minZoom: 0,
//     maxZoom: 20,
//     attribution: '&copy; <a href="https://www.stadiamaps.com/">Stadia Maps</a> &copy; OpenMapTiles &copy; Dann LeBeau',
//     ext: 'png'
// });

var cartoDBPositronLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: '&copy; CartoDB | © Dann LeBeau',
    maxZoom: 19
});

var esriWorldImageryLayer = L.tileLayer('https://server.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Dann LeBeau',
    maxZoom: 18
}).addTo(map); // Esri World Imagery es el mapa base por defecto

var ESRItopo = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Dann LeBeau',
    maxZoom: 18
});

//===========================CONTROL DE CAPAS==============================//
// Crear el control de capas solo para mapas base
var baseMaps = {
    "OpenStreetMap": openStreetMapLayer,
    // "Stadia": Stadia_AlidadeSmooth,
    "CartoDB Positron": cartoDBPositronLayer,
    "ESRI": esriWorldImageryLayer,
    // "Topographic": ESRItopo,
};

// Control de capas
L.control.layers(baseMaps, null, { position: 'topright', collapsed: true }).addTo(map);


//===================Barra de Busqueda===========================================================//



//==========================CARGA DE ARCHIVOS GEOJSON===========================================================================//

// Archivos GeoJSON
var geojsonFiles = [
    'data/geojson/1.Borde_costero_Las_Torpederas_poligono.geojson',
    'data/geojson/2.Renovacion_Playa_Carvallo_poligono.geojson',
	'data/geojson/3.Balneario_San_Mateo_poligono.geojson',
    'data/geojson/4.Mejoramiento_Muelle_Prat_poligono.geojson',
    'data/geojson/5.Ampliacion_Muelle_Prat_poligono.geojson',
    'data/geojson/6.Construccion_Parque_Baron_poligono.geojson',
    'data/geojson/7.Equipamiento_Nautico_Baron_poligono.geojson',
    'data/geojson/8.Marina_deportiva_Baron_poligono.geojson',
    'data/geojson/9.Paseo_costero_poligono.geojson',
    'data/geojson/10.Paseo_Juan_de_Saavedra_poligono.geojson',
    'data/geojson/11.Nuevos_Miradores_poligono.geojson',
    'data/geojson/12.Equipamiento_Mirador_Viento_Sur_poligono.geojson',

    'data/geojson/13.Caleta_El_Membrillo_poligono.geojson',
    'data/geojson/14.Plaza_sotomayor_poligono.geojson',
    'data/geojson/15.Port_Center_poligono.geojson',
    'data/geojson/16.Mejoramiento_Avenida_Brasil_poligono.geojson',
    'data/geojson/17.Avenida_Brasil_Argentina_poligono.geojson',
    'data/geojson/18.Adquisicion_terrenos_poligono.geojson',
    'data/geojson/19.Viviendas_Edificio_Tassara_poligono.geojson',
    'data/geojson/20.Archivo_regional_Taller_poligono.geojson',
    'data/geojson/21.Estacionamientos_Plan_poligono.geojson',
    'data/geojson/22.Bodega_Simon_Bolivar_poligono.geojson',
    'data/geojson/23.Maestranza_tornamesa_poligono.geojson',
    'data/geojson/24.Renovacion_quebrada_los_placeres_poligono.geojson',
    'data/geojson/25.Caleta_Joya_del_Pacifico_poligono.geojson',
    'data/geojson/26.Ampliacion_portuaria_poligono.geojson',
    'data/geojson/27.Molo_abrigo_poligono.geojson',
    'data/geojson/28.Puente_Portuario_poligono.geojson',
    'data/geojson/29.Mejoramiento_Caletas_poligono.geojson',
    'data/geojson/30.Varadero_reparacion_naves_menores_poligono.geojson',
    'data/geojson/31.Intermodal_ferroviaria_Yolanda_poligono.geojson',
    'data/geojson/32.Paseo_Altamirano_poligono.geojson',
    'data/geojson/33.Rehabilitacion_ascensores_poligono.geojson',
    'data/geojson/34.Paseo_Errazuriz_España_poligono.geojson',
    'data/geojson/35.Rutas_seguras_boulevares_poligono.geojson',
    'data/geojson/36.Pasajes_Barrio_Puerto_poligono.geojson',
    'data/geojson/37.Intermodal_Baron_poligono.geojson',
    'data/geojson/38.Soterramiento_estaciones_poligono.geojson',
    'data/geojson/39.Accesibilidad_Estacion_Portales_poligono.geojson',
];

//=========================Archivos GEOJSON================================================//
// Función para cargar y convertir cada archivo
geojsonFiles.forEach(function(file, index) {
    fetch(file)
        .then(response => {
            if (!response.ok) {
                console.error(`Error al cargar el archivo ${file}:`, response.statusText);
                throw new Error('Error en la carga del archivo');
            }
            return response.json();
        })
        .then(data => {
            console.log(`Archivo cargado correctamente: ${file}`, data); // Verificar los datos del GeoJSON

            // Asegurarnos de que las geometrías son válidas
            if (data.features && data.features.length > 0) {
                // Definir los colores de relleno y borde según el índice del archivo
                let fillColor, borderColor;
                //Componente 1
                if (index < 11) {
                    fillColor = "#578DCA";   // Celeste para relleno
                    borderColor = "#578DCA"; // Celeste para borde
                    //Componente 2
                } else if (index < 24) {
                    fillColor = "#A1C750";   // Verde para relleno
                    borderColor = "#A1C750"; // Verde para borde
                    //Componente 3
                } else if (index < 31) {
                    fillColor = "#E94190";   // Rosa para relleno
                    borderColor = "#E94190"; // Rosa para borde
                }
                //Componente 4
                else {
                    fillColor = "#EA573C";   // Rojo para relleno
                    borderColor = "#EA573C"; // Rojo para borde
                }

                // Crear la capa GeoJSON con estilo personalizado para polígonos
                var geojsonLayer = L.geoJSON(data, {
                    style: function(feature) {
                        return {
                            color: borderColor,      // Color del borde de los polígonos
                            fillColor: fillColor,    // Color de relleno de los polígonos
                            fillOpacity: 0.6,        // Opacidad del relleno (ajustar según se desee)
                            weight: 3,               // Grosor de la línea del borde
                            opacity: 1               // Opacidad de la línea del borde
                        };
                    },
                    onEachFeature: function(feature, layer) {
                        // Crear el contenido del popup con la información del proyecto
                        var popupContent = `
    <div style="width: 250px;">
        <h4><strong>${feature.properties.Layer || 'Nombre del Proyecto'}</strong></h4>
        <p><strong>Descripción:</strong> ${feature.properties.descripcion || 'N/A'}</p>
        <p><strong></strong>
            <a href="${feature.properties.pdf_link}" target="_blank">Ver Iniciativa</a>
        </p>
    </div>
`;


                        // Asociar el popup a la capa GeoJSON
                        layer.bindPopup(popupContent);
                    }
                }).addTo(map); // Añadir la capa directamente al mapa
            } else {
                console.warn(`El archivo ${file} no contiene datos GeoJSON válidos.`);
            }
        })
        .catch(error => {
            console.error("Error cargando el archivo GeoJSON:", error);
        });
});

//============================LEYENDA==============================================================================================//
const legend = L.control({ position: 'bottomright' });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.style.backgroundColor = 'white'; // Fondo blanco
    div.style.padding = '10px';          // Espacio interno
    div.style.borderRadius = '5px';      // Bordes redondeados
    div.style.boxShadow = '0 0 15px rgba(0, 0, 0, 0.2)'; // Sombra para el efecto

    div.innerHTML += "<h4>Iniciativas de inversión</h4>";
    div.innerHTML += '<i style="background: #578DCA; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border: 1px solid black;"></i> Acceso al Mar<br>'; // Componente 1
    div.innerHTML += '<i style="background: #A1C750; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border: 1px solid black;"></i> Renovación Urbana<br>'; // Componente 2
    div.innerHTML += '<i style="background: #E94190; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border: 1px solid black;"></i> Infraestructura Productiva y Portuaria<br>'; //Componente 3
    div.innerHTML += '<i style="background: #EA573C; width: 18px; height: 18px; display: inline-block; margin-right: 8px; border: 1px solid black;"></i> Movilidad y Espacio Público<br>'; // Componente 4
    return div;
};

legend.addTo(map);




//==============================OTROS=======================================//

// var popupContent = `
//     <div style="width: 250px;">
//         <h4><strong>${feature.properties.Layer || 'Nombre del Proyecto'}</strong></h4>
//         <p><strong>Descripción:</strong> ${feature.properties.descripcion || 'N/A'}</p>
//         <p><strong>Link del Proyecto:</strong><br>
//             <a href="${feature.properties.image_1}" target="_blank">
//                 <img src="${feature.properties.image_1}" alt="${feature.properties.name}" width="250px">
//             </a><br>
//             <a href="${feature.properties.image_2}" target="_blank">
//                 <img src="${feature.properties.image_2}" alt="${feature.properties.name}" width="250px">
//             </a>
//         </p>
//         <p><strong>PDF del Proyecto:</strong><br>
//             <a href="${feature.properties.pdf_link}" target="_blank">Ver PDF del Proyecto</a>
//         </p>
//     </div>
// `;


//================Address search=======================================//



// // Agregar el control de búsqueda de direcciones
// const addressSearch = new L.Control.GeoapifyAddressSearch({
//     apiKey: 'eb8fa138e322405ab0a7b33b857a9e66',  // Reemplaza con tu clave API de Geoapify
//     position: 'topright', // Colocamos temporalmente en una posición
//     placeholder: 'Buscar dirección...', // Texto de marcador de posición
//     resultCallback: (result) => {
//         if (result) {
//             map.setView(result.latlng, 15); // Centrar el mapa en el resultado
//         }
//     }
// });
// map.addControl(addressSearch);

// // Aplicar estilos CSS para centrar el control de búsqueda en la parte superior
// const searchControlElement = document.querySelector('.leaflet-control-geocoder');
// searchControlElement.style.position = 'absolute';
// searchControlElement.style.top = '10px'; // Distancia desde la parte superior
// searchControlElement.style.left = '50%';
// searchControlElement.style.transform = 'translateX(-50%)'; // Centra el control horizontalmente
