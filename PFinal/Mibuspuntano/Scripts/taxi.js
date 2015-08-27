var rendererOptions = {
    draggable: true
};
var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);;
var directionsService = new google.maps.DirectionsService();
var map;
var geocoder = new google.maps.Geocoder;

var myLatlng = new google.maps.LatLng(-33.302248, -66.336788);
var desde = new google.maps.LatLng(-33.302168, -66.340691);
var hasta = new google.maps.LatLng(-33.303400, -66.331958);

var mapOptions = {
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: myLatlng
};
map = new google.maps.Map(document.getElementById('map'), mapOptions);
var defaultBounds = new google.maps.LatLngBounds(
  new google.maps.LatLng(-33.303324, -66.403393),
  new google.maps.LatLng(-33.264004, -66.287693));
map.fitBounds(defaultBounds);
var desde = (document.getElementById('pac-input-desde'));
var hasta = (document.getElementById('pac-input-hasta'));

map.controls[google.maps.ControlPosition.TOP_LEFT].push(desde);
map.controls[google.maps.ControlPosition.TOP_LEFT].push(hasta);


function initialize() {

    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directionsPanel'));
    google.maps.event.addListener(directionsDisplay, 'directions_changed', function () {
        computeTotalDistance(directionsDisplay.getDirections());
    });

    google.maps.event.addListener(directionsDisplay, 'click', function () {
        computeTotalDistance(directionsDisplay.getDirections());
    });

    window.calcRoute = function () {

        var request = {
            origin: document.querySelector("#pac-input-desde").value.toString(),
            destination: document.querySelector("#pac-input-hasta").value.toString(),
            travelMode: google.maps.TravelMode.DRIVING
        };

        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });
    }
///////////////Oooooooooooooooooooooooooooooooooooooooooooooooooooooh
    calcRoute();

    function computeTotalDistance(result) {
        var total = 0;
        var myroute = result.routes[0];
        for (var i = 0; i < myroute.legs.length; i++) {
            total += myroute.legs[i].distance.value;
        }
        total = total / 1000.0;
        document.getElementById('total').innerHTML = total + ' km';

        var latlng = { lat: result.request.origin.G, lng: result.request.origin.K };
        geocoder.geocode({ 'location': latlng }, function (results, status) {
            document.getElementById('pac-input-desde').value = results[0].formatted_address;
        });

        var latlng1 = { lat: result.request.destination.G, lng: result.request.destination.K };
        geocoder.geocode({ 'location': latlng1 }, function (results, status) {
            document.getElementById('pac-input-hasta').value = results[0].formatted_address;
        });
    }

}




