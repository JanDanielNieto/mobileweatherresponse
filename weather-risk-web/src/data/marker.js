const marker = L.marker([latitude, longitude]).addTo(map);
marker.bindPopup("Your custom message").openPopup();


const customIcon = L.icon({
  iconUrl: `https://api.geoapify.com/v1/icon?type=material&color=%23ff0000&icon=location&apiKey=YOUR_API_KEY`,
  iconSize: [31, 46],
  iconAnchor: [15.5, 42],
  popupAnchor: [0, -45]
});

L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
