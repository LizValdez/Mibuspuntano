
function initialize1() {

    var desde = window.parent(document.getElementById('pac-input-desde'));
    var hasta = window.parent(document.getElementById('pac-input-hasta'));

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