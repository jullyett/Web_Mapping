// Store our API endpoint inside queryUrl
// We are retrieving data for ALL earthquakes in the past day
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var global_earthquakeData;


// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  global_earthquakeData = data.features;

  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
  console.log(data.features);
});


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place, magnitude and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "<br>" + "Magnitude: " + feature.properties.mag + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  }

  // Define a markerSize function that will give each cirle a different radius based on its magnitude
  function markerSize(d) {
    console.log(d)

    return d * 5;
  }

  // Create function to assign color for each objectbased on its magnitude
  function getColor(d){
    if (d >= 5) {
      color = "#ff0000";
    }
    else if (d >= 4 && d <5) {
      color = "#e7552c";
    }
    else if (d >= 3 && d <4) {
      color = "#ff8000";
    }
    else if (d >= 2 && d <3) {
      color = "#ffff00";
    }
    else if (d >= 1 && d <2) {
      color = '#adff2f';
    }
    else {
      color = "#00ff00";
    }
    return color;
  }

 // Create function to assign style to GeoJason layer
  function geojsonMarkerOptions (feature){
    return{
    radius: markerSize(feature.properties.mag),
    fillColor: getColor(feature.properties.mag),
    color: "white",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.75
    }
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
  },
  style: geojsonMarkerOptions,
  onEachFeature: onEachFeature
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}


function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var satellite_map = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [darkmap, earthquakes]
  });

  //Tectonic plates 

  // Store our API endpoint inside queryUrl
  // We are retrieving data for ALL earthquakes in the past day

  var faults = new L.layerGroup();

  var faultsUrl = 
  "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

  // Perform a GET request to the query URL
  d3.json(faultsUrl, function(plates) {

    platesData = plates.features;
    console.log(plates.features);

    // Create a GeoJSON layer containing the features array on the tectonic plates
    
    L.geoJSON(plates, {
      style: {
        color: "orange"
      }
    }).addTo(faults);
    faults.addTo(myMap);
    
  });

  //Create legend
  var legend = L.control({position: 'bottomright'});

  /*function getLegendColor(d) {
    return d > 5 ? '#ff0000' :
           d >= 4 && d <5 ? '#ff8000' :
           d >= 3 && d <4 ? '#ffbf00' :
           d >= 2 && d <3 ? '#ffff00' :
           d >= 1 && d <2 ? '#bfff00' :
                            '#00ff00';
  }*/
  
  legend.onAdd = function (myMap) {

    var div = L.DomUtil.create('div', 'info legend');
      mag = [0, 1, 2, 3, 4, 5];
      labels = ['#00ff00', '#adff2f', '#FFFF00', '#ff8000', "#e7552c", '#FF0000'];
      
    // loop through our earthquake magnitude intervals and generate a label with a colored square for each interval
    for (var i = 0; i < mag.length; i++) {
 
        div.innerHTML +=
       
            "<i style='background: " + labels[i] + "'></i> " +
            mag[i] + (mag[i + 1] ? '&ndash;' + mag[i + 1] + '<br>' : '+');
    }
  
    return div;
};

  legend.addTo(myMap);

// Define a baseMaps object to hold our base layers
var baseMaps = {
  "Dark Map": darkmap,
  "Satellite Map": satellite_map,
  "Greyscale Map": lightmap
};

// Create overlay object to hold our overlay layer
var overlayMaps = {
  "Earthquakes": earthquakes,
  "Fault lines": faults
};

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

}
