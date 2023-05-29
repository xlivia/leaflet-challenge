// Leaflet map setup
const myMap = L.map('map').setView([0, 0], 2);

// Tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18
}).addTo(myMap);

// GeoJSON API URL
const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to determine the marker size based on magnitude
function getMarkerSize(magnitude) {
    return magnitude * 5;
}

// Function to determine the marker color based on depth
function getMarkerColor(depth) {
    var colors = ["#00ff99", "#33ff00", "#ccff00", "#ffcc00", "#ff6600", "#ff0000"];
    if (depth < 10) {
        return colors[0]; // Green
    }
    else if (depth < 30) {
        return colors[1]; // Lime
    }
    else if (depth < 50) {
        return colors[2]; // Yellow
    }
    else if (depth < 70) {
        return colors[3]; // Orange
    }
    else if (depth < 90) {
        return colors[4]; // Red-Orange
    }
    else {
        return colors[5]; // Red
    }
}

// Retrieve earthquake data and create markers
d3.json(url).then(function(data) {
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getMarkerSize(feature.properties.mag),
                fillColor: getMarkerColor(feature.geometry.coordinates[2]),
                fillOpacity: 0.7,
                color: "#000",
                weight: 0.5
            }).bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2] + "</p>");
        }
    }).addTo(myMap);
    // Legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var depths = [-10, 10, 30, 50, 70, 90];
        var labels = [];
        for (var i = 0; i < depths.length; i++) {
            div.innerHTML += '<i class="legend-dot" style="background:' + getMarkerColor(depths[i] + 1) + '"></i> ' + depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
        }
        return div;
    };
    legend.addTo(myMap);
});

/*
// Create the map
const map = L.map('map').setView([0, 0], 2);

// Add the tile layer to the map
const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    maxZoom: 18,
}).addTo(map);

// Fetch the earthquake data
const earthquakeUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
fetch(earthquakeUrl).then(response => response.json()).then(earthquakeData => {
    // Create an earthquakes layer group
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
        // Create a marker with tooltip
        const marker = L.circleMarker([lat, lng], {
            radius: markerSize,
            fillColor: markerColor,
            color: '#000',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }).bindTooltip(`<strong>Magnitude:</strong> ${magnitude}<br><strong>Location:</strong> ${earthquake.place}<br><strong>Depth:</strong> ${depth} km`);
        // Add the marker to the earthquakes layer group
        earthquakes.addLayer(marker);
    });
    // Add the earthquakes layer to the map
    earthquakes.addTo(map);
    // Fit the map bounds to the earthquakes layer
    map.fitBounds(earthquakes.getBounds());
    // Function to get the marker color based on depth
    function getColor(depth) {
        return depth > 100 ? '#FF0000' : depth > 50  ? '#FFA500' : depth > 10  ? '#FFFF00' : '#00FF00';
    }
    // Create a legend control
    const legend = L.control({ position: 'bottomright' });
    // Function to generate the legend content
    legend.onAdd = function () {
        const div = L.DomUtil.create('div', 'info legend');
        const depths = [0, 10, 50, 100];
        const labels = [];
        for (let i = 0; i < depths.length; i++) {
            div.innerHTML += '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' + depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
        }
        return div;
    };
    // Add the legend to the map
    legend.addTo(map);
});
*/