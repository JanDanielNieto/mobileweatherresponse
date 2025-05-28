<script src="https://unpkg.com/leaflet.heat/dist/leaflet-heat.js"></script>

const heat = L.heatLayer([
  [latitude1, longitude1, intensity1],
  [latitude2, longitude2, intensity2],
  // ... more data points
], { radius: 25 }).addTo(map);
