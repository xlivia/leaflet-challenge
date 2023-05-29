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
            //}).bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>Magnitude: " + feature.properties.mag + "<br>Depth: " + feature.geometry.coordinates[2] + "</p>");
            }).bindPopup(`<strong>Magnitude:</strong> ${feature.properties.mag}<br><strong>Location:</strong> ${feature.properties.place}<br><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km`);
        }
    }).addTo(myMap);

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
    legend.addTo(myMap);
});