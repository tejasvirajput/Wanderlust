mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: "map",
  center: listing.geometry.coordinates,
  zoom: 11,
  style: "mapbox://styles/mapbox/outdoors-v12",
});

// Add marker
const marker = new mapboxgl.Marker({ color: "#fe424d" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${listing.title}</h4>
       <p>Exact location provided after booking.</p>`,
    ),
  )
  .addTo(map);

// Fullscreen button
map.addControl(new mapboxgl.FullscreenControl());

// Map style switcher
const mapStyle = document.getElementById("map-style");

if (mapStyle) {
  mapStyle.addEventListener("change", (event) => {
    const styleId = event.target.value;

    map.setStyle("mapbox://styles/mapbox/" + styleId);
  });
}
