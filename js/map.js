import { chosenRadar, closestPointsDict } from "./searchBar.js";
import { dataHeatMap } from "./radarChart.js";
import { apiKey } from "./apiKey.js";

// mapbox token
mapboxgl.accessToken =
  "pk.eyJ1IjoiYWJyYWNhZGFicmEwMSIsImEiOiJjbGVzcDJkeGMxNTBrM3lxcm1jMTFwdnJ6In0.LMBtWVupDcCbIViaBze5xg";

export var map = new mapboxgl.Map({
  container: "map",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/abracadabra01/clc7bwivm000w14s0to2heoro",
  // center map
  center: [5.726, 45.183],
  // starter zoom value
  zoom: 12.5,
  interactive: false, // set the map's interactions to false
});
map.setMinZoom(12.5);
map.scrollZoom.disable();

export var map2 = new mapboxgl.Map({
  container: "map2",
  // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
  style: "mapbox://styles/abracadabra01/clc7bwivm000w14s0to2heoro",
  // center map
  center: [5.726, 45.183],
  // starter zoom value
  zoom: 12.5,
});
map2.setMinZoom(12.5);

// Add navigation control to second map
map2.addControl(new mapboxgl.NavigationControl());

// Add scale control to second map
map2.addControl(new mapboxgl.ScaleControl(), "bottom-right");

export function selectingClosestRadar() {
  // Reset the stroke color of all points to the default color (black)
  map.setPaintProperty("capteur-gre-randomized", "circle-stroke-color", "#000");

  if (!chosenRadar) {
    // Change the stroke color of the selected point to green
    map.setPaintProperty("capteur-gre-randomized", "circle-stroke-color", [
      "case",
      ["==", ["get", "ID"], closestPointsDict[1].id],
      "#00FF00",
      "#A3AF9E",
    ]);
  } else {
    // Change the stroke color of the selected point to green
    map.setPaintProperty("capteur-gre-randomized", "circle-stroke-color", [
      "case",
      ["==", ["get", "ID"], chosenRadar],
      "#00FF00",
      "#A3AF9E",
    ]);
  }
  dataHeatMap();
}

// Show the "second-layer"
map2.on("load", function () {
  map2.setLayoutProperty("lcz-contours", "visibility", "visible");
  map2.setLayoutProperty("capteur-gre-randomized", "visibility", "visible");
});
