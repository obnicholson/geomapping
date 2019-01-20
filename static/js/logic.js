var hourlyEarthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson";
var dailyEarthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var weeklyEarthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var monthlyEarthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";
var plateBoundariesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


//circle colors based on magnitude
var magIntervals = [1,2,3,4,5,999];
var intervalLabels = ['<=1', '1-2', '2-3', '3-4', '4-5', '>5']
var circleColors = ['#99cc66', '#cee652', '#ffff33', '#ffc636', '#ff8436', '#ff0033'];

function getColor(magnitude) {
    for (var i = 0; i < magIntervals.length; i++) {
        if (magnitude <= magIntervals[i]) {
            return circleColors[i];
        }
    }
}

//create maps function
function createMap(hourlyEarthquakes, dailyEarthquakes, weeklyEarthquakes, monthlyEarthquakes, borders) {
    var greyscale = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets-satellite",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
        accessToken: API_KEY
    });
        
    var baseMaps = {
        Greyscale: greyscale,
        Satellite: satellite,
        Outdoors: outdoors
    };
    
    var overlayMaps = {
        'Earthquakes Past Hour': hourlyEarthquakes,
        'Earthquakes Past 24 Hours': dailyEarthquakes,
        'Earthquakes Past 7 Days': weeklyEarthquakes,
        'Earthquakes Past 30 Days': monthlyEarthquakes,
        'Tectonic Plates': borders
    };

    var myMap = L.map('my-map', {
        center: [39, -98],
        zoom: 3.4,
        layers: [greyscale, weeklyEarthquakes, borders]
    });

    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    //create legend
    var legend = L.control({position: 'bottomright'})
    legend.onAdd = function(myMap) {
        var div = L.DomUtil.create('div', 'info legend');
        for (var i = 0; i < magIntervals.length; i++){
            div.innerHTML += '<i style="background:'+getColor(magIntervals[i])+'"></i> '+(intervalLabels[i] ? intervalLabels[i] + '<br>' : '+');
        }
        return div;
    }

    legend.addTo(myMap)
}

//converting geoJSON time data to date time string
function convertTime(geoJSONTime) {
    var date = new Date(geoJSONTime);
    return date.toString();
}

//create circles layer
function createEarthquakes(earthquakeFeatures) {
    var earthquakes = L.geoJSON(earthquakeFeatures, {
        pointToLayer: function(geoJsonPoint, latlng) {
            return L.circleMarker(latlng, {
                color: 'transparent',
                opacity: 0,
                fillColor: getColor(geoJsonPoint.properties.mag),
                fillOpacity: .95,
                radius: geoJsonPoint.properties.mag*5
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup('<p><strong>Location:</strong> '+feature.properties.place+'<br><strong>Magnitude:</strong> '+feature.properties.mag+'<br><strong>Time:</strong> '+convertTime(feature.properties.time)+'<p>')
        }
    });
    return earthquakes;
}

//create tectonic borders layer
function createBorders(borderFeatures) {
    var borders = L.geoJSON(borderFeatures, {
        style: {
            color: 'blue',
            fillOpacity: 0,
            weight: 3
        }
    })
    return borders;
}

//get earthquake data and build maps
d3.json(hourlyEarthquakeURL, function(hourlyResponse) {
    d3.json(dailyEarthquakeURL, function(dailyResponse) {
        d3.json(weeklyEarthquakeURL, function(weeklyResponse) {
            d3.json(monthlyEarthquakeURL, function(monthlyResponse) {
                d3.json(plateBoundariesURL, function(borderResponse) {

                var hourlyFeatures = hourlyResponse.features;
                var dailyFeatures = dailyResponse.features;
                var weeklyFeatures = weeklyResponse.features;
                var monthlyFeatures = monthlyResponse.features;
                var borderFeatures = borderResponse.features;

                var hourlyEarthquakes = createEarthquakes(hourlyFeatures);
                var dailyEarthquakes = createEarthquakes(dailyFeatures);
                var weeklyEarthquakes = createEarthquakes(weeklyFeatures);
                var monthlyEarthquakes = createEarthquakes(monthlyFeatures);
                var borders = createBorders(borderFeatures);

                createMap(hourlyEarthquakes, dailyEarthquakes, weeklyEarthquakes, monthlyEarthquakes, borders);
                })
            })
        })
    })
})




