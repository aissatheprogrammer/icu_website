export function getRegionName(lat, long, data) {
  // Check if the coordinates are contained within any of the regions
  var contains = d3.geoContains(data, [long, lat]);
  if (contains) {
    // If the coordinates are contained within a region, find the region and return its name
    for (var i = 0; i < data.features.length; i++) {
      var region = data.features[i];
      if (d3.geoContains(region, [long, lat])) {
        return region.properties.DEC_QUARTIERS_IRIS_99_NOM;
      }
    }
  } else {
    // If the coordinates are not contained within any region, return null
    return null;
  }
}
