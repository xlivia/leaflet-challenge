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

// Create the grayscale tile layer using Stamen's toner tile layer
const grayscaleLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.{ext}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});

// Create a base layer group
const baseLayers = {
    'Street Map': tileLayer,
    'Satellite Map': satelliteLayer,
    'Grayscale Map': grayscaleLayer,
};

// Add the base layers to the map
tileLayer.addTo(map);

// Function to get the marker color based on depth
function getColor(depth) {
    if (depth >= -10 && depth <= 10) {
        return '#00FF00'; // green-lime color square
    }
    else if (depth > 10 && depth <= 30) {
        return '#ADFF2F'; // yellow-green color square
    }
    else if (depth > 30 && depth <= 50) {
        return '#FFFF00'; // yellow-orange color square
    }
    else if (depth > 50 && depth <= 70) {
        return '#FFA500'; // orange color square
    }
    else if (depth > 70 && depth <= 90) {
        return '#FF4500'; // red-orange color square
    }
    else {
        return '#FF0000'; // red color square
    }
}

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

    // Fetch the tectonic plates data
    const tectonicPlatesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json';
    fetch(tectonicPlatesUrl).then(response => response.json()).then(tectonicPlatesData => {

        // Create a tectonic plates overlay group
        const tectonicPlates = L.layerGroup();

        // Create a GeoJSON layer for the tectonic plates
        const tectonicPlatesLayer = L.geoJSON(tectonicPlatesData, {
            style: {
                color: '#FF0000',
                weight: 2,
            }
        });

        // Add the tectonic plates layer to the tectonic plates overlay group
        tectonicPlates.addLayer(tectonicPlatesLayer);

        // Create an overlay layer group
        const overlayLayers = {
            'Earthquakes': earthquakes,
            'Tectonic Plates': tectonicPlates,
        };

        // Create the layer control
        L.control.layers(baseLayers, overlayLayers).addTo(map);

        // Create the legend control
        const legend = L.control({ position: 'bottomright' });

        // Function to generate the HTML for the legend
        legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'legend');
            const colors = [
                { color: '#00FF00', range: '-10 - 10' },
                { color: '#ADFF2F', range: '10 - 30' },
                { color: '#FFFF00', range: '30 - 50' },
                { color: '#FFA500', range: '50 - 70' },
                { color: '#FF4500', range: '70 - 90' },
                { color: '#FF0000', range: '90+' }
            ];
            let labels = '';
            for (let i = 0; i < colors.length; i++) {
                labels += '<div class="legend-item">' + '<div class="legend-color" style="background:' + colors[i].color + '"></div>' + '<div class="legend-range">' + colors[i].range + '</div>' + '</div>';
            }
            div.innerHTML = labels;
            return div;
        };

        // Add the legend to the map
        legend.addTo(map);

    }).catch(error => console.log('Error fetching tectonic plates data:', error));

    // Add the earthquakes overlay to the map
    earthquakes.addTo(map);
}).catch(error => console.log('Error fetching earthquake data:', error));