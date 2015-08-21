var map, places;
var markers = [];
var autocompleteDesde;
var autocompleteHasta;
var strictBounds;
var myLatlng;
var mapW;
var mapH;
var geocoder;
var isFullScreen = false;

var rendererOptions = {
    draggable: true,
    markerOptions: { visible: false }
};
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

var stepDisplay;
var markersInfoGirar = [];

var indexCompleto_Sel;

var sobreEscribirText = false;

/*VARIABLES QUE USO CUANDO SELECCIONO UN RESULTADO===================================================*/
var polylines = [],
    indexPoly_Acotado_A = 0,
    indexPoly_Completo_A = 1,
    indexPoly_Acotado_B = 2,
    indexPoly_Completo_B = 3;

var markersParadas = [],
     IndexParadaD = 0, /*parada donde sube cerca del desde*/
     IndexParadaH = 1, /*parada donde baja cerca del hasta*/
     IndexParadaA = 2, /*parada donde baja para combinar*/
     IndexParadaB = 3; /*parada donde sube luego de combinar*/

var markersParadasTodas_A = [];
var markersParadasTodas_B = [];

var markersAlertas = [];
var divSuperiorOnMap;
var AlertasIsShow = false;
var InfoWindowsAlertas = [];

var TaxiRemis_Distancia;
var TaxiRemis_Tiempo;
var TaxiRemis_JsonResult;

var selectResult;

var iconParada = "../Recursos_Compartidos/Images/Markers/Otros/parada-bus.png";
var iconA = "../Recursos_Compartidos/Images/Markers/Otros/A.png";
var iconB = "../Recursos_Compartidos/Images/Markers/Otros/B.png";
var icon1 = "../Recursos_Compartidos/Images/Markers/Otros/1.png";
var icon2 = "../Recursos_Compartidos/Images/Markers/Otros/2.png";
var icon3 = "../Recursos_Compartidos/Images/Markers/Otros/3.png";
var icon4 = "../Recursos_Compartidos/Images/Markers/Otros/4.png";
var iconBullet = "../Recursos_Compartidos/Images/Markers/Otros/Bullet.png";
var iconCar = "../Recursos_Compartidos/Images/Markers/Otros/car.png";
var iconWalk = "../Recursos_Compartidos/Images/Markers/Otros/walk.png";
var iconBus = "../Recursos_Compartidos/Images/Markers/Otros/bus.png";
var iconAlert = "../Recursos_Compartidos/Images/Markers/Otros/bullet-red1.png";
var btnCompleto;
var btnAcotado;
/*====================================================================================*/

/*DEFINO LA IMAGEN Y EL SUBINDICE PARA MARKER DESDE Y HASTA*/
var imgDesde = "../Recursos_Compartidos/Images/Markers/markersD/image.png";
var imgHasta = "../Recursos_Compartidos/Images/Markers/markersH/image.png";
var indexMarkerDesde = 0;
var indexMarkerHasta = 1;


/* VARIABLES QUE REPRESENTAN A CONTROLES DE LA PAGINA */
var cmdIrOrigen;
var cmdIrDestino;
var cmdBuscarBondi;
var cmdBuscarCombinaciones;
var cmdEnAuto;
var cmdAPie;
var cmbRadio;
var cmdBuscarCombFlecha;

var shareOptionDiv;

/* LOS DOS MARKERS QUE APARECEN AL INICIO, UNA VEZ QUE SE ARRASTRAN O SE ESCRIBE UNA DIRECCION, 
ESTOS SE ELIMINAN Y SE CREAN LOS DEL ARRAY QUE LUEGO SE USAN EN LA BUSQUEDA MARKERS[0] Y MARKERS[1] */
var markerAuxD;
var markerAuxH;
var yaCreoMarkerDesde = false;
var yaCreoMarkerHasta = false;

var imgLogo = "../Recursos_Compartidos/Images/Logo/Isologo.png";
var divPrint;
var queBusca = ''; /*[COLECTIVO|RUTA]*/
var route_mode = '';
var linkCompartir = "";

/*PARA LEER EL QUERYSTRING*/
var qs_tipo = "";
var qs_latd = "";
var qs_lngd = "";
var qs_lath = "";
var qs_lngh = "";
var qs_radio = "";
var qs_comb = "";
var qs_mode = "";

/*PARA MOVER EL COLECTIVO*/
var polyMover;
var t = -1;
var markerMov;
var timerRunning = false;
var myTimer = null;
var polyMoverAux = null;

/*geolocalizacion*/
var indexSelectToLocalizacion;
var indexSelectToSearchInterestPlaces;

/*ASIGNO NOMBRE DE CONTROLES A LAS VARIABLES*/
function InicializarVariablesControles() {
    cmdIrOrigen = $('#cmdIrOrigen');
    cmdIrDestino = $('#cmdIrDestino');
    cmdBuscarBondi = $('#cmdBuscarBondi');
    cmdBuscarCombinaciones = $('#cmdBuscarCombinaciones');
    cmdEnAuto = $('#cmdEnAuto');
    cmdAPie = $('#cmdAPie');
    cmbRadio = $('#cmbRadio');
    cmdBuscarCombFlecha = $('#cmdBuscarCombFlecha');

}


var divCompartir;

var imgOpenRoute = "../Recursos_Compartidos/Images/rec_open.jpg";
var imgCloseRoute = "../Recursos_Compartidos/Images/rec_close.jpg";
var imgOpenTarifa = "../Recursos_Compartidos/Images/tarifa_open.jpg";
var imgCloseTarifa = "../Recursos_Compartidos/Images/tarifa_close.jpg";

/*ESTE ES EL METODO INICIAL (CREO QUE SE INICA ANTES DE CUALQUIER METODO DE INICIO DEL MASTER)*/
function initialize() {

    /*LLAMO A METODO INICONFIGS DE COMUN.JS, INICIA CONFIGURACIONES POR EJEMPLO LA DE LEER EL WEBCONFIG*/
    IniConfigs();

    /*VALIDO EL ACCESO A LA PAGINA*/
    validAccess("DH");
    
    	
    /*ASIGNO NOMBRE DE CONTROLES A LAS VARIABLES*/
    InicializarVariablesControles();

    /*AGREGO EL EVENTO QUE CIERRE EL FULLSCREEN AL PRESIONAR ESCAPE */
    $(window).keydown(function (objEvent) {
        if (objEvent.keyCode == 27) {
            if (isFullScreen)
                setFullScreen();
        }
    });

    /*MUESTRO EL CARTEL DE INICIO*/
    /*showInfo("¿CÓMO LLEGAR?", " busque alternativas para llegar de un origen a un destino determinados");*/

    /*ASIGNA TAMAÑOS AL MAPCONTENT DE ACUERDO AL TAMAÑO DEL PAGECONTENT QUE SE ASIGNA EN IniConfigs(); 
    DE ACUERDO A SI HAY O NO PUBLICIDAD*/
    mapW = $("#pageContent").width() - $("#searchContent").width() - 32;
    mapH = $("#mapContent").height();
    $("#mapContent").width(mapW);

    /*CREO EL MAPA Y LO CENTRO DE ACUERDO A LAT Y LONG DECLARADOS EN WEBCONFIG*/
    myLatlng = new google.maps.LatLng(webConfig.par_CenterMap_Latitud, webConfig.par_CenterMap_Longitud);
    var myOptions = {
        center: myLatlng,
        zoom: parseInt(webConfig.par_mapZoom),
        minZoom: 11,
        panControl: true,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
        },
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.SMALL
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById('map_canvas'), myOptions);

    /*SI TOMAMOS UN MARKER Y LO ARRASTRAMOS FUERA DEL MAPA, ESE MARKER SE ELIMINA, Y LA FORMA DE QUE VUELVA A
    APARECER DE NUEVO ES CREANDOLO EN EL CLICK SOBRE EL MAPA (O ESCRIBIENDO UNA DIRECCION). aCA AGREGO ESE EVENTO EN EL CLICK DEL MAPA */
    google.maps.event.addListener(map, 'click', function (event) {
        if (!markers[indexMarkerDesde] && yaCreoMarkerDesde) {
            /*CREO EL MARKER DESDE EN EL CLICK DEL MAPA SOLO SI NO EXISTE*/
            cmdIrOrigen.focus();
            createMarker(imgDesde, indexMarkerDesde, "geoSearcherDesde", event.latLng);
            codeLatLng(event.latLng, "geoSearcherDesde", indexMarkerDesde);
        }
        else if (!markers[indexMarkerHasta] && yaCreoMarkerHasta) {
            /*CREO EL MARKER HASTA EN EL CLICK DEL MAPA SOLO SI NO EXISTE*/
            cmdIrDestino.focus();
            createMarker(imgHasta, indexMarkerHasta, "geoSearcherHasta", event.latLng);
            codeLatLng(event.latLng, "geoSearcherHasta", indexMarkerHasta);
        }
    });

    /*PONGO LIMITE AL MOVER EL MAPA. LAT Y LONG PARA LIMITES ESTAN DEFINIDOS EN WEBCONFIG*/
    limitarMapa();

    /*ASIGNO EL MISMO LIMITE PARA EL AUTOCOMPLETE. LA VARIABLE strictBounds SE ASIGNA EN limitarMapa() */
    var options = {
        bounds: strictBounds,
        componentRestrictions: { country: 'ar' }
    };

    /*INICIALIZO LOS GEO SEARCHER*/
    iniGeoSearcherMap(myLatlng, strictBounds, webConfig.par_Ciudad_Nombre, webConfig.par_arrayCiudades_Replace, webConfig.par_AdministrateLevel2);
    createGeoSearcher("geoSearcherDesde", "270", "450", "De:  Dirección o Lugar + (ENTER)");
    createGeoSearcher("geoSearcherHasta", "270", "450", "A:   Dirección o Lugar + (ENTER)");
    configurateTabControlProx("geoSearcherDesde", "geoSearcherHasta");
    $("#tblSearchContent").show();

    /*ASIGNO LOS EVENTOS EN LOS TEXTBOX DESDE HASTA, EJEMPLO FOCUS, CLICK, ETC*/
    setEventsToTextBoxs();

    /*ASIGNO LOS EVENTOS EN TODOS LOS BOTONES DE LA PAGINA*/
    setEventsToButtons();

    /*CREO EL MENU CONTEXTUAL SOBRE EL MAPA*/
    createContextMenu();

    /*CREO LOS BOTONES EN EL MAPA, EJEMPLO FULLSCREEN*/
    addCustomButton();

    /*CARGO LAS ALERTAS EN EL MAPA*/
    getAlertasGeo();

    /*INICIO CONTROL PARA BUSCAR RUTAS*/
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    stepDisplay = new google.maps.InfoWindow();

    /*CREO UN DIV PARA IMPRIMIR*/
    divPrint = document.createElement('DIV');


    /*SI VIENE DE UN LINK COMPRATIDO, BUSCO*/
    if (readQueryString() == true) {
        /*si estan bien los datos que vienen por querystring*/
        /*antes se buscaba por querystring aca, pero lo comente y busco en el success de cargar radios*/
        /*buscarFromQueryString();*/
    }
    else {
        /*CREO LOS DOS MARCADORES QUE APARECEN POR DEFECTO EN EL MAPA. ESTOS SON DOS VARIABLES SUELTAS markerAuxD Y markerAuxH 
        OSEA QUE NO SE CARGAN EN EL ARRAY DE MARKERS. CUANDO SE MUEVEN O SE ESCRIBE UNA DIRECCION, RECIEN AHI SE ELIMINAS ESTOS Y 
        SE CREAN LOS MARKERS DESDE Y HASTA EN EL ARRAY   */
        createTwoMarkers(imgDesde, webConfig.par_MarkerDesde_Latitud, webConfig.par_MarkerDesde_Longitud, indexMarkerDesde, "geoSearcherDesde");
        createTwoMarkers(imgHasta, webConfig.par_MarkerHasta_Latitud, webConfig.par_MarkerHasta_Longitud, indexMarkerHasta, "geoSearcherHasta");
    }


    cmbRadio.attr("tabindex", 3);
    cmdBuscarBondi.attr("tabindex", 4);
    cmdBuscarCombinaciones.attr("tabindex", 5);
    cmdEnAuto.attr("tabindex", 6);
    cmdAPie.attr("tabindex", 7);

    if (webConfig.par_showTaxiRemis == 'n') {
        cmdEnAuto.text("En Auto");
    }

    if (webConfig.par_showInfoNuevoMarco == 's' && webConfig.par_textoInfoNuevoMarco!="")
        showYellow(webConfig.par_textoInfoNuevoMarco, "");

    /*INICIALIZO COMPARTIR*/
    divCompartir = document.createElement('DIV');
    $(divCompartir).attr("id", "divCompartir");
    $(divCompartir).addClass('gmap-control comparte');

    clearResults();

}
/*==========================FIN INITIALIZE===================================*/

/*ESTA FUNCION DEBE ESTAR SEMPRE EN EL CONTEXTO DONDE SE USE ALGUN GEO SEARCHER*/
/*ES LA QUE SE EJECUTA EN EL MOMENTO EN QUE SE SELECCIONA ALGUN VALOR*/
/*DEVUELVE E NOMBRE DEL CONTROL, POSICION Y DIRECCION SELECCIONADAS*/
/*LA POSICION latlng NO SE TEXTO SINO UN var latlng = new google.maps.LatLng(lat, lng);*/

function onGeoCodeSelect(geoSearcherName, latlng, dire) {

    if (dire == '')
        sobreEscribirText = true;
    else
        sobreEscribirText = false;

    switch (geoSearcherName) {

        case "geoSearcherDesde":
            showSelectedPlace(latlng, dire, indexMarkerDesde, geoSearcherName, imgDesde);
            break;

        case "geoSearcherHasta":
            showSelectedPlace(latlng, dire, indexMarkerHasta, geoSearcherName, imgHasta);
            break;

    }
}

/*LEER EL QUERYSTRING*/
function readQueryString() {

    if (qs_tipo != "colectivo" && qs_tipo != "ruta") return false;

    if (isNaN(Number(qs_latd)) || isNaN(Number(qs_lngd)) || isNaN(Number(qs_lath)) || isNaN(Number(qs_lngh)) || isNaN(Number(qs_radio))) return false;

    if (Number(qs_latd) == 0 || Number(qs_lngd) == 0 || Number(qs_lath) == 0 || Number(qs_lngh) == 0) return false;

    if (qs_tipo == "colectivo") {

        if (qs_comb != "1")
            qs_comb = "0";

        if (Number(qs_radio) == 0)
            return false;
    }
    else {

        if (qs_mode != "auto" && qs_mode != "pie")
            qs_mode = "auto";
    }

    if (restrictPosition(qs_latd, qs_lngd) == false) return false;

    if (restrictPosition(qs_lath, qs_lngh) == false) return false;

    return true;
}

/*DESPUES DE LEER EL QUERYSTRING REALIZO LA BUSQUEDA*/
function buscarFromQueryString() {

    var positionD = new google.maps.LatLng(qs_latd, qs_lngd);
    var positionH = new google.maps.LatLng(qs_lath, qs_lngh);
    
    sobreEscribirText = true;
    
    createMarker(imgDesde, indexMarkerDesde, "geoSearcherDesde", positionD);
    createMarker(imgHasta, indexMarkerHasta, "geoSearcherHasta", positionH);

    codeLatLng(positionD, "geoSearcherDesde", indexMarkerDesde);
    codeLatLng(positionH, "geoSearcherHasta", indexMarkerHasta);

    if (Number(qs_radio) == 0)
        qs_radio = 300;

    changeCircleRadius(Number(qs_radio));
    if (qs_tipo == "colectivo") {
        
        cmbRadio.val(qs_radio);
        
        if (qs_comb == "0")
            buscarBondi(qs_radio, true);
        else
            buscarBondi(qs_radio, false);
    }
    else {
        calcRoute(qs_mode);
    }
}

/*CREO LOS DOS MARKERS QUE APARECEN POR DEFECTO*/
function createTwoMarkers(img, lat, lon, markerIndex, geoSearcherName) {
    
    var position = new google.maps.LatLng(lat, lon);
    var image = new google.maps.MarkerImage(img, new google.maps.Size(28, 41));
    var marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: image,
        draggable: true
    });


    /*POR EL PUTO ERROR DE CHROME, CUANDO EMPIEZO A MOVER UN MARKADOR PONGO EL FOCO EN ALGUN BOTON PORQUE SI EL FOCO 
    ESTUVIESE EN EL TEXTBOX SE BORRARIA DEL MISMO LA DIRECCION ELEGIDA*/
    google.maps.event.addDomListener(marker, 'dragstart', function (event) {
        if (markerIndex == indexMarkerDesde)
            cmdIrOrigen.focus();
        if (markerIndex == indexMarkerHasta)
            cmdIrDestino.focus();
    });


    /*CUANDO SUELTO EL MARKER LO ELIMINO Y CREO EL MARKER REAL QUE VA AL ARRAY MARKERS*/
    google.maps.event.addDomListener(marker, 'dragend', function (event) {
        marker.setMap(null);
        marker == null;
        sobreEscribirText = true;
        createMarker(img, markerIndex, geoSearcherName, event.latLng);
        codeLatLng(event.latLng, geoSearcherName, markerIndex);
    });

    /*AGREGO TOOLTIP EN MOUSEOVER A LOS MARKERS DE INICIO*/
    google.maps.event.addDomListener(marker, "mouseover", function () {
        if (indexMarkerDesde == markerIndex)
            showtip("Arrastre para indicar el Origen", 'yellow', 170);
        else
            showtip("Arrastre para indicar el Destino", 'yellow', 170);
    });

    /*OCULTO EL TOOLTIP EN MOUSEOUT*/
    google.maps.event.addDomListener(marker, "mouseout", function () {
        unshowtip();
    });

    if (markerIndex == indexMarkerDesde)
        markerAuxD = marker;
    else
        markerAuxH = marker;
    
}

/*AGREGO LOS BOTONES AL MAPA*/
function addCustomButton() {

    /*CREO EL DIV QUE LOS VA A CONTENER*/
    var controlDiv = document.createElement('DIV');
    $(controlDiv).addClass('gmap-control-container').addClass('gmnoprint');
    divSuperiorOnMap = controlDiv;

    /*AGREGA INFO*/
    var controlUI_in = document.createElement('DIV');
    $(controlUI_in).addClass('gmap-control');
    $(controlUI_in).html("<i class='icon-info-sign'></i>");
    $(controlDiv).append(controlUI_in);
    $(controlUI_in).click(function () {
        showInformacion(1);
    });
    $(controlUI_in).mouseover(function () {
        showtip("Información", 'yellow', 80);
    });
    $(controlUI_in).mouseout(function () {
        unshowtip();
    });

    /*AGREGA UN SEPARADOR*/
    /*var controlUI_SE = document.createElement('DIV');
    $(controlUI_SE).addClass('gmap-control-separator');
    $(controlUI_SE).html("&nbsp;");
    $(controlDiv).append(controlUI_SE);*/

    /*AGREGA VISTA COMPLETA*/
    var controlUI_vc = document.createElement('DIV');
    $(controlUI_vc).addClass('gmap-control');
    $(controlUI_vc).html("<i class='icon-screenshot'></i>");
    $(controlDiv).append(controlUI_vc);
    $(controlUI_vc).click(function () {
        vistaCompleta();
    });
    $(controlUI_vc).mouseover(function () {
        showtip("Posición Inicial", 'yellow', 80)
    });
    $(controlUI_vc).mouseout(function () {
        unshowtip();
    });

    /*AGREGA FULLSCREEN*/
    var controlUI_fs = document.createElement('DIV');
    $(controlUI_fs).attr("id", "btnFullScreen");
    $(controlUI_fs).addClass('gmap-control');
    $(controlUI_fs).html("<i class='icon-fullscreen'></i>");
    $(controlDiv).append(controlUI_fs);
    $(controlUI_fs).click(function () {
        setFullScreen();
    });
    $(controlUI_fs).mouseover(function () {
        showtip("Pantalla Completa", 'yellow', 100);
    });
    $(controlUI_fs).mouseout(function () {
        unshowtip();
    });

    /*AGREGO CONTROL DE TRAFICO*/
    if (webConfig.par_show_traffic == 's')
        addTrafficLegend(controlDiv);
      

    /*AGREGO EL DIV CONTENT AL MAPA*/
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(controlDiv);
}

/*!!!!!!!!!!!!!!!!!! ESTE METODO SE EJECUTA CUANDO ELEGIMOS DIRECCION O LUGAR DESDE EL AUTOCOMPLETE (INPUTDESDE O IMPUTHASTA)*/
function showSelectedPlace(latlng, dire, markerIndex, geoSearcherName, img) {

    var lat = latlng.lat();
    var lon = latlng.lng();

    /*VALIDO QUE CAIGA DENTRO DE LOS LIMITES ESTABLECIDOS POR STRINBOUNDS*/
    if (restrictPosition(lat, lon) == true) {
        /*CENTRO EL MAPA EN LA DIRECCION SELECCIONADA*/

        myLatlng = new google.maps.LatLng(lat, lon);
        map.panTo(myLatlng);
        /*MUEVO EL MARKER (DESDE O HASTA) O LO CREO SI ES QUE NO EXISTE*/
        MoveOrCreateMarker(markerIndex, myLatlng, img, geoSearcherName, true);
        /*OCULTO EL MENSAJE*/
        hideMessage();
    }
    else {
        showError('Dirección fuera de rango: ', dire);
        setError(geoSearcherName);
    }
}

/*!!!!!!!!!!!!!!!MUEVO EL MARKER (DESDE O HASTA) O LO CREO SI ES QUE NO EXISTE*/
function MoveOrCreateMarker(markerIndex, latLng, img, geoSearcherName, boolsearch) {
    if (markers[markerIndex]) {
        /*EXISTE Y LO MUEVO AL IGUAL QUE AL CIRCULO ASOCIADO*/
        markers[markerIndex].setPosition(latLng);
    }
    else
        createMarker(img, markerIndex, geoSearcherName, latLng); /*NO EXISTE Y LO CREO*/

    /*BUSCO LA DIRECCION DEL MARKER Y LA MUESTRO EN EL TOOLTIP Y EN EL INPUT ASOCIADO*/
    if (boolsearch)
        codeLatLng(latLng, geoSearcherName, markerIndex);
}

/*CREO UN MARCADOR (DESDE O HASTA)*/
function createMarker(img, markerIndex, geoSearcherName, position) {

    var image = new google.maps.MarkerImage(img, new google.maps.Size(28, 41));
    markers[markerIndex] = new google.maps.Marker({
        position: position,
        map: map,
        icon: image,
        draggable: true,
        cursor: "move"
    });

    /*SI EL MARCADOR AUXILIAR QUE SE CREA AL INICIAR LA PAGINA EXISTE (DESDE O HASTA), LO ELIMINO 
    (ESTO SUCEDE CUANDO ESCRIBO UNA DIRECION SIN MOVER EL MARCADOR AUXILIAR)*/
    if (markerIndex == indexMarkerDesde && markerAuxD) {
        markerAuxD.setMap(null);
        markerAuxD == null;
    }
    if (markerIndex == indexMarkerHasta && markerAuxH) {
        markerAuxH.setMap(null);
        markerAuxH == null;
    }

    if (markerIndex == indexMarkerDesde)
        yaCreoMarkerDesde = true;
    else
        yaCreoMarkerHasta = true;

    /*POR EL PUTO ERROR DE CHROME, CUANDO EMPIEZO A MOVER UN MARKADOR PONGO EL FOCO EN ALGUN BOTON PORQUE SI EL FOCO 
    ESTUVIESE EN EL TEXTBOX SE BORRARIA DEL MISMO LA DIRECCION ELEGIDA*/
    google.maps.event.addDomListener(markers[markerIndex], 'dragstart', function (event) {
        if (markerIndex == indexMarkerDesde)
            cmdIrOrigen.focus();
        if (markerIndex == indexMarkerHasta)
            cmdIrDestino.focus();
    });

    /*CUANDO SUELTO EL MARKER BUSCO LA DIRECCION Y LA MUESTRO EN EL TOOLTIP Y EL INPUT ASOCIADO*/
    google.maps.event.addDomListener(markers[markerIndex], 'dragend', function (event) {
        sobreEscribirText = true;
        codeLatLng(event.latLng, geoSearcherName, markerIndex);
    });

}

/*INTERCAMBIAR ORIGEN Y DESTINO*/
function Intercambiar() {
    var hayD = false, hayH = false, latLngD, latLngH;

    if (markers[indexMarkerDesde]) {
        hayD = true;
        latLngD = markers[indexMarkerDesde].getPosition();
    }
    if (markers[indexMarkerHasta]) {
        hayH = true;
        latLngH = markers[indexMarkerHasta].getPosition();
    }
    if (!hayD || !hayH) return;

    var latLngD;
    var latLngH;

    if (markers[indexMarkerDesde])
        latLngD = markers[indexMarkerDesde].getPosition();

    if (markers[indexMarkerHasta])
        latLngH = markers[indexMarkerHasta].getPosition();

    sobreEscribirText = true;
    MoveOrCreateMarker(indexMarkerHasta, latLngD, imgHasta, "geoSearcherHasta", true);
    MoveOrCreateMarker(indexMarkerDesde, latLngH, imgDesde, "geoSearcherDesde", true);

    if (queBusca == "COLECTIVO")
        buscarBondi(cmbRadio.val(), true);
    else
        if(route_mode!='')
            calcRoute(route_mode);
}

/*!!!!!!!!!!!!!!!!!!!BUSCO LA DIRECCION Y LA MUESTRO EN EL TOOLTIP Y EL INPUT ASOCIADO*/
function codeLatLng(latlng, geoSearcherName, markerIndex) {

    /*ESTE METODO SE LLAMA DE VARIOS LUGARES, PERO SI SE LO LLAMA AL MOVER UN MARCADOR, SE VALIDA QUE HAYA SIDO SOLTADO DENTRO DE LOS LIMITES VALIDOS*/
    if (restrictPosition(latlng.lat(), latlng.lng()) == false) {
        deleteMarker(markerIndex);
        geoSearcher_setText(geoSearcherName, '', '');
        return;
    }

    /*!!!!!!!!!!!BUSCO LA DIRECCION QUE REPRESENTA A LATLNG*/
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                var address = removeCityName(results[0].formatted_address);
                if (sobreEscribirText == true)
                    geoSearcher_setText(geoSearcherName, address, latlng.lat() + ',' + latlng.lng());
                google.maps.event.addDomListener(markers[markerIndex], "mouseover", function () {
                    showtip(address, 'yellow', 150)
                });
                google.maps.event.addDomListener(markers[markerIndex], "mouseout", function () {
                    unshowtip();
                });
            }
        }
    });
}

/*!!!!!!!!!!!!!!IR AL MARCADOR EN EL MAPA (DESDE O HASTA)*/
function gotoMarkerPosition(markerIndex) {
    if (markers[markerIndex]) {
        map.panTo(markers[markerIndex].getPosition());
        map.setZoom(15);
    }
}

/*AGREGO LOS VENTOS A TODOS LOS BOTONES DE LA PAGINA*/
function setEventsToButtons() {

    cmdIrOrigen.click(function () {
        gotoMarkerPosition(indexMarkerDesde);
    });
    cmdIrOrigen.mouseover(function () {
        showtip("Ir al Origen", 'yellow', 70)
    });
    cmdIrOrigen.mouseout(function () {
        unshowtip();
    });

    cmdIrDestino.click(function () {
        gotoMarkerPosition(indexMarkerHasta);
    });
    cmdIrDestino.mouseover(function () {
        showtip("Ir al Destino", 'yellow', 70)
    });
    cmdIrDestino.mouseout(function () {
        unshowtip();
    });
    cmdBuscarBondi.click(function () {
        buscarBondi(cmbRadio.val(), true);
    });
    cmdBuscarCombinaciones.click(function () {
        buscarBondi(cmbRadio.val(), false);
    });

    cmdEnAuto.click(function () {
        calcRoute('auto');
    });
    cmdAPie.click(function () {
        calcRoute('pie');
    });
}

function printResults() {
    if (queBusca == "RUTA") {

        $(divPrint).html("");
        $(divPrint).append($("#directions-panel").clone());
    }
    $(divPrint).printElement({ printMode: 'popup', pageTitle: 'Miautobus.com' });
}


/*PARA MOSTRAR LA DIRECCION ELEGIDA EN EL TOOLTIP DEL MARCADOR, QUITO EL NOMBRE DE LA CIUDAD Y DEL PAIS*/
function removeCityName(address) {

    var textosReplace = new Array();
    textosReplace = webConfig.par_arrayCiudades_Replace.split('|');

    for (i = 0; i < textosReplace.length - 1; i++)
        address = address.replace(textosReplace[i], "");
    return address;
}

/*AGREGA LOS LIMITES HASTA DONDE MOVER EL MAPA*/
function limitarMapa() {

    var minZoomLevel = 11;

    strictBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(webConfig.par_Bound1_Latitud, webConfig.par_Bound1_Longitud),
        new google.maps.LatLng(webConfig.par_Bound2_Latitud, webConfig.par_Bound2_Longitud)
    );

    google.maps.event.addListener(map, 'center_changed', function () {
        if (strictBounds.contains(map.getCenter())) return;

        var c = map.getCenter(),
         x = c.lng(),
         y = c.lat(),

         maxX = strictBounds.getNorthEast().lng(),
         maxY = strictBounds.getNorthEast().lat(),
         minX = strictBounds.getSouthWest().lng(),
         minY = strictBounds.getSouthWest().lat();

        if (x < minX) x = minX;
        if (x > maxX) x = maxX;
        if (y < minY) y = minY;
        if (y > maxY) y = maxY;

        map.setCenter(new google.maps.LatLng(y, x));
    });

    google.maps.event.addListener(map, 'zoom_changed', function () {
        if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
    });
}

/*VALIDA QUE UNA DIRECCION ELEGIDA CAIGA DENTRO DE LOS LIMITES*/
function restrictPosition(lat, lon) {

    var maxLat = strictBounds.getNorthEast().lat(),
        maxLon = strictBounds.getNorthEast().lng(),

        minLat = strictBounds.getSouthWest().lat(),
        minLon = strictBounds.getSouthWest().lng();

    if (lat < minLat) return false;
    if (lat > maxLat) return false;
    if (lon < minLon) return false;
    if (lon > maxLon) return false;

    return true;
}

function clearMarkers() {
    if (markers) {
        for (var i = 0; i < markers.length; i++) {
            if (markers[i]) {
                markers[i].setMap(null);
                markers[i] == null;
                markers[i] = undefined;
            }
        }
        markers = [];
    }
}

function deleteMarker(i) {
    if (markers[i]) {
        markers[i].setMap(null);
        markers[i] == null;
        markers[i] = undefined;
    }
}
function createContextMenu() {
    var menu = new contextMenu({ map: map });
    var texto;
    var espacios = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";

    texto = "<i class='icon-map-marker'></i> Desde aquí";
    menu.addItem(texto, function (map, latLng) {
        sobreEscribirText = true;
        MoveOrCreateMarker(indexMarkerDesde, latLng, imgDesde, "geoSearcherDesde", true)
    });
    texto = "<i class='icon-map-marker'></i> Hasta aquí";
    menu.addItem(texto, function (map, latLng) {
        sobreEscribirText = true;
        MoveOrCreateMarker(indexMarkerHasta, latLng, imgHasta, "geoSearcherHasta", true)
    });
    menu.addSep();
    texto = "<i class='icon-zoom-in'></i> Acercar";
    menu.addItem(texto, function (map, latLng) {
        map.setZoom(map.getZoom() + 1);
        map.panTo(latLng);
    });
    texto = "<i class='icon-zoom-out'></i> Alejar";
    menu.addItem(texto, function (map, latLng) {
        map.setZoom(map.getZoom() - 1);
        map.panTo(latLng);
    });
    menu.addSep();

    texto = "<i class='icon-font'></i> Ir al Origen";
    menu.addItem(texto, function (map, latLng) {
        gotoMarkerPosition(indexMarkerDesde);
    });

    texto = "<i class='icon-bold'></i> Ir al Destino";
    menu.addItem(texto, function (map, latLng) {
        gotoMarkerPosition(indexMarkerHasta);
    });
    menu.addSep();
    texto = "<i class='icon-random'></i> Intercambiar";
    menu.addItem(texto, function (map, latLng) {
        Intercambiar();
    });
    menu.addSep();
    texto = "<i class='icon-screenshot'></i> Posición Inicial";
    menu.addItem(texto, function (map, latLng) {
        vistaCompleta();
    });
    texto = "<i class='icon-fullscreen'></i> Pantalla Completa";
    menu.addItem(texto, function (map, latLng) {
        setFullScreen();
    });
}

function vistaCompleta() {
    map.panTo(myLatlng);
    map.setZoom(parseInt(webConfig.par_mapZoom));
}

function setFullScreen() {
    x = map.getZoom();
    c = map.getCenter();
    if (isFullScreen) {
        $("#mapContent").width(mapW);
        $("#mapContent").height(mapH);
        $("#mapContent").removeClass("mapContentFullScreem");
        $("#mapContent").addClass("mapContent item gradient shadow-all controlLeft");
        $("#map_canvas").width(mapW);
        $("#map_canvas").height(mapH);
        $("body").addClass("showscroll");
        $("body").removeClass("hidescroll");
        isFullScreen = false;
        $("#map_canvas").css('zIndex', 200);
        $("#mapContent").css('zIndex', 200);
        $("#btnFullScreen").removeClass('gmap-control-clear cursorPointer').addClass('gmap-control');
    }
    else {
        var newW = getBodyWidth() - 10;
        var newH = getBodyHeight() - 10;
        $("#mapContent").width(newW);
        $("#mapContent").height(newH);
        $("#mapContent").removeClass("mapContent item gradient shadow-all controlLeft");
        $("#mapContent").addClass("mapContentFullScreem");
        $("body").removeClass("showscroll");
        $("body").addClass("hidescroll");
        $("#map_canvas").width(newW);
        $("#map_canvas").height(newH);
        $("#tdMap").width(newW + 10);
        isFullScreen = true;
        $("#map_canvas").css('zIndex', 2000);
        $("#mapContent").css('zIndex', 2000);
        ScrollToTop($("#header"));
        $("#btnFullScreen").removeClass('gmap-control').addClass('gmap-control-clear cursorPointer');
    }
    google.maps.event.trigger(map, 'resize');
    map.setZoom(x);
    map.setCenter(c);

}

/*DESPUES DE LA BUSQUEDA SE EJECUTA EL METODO ONCOMPLETE*/
function buscarBondi(radio, directos) {
    try {

        clearResults();
        clearMap();
        hideMessage();
        
        queBusca = "COLECTIVO";

        /*============================================================
        si no hay texto informa que faltan datos
        si hay texto y no hay value (latlon) entonces busca y sugiere
        si hay texto y hay value, busca
        lamentablemente este bloque se repite 2 veces en los 3 buscar 
        por movimos de sincronizacion, no pueden ponerse en una funcion
        ==============================================================*/

        var sugerir = false;
        var textA = geoSearcher_getText("geoSearcherDesde")
        var valueA = geoSearcher_getValue("geoSearcherDesde")

        var textB = geoSearcher_getText("geoSearcherHasta")
        var valueB = geoSearcher_getValue("geoSearcherHasta")

        var showA = false;
        var showB = false;

        var ww;
        if (textA != "" && valueA == "") {
            sugerir = true;
            showA = true;
            if (!(textB != "" && valueB == ""))
                ww = "207px";
            getSuggest('geoSearcherDesde', 'geoSuggestDesde', 'titleDesde', true,ww);
        } else
            hideBlock('geoSuggestDesde', 'titleDesde');

        if (textB != "" && valueB == "") {
            sugerir = true;
            showB = true;
            if (!(textA != "" && valueA == ""))
                ww = "207px";
            getSuggest('geoSearcherHasta', 'geoSuggestHasta', 'titleHasta', true,ww);
        } else
            hideBlock('geoSuggestHasta', 'titleHasta');

        if (showA || showB)
            showSuggestContent();
        else
            hideSuggestContent();
        /*==============================================================*/

        if (sugerir == false) {
            if (markers[indexMarkerDesde] && markers[indexMarkerHasta]) {

                showLoading('Buscando con radio de caminata de ' + radio + ' metros...', 400);
                latLngD = markers[indexMarkerDesde].getPosition();
                latLngH = markers[indexMarkerHasta].getPosition();
                linkCompartir = webConfig.par_url + "?tipo=colectivo&latd=" + latLngD.lat() + "&lngd=" + latLngD.lng() + "&lath=" + latLngH.lat() + "&lngh=" + latLngH.lng() + "&radio=" + radio;

                if (directos) {
                    linkCompartir = linkCompartir + "&comb=0";
                    //alert("Descomentar aqui");
                    //onSuccessDirectos("");
                    DesdeHasta_GetDesdeHastaDirectos(radio, latLngD.lat(), latLngD.lng(), latLngH.lat(), latLngH.lng(), onSuccessDirectos, true);
                }
                else {
                    linkCompartir = linkCompartir + "&comb=1";
                    DesdeHasta_GetDesdeHastaCombinados(radio, latLngD.lat(), latLngD.lng(), latLngH.lat(), latLngH.lng(), onSuccessCombinados, true);
                }
            }
            else
                showError("Datos incompletos: ", "No ha ingresado todos los datos necesarios para realizar la consulta. Por favor ingrese Origen y Destino");
        }
    }
    catch (error) {
        hideLoading();
        showError("Se produjo un error: ", "Disculpe las molestias, por favor vuelva a realizar su consulta más tarde, muchas gracias. Equipo Miautobus.");
    }
}
function onSuccessDirectos(result) {
    var res = [{ "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "Colombres 1205 (entre Videla Castillo y Galan)", "Direccion_Parada_H": "Revolución de Mayo 1243 (entre La Coruña y Madrid)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.39221768833285", "Lat_Parada_H": "-31.4337394255918", "Linea": "25", "LineaB": "25", "LineaDos": "DIRECTO", "LineaUno": "25", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.19693744883386", "Long_Parada_H": "-64.16952740753744", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 671, "OrdenRec_P_H": 1032, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 162, "Recorridos_ID_B": null, "Resultados": "25 (Costo: $5.30)", "ResultadosToolTip": "Linea 25, subiendo en Colombres 1205 (entre Videla Castillo y Galan) y bajando en Revolución de Mayo 1243 (entre La Coruña y Madrid)\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "Castro Barros 1527 (entre 6 de Julio y Copacabana)", "Direccion_Parada_H": "Avenida Gdor. Amadeo Sabattini 1749-1850", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.3923", "Lat_Parada_H": "-31.43286036237277", "Linea": "15", "LineaB": "15", "LineaDos": "DIRECTO", "LineaUno": "15", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.203", "Long_Parada_H": " -64.16214099892477", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 815, "OrdenRec_P_H": 1182, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 140, "Recorridos_ID_B": null, "Resultados": "15 (Costo: $5.30)", "ResultadosToolTip": "Linea 15, subiendo en Castro Barros 1527 (entre 6 de Julio y Copacabana) y bajando en Avenida Gdor. Amadeo Sabattini 1749-1850\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "Castro Barros 1527 (entre 6 de Julio y Copacabana)", "Direccion_Parada_H": "Sabattini 1800 (entre Extremadura y El Escorial)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.3923", "Lat_Parada_H": "-31.4328", "Linea": "12", "LineaB": "12", "LineaDos": "DIRECTO", "LineaUno": "12", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.203", "Long_Parada_H": "-64.1621", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 685, "OrdenRec_P_H": 1062, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 135, "Recorridos_ID_B": null, "Resultados": "12 (Costo: $5.30)", "ResultadosToolTip": "Linea 12, subiendo en Castro Barros 1527 (entre 6 de Julio y Copacabana) y bajando en Sabattini 1800 (entre Extremadura y El Escorial)\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "Castro Barros 1527 (entre Copacabana y 6 de Julio)", "Direccion_Parada_H": "Sabattini 1800 (entre Extremadura y El Escorial)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.3919", "Lat_Parada_H": "-31.4328", "Linea": "10", "LineaB": "10", "LineaDos": "DIRECTO", "LineaUno": "10", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.2033", "Long_Parada_H": "-64.1621", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 538, "OrdenRec_P_H": 931, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 131, "Recorridos_ID_B": null, "Resultados": "10 (Costo: $5.30)", "ResultadosToolTip": "Linea 10, subiendo en Castro Barros 1527 (entre Copacabana y 6 de Julio) y bajando en Sabattini 1800 (entre Extremadura y El Escorial)\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "Castro Barros 1527 (entre 6 de Julio y Copacabana)", "Direccion_Parada_H": "Sabattini 1800 (entre Extremadura y El Escorial)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.3923", "Lat_Parada_H": "-31.4328", "Linea": "11", "LineaB": "11", "LineaDos": "DIRECTO", "LineaUno": "11", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.203", "Long_Parada_H": "-64.1621", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 766, "OrdenRec_P_H": 1161, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 132, "Recorridos_ID_B": null, "Resultados": "11 (Costo: $5.30)", "ResultadosToolTip": "Linea 11, subiendo en Castro Barros 1527 (entre 6 de Julio y Copacabana) y bajando en Sabattini 1800 (entre Extremadura y El Escorial)\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "Castro Barros 1527 (entre 6 de Julio y Copacabana)", "Direccion_Parada_H": "Sabattini 1800 (entre Extremadura y El Escorial)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.3923", "Lat_Parada_H": "-31.4328", "Linea": "14", "LineaB": "14", "LineaDos": "DIRECTO", "LineaUno": "14", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.203", "Long_Parada_H": "-64.1621", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 735, "OrdenRec_P_H": 1130, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 138, "Recorridos_ID_B": null, "Resultados": "14 (Costo: $5.30)", "ResultadosToolTip": "Linea 14, subiendo en Castro Barros 1527 (entre 6 de Julio y Copacabana) y bajando en Sabattini 1800 (entre Extremadura y El Escorial)\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "Castro Barros 1527 (entre 6 de Julio y Copacabana)", "Direccion_Parada_H": "Sabattini 1800 (entre Extremadura y El Escorial)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.3923", "Lat_Parada_H": "-31.4328", "Linea": "17", "LineaB": "17", "LineaDos": "DIRECTO", "LineaUno": "17", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.203", "Long_Parada_H": "-64.1621", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 774, "OrdenRec_P_H": 1170, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 128, "Recorridos_ID_B": null, "Resultados": "17 (Costo: $5.30)", "ResultadosToolTip": "Linea 17, subiendo en Castro Barros 1527 (entre 6 de Julio y Copacabana) y bajando en Sabattini 1800 (entre Extremadura y El Escorial)\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "1Castro Barros 1502 -", "Direccion_Parada_H": "Avenida Gdor. Amadeo Sabattini 1749-1900", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.392011490797888", "Lat_Parada_H": "-31.432737642039463", "Linea": "17 Especial Capillitas", "LineaB": "17 Especial Capillitas", "LineaDos": "DIRECTO", "LineaUno": "17 Especial Capillitas", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": " -64.20319749708784", "Long_Parada_H": " -64.16204874986067", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 772, "OrdenRec_P_H": 1170, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 297, "Recorridos_ID_B": null, "Resultados": "17 Especial Capillitas (Costo: $5.30)", "ResultadosToolTip": "Linea 17 Especial Capillitas, subiendo en 1Castro Barros 1502 - y bajando en Avenida Gdor. Amadeo Sabattini 1749-1900\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "12 de Octubre  (entre Pedro Zanni y Enfermera Clermont)", "Direccion_Parada_H": "Ferroviarios  (entre Rogelio Martinez y Jose Gimenez)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.39929353225997", "Lat_Parada_H": "-31.43000206237348", "Linea": "74", "LineaB": "74", "LineaDos": "DIRECTO", "LineaUno": "74", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.20912340991626", "Long_Parada_H": "-64.16046497046256", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 259, "OrdenRec_P_H": 669, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 263, "Recorridos_ID_B": null, "Resultados": "74 (Costo: $5.30)", "ResultadosToolTip": "Linea 74, subiendo en 12 de Octubre  (entre Pedro Zanni y Enfermera Clermont) y bajando en Ferroviarios  (entre Rogelio Martinez y Jose Gimenez)\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "Revolución de Mayo 1243 (entre La Coruña y Madrid)", "Direccion_Parada_H": "Revolucion de Mayo 1299-1400", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.39221768833285", "Lat_Parada_H": "-31.434312966913286", "Linea": "28", "LineaB": "28", "LineaDos": "DIRECTO", "LineaUno": "28", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.19693744883386", "Long_Parada_H": " -64.16913402016291", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 314, "OrdenRec_P_H": 733, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 156, "Recorridos_ID_B": null, "Resultados": "28 (Costo: $5.30)", "ResultadosToolTip": "Linea 28, subiendo en Revolución de Mayo 1243 (entre La Coruña y Madrid) y bajando en Revolucion de Mayo 1299-1400\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "OCTAVIO PINTO 2501 (ESQ. INTENDENTE MESTRE (Casona))", "Direccion_Parada_H": "REVOLUCION DE MAYO 1410 (ESQ. MONSERRAT)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.3934354954842", "Lat_Parada_H": "-31.43719645159564", "Linea": "80", "LineaB": "80", "LineaDos": "DIRECTO", "LineaUno": "80", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.21284449915262", "Long_Parada_H": "-64.16525906014657", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 277, "OrdenRec_P_H": 707, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 290, "Recorridos_ID_B": null, "Resultados": "80 (Costo: $5.30)", "ResultadosToolTip": "Linea 80, subiendo en OCTAVIO PINTO 2501 (ESQ. INTENDENTE MESTRE (Casona)) y bajando en REVOLUCION DE MAYO 1410 (ESQ. MONSERRAT)\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "OCTAVIO PINTO 2501 (ESQ. INTENDENTE MESTRE (Casona))", "Direccion_Parada_H": "Valencia 1650-1699", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.3934354954842", "Lat_Parada_H": "-31.434371537083205", "Linea": "82", "LineaB": "82", "LineaDos": "DIRECTO", "LineaUno": "82", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.21284449915262", "Long_Parada_H": " -64.16316557975006", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 732, "OrdenRec_P_H": 1195, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 207, "Recorridos_ID_B": null, "Resultados": "82 (Costo: $5.30)", "ResultadosToolTip": "Linea 82, subiendo en OCTAVIO PINTO 2501 (ESQ. INTENDENTE MESTRE (Casona)) y bajando en Valencia 1650-1699\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "Doctor Angel Roffo 2099-2200", "Direccion_Parada_H": "VALENCIA 1678 (ESQ  EXTREMADURA)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.396312670165774", "Lat_Parada_H": "-31.43394571122887", "Linea": "83", "LineaB": "83", "LineaDos": "DIRECTO", "LineaUno": "83", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": " -64.20783829136087", "Long_Parada_H": "-64.16052414453301", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 568, "OrdenRec_P_H": 1170, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 209, "Recorridos_ID_B": null, "Resultados": "83 (Costo: $5.30)", "ResultadosToolTip": "Linea 83, subiendo en Doctor Angel Roffo 2099-2200 y bajando en VALENCIA 1678 (ESQ  EXTREMADURA)\u003cb\u003e (Costo viaje: $5.30) \u003c/b\u003e " }, { "dibujarParadas_Rec1": true, "dibujarParadas_Rec2": true, "Direccion_Parada_A": null, "Direccion_Parada_B": null, "Direccion_Parada_D": "JORGE ZAPIOLA 194 (ESQ  T. GUIDO)", "Direccion_Parada_H": "REVOLUCION DE MAYO 1200 (ESQ  LA CORUÑA)", "ES_DIRECTO": true, "Identificador_Parada_A": null, "Identificador_Parada_B": null, "Identificador_Parada_D": "1", "Identificador_Parada_H": "1", "Lat_Parada_A": null, "Lat_Parada_B": null, "Lat_Parada_D": "-31.39620728463669", "Lat_Parada_H": "-31.43314408044609", "Linea": "500", "LineaB": "500", "LineaDos": "DIRECTO", "LineaUno": "500", "Long_Parada_A": null, "Long_Parada_B": null, "Long_Parada_D": "-64.19729065792207", "Long_Parada_H": "-64.16978341651574", "ORDEN_A": null, "ORDEN_B": null, "OrdenRec_P_D": 434, "OrdenRec_P_H": 870, "Paradas_Id_A": null, "Paradas_Id_B": null, "Paradas_Id_D": 1, "Paradas_Id_H": 1, "PARADAS_RECORRIDOS_ID_CERCANA_D": 1, "PARADAS_RECORRIDOS_ID_CERCANA_H": 1, "Recorridos_ID": 274, "Recorridos_ID_B": null, "Resultados": "500 (Costo: $6.10)", "ResultadosToolTip": "Linea 500, subiendo en JORGE ZAPIOLA 194 (ESQ  T. GUIDO) y bajando en REVOLUCION DE MAYO 1200 (ESQ  LA CORUÑA)\u003cb\u003e (Costo viaje: $6.10) \u003c/b\u003e "}];
    //alert("Descomentar aqui");
    //onComplete(res);
    onComplete(result.GetDesdeHastaDirectosResult);
}
function onSuccessCombinados(result) {
    onComplete(result.GetDesdeHastaCombinadosResult);
}
function onComplete(result) {
    clearResults();
    clearMap();
    if (result == '[]') {
        hideLoading();
        linkCompartir = "";
        $("#mnuBuscarCombinaciones").dropdown('toggle');
        showError("Sin resultados: ", "No se encontraron recorridos, intente cambiar origen y destino o bien agrandar el radio de caminata. Recuerde que si está buscando recorridos directos y no encuentra, tiene la opción de <b>buscar recorridos combinados</b> desplegando la lista junto al botón de Colectivo.");
    }
    else
        createItems(result);
}

function reiniciarScrollResult() {
    var newHtml = "<div class='scrollbar'><div style='display: none' id='track' class='track'><div class='thumb'><div class='end'></div></div></div></div>";
    newHtml = newHtml + "<div id='viewport' class='viewport'><div id='overview' class='overview'></div></div>";
    $("#scrollbar1").html(newHtml);
}

/*SI HAY RESULTADOS, CREO LOS ITEMS (CADA UNO DE LOS RESULTADOS)*/
function createItems(result) {
    try {

        //alert("descomentar aqui");
        var jsonResults = JSON.parse(result);
        //var jsonResults = result;

        /*SI HAY 6 O MAS RESULTADOS, MUESTRO EL SCROLL Y LE PONGO UNA RAYITA ABAJO PA QUE QUEDE MAS CHETO*/
        if (jsonResults.length > 5) {
            $("#track").show();
            $("#viewport").addClass("scrollContentLarge");
        }
        else {
            $("#track").hide();
            $("#viewport").removeClass("scrollContentLarge");
        }

        /*RECORRO EL JSON DE RESULTADOS*/
        jQuery.each(jsonResults, function (i, item) {

            var lineaUno = item['LineaUno'];
            var lineaDos = item['LineaDos'];
            var ResultadosToolTip = item['ResultadosToolTip'];

            var RecorridosId = item["Recorridos_ID"];
            var RecorridosIdB = item["Recorridos_ID_B"];

            var TextoMostrar = item['Resultados'];
            var iconUno = getIconBus(lineaUno);//.replace("../", "../Recursos_Compartidos/");
            var imageDos = '';
            if (lineaDos != "DIRECTO") {
                /*SI ES COMBINADO, BUSCO TAMBIEN EL ICONO DE LA LINEA DOS*/
                var iconDos = getIconBus(lineaDos);//.replace("../", "../Recursos_Compartidos/");
                imageDos = $("#imgAux").clone().attr('src', iconDos).attr('width', '35px').show();
            }
            /*HAY UNA IMAGEN OCULTA EN LA MASTER CUYO ICONO ES UN LOADING, USO ESTA IMAGEN PARA CLONARLA DE MANERA TAL QUE HASTA QUE TRAIGA EL ICONO 
            CORRESPONDIENTE A LA LINEA, SE MUESTRE COMO UN LOADING. PERO CREO QUE NO FUNCA*/
            var imageUno = $("#imgAux").clone().attr('src', iconUno).attr('width', '35px').show();

            /*CADA UNO DE LOS RESULTADOS ES UN DIV Y AHI AGREGO EL/LOS ICONOS Y EL TEXTO CORTO DEL RESULTADO*/
            var div = $("<div>").addClass("itemResult gradient shadow-all-Result").append(imageUno).append(imageDos).append("  " + TextoMostrar);

            $(divPrint).append("<br/>" + ResultadosToolTip + "<br/>");

            div.click(function () {
                /*AGREGO EL EVENTO CLICK*/
                var image1 = "<img style='width: 35px' src=" + iconUno + "/>";
                var image2 = '';
                if (imageDos != '')
                    image2 = "<img style='width: 35px' src=" + iconDos + "/>";
                $('#overview div').each(function (index, domEle) {
                    $(domEle).removeClass("itemResultSelect").addClass("itemResult");
                });
                div.removeClass("itemResult").addClass("itemResultSelect");
                /*POR AHORA MUESTRO EL LOADING Y LO OCULTO A LOS 2 SEGUNDOS, ES SOLO PARA PROBAR YA QUE EN ESTA LINEA TENGO QUE LLAMAR AL WEBSERVICE 
                QUE TRAE EL DETALLE DEL RECORRIDO Y OCULTO EL LOADING EN EL EVENTO ONCOMPLETE. RECORDAR QUE ESTO SE EJECUTA CUANDO SE HACE CLICK EN UN RESULTADO*/
                showWarning("Detalle: ", ResultadosToolTip);
                BuscarDetalle(item);

            });

            /*OVERVIO ES UN CONTENEDOR QUE ESTA DENTRO DEL CONTROL SCROLL. AHI AGREGO CADA DIV DE RESULTADOS*/
            $("#overview").append(div);

        });

        /*LE DIGO A SCROLLBAR1 QUE SEA UN CONTROL DE SCROLL*/
        var options = {};
        $('#scrollbar1').show("bounce", options, 1000);
        $('#scrollbar1').tinyscrollbar();

        showCompartir(linkCompartir);
        

        /*MUSTRO UN MENSAJE VERDE DE LA CANTIDAD DE RESULTADOS ENCONTRADOS*/
        showSuccess("Búsqueda exitosa: <b>", jsonResults.length + "</b> resultados obtenidos. Para ver los recorridos en el mapa, seleccione los resultados que desee en la lista de la izquierda.");

        /*OCULTO EL ALERT DE BUSCANDO*/
        hideLoading();
    }
    catch (error) {
        hideLoading();
        showError("Se produjo un error: ", "Disculpe las molestias, por favor vuelva a realizar su consulta más tarde, muchas gracias. Equipo Miautobus.");
    }
}

/*CUANDO HAGO CLICK EN ALGUN RESULTADO, VOY A BUSCAR LOS PUNTOS QUE FORMAN EL RECORRIDO Y LO DIBUJO*/
function BuscarDetalle(item) {

    showLoading("Cargando Recorrido...", 300);

    selectResult = item;
    clearPolylines();
    clearMarkersParadas();
    clearMarkersParadasTodas();
    stopTimer();

    if (selectResult.dibujarParadas_Rec1)
        CargarParadas(IndexParadaD);

    if (selectResult.dibujarParadas_Rec1 && item["ES_DIRECTO"])
        CargarParadas(IndexParadaH);

    if (selectResult.dibujarParadas_Rec2 && !item["ES_DIRECTO"])
        CargarParadas(IndexParadaH);

    if (selectResult.dibujarParadas_Rec1 && !item["ES_DIRECTO"])
        CargarParadas(IndexParadaA);

    /*BUSCO EL DETALLE DEL PRIMER RECORRIDO*/
    getDetalleRecorrido_A();

    /*==============================================================================================*/
    /*                                      IMPORTANTE                                              */
    /*==============================================================================================*/
    /*ANTESLLAMABA EN ESTA LINEA AL METODO getDetalleRecorrido_B();*/
    /*PERO COMO TRAIA PROBLEMAS DE SINCRONIZMO, LO LLAMO EN EL SUCCESS DE getDetalleRecorrido_A();*/
    /*==============================================================================================*/


    /*SETEO EL ZOOM DEL MAPA*/
    ConfigZoomMap();

    /*AGREGO LOS BOTONES EN EL MAPA (VER COMPLETO, LIMPIAR)*/
    addCustomButtonCompletoAcotado();
    addCustomButtonClear();
}

/*BUSCAR DETALLE DEL PRIMER RECORRIDO (O UNICO RECORRIDO)*/
function getDetalleRecorrido_A() {
    try {
        RecorridosDetalle_GetByRecorridosId(selectResult.Recorridos_ID, onCompleteDetalle_A)
    }
    catch (err) {
        hideLoading();
        showError("Se produjo un error: ", "Disculpe las molestias, por favor vuelva a realizar su consulta más tarde, muchas gracias. Equipo Miautobus.");
    }
}
/*BUSCAR DETALLE DEL SEGUNDO RECORRIDO*/
function getDetalleRecorrido_B() {
    try {
        RecorridosDetalle_GetByRecorridosId(selectResult.Recorridos_ID_B, onCompleteDetalle_B);
    }
    catch (err) {
        hideLoading();
        showError("Se produjo un error: ", "Disculpe las molestias, por favor vuelva a realizar su consulta más tarde, muchas gracias. Equipo Miautobus.");
    }
}

/*ESTE METODO SE EJECUTA CUANDO VUELVE CON EXITO EL webservices PARA TRAER EL DETALLE DEL PRIMER RECORRIDO (o unico recorrido)*/
function onCompleteDetalle_A(result) {

    result = result.GetByRecorridosIdResult;
    var closeLoading = true;
    var ordenD, ordenH, latParD, lonParD, latParH, lonParH, showParadas, closeLoading;
    if (selectResult.ES_DIRECTO) {
        /*es directo, este es el unico recorrido*/
        ordenD = selectResult.OrdenRec_P_D;
        ordenH = selectResult.OrdenRec_P_H;
        latParD = selectResult.Lat_Parada_D;
        lonParD = selectResult.Long_Parada_D;
        latParH = selectResult.Lat_Parada_H;
        lonParH = selectResult.Long_Parada_H;
        closeLoading = true;
    }
    else {
        /*es combinado, este es el primero recorrido*/
        ordenD = selectResult.OrdenRec_P_D;
        ordenH = selectResult.ORDEN_A;
        latParD = selectResult.Lat_Parada_D;
        lonParD = selectResult.Long_Parada_D;
        latParH = selectResult.Lat_Parada_A;
        lonParH = selectResult.Long_Parada_A;
        closeLoading = false;
    }
    showParadas = selectResult.dibujarParadas_Rec1;
    CargarDetalle(result, indexPoly_Acotado_A, indexPoly_Completo_A, ordenD, ordenH, latParD, lonParD, latParH, lonParH, selectResult.LineaUno, showParadas, closeLoading, selectResult.Recorridos_ID);

    /*HAGO ESTO ACA PARA GANAR SINCRONIZMO, COMO SE EXPLICA 2 METODOS MAS ARRIBA*/
    if (!selectResult.ES_DIRECTO) {

        /*BUSCO LAS PARADAS DEL SEGUNDO RECORRIDO*/
        if (selectResult.dibujarParadas_Rec2)
            CargarParadas(IndexParadaB);

        /*BUSCO EL DETALLE DEL SEGUNDO RECORRIDO*/
        getDetalleRecorrido_B();
    }

}

/*ESTE METODO SE EJECUTA CUANDO VUELVE CON EXITO EL webservices PARA TRAER EL DETALLE DEL SEGUNDO RECORRIDO (EN CASO DE COMBINACION)*/
function onCompleteDetalle_B(result) {

    result = result.GetByRecorridosIdResult;

    var ordenD, ordenH, latParD, lonParD, latParH, lonParH, showParadas;
    ordenD = selectResult.ORDEN_B;
    ordenH = selectResult.OrdenRec_P_H;
    latParD = selectResult.Lat_Parada_B;
    lonParD = selectResult.Long_Parada_B;
    latParH = selectResult.Lat_Parada_H;
    lonParH = selectResult.Long_Parada_H;
    showParadas = selectResult.dibujarParadas_Rec2;
    CargarDetalle(result, indexPoly_Acotado_B, indexPoly_Completo_B, ordenD, ordenH, latParD, lonParD, latParH, lonParH, selectResult.LineaDos, showParadas, true, selectResult.Recorridos_ID_B);
}

/*CARGO EL/LOS RECORRIDOS EN EL MAPA*/
/*ESTA FUNCION SE LLAMA UNA VEZ SI ES DIRECTO Y DOS VECES SI ES COMBINACION, RECIBE POR PARAMETROS DATOS NECESARIOS PARA SABER QUE RECORRIDO TIENE QUE DIBUJAR*/
function CargarDetalle(result, indexAcotado, indexCompleto, ordenDesde, ordenHasta, latParD, lonParD, latParH, lonParH, lineaName, showParadas, closeLoading, RecorridosId) {
    try {
        var jsonResults = JSON.parse(result);
        var points = [];
        var pointsCompleto = [];

        indexCompleto_Sel = indexCompleto;

        var color = getColor(lineaName);
        if (lineaName != selectResult.LineaUno) {
            /*SI ES EL SEGUNDO RECORRIDO Y DEL MISMO COLOR DEL PRIMERO, LE DA EL COLOR NEGRO*/
            if (color == getColor(selectResult.LineaUno)) {
                color = getColor("black");
            }
        }

        var imgLinea = getIconBus(lineaName);//.replace("../", "../Recursos_Compartidos/");

        points.push(new google.maps.LatLng(latParD, lonParD));
        jQuery.each(jsonResults, function (i, item) {
            if (Number(item["Orden"]) >= ordenDesde && Number(item["Orden"]) <= ordenHasta)
                points.push(new google.maps.LatLng(item["Latitud"], item["Longitud"]));
            pointsCompleto.push(new google.maps.LatLng(item["Latitud"], item["Longitud"]));
        });
        points.push(new google.maps.LatLng(latParH, lonParH));

        polylines[indexAcotado] = new google.maps.Polyline({
            path: points,
            strokeColor: color,
            strokeOpacity: 1.0,
            strokeWeight: 4
        });

        google.maps.event.addDomListener(polylines[indexAcotado], "mouseover", function () {
            showtip(selectResult.ResultadosToolTip, 'yellow', 350)
        });
        google.maps.event.addDomListener(polylines[indexAcotado], "mouseout", function () {
            unshowtip();
        });

        polylines[indexCompleto] = new google.maps.Polyline({
            path: pointsCompleto,
            strokeColor: color,
            strokeOpacity: 1.0,
            strokeWeight: 4
        });
        google.maps.event.addDomListener(polylines[indexCompleto], "mouseover", function () {
            showtip(selectResult.ResultadosToolTip, 'yellow', 350)
        });
        google.maps.event.addDomListener(polylines[indexCompleto], "mouseout", function () {
            unshowtip();
        });

        polylines[indexAcotado].setMap(map);

        if (showParadas)
            buscarParadas(RecorridosId);

        /*======================================================================================================
        PARA MOVER EL ICONO DEL COLECTIVO
        CREO UN POLYLINE QUE NO SE MUESTRA EN EL MAPA
        ESE POLYLINE ES PARA INDICARLE POR DONDE TIENE QUE MOVERSE EL COLECTIVO
        SI ES DIRECTO, ES IGUAL AL POLYLINE ACOTADO, PERO SI ES COMBINACION, ES LA SUMA DE LOS DOS ACOTADOS
        =========================================================================================================*/

        try {

            if (closeLoading == false) {
                /*SI ES COMBINACION PASA PRIMERO POR ACA, ES DECIR CUANDO CARGA EL PRIMER RECORRIDO*/
                polyMoverAux = new google.maps.Polyline({
                    path: points,
                    strokeOpacity: 1.0,
                    strokeWeight: 4
                });

            }
            else {
                /*SI ES DIRECTO, PASA SOLAMENTE POR ACA*/
                /*SI ES COMBINACION PASA LA SEGUNDA VEZ POR ACA, ES DECIR CUANDO CARGA EL SEGUNDO RECORRIDO*/

                imgLinea = iconBus;

                var pointsMover = [];

                if (polyMoverAux)
                    for (i = 0; i < polyMoverAux.getPath().getArray().length; i++)
                        pointsMover.push(polyMoverAux.getPath().getArray()[i]);

                for (i = 0; i < points.length; i++)
                    pointsMover.push(points[i]);

                polyMover = new google.maps.Polyline({
                    path: pointsMover,
                    strokeOpacity: 1.0,
                    strokeWeight: 4
                });

                var latLng_1 = polyMover.getPath().getArray()[0];
                var latLng_2 = polyMover.getPath().getArray()[1];

                if (markerMov)
                    markerMov.setMap(null);

                var image1 = new google.maps.MarkerImage(imgLinea, new google.maps.Size(32, 37));
                markerMov = new google.maps.Marker({
                    position: latLng_1,
                    icon: image1,
                    map: map
                });

                myTimer = setTimeout('moveMarker(0,0);', 500);
                timerRunning = true;

            }
        } catch (err) { }


    }
    catch (err) {
        showError("Se produjo un error: ", "Disculpe las molestias, por favor vuelva a realizar su consulta más tarde, muchas gracias. Equipo Miautobus.");
    }
    finally {
        if (closeLoading) {
            setTimeout("hideLoading();", 200);
        }
    }
}

/*=======================================================================================================
CENTRAR EL MAPA A LA MITAD DEL RECORRIDO Y ZOOM AUTOMATICO
========================================================================================================*/
function ConfigZoomMap() {
    try {
        ini = markers[indexMarkerDesde].getPosition();
        fin = markers[indexMarkerHasta].getPosition();

        var bounds = new google.maps.LatLngBounds();
        bounds.extend(ini);
        bounds.extend(fin);
        map.fitBounds(bounds);

    } catch (err) { }
}

/*BUSCAR PARADAS*/
function buscarParadas(RecorridosId) {
    try {
        Paradas_GetvwParadasByRecorridosId(RecorridosId, CargarParadasTodas);
    }
    catch (err) {
        hideLoading();
        showError("Se produjo un error: ", "Disculpe las molestias, por favor vuelva a realizar su consulta más tarde, muchas gracias. Equipo Miautobus.");
    }
}
/*SI SE ELIGE MOSTRAR RECORRIDO COMPLETO, MUESTRO TODAS LAS PARADAS*/
function CargarParadasTodas(result) {

    var jsonResults = JSON.parse(result.GetvwParadasByRecorridosIdResult);

    jQuery.each(jsonResults, function (i, item) {
        var position = new google.maps.LatLng(item["Latitud"], item["Longitud"]);

        var iconP;
        var image;

        if (indexCompleto_Sel == indexPoly_Completo_A) {
            if (selectResult.ES_DIRECTO) {
                iconP = iconParada;
                image = new google.maps.MarkerImage(iconP, new google.maps.Size(12, 12));
            }

            else {
                iconP = iconA;
                image = new google.maps.MarkerImage(iconP, new google.maps.Size(14, 18),
                                                                new google.maps.Point(0, 0),
                                                                new google.maps.Point(13, 15),
                                                                new google.maps.Size(14, 18));
            }
        }
        else {
            iconP = iconB;
            image = new google.maps.MarkerImage(iconP, new google.maps.Size(14, 18),
                                                                new google.maps.Point(0, 0),
                                                                new google.maps.Point(13, 15),
                                                                new google.maps.Size(14, 18));
        }


        if (indexCompleto_Sel == indexPoly_Completo_A) {
            markersParadasTodas_A[i] = new google.maps.Marker({
                position: position,
                icon: image,
                draggable: false
            });
            google.maps.event.addDomListener(markersParadasTodas_A[i], "mouseover", function () {
                showtip(item["Direccion"], 'yellow', 150)
            });
            google.maps.event.addDomListener(markersParadasTodas_A[i], "mouseout", function () {
                unshowtip();
            });
        }
        else {
            markersParadasTodas_B[i] = new google.maps.Marker({
                position: position,
                icon: image,
                draggable: false
            });
            google.maps.event.addDomListener(markersParadasTodas_B[i], "mouseover", function () {
                showtip(item["Direccion"], 'yellow', 150)
            });
            google.maps.event.addDomListener(markersParadasTodas_B[i], "mouseout", function () {
                unshowtip();
            });
        }
    });
}
/*PARA MOSTRAR LAS PARADAS DONDE SUBIR Y BAJAR, SE LLAMA TANTAS VECES COMO PARADAS HAYA (1,2,3,4)*/
function CargarParadas(index) {

    var lat, lon, direccion, icon;
    switch (index) {
        case IndexParadaD:
            lat = selectResult.Lat_Parada_D;
            lon = selectResult.Long_Parada_D;
            direccion = "Subir en " + selectResult.Direccion_Parada_D;
            icon = icon1;
            break;
        case IndexParadaH:
            lat = selectResult.Lat_Parada_H;
            lon = selectResult.Long_Parada_H;
            direccion = "Bajar en " + selectResult.Direccion_Parada_H;
            if (selectResult.ES_DIRECTO)
                icon = icon2;
            else
                icon = icon4;

            break;
        case IndexParadaA:
            lat = selectResult.Lat_Parada_A;
            lon = selectResult.Long_Parada_A;
            direccion = "Bajar en " + selectResult.Direccion_Parada_A;
            icon = icon2;
            break;
        case IndexParadaB:
            lat = selectResult.Lat_Parada_B;
            lon = selectResult.Long_Parada_B;
            direccion = "Subir en " + selectResult.Direccion_Parada_B;
            icon = icon3;
            break;
    }

    var position = new google.maps.LatLng(lat, lon);
    var image = new google.maps.MarkerImage(icon, new google.maps.Size(16, 20),
                                                                new google.maps.Point(0, 0),
                                                                new google.maps.Point(13, 15),
                                                                new google.maps.Size(16, 20));
    markersParadas[index] = new google.maps.Marker({
        position: position,
        map: map,
        icon: image,
        draggable: false
    });
    google.maps.event.addDomListener(markersParadas[index], "mouseover", function () {
        showtip(direccion, 'yellow', 150)
    });
    google.maps.event.addDomListener(markersParadas[index], "mouseout", function () {
        unshowtip();
    });
}

function clearPolylines() {
    if (polylines) {
        for (var i = 0; i < polylines.length; i++) {
            if (polylines[i]) {
                polylines[i].setMap(null);
                polylines[i] == null;
                polylines[i] = undefined;
            }
        }
        polylines = [];
    }
}
function clearMarkersParadas() {
    if (markersParadas) {
        for (var i = 0; i < markersParadas.length; i++) {
            if (markersParadas[i]) {
                markersParadas[i].setMap(null);
                markersParadas[i] == null;
                markersParadas[i] = undefined;
            }
        }
        markersParadas = [];
    }
}
function clearMarkersParadasTodas() {
    if (markersParadasTodas_A) {
        for (var i = 0; i < markersParadasTodas_A.length; i++) {
            if (markersParadasTodas_A[i]) {
                markersParadasTodas_A[i].setMap(null);
                markersParadasTodas_A[i] == null;
                markersParadasTodas_A[i] = undefined;
            }
        }
        markersParadasTodas_A = [];
    }
    if (markersParadasTodas_B) {
        for (var i = 0; i < markersParadasTodas_B.length; i++) {
            if (markersParadasTodas_B[i]) {
                markersParadasTodas_B[i].setMap(null);
                markersParadasTodas_B[i] == null;
                markersParadasTodas_B[i] = undefined;
            }
        }
        markersParadasTodas_B = [];
    }
}

function showParadasTodas() {
    if (markersParadasTodas_A) {
        for (var i = 0; i < markersParadasTodas_A.length; i++) {
            if (markersParadasTodas_A[i])
                markersParadasTodas_A[i].setMap(map);
        }
    }
    if (markersParadasTodas_B) {
        for (var i = 0; i < markersParadasTodas_B.length; i++) {
            if (markersParadasTodas_B[i])
                markersParadasTodas_B[i].setMap(map);
        }
    }
}
function hideParadasTodas() {
    if (markersParadasTodas_A) {
        for (var i = 0; i < markersParadasTodas_A.length; i++) {
            if (markersParadasTodas_A[i])
                markersParadasTodas_A[i].setMap(null);
        }
    }
    if (markersParadasTodas_B) {
        for (var i = 0; i < markersParadasTodas_B.length; i++) {
            if (markersParadasTodas_B[i])
                markersParadasTodas_B[i].setMap(null);
        }
    }
}
function showParadasSubirBajar() {
    if (markersParadas) {
        for (var i = 0; i < markersParadas.length; i++) {
            if (markersParadas[i])
                markersParadas[i].setMap(map);
        }
    }
}
function hideParadasSubirBajar() {
    if (markersParadas) {
        for (var i = 0; i < markersParadas.length; i++) {
            if (markersParadas[i])
                markersParadas[i].setMap(null);
        }
    }
}
function clearMarkersInfoGirar() {
    if (markersInfoGirar) {
        for (var i = 0; i < markersInfoGirar.length; i++) {
            if (markersInfoGirar[i]) {
                markersInfoGirar[i].setMap(null);
                markersInfoGirar[i] == null;
                markersInfoGirar[i] = undefined;
            }
        }
        markersInfoGirar = [];
    }
}

function clearResults() {

    $("#scrollbar1").hide();
    reiniciarScrollResult();

    $("#directions-panel-content").hide();
    $("#directions-panel").hide();
    $("#directions-panel").html("");

    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);
    directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));

    clearButtonsAcotadoCompleto();
    clearButtonsRoute();
    clearButtonsClear();
    clearCompartir();

    hideSuggestContent();

    $(divPrint).html("");

}

function clearButtonsAcotadoCompleto() {
    map.controls[google.maps.ControlPosition.TOP_LEFT].clear();
}

function clearCompartir() {
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].clear();
}

function showCompartir(linkCompartir) {

    clearCompartir()

    $(divCompartir).addClass('gmap-control-container').addClass('gmnoprint');

    /*AGREGO EL CONTENEDOR ABAJO A LA IZQUIERDA*/
    map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(divCompartir);
    showShareButtons(linkCompartir);
}
/*METODO BUSCAR PERO PARA CAMINAR O AUTO*/

function calcRoute(modo) {
    try {

        clearResults();
        clearMap();
        hideMessage();
        
        queBusca = "RUTA";
        route_mode = modo;

        /*============================================================
        si no hay texto informa que faltan datos
        si hay texto y no hay value (latlon) entonces busca y sugiere
        si hay texto y hay value, busca
        lamentablemente este bloque se repite 2 veces en los 3 buscar 
        por movimos de sincronizacion, no pueden ponerse en una funcion
        ==============================================================*/

        var sugerir = false;
        var textA = geoSearcher_getText("geoSearcherDesde")
        var valueA = geoSearcher_getValue("geoSearcherDesde")

        var textB = geoSearcher_getText("geoSearcherHasta")
        var valueB = geoSearcher_getValue("geoSearcherHasta")

        var showA = false;
        var showB = false;

        var ww;
        if (textA != "" && valueA == "") {
            sugerir = true;
            showA = true;
            if (!(textB != "" && valueB == ""))
                ww = "207px";
            getSuggest('geoSearcherDesde', 'geoSuggestDesde', 'titleDesde', true, ww);
        } else
            hideBlock('geoSuggestDesde', 'titleDesde');

        if (textB != "" && valueB == "") {
            sugerir = true;
            showB = true;
            if (!(textA != "" && valueA == ""))
                ww = "207px";
            getSuggest('geoSearcherHasta', 'geoSuggestHasta', 'titleHasta', true, ww);
        } else
            hideBlock('geoSuggestHasta', 'titleHasta');

        if (showA || showB)
            showSuggestContent();
        else
            hideSuggestContent();
        /*==============================================================*/

        if (sugerir == false) {
            if (markers[indexMarkerDesde] && markers[indexMarkerHasta]) {
                clearMarkersInfoGirar();

                showLoading("Calculando ruta...", 300);
                hideMessage();

                clearMap();
                clearResults();

                var travelMode;
                if (modo == 'auto')
                    travelMode = google.maps.DirectionsTravelMode.DRIVING;
                else
                    travelMode = google.maps.DirectionsTravelMode.WALKING;

                latLngD = markers[indexMarkerDesde].getPosition();
                latLngH = markers[indexMarkerHasta].getPosition();

                linkCompartir = webConfig.par_url + "?tipo=ruta&latd=" + latLngD.lat() + "&lngd=" + latLngD.lng() + "&lath=" + latLngH.lat() + "&lngh=" + latLngH.lng() + "&mode=" + modo;

                /*===============================================================================
                PARAMETROS USADOS PARA LA CONSULTA
                =================================================================================
                optimizeWaypoints = true = va a devolver la mas corta
                provideRouteAlternatives = false = va a devolver solo una ruta (la mas corta)
                avoidHighways  = true = Va a evitar que elija ruta por circunvalación. 
                avoidTolls = true
                =================================================================================*/

                var request = {
                    origin: latLngD,
                    destination: latLngH,
                    travelMode: travelMode,
                    optimizeWaypoints: true,
                    provideRouteAlternatives: false,
                    avoidHighways: true,
                    avoidTolls: true
                };

                /*REMUEVO EL EVENTO CLICK*/
                $("#directions-panel").unbind('click');

                /*BUSCAR RUTA*/
                directionsService.route(request, function (response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                        var route = response.routes[0];

                        /*DIBUJAR BOTONES Y TEXTOS RESULTANTES*/
                        drawingResults(response, route.legs[0].distance.text, route.legs[0].distance.value, route.legs[0].duration.text, latLngD.lat(), latLngD.lng(), latLngH.lat(), latLngH.lng(), modo)

                        /*DEFINIR EL EVENTO CUANDO MUEVE UNA RUTA POR EL MOUSE*/
                        google.maps.event.addListener(directionsDisplay, 'directions_changed', function () {
                            var route = directionsDisplay.directions.routes[0];
                            drawingResults(directionsDisplay.directions, route.legs[0].distance.text, route.legs[0].distance.value, route.legs[0].duration.text, latLngD.lat(), latLngD.lng(), latLngH.lat(), latLngH.lng(), modo)
                        });

                        /*DEFINIR EL EVENTO CUANDO HACE CLICK EN ALGUN MENSAJE EN LA GRILLA DE LA IZQUIERDA DONDE DICE GIRAR POR TAL LUGAR*/
                        $("#directions-panel").click(function () {
                            if (directionsDisplay.getMap(map) == null) {

                                if (modo == 'auto') {
                                    addCustomButtonTaxiRemis(TaxiRemis_JsonResult);
                                    addCustomButtonAPie(route.legs[0].distance.text, route.legs[0].duration.text, "En Auto");
                                }
                                else
                                    addCustomButtonAPie(route.legs[0].distance.text, route.legs[0].duration.text, "Caminando");

                                addCustomButtonClear();
                                showSteps(response, modo);
                                directionsDisplay.setMap(map);
                            }

                        });
                        $("#directions-panel-content").show();
                        if (modo == 'auto') {
                            $("#imgShowTarifa").show();
                            $("#taxiremis_content").show();
                            $("#directions-panel").hide();
                            $("#imgShowRoute").show();
                            $("#imgShowRoute").attr("src", imgCloseRoute);
                            $("#imgShowTarifa").attr("src", imgOpenTarifa);
                            $("#directions-panel").height(280);
                        }
                        else {
                            $("#imgShowTarifa").hide();
                            $("#taxiremis_content").hide();
                            $("#directions-panel").show();
                            $("#imgShowRoute").hide();
                            $("#directions-panel").height(320);

                        }

                        showCompartir(linkCompartir);

                    }
                    else
                        showError("Google map error: ", "Disculpe las molestias. Equipo Miautobus.");
                    hideLoading();
                });
            }
            else
                showError("Datos incompletos: ", "No ha ingresado todos los datos necesarios para realizar la consulta. Por favor ingrese Origen y Destino");
        }
    } 

    catch (error) {
        hideLoading();
        showError("Se produjo un error: ", "por favor vuelva a realizar su consulta más tarde. Disculpe las molestias. Equipo Miautobus.");
    }
}

function drawingResults(response, distanceText, distanceValue, duration, latD, lonD, latH, lonH, modo) {

    clearMarkersInfoGirar();
    stopTimer();

    addCustomButtonClear();
    
    if (modo == 'auto') {
        TaxiRemis_Distancia = distanceText;
        TaxiRemis_Tiempo = duration;
        /*si se muestrataxi, se calcula el precio, sino se muestra distancia y tiempo*/
        if (webConfig.par_showTaxiRemis == 's') 
            GetTarifaTaxiRemis(distanceValue, latD, lonD, latH, lonH, addCustomButtonTaxiRemis);
        addCustomButtonAPie(distanceText, duration, "En Auto");
    }
    else
        addCustomButtonAPie(distanceText, duration, "Caminando");

    showSteps(response, modo);
}

function changePanel() {

    $('#directions-panel').slideToggle();
    $('#taxiremis_content').slideToggle();

    if ($("#imgShowRoute").attr("src") == imgOpenRoute)
        $("#imgShowRoute").attr("src", imgCloseRoute);
    else
        $("#imgShowRoute").attr("src", imgOpenRoute);

    if ($("#imgShowTarifa").attr("src") == imgOpenTarifa)
        $("#imgShowTarifa").attr("src", imgCloseTarifa);
    else
        $("#imgShowTarifa").attr("src", imgOpenTarifa);

}

function addCustomButtonTaxiRemis(result) {

    clearButtonsRoute();

    /*CREO EL DIV QUE LOS VA A CONTENER*/
    controlDiv = document.createElement('DIV');
    $(controlDiv).addClass('gmap-control-container').addClass('gmnoprint');

    /*CREO LA INFO DE TIEMPO Y DISTANCIA  Y PRECIOS*/
    divInfo = document.createElement('DIV');

    $(divInfo).load("../Html/TaxisRemisesResult2.htm", function () {

        /*EN EL SUCCESS DEL LOAD RECORRO EL JSON Y CARGO LOS DATOS*/
        TaxiRemis_JsonResult = result;

        //alert("acordate de descomentar esta otra tambien");
        var jsonResults = JSON.parse(TaxiRemis_JsonResult.GetTarifaTaxiRemisResult);
        //var jsonResults = result;

        $(".tdDistanciaTiempo").html("Distancia: " + TaxiRemis_Distancia + "  -  Tiempo: " + TaxiRemis_Tiempo);

        $.each(jsonResults, function (i, item) {

            var tarifaNormal = '$ ' + item.Costo_Horario_Normal + '  (' + item.Titulo_Tarifa + ')';
            var tarifaEspecial = '$ ' + item.Costo_Horario_Especial + '  (' + item.Leyenda_Horario_Especial + ')';
            var bajadaBandera = 'Bajada de Bandera  $' + item.Costo_Bajada_Bandera;
            var ficha = 'Ficha $' + item.Costo_Ficha + ' cada ' + item.Metros_Entre_Ficha + ' mtrs';
            var fichaEspera = 'Ficha Espera $' + item.Costo_Ficha_Tiempo_Espera + ' cada ' + item.Tiempo_Espera_Ficha;

            if (item.Es_Taxi == true) {
                $("#li_tax_1").html(tarifaNormal);
                $("#li_tax_2").html(tarifaEspecial);
                $("#li_tax_3").html(bajadaBandera);
                $("#li_tax_4").html(ficha);
                $("#li_tax_5").html(fichaEspera);
            }
            else {
                $("#li_rem_1").html(tarifaNormal);
                $("#li_rem_2").html(tarifaEspecial);
                $("#li_rem_3").html(bajadaBandera);
                $("#li_rem_4").html(ficha);
                $("#li_rem_5").html(fichaEspera);
            }
        });
    });

    $(controlDiv).append(divInfo);

    /*AGREGO EL CONTENEDOR ABAJO A LA IZQUIERDA*/
    $("#taxiremis_content").html("");
    $("#taxiremis_content").append(controlDiv);
    //map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlDiv);
}

/*CUANDO MUESTRO UNA RUTA, ACA MUESTRO LOS PUNTOS DONDE GIRAR*/
function showSteps(directionResult, modo) {

    var myRoute = directionResult.routes[0].legs[0];
    var image = new google.maps.MarkerImage(iconBullet, new google.maps.Size(24, 24));

    var points = [];

    for (var i = 0; i < myRoute.steps.length; i++) {
        var j = 0;
        for (j = 0; j < myRoute.steps[i].path.length; j++) {
            points.push(myRoute.steps[i].path[j]);
        }
        var marker = new google.maps.Marker({
            position: myRoute.steps[i].start_point,
            icon: image,
            map: map
        });
        attachInstructionText(marker, myRoute.steps[i].instructions);
        markersInfoGirar[i] = marker;
        
    }

    /*======== PARA MOVER EL ICONO============================*/
    polyMover = new google.maps.Polyline({
        path: points,
        strokeOpacity: 1.0,
        strokeWeight: 4
    });

    var latLng_1 = polyMover.getPath().getArray()[0];
    var latLng_2 = polyMover.getPath().getArray()[1];
    if (markerMov)
        markerMov.setMap(null);

    var icon;
    if (modo == 'auto')
        icon = iconCar;
    else
        icon = iconWalk;

    var image1 = new google.maps.MarkerImage(icon, new google.maps.Size(32, 37));
    markerMov = new google.maps.Marker({
        position: latLng_1,
        icon: image1,
        map: map
    });

    myTimer = setTimeout('moveMarker(0,0);', 500);
    timerRunning = true;
    /*================================================================*/
}

/*MUESTRA LAS INSTRUCCIONES DE RUTA*/
function attachInstructionText(marker, text) {
    google.maps.event.addListener(marker, 'click', function () {
        stepDisplay.setContent(text);
        stepDisplay.open(map, marker);
    });
}
/*===============================================================*/
/*FUNCIONES PARA MOVER LOS ICONOS (COLECTIVO, AUTO, CAMINAR)*/
/*===============================================================*/
function moveMarker(ver, cur) {
    var latLng_1 = polyMover.getPath().getArray()[ver];
    var latLng_2 = polyMover.getPath().getArray()[ver + 1];
    var met = Math.pow(2, 18 - map.getZoom());

    var len = Math.ceil(google.maps.geometry.spherical.computeDistanceBetween(latLng_1, latLng_2) / met);

    var lat = normalMove(cur, latLng_1.lat(), latLng_2.lat() - latLng_1.lat(), len);
    var lng = normalMove(cur, latLng_1.lng(), latLng_2.lng() - latLng_1.lng(), len);
    markerMov.setPosition(new google.maps.LatLng(lat, lng));
    cur++;
    if (cur > len - 1) {
        cur = 0;
        ver++;
        if (ver >= polyMover.getPath().getArray().length - 1) { ver = 0; }
    }
    myTimer = setTimeout('moveMarker(' + ver + ', ' + cur + ')', 100);
}

function normalMove(t, b, c, d) {
    return c * t / d + b;
}
function stopTimer() {
    if (timerRunning) {
        clearTimeout(myTimer);
        t = -1;
        markerMov.setMap(null);
        polyMoverAux = null;
    }
}

function moveToStep(marker, route, c) {

    if (route.steps.length > c)
        marker.setPosition(route.steps[c].start_point);
    else
        c = -1;

    window.setTimeout(function () {
        moveToStep(marker, route, c + 1);
    }, 500);
}