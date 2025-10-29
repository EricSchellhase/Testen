// Initialize the map centered on Mainz
const map = L.map('map').setView([50.0000, 8.2710], 13);

// OpenStreetMap
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// OpenCycleMap
const cycleLayer = L.tileLayer('https://tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=f789fb047341451980ddebf8cbb8b9f5', {
    attribution: '&copy; OpenCycleMap &copy; OpenStreetMap contributors'
});

// OpenRailwayMap tiles (Overlay)
const railwayTiles = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenRailwayMap &copy; OpenStreetMap contributors'
});

// railwayLayer als Gruppe: OpenStreetMap im Hintergrund + Railway-Overlay oben drauf
const railwayLayer = L.layerGroup([osmLayer, railwayTiles]);

// Basemap-Objekt für die Legende
const baseMaps = {
    "OpenStreetMap": osmLayer,
    "OpenCycleMap": cycleLayer,
    "OpenRailwayMap": railwayLayer
};

// Legende / Layer-Selector oben rechts
L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

// Funktion: überprüft das Unterverzeichnis "Layer/" auf .geojson-Dateien und fügt sie der Karte hinzu
async function loadGeoJSONFromLayerFolder(folder = 'Layer/') {
    // Versucht, das Verzeichnis abzurufen (vorausgesetzt der Server liefert ein Directory-Listing)
    try {
        const res = await fetch(folder, { method: 'GET' });
        if (!res.ok) {
            console.warn(`Kein Directory-Listing verfügbar für ${folder} (Status ${res.status})`);
            return;
        }
        const text = await res.text();

        // Sucht nach hrefs oder direkten Dateinamen mit Endung .geojson
        const urls = new Set();
        // 1) HTML links
        const hrefRegex = /href=["']([^"']+\.geojson)["']/gi;
        let m;
        while ((m = hrefRegex.exec(text)) !== null) urls.add(new URL(m[1], location.href + folder).href);

        // 2) Plaintext fallback: Dateinamen im Listing
        const nameRegex = /([^\s"'>]+\.geojson)/gi;
        while ((m = nameRegex.exec(text)) !== null) urls.add(new URL(m[1], location.href + folder).href);

        if (urls.size === 0) {
            console.info(`Keine .geojson-Dateien im Ordner ${folder} gefunden oder Directory-Listing blockiert.`);
            return;
        }

        // Für jede gefundene Datei: laden und als Layer zur Karte hinzufügen
        for (const url of urls) {
            try {
                console.info(`Lade GeoJSON: ${url}`);
                const gjRes = await fetch(url);
                if (!gjRes.ok) {
                    console.warn(`Fehler beim Laden von ${url}: ${gjRes.status}`);
                    continue;
                }
                const geojson = await gjRes.json();
                const layer = L.geoJSON(geojson, {
                    onEachFeature: function (feature, layer) {
                        // Einfacher Popup: alle Eigenschaften anzeigen, falls vorhanden
                        if (feature && feature.properties) {
                            layer.bindPopup('<pre>' + JSON.stringify(feature.properties, null, 2) + '</pre>');
                        }
                    },
                    style: function () {
                        return { color: '#ff7800', weight: 2 };
                    },
                    pointToLayer: function (feature, latlng) {
                        return L.circleMarker(latlng, { radius: 6, fillColor: '#ff7800', color: '#000', weight: 1, fillOpacity: 0.8 });
                    }
                }).addTo(map);
                // Optional: zur Kontrolle in der Konsole ausgeben
                console.info(`GeoJSON hinzugefügt: ${url}`);
            } catch (err) {
                console.error(`Fehler beim Verarbeiten von ${url}:`, err);
            }
        }
    } catch (err) {
        console.error(`Fehler beim Zugriff auf ${folder}:`, err);
    }
}

// Tab Funktionalität
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Entferne active Klasse von allen Tabs
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
        
        // Setze active Klasse für ausgewählten Tab
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
        
        // Aktualisiere Karte wenn der Map-Tab aktiv ist
        if (button.dataset.tab === 'map') {
            map.invalidateSize();
        }
    });
});

// Aufruf nach der Kartenerstellung
loadGeoJSONFromLayerFolder();