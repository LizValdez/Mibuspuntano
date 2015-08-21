var map;

function initialize() {

    //marco la posicion de inicio del mapa
    var myLatlng = new google.maps.LatLng(-33.302248, -66.336788);
    var desde = new google.maps.LatLng(-33.302168, -66.340691);
    var hasta = new google.maps.LatLng(-33.303400, -66.331958);



    //Colocar el marcador
    desde = new google.maps.Marker({
        map: map,
        draggable: true,
        position: desde
    }); desde.setIcon('/Imagenes/A.png');

    hasta = new google.maps.Marker({
        map: map,
        draggable: true,
        position: hasta
    }); hasta.setIcon('/Imagenes/B.png');


};








 