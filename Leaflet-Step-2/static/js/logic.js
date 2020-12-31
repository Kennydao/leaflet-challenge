// loading geoJSON from source

const queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

// Initialize map, setting the streetmap and earthquakes layers to display on load
// Set view to san francisco latlng
var mymap = L.map("map", {
            center: [37.73379, -122.44676],
            zoom: 3.5,
        });

// Use CartoDB.Positron layer as basemap
var lyrCDB = L.tileLayer.provider('CartoDB.Positron');
mymap.addLayer(lyrCDB);

// layer Satelite
var lyrSatelite;
// layer Grayscale
var lyrGrayscale;
// layer Outdoors
var lyrOutdoors;

// layer Cluster
var lyrMarkerClusters;

// layer Earthquake
var lyrEathquakes;
var lyrClusterEarthquakes;

// layer Fault Lines
var lyrFaultlines;

// layer heatmaps
var lyrHeatmaps;

// layer time dimension
var lyrTimeDimension;
var tdGeoLayer;

var objBasemaps;
var objOverlays;
var ctlLayers;

// ****** Initialize layers ******

lyrGrayscale = L.tileLayer.provider('Esri.WorldGrayCanvas');
lyrSatelite = L.tileLayer.provider('Esri.WorldImagery');
lyrOutdoors = L.tileLayer.provider('Thunderforest.Outdoors');


// Using ajax plugin to load data from queryURL and call function to create circle markers
lyrEathquakes = new L.LayerGroup();
lyrEathquakes = L.geoJSON.ajax(queryURL, {pointToLayer: eqkMarkers});


// create marker cluster layer
lyrMarkerClusters = new L.LayerGroup();
lyrMarkerClusters =  L.markerClusterGroup();
lyrClusterEarthquakes = L.geoJSON.ajax(queryURL, {pointToLayer: eqkMarkers});

lyrClusterEarthquakes.on('data:loaded', function() {
    // console.log(json)
    lyrMarkerClusters.addLayer(lyrClusterEarthquakes);

});

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
           d >= 5 ?  '#ff0000' :
                    '#ff0000';
}

// *** function to create circle markers for each property

function eqkMarkers(json, latlng) {
    // console.log(json);
    // use magtitudes to set radius and color for each circle
    optColor = json.properties.mag;

    // create circle marker for each feature
    var myMarkers = L.circleMarker(latlng, {radius:optColor*6, color:'black',
                                fillColor:getColor(optColor),
                                weight: 0.3, fillOpacity:0.8});

    // set popup label on mouse click
    myMarkers.bindPopup("<h5>" + json.properties.place + "</h5><hr>"
                         + new Date(json.properties.time) + " - Magnitude: " + optColor,{interactive:true});

    return myMarkers;
}

// *** create faultlines layer ***

// setting new layergroup
const flnURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/b53c3b7d82afd764650ebdc4565b9666795b9d83/GeoJSON/PB2002_boundaries.json'
// static/data/PB2002_boundaries.json
lyrFaultlines = new L.LayerGroup();
d3.json(flnURL, function(json) {
    // adding boundaries to layer
    L.geoJSON(json, {color: 'brown', weight:1.1}).addTo(lyrFaultlines);

    // lyrFaultlines.addTo(mymap);
})

// create heatmap layer
const heatQueryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// setting new object layergroup
lyrHeatmaps = new L.LayerGroup();

d3.json(heatQueryURL, function(response) {
    // console.log(response.features);
    var att = response.features;
    var heatArray = [];

    for (var i = 0; i < att.length; i++) {
        var location = att[i].geometry;
        if (location) {
            heatArray.push([location.coordinates[1], location.coordinates[0]]);
        }
    }
    // console.log(heatArray);
    var heat = L.heatLayer(heatArray, {
        radius: 30,
        blur: 20
    }).addTo(lyrHeatmaps);

    // lyrHeatmaps.addTo(mymap); //.addLayer(heat);//L.addLayer(heat);
});


// define basemaps
objBasemaps = {
    "Satelite": lyrSatelite,
    "Grayscale": lyrGrayscale,
    "Outdoors": lyrOutdoors
};

// define overlays
objOverlays = {
    "Fault Lines":lyrFaultlines,
    "Heatmaps": lyrHeatmaps,
    "Earthquakes":lyrEathquakes,
    "Clusters": lyrMarkerClusters
};

ctlLayers = L.control.layers(objBasemaps, objOverlays, {collapsed: false}).addTo(mymap);
