
// Initialize map, setting the streetmap and earthquakes layers to display on load
// Set view to san francisco latlng
var mymap = L.map("map", {center: [37.73379, -122.44676], zoom: 5});

// Use CartoDB.Positron layer as basemap
var lyrCDB = L.tileLayer.provider('CartoDB.Positron');
mymap.addLayer(lyrCDB);

// create heatmap layer
const heatQueryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

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
        blur: 25
    }).addTo(mymap);
});