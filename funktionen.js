// Initialize the map centered on Mainz
const map = L.map('map').setView([50.0000, 8.2710], 13);

// OpenStreetMap
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// OpenCycleMap
const cycleLayer = L.tileLayer('https://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenCycleMap &copy; OpenStreetMap contributors'
});

// OpenRailwayMap
const railwayLayer = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenRailwayMap &copy; OpenStreetMap contributors'
});

// Basemap-Objekt für die Legende
const baseMaps = {
    "OpenStreetMap": osmLayer,
    "OpenCycleMap": cycleLayer,
    "OpenRailwayMap": railwayLayer
};

// Legende / Layer-Selector oben rechts
L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);
