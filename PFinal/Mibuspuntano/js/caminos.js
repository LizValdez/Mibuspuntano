
var desde = new google.maps.LatLng(-33.302168, -66.340691);
var hasta = new google.maps.LatLng(-33.303400, -66.331958);

function initialize1() {

    var defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(-33.303324, -66.403393),
      new google.maps.LatLng(-33.264004, -66.287693));
    map.fitBounds(defaultBounds);

    var desde = (document.getElementById('pac-input-desde'));
    var hasta = (document.getElementById('pac-input-hasta'));

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(desde);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(hasta);

    var searchBoxDesde = new google.maps.places.SearchBox((desde));
    var searchBoxHasta = new google.maps.places.SearchBox((hasta));

    var callInitRoute = function () {
        if (desde.value.toString() != '' && hasta.value.toString() != '') {
            calcRoute();
        }
    };

    searchBoxDesde.addListener('places_changed', function (dat) {
        callInitRoute();
    });
    searchBoxHasta.addListener('places_changed', function (dat) {
        callInitRoute();
    });

    // Bias the SearchBox results towards places that are within the bounds of the
    // current map's viewport.
    google.maps.event.addListener(map, 'bounds_changed', function () {
        var bounds = map.getBounds();
        searchBoxDesde.setBounds(bounds);
        searchBoxHasta.setBounds(bounds);
    });


    }