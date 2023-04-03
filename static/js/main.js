// Creating the map object
var myMap = L.map("map", {
  center: [27.96044, -82.30695],
  zoom: 3
});

// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

// Load the GeoJSON data.
var geometriesData = "../../resources/country_geometries.json";
var emissionsData = "../../resources/country_ch4_emissions.json";


// Get the data with d3.
Promise.all([d3.json(geometriesData), d3.json(emissionsData)]).then(function([geoData, emissionsData]) {

   // Create a lookup object for the emissions data
   var emissionsLookup = {};
   emissionsData.forEach(function(country) {
     emissionsLookup[country["Country Code"]] = country["2000"];
   });
 
  // Join the emissions data to the GeoJSON data
  geoData.features.forEach(function(feature) {
    var countryCode = feature.properties.ISO_A3;
    feature.properties.ch4_emissions_2019 = emissionsLookup[countryCode];
  });

 
  // Create a new choropleth layer.
  L.geoJSON(geoData, {
    style: function(feature) {
      return {
        color: "white",
        fillColor: getColor(feature.properties.ch4_emissions_2019),
        fillOpacity: 0.7,
        weight: 1.5
      };
    },
    onEachFeature: function(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.ADMIN + "</h3><hr><p>CH4 Emissions (2019): " + feature.properties.ch4_emissions_2019 + "</p>");
    }
  }).addTo(myMap);
});

// Define a function to set the color based on the CH4 emissions value
function getColor(d) {
  return d > 1000000 ? '#800026' :
         d > 500000  ? '#BD0026' :
         d > 200000  ? '#E31A1C' :
         d > 100000  ? '#FC4E2A' :
         d > 50000   ? '#FD8D3C' :
         d > 20000   ? '#FEB24C' :
         d > 10000   ? '#FED976' :
                       '#FFEDA0';
}

// Add a legend to the map
var legend = L.control({ position: 'bottomright' });

legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "info legend");
  var labels = [
    "Extremely Low",
    "Very Low",
    "Low",
    "Low to Moderate",
    "Moderate",
    "Moderate to High",
    "High",
  ];
  var grades = [0, 10000, 20000, 50000, 100000, 200000, 1000000];

  // loop through our emission intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
      labels[i] +
      ": " +
      grades[i] +
      (grades[i + 1] ? "&ndash;" + (grades[i + 1] - 1) + "<br>" : "+");
  }

  return div;
};

legend.addTo(myMap);

function getEmissionsLevelDescription(value) {
  if (value >= 1000000) return 'High';
  if (value >= 200000) return 'Moderate to High';
  if (value >= 100000) return 'Moderate';
  if (value >= 50000) return 'Low to Moderate';
  if (value >= 20000) return 'Low';
  if (value >= 10000) return 'Very Low';
  return 'Extremely Low';
}

