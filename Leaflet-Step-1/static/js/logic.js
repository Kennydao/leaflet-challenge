// loading geoJSON from source

var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Initialize map, setting the streetmap and earthquakes layers to display on load
// Set view to san francisco latlng
var mymap = L.map("map", {center: [37.73379, -122.44676], zoom: 6});

// Use CartoDB.Positron layer as basemap
var lyrCDB = L.tileLayer.provider('CartoDB.Positron');
mymap.addLayer(lyrCDB);

var lyrEathquakes;

// Using ajax plugin to load data from queryURL and call function to create circle markers
lyrEathquakes = L.geoJSON.ajax(queryURL, {pointToLayer: eqkMarkers}).addTo(mymap);

// seting up legend
var legend = L.control({position: 'bottomright'});

legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend');
    var magRates = [0, 1, 2, 3, 4, 5];

    // loop through magRates and generate a label with a colored square for each interval
    for (var i = 0; i < magRates.length; i++) {
        // setting labels for the legend using (?:) conditional operator
        div.innerHTML +=
            '<i style="background-color:' + getColor(magRates[i]) + '"></i> ' +
            magRates[i] + (magRates[i + 1] ? '&ndash;' + magRates[i + 1] +"<br>" : '+');
    }
    return div;
};

legend.addTo(mymap);

// ***** Assign colors
function getColor(d) {
    // use conditional operator (?:) to return suitable color scheme
    return d < 1 ? '#ecffb3' :
           d < 2 ? '#ffcc66' :
           d < 3 ? '#ff9900' :
           d < 4 ? '#e68a00' :
           d < 5 ? '#b36b00' :
           d > 5 ? '#ff0000' :
                    '#ff0000';
}

// *** function to create circle markers for each property
function eqkMarkers(json, latlng) {
    // use magtitudes to set radius and color for each circle
    optColor = json.properties.mag;

    // create circle marker for each feature
    var myMarkers = L.circleMarker(latlng, {radius:optColor*6, color:'black',
                                fillColor:getColor(optColor),
                                weight: 0.3, fillOpacity:0.8});

    // set popup label on mouse click
    myMarkers.bindPopup("<h5>" + json.properties.place + "</h5><hr>"
                         + new Date(json.properties.time),{interactive:true});
    return myMarkers;
}