mapboxgl.accessToken = mapToken;

// const latlng = [campgroundLng, campgroundLat];

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/light-v11',
  // center: latlng,
  center: campground.geometry.coordinates,
  zoom: 10,
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
  // .setLngLat(latlng)
  .setLngLat(campground.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 })
      .setHTML(
        `<h3>${campground.title}</h3><p>${campground.location}`
      )
  )
  .addTo(map)