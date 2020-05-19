/** TODOS:
* - change getgeojson args to object
* - make map raise user alert if out of bounds
* - handle 500 error
* - html is not centered
*/

var geoj_layers = {
  'WALK': {},
  'BICYCLE': {},
  'util': {}
}

contourWeight = 2;

var walkFenceStyle = {
  "dashArray": 3,
  "color": "#0078ff",
  "weight": 0.5,
  "opacity": 0.85,
  "fillOpacity": 0.15,
  "fillColor": "#0078ff",
  "weight": contourWeight,
}

var bikeFenceStyle = {
  "dashArray": 6,
  "color": "#ff7800",
  "weight": 0.5,
  "opacity": 0.85,
  "fillOpacity": 0.15,
  "fillColor": "#ff7800",
  "weight": contourWeight,
}

/* updates URL with updated parameters
 */
function updateUrl(){
  var search_params = new URLSearchParams(window.location.search); 
  search_params.delete('cutoffs');
  /*search_params.append('cutoffs', 900);
  search_params.set('modes', modes);*/
  search_params.set('lat', init_coords[0]);
  search_params.set('lng', init_coords[1]);
  new_url = window.location.pathname + '?'+search_params.toString();
  qrcode.clear()
  qrcode.makeCode(new_url);
  history.pushState({page: 1},
    document.title,
    new_url
  );
}

/* parses cutoffs and generates min_cutoffs with values in minutes
 */
function getcutoffs(){
  var inp = document.getElementById("cutoffinput");
  min_cutoffs = inp.value.split(',');
  cutoffs = min_cutoffs.map(i => i*60);
  mapRedraw();
}

/* just an helper function
 */
function getDefault(item, _default){
  return item ? item : _default;
}

/* parses URL parameters into internal object
 *
 * cutoffs aren't used anymore
 */
function parseUrl(){
  var search_params = new URLSearchParams(window.location.search); 
  var modes = getDefault(search_params.getAll('modes'), modes);
  var min_cutoffs = getDefault(search_params.getAll('cutoffs'), [15]);
  var cutoffs = min_cutoffs.map(i => i*60);
  var lat = getDefault(search_params.get('lat'), 45.074975);
  var lng = getDefault(search_params.get('lng'), 7.6736);
  return {
    'modes': modes,
    'cutoffs': cutoffs,
    'min_cutoffs': min_cutoffs,
    'coords': [lat, lng],
  };
}

function get_text_marker(geoJson, map, text){
    var c = geoJson.features[0].geometry.coordinates[0][0][0];
    var coordinates = [c[1], c[0]];
    return L.marker(coordinates, {icon: L.divIcon({className: 'my-div-icon', html: '<h2>'+text+'</h2>'})});
}

function get_geojson_layer(geoJson, map, mode){
  return L.geoJSON(geoJson, {
    style: mode === 'WALK' ? walkFenceStyle : bikeFenceStyle,
    smoothFactor: 0.5,
  });
}

function cleanMap(map, mode){
  if (geoj_layers[mode] !== null && map.hasLayer(geoj_layers[mode].marker)) {
    map.removeLayer(geoj_layers[mode].marker);
    map.removeLayer(geoj_layers[mode].geojson);
  }
  if (geoj_layers.util['start_marker'] != null){
    map.removeLayer(geoj_layers.util['start_marker']);
  }
}

function addLayers(geoJson, mode, text, map){
    cleanMap(map, mode);
    geoj_layers[mode]['geojson'] = get_geojson_layer(geoJson, map, mode);
    geoj_layers[mode]['marker'] = get_text_marker(geoJson, map, text);
    geoj_layers[mode]['geojson'].addTo(map);
    geoj_layers[mode]['marker'].addTo(map);
// L.control.layers(geoj_layers[mode]).addTo(map);
    mode == 'WALK' ? "" : map.fitBounds(geoj_layers[mode].geojson.getBounds());
}

function addGeoJson(geoJsons, args){
  var L = args[0];
  var map = args[1];
  var modes = args[2];
  var coords = args[3];
  try {
    for (i = 0; i < modes.length; i++){
      addLayers(geoJsons[modes[i]], modes[i], modes[i] == 'WALK' ? '🚶' : '🚲', map);
    };
    geoj_layers.util['start_marker'] = L.marker(
        coords,
        {icon: L.divIcon({
                           className: 'my-div-icon',
                           html: '<h2>&#9873;</h2>',
                           iconAnchor:  [8, 24]
                         })}
    );
    geoj_layers.util['start_marker'].addTo(map);
    toggleLoader();
  } catch (e){
    console.error(e, geoJsons[i]);
  }
}

// loader show/hide
function toggleLoader(){
  actual = loader_div.style.display
  loader_div.style.display = actual == "none" | actual == "" ? "block" : "none";
}

function onMapClick(e){
  toggleLoader();
  init_coords = [e.latlng.lat, e.latlng.lng];
  mapRedraw();
}

/* gets the coords of user's click and redraws the map
 */
function mapRedraw() {
  get_isochrones(init_coords, modes), [L, map, modes]
  updateUrl();
}

/* calls the OpenTripPlanner API to retrieve isochrones
 */
function get_isochrones(coords, _modes) {
  var url = new URL(otp_api_url+"/isochrone");
  //url.searchParams.set('fromPlace', coords[0]+','+coords[1]);
  url.searchParams.set('lat', coords[0]);
  url.searchParams.set('lng', coords[1]);
  url.searchParams.set('modes', _modes);
  url.searchParams.append('cutoffs', 900);
  httpGetJson(url, addGeoJson, [L, map, _modes, coords]);
}

/* just calls an URL with an HTTP GET and parse the response as JSON
 */
function httpGetJson(theUrl, callback, callback_args) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
                callback(JSON.parse(xmlHttp.responseText), callback_args);
            }
        }
    xmlHttp.open( "GET", theUrl, true );
    xmlHttp.send( null );
}

function getselection(i){
  modes = []
  for (i = 0; i < modeselectors.length; i++){
    modes = modes+ modeselectors[i].value;
  }
  mapRedraw(init_coords);
}
