// example.js
function addGeoJSONLayer(mymap, data) {
    // var icon = L.icon({
    //     // iconUrl: 'img/bus.png',
    //     iconSize: [22, 22],
    //     iconAnchor: [11, 11]
    // });

    var geoJSONLayer = L.geoJSON(data, {
        pointToLayer: function (feature, latLng) {
            // console.log(data);
            console.log(feature);
            console.log(latLng)
            optColor = feature.properties.mag;
            console.log(optColor);
            // create circle marker for each feature
            var myMarkers = L.circleMarker(latLng, {radius:optColor*6, color:'black',
                                            dashArray: '2, 3',
                                            fillColor:getColor(optColor),
                                            weight: 0.5, fillOpacity:0.8});

            // set popup label on mouse click
            myMarkers.bindPopup("<h5>" + feature.properties.place + "</h5><hr>"
                                 + new Date(feature.properties.time) + " - Magnitude: " + optColor,{interactive:true});

            return myMarkers;
        }
    });

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
    var geoJSONTDLayer = L.timeDimension.layer.geoJson(geoJSONLayer, {
        updateTimeDimension: true,
        duration: 'PT1M',
        updateTimeDimensionMode: 'replace',
        addlastPoint: true
    });

    // Show both layers: the geoJSON layer to show the whole track
    // and the timedimension layer to show the movement of the
    geoJSONLayer.addTo(mymap);
    geoJSONTDLayer.addTo(mymap);
}

var mymap = L.map('map', {
    center: [39.73379, -122.44676],
    zoom: 4,
    fullscreenControl: true,
    timeDimensionOptions: {
        timeInterval: "2017-09-30/2020-12-30",
        period: "PT1H",
        currentTime: Date.parse("2017-09-30T09:00:00Z")
    },
    timeDimensionControl: true,
    timeDimensionControlOptions: {
        timeSliderDragUpdate: true,
        loopButton: true,
        autoPlay: true,
        playerOptions: {
            transitionTime: 500,
            loop: true
        }
    },
    timeDimension: true,
});

var osmLayer = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
});
osmLayer.addTo(mymap);

var oReq = new XMLHttpRequest();
oReq.addEventListener("load", (function (xhr) {
    var response = xhr.currentTarget.response;
    var data = JSON.parse(response);
    addGeoJSONLayer(mymap, data);
}));
oReq.open('GET', 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
oReq.send();

