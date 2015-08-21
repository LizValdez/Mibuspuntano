  var geocoder = new google.maps.Geocoder;

  document.getElementById('search').addEventListener('click', function() {
    geocodeLatLng(geocoder, map);
  });


function geocodeLatLng(geocoder, map) {
  var desde = document.getElementById('desde').value;
  var latlngStr = desde.split(',', 2);
  var latlng = {lat: parseFloat(latlngStr[0]), lng: parseFloat(latlngStr[1])};
  geocoder.geocode({'location': latlng}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      if (results[1]) {
        map.setZoom(11);
        var marker = new google.maps.Marker({
          position: latlng,
          map: map
        });
      } else {
        window.alert('No results found');
      }
    } else {
      window.alert('Geocoder failed due to: ' + status);
    }
  });
}