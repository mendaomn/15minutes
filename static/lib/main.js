var otp_api_url = window.location.origin+'/api';
var options = parseUrl();
var defmode = options.mode;
var init_coords = options.coords;
var map = L.map('map').setView(init_coords, 12);
var sharediv = document.getElementById('sharediv');
// setting values in page
var modeselectors = document.getElementsByClassName('modeselector');
var modes=["BICYCLE", "WALK"];
var loader_div = document.getElementById("loader");
var qrcode_div = document.getElementById("qrcode");
var qrcode = new QRCode(qrcode_div, window.location.href);

var tile_url = 'map/tile/{z}/{x}/{y}.png';
var tile_attribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>';

loader_div.style.display = "none";

L.tileLayer(tile_url, {
  maxZoom: 18,
  attribution: tile_attribution,
}).addTo(map);
L.control.browserPrint({
  documentTitle: "Luoghi a meno di 15 minuti da qua",
  printModes: [
    //L.control.browserPrint.mode.auto("Landscape", "A4"),
    L.control.browserPrint.mode.landscape(),
  ],
}).addTo(map)


map.on('click', onMapClick);

// map initialization
try {
  map.zoomControl.setPosition('bottomleft');
  latlng = {"lat": init_coords[0], "lng": init_coords[1]};
  onMapClick({"latlng": latlng});
} catch(e){;}

// qrcode show/hide
sharediv.addEventListener('click', function(){
  actual = qrcode_div.style.display
  qrcode_div.style.display = actual == "none" | actual == "" ? "block" : "none";
});


/* Toggle between adding and removing the "responsive" class to header when the user clicks on the icon */
function responsiveHeader() {
  var x = document.getElementById("header");
  if (x.className === "header") {
    x.className += " responsive";
  } else {
    x.className = "header";
  }
}

// handles page printing
document.querySelector("#printdiv").addEventListener("click", function(){
  var modeToUse = L.control.browserPrint.mode.auto();
  map.printControl.print(modeToUse);
});

