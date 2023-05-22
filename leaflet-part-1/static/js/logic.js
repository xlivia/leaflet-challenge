// Create the map
const map = L.map('map').setView([0, 0], 2);

// Add the tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

// Fetch the earthquake data
const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

fetch(url).then(response => response.json()).then(data => {

    // Loop through the earthquake data
    data.features.forEach(feature => {
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
        L.circleMarker([lat, lng], {
            radius: markerSize,
            fillColor: markerColor,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindPopup(`<strong>Magnitude:</strong> ${magnitude}<br><strong>Location:</strong> ${earthquake.place}<br><strong>Depth:</strong> ${depth} km`).addTo(map);
    });
});

// Function to get the marker color based on depth
function getColor(depth) {
    return depth > 100 ? '#FF0000' : depth > 50  ? '#FFA500' : depth > 10  ? '#FFFF00' : '#00FF00';
}