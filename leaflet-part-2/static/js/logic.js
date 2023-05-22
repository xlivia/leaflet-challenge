// Create the map
const map = L.map('map').setView([0, 0], 2);

// Add the tile layers to the map
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
});

const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Map data &copy; <a href="https://www.arcgis.com/">ArcGIS</a>',
    maxZoom: 18,
});

const grayscaleLayer = L.tileLayer('https://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
});

// Create a base layer group
const baseLayers = {
    'Street Map': tileLayer,
    'Satellite Map': satelliteLayer,
    'Grayscale Map': grayscaleLayer,
};

// Add the base layers to the map
tileLayer.addTo(map);

// Fetch the earthquake data
const earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

fetch(earthquakeUrl).then(response => response.json()).then(earthquakeData => {

    // Create an earthquakes overlay group
    const earthquakes = L.layerGroup();

    // Loop through the earthquake data
    earthquakeData.features.forEach(feature => {
        const earthquake = feature.properties;

        // Get the latitude, longitude, magnitude, and depth of the earthquake
        const lat = feature.geometry.coordinates[1];
        const lng = feature.geometry.coordinates[0];
        const magnitude = earthquake.mag;
        const depth = feature.geometry.coordinates[2];

        // Define the marker size and color based on magnitude and depth
        const markerSize = magnitude * 5;
        const markerColor = getColor(depth);

        // Create a marker with popup
        const marker = L.circleMarker([lat, lng], {
            radius: markerSize,
            fillColor: markerColor,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<strong>Magnitude:</strong> ${magnitude}<br><strong>Location:</strong> ${earthquake.place}<br><strong>Depth:</strong> ${depth} km`);

        // Add the marker to the earthquakes layer group
        earthquakes.addLayer(marker);
    });

    // Create an object to hold the tectonic plates layer
    const tectonicPlates = {
        'Tectonic Plates': L.geoJson(),
    };

    // Fetch the tectonic plates data
    const tectonicPlatesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';

    fetch(tectonicPlatesUrl).then(response => response.json()).then(tectonicPlatesData => {

        // Create a tectonic plates layer
        const tectonicPlatesLayer = L.geoJson(tectonicPlatesData, {
            style: {
                color: '#FF0000',
                weight: 2,
            }
        });

        // Add the tectonic plates layer to the tectonic plates overlay
        tectonicPlates['Tectonic Plates'] = tectonicPlatesLayer;

        // Create the layer control
        const layerControl = L.control.layers(baseLayers, { 'Earthquakes': earthquakes, ...tectonicPlates }).addTo(map);

        // Add the earthquakes layer to the map
        earthquakes.addTo(map);

        // Fit the map bounds to the earthquakes layer
        map.fitBounds(earthquakes.getBounds());

        // Function to get the marker color based on depth
        function getColor(depth) {
            return depth > 100 ? '#FF0000' : depth > 50  ? '#FFA500' : depth > 10  ? '#FFFF00' : '#00FF00';
        }

    });

});