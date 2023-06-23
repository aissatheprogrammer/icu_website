import { map, selectingClosestRadar } from "./map.js";
import { updateBarChart } from "./horizontalBarChart.js";

const baseUrl = "https://api-adresse.data.gouv.fr/search/";

// select the input and suggestion list elements
const input = document.querySelector("input[name='location']");
const suggestionList = document.querySelector(".suggestion-list");

// create a function to fetch suggestions from the API
function fetchSuggestions(event) {
  // get the value of the input field
  const value = event.target.value.toLowerCase();
  console.log("inputted address: ", value);

  if (value.length < 3) {
    // clear the suggestion list and remove the border class
    suggestionList.innerHTML = "";
    suggestionList.classList.remove("border");
    return; // exit the function
  }

  // make a request to the API with the input value as the search query
  fetch(`${baseUrl}?q=${value}&citycode=38185&limit=4`)
    .then((response) => response.json())
    .then((data) => {
      // clear the suggestion list
      suggestionList.innerHTML = "";

      // add or remove the border class based on whether there are suggestions
      if (data.features.length > 0) {
      } else {
        suggestionList.classList.remove("border");
      }
      // loop through the results and create a list item for each one
      data.features.forEach((feature) => {
        const li = document.createElement("li");
        li.textContent = feature.properties.label;
        suggestionList.appendChild(li);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

function getlczId(lat, long, data) {
  // Check if the coordinates are contained within any of the regions
  var contains = d3.geoContains(data, [long, lat]);
  console.log("my coordinates are : ", long, lat);

  if (contains) {
    // If the coordinates are contained within a region, find the region and return its name
    for (var i = 0; i < data.features.length; i++) {
      var region = data.features[i];
      if (d3.geoContains(region, [long, lat])) {
        return region.properties.ID;
      }
    }
  } else {
    // If the coordinates are not contained within any region, return null
    return null;
  }
}

/////////////////////////

export var chosenRadar;

function fetchUserIcuValue() {
  d3.json(
    "./data/json/test-carte_icu_projecton-final.geojson",
    function (error, data) {
      if (error) throw error;

      // Test the function with some coordinates
      let icuVal = findIcuVal(data, inputCoordinates[1], inputCoordinates[0]);

      console.log("ICU value:", icuVal);

      // Log the color based on the ICU value
      if (icuVal >= -8 && icuVal < 30) {
        icuClass = "blue";
      } else if (icuVal >= 30 && icuVal < 35) {
        icuClass = "green";
      } else if (icuVal >= 35 && icuVal < 40) {
        icuClass = "yellow";
      } else if (icuVal >= 40 && icuVal < 45) {
        icuClass = "orange";
      } else if (icuVal >= 45) {
        icuClass = "red";
      }
      console.log(
        "dictionarydictionarydictionarydictionarydictionarydictionary dictionarydictionarydictionarydictionarydictionarydictionary",
        closestPointsDict,
        "icuClass icuClass icuClass ",
        icuClass
      );
      setTimeout(() => {
        const icuColorsList = ["blue", "green", "yellow", "orange", "red"]; // Replace with your list
        console.log("VVVVVVVVVVVVV", icuColorsList);
        let icuColoredRectangle;
        for (let i = 0; i < icuColorsList.length; i++) {
          console.log("XXXXXXXXXXXXXXXXXXXX", icuClass);
          if (icuColorsList[i] === icuClass) {
            icuColoredRectangle = document.getElementById(
              `icu-rectangle-${icuClass}`
            );
            console.log(
              "LLLLLLLLLLLLLLLLLLLLLLLLL",
              `icu-rectangle-${icuClass}`
            );
            icuColoredRectangle.style.opacity = "0"; // Set initial opacity to 0
            icuColoredRectangle.style.display = "inline-block";

            setTimeout(() => {
              icuColoredRectangle.style.transition = "opacity 1s"; // Add a transition effect
              icuColoredRectangle.style.opacity = "1"; // Gradually increase opacity to 1
            }, 200);
          }
        }
      }, 20); // The time before the info box appears
    }
  );
}

function findIcuVal(data, latitude, longitude) {
  for (var i = 0; i < data.features.length; i++) {
    var region = data.features[i];
    if (d3.geoContains(region, [longitude, latitude])) {
      return region.properties.DN;
    }
  }
  return null; // Return null if no matching feature is found
}

let inputCoordinates;
export var closestPointsDict;
var icuClass;
// add an event listener to the input field to trigger the fetchSuggestions function when the input value changes
input.addEventListener("input", fetchSuggestions);
// add an event listener to the suggestion list to handle clicks on the list items
suggestionList.addEventListener("click", (event) => {
  // check if the clicked element is a list item
  if (event.target.tagName === "LI") {
    // get the value of the clicked list item
    const value = event.target.textContent;

    // make a request to the API with the clicked list item value as the search query
    fetch(`${baseUrl}?q=${value}&citycode=38185`)
      .then((response) => response.json())
      .then((data) => {
        inputCoordinates = data.features[0].geometry.coordinates;

        ////////////////////////////////////

        const givenPoint = [inputCoordinates[0], inputCoordinates[1]]; // Coordinates of the given point
        const range = 500; // Range in meters

        console.log("givenPoint ", givenPoint);

        // Fetch the GeoJSON file
        fetch("./data/json/capteurs2_gre_Random.geojson")
          .then((response) => response.json())
          .then((data) => {
            const features = data.features;

            console.log("454454", features);

            let closestPoints = []; // Array to store the closest points

            // Iterate over the features in the GeoJSON feature collection
            features.forEach((feature) => {
              const point = [
                feature.geometry.coordinates[0],
                feature.geometry.coordinates[1],
              ];
              const distance = turf.distance(
                turf.point(givenPoint),
                turf.point(point),
                { units: "meters" } // Specify the distance units as meters
              );

              if (distance <= range) {
                closestPoints.push({
                  id: feature.properties.ID,
                  distance: distance.toFixed(2) + " meters", // Round the distance and add "meters" label
                  coordinates: point, // Add the coordinates of the point
                });
              } else {
                if (closestPoints.length === 0) {
                  closestPoints.push({
                    id: feature.properties.ID,
                    distance: distance.toFixed(2) + " meters",
                    coordinates: point,
                  });
                } else {
                  // Check if the current point is closer than the previously added closest point
                  const closestDistance = turf.distance(
                    turf.point(givenPoint),
                    turf.point(closestPoints[0].coordinates),
                    { units: "meters" }
                  );
                  if (distance < closestDistance) {
                    closestPoints.splice(0, 1, {
                      id: feature.properties.ID,
                      distance: distance.toFixed(2) + " meters",
                      coordinates: point,
                    });
                  }
                }
              }
            });

            // Sort the closestPoints array based on distance in ascending order
            closestPoints.sort(
              (a, b) => parseFloat(a.distance) - parseFloat(b.distance)
            );

            // Create a dictionary with the closest points, where the key is the order number and the value is an object containing the point ID, distance, and coordinates
            closestPointsDict = {};
            closestPoints.forEach((point, index) => {
              closestPointsDict[index + 1] = {
                id: point.id,
                distance: point.distance,
                coordinates: point.coordinates,
              };
            });

            console.log("Closest points in range:", closestPointsDict);
          })
          .catch((error) => {
            console.error("Error loading GeoJSON file:", error);
          });

        //////////////////////////////

        // Move the code that relies on inputCoordinates here
        d3.json("./data/json/lcz_contours.geojson", function (error, data) {
          if (error) throw error;
          var lczId = getlczId(inputCoordinates[1], inputCoordinates[0], data);
          console.log("aaaa", lczId);
          updateBarChart(lczId);

          function logCoordinates(closestPointsDict) {
            for (const key in closestPointsDict) {
              const point = closestPointsDict[key];
              const coordinates = point.coordinates;
              console.log(`Coordinates for point ${key}: ${coordinates}`);
              d3.json(
                "./data/json/test-carte_icu_projecton-final.geojson",
                function (error, data) {
                  if (error) throw error;

                  // Test the function with some coordinates
                  let icuVal = findIcuVal(data, coordinates[1], coordinates[0]);

                  console.log("find icu val: ", icuVal);

                  // Log the color based on the ICU value of the radar
                  if (icuVal >= -8 && icuVal < 30) {
                    closestPointsDict[key].icuRadarClass = "blue";
                  } else if (icuVal >= 30 && icuVal < 35) {
                    closestPointsDict[key].icuRadarClass = "green";
                  } else if (icuVal >= 35 && icuVal < 40) {
                    closestPointsDict[key].icuRadarClass = "yellow";
                  } else if (icuVal >= 40 && icuVal < 45) {
                    closestPointsDict[key].icuRadarClass = "orange";
                  } else if (icuVal >= 45) {
                    closestPointsDict[key].icuRadarClass = "red";
                  }

                  console.log(
                    "FGFGFGFGF",
                    closestPointsDict[key],
                    "FGFGFGFGF",
                    closestPointsDict[key].icuRadarClass,
                    "FRATRAAA",
                    icuClass
                  );

                  // Find the element with the ID "text_1"
                  var element = document.getElementById("barchart-label-1");

                  // Change the text content of the element
                  element.textContent = "Votre lcz";

                  /////////////////////////////

                  if (closestPointsDict[key].icuRadarClass == icuClass) {
                    if (!chosenRadar) {
                      chosenRadar = closestPointsDict[key].id;
                      console.log("555555555", chosenRadar);
                      selectingClosestRadar();
                    }
                  }
                }
              );
            }
          }

          // Call the fetchUserIcuValue function to fetch the DN value
          fetchUserIcuValue(inputCoordinates);
          logCoordinates(closestPointsDict);
          selectingClosestRadar();

          let zoom = map.getZoom();
          let targetZoom = 15;
          let interval = setInterval(() => {
            zoom += 0.1;
            map.setZoom(zoom);
            if (zoom >= targetZoom) {
              clearInterval(interval);
            }
          }, 5);
          map.setCenter(inputCoordinates);
          // map.scrollWheelZoom.disable();
          // add markers to map
          // disable click to drag -> map.dragPan.disable();

          // create a HTML element for each feature
          const el = document.createElement("div");
          el.className = "marker";

          // make a marker for each feature and add to the map
          new mapboxgl.Marker(el).setLngLat(inputCoordinates).addTo(map);

          // Removing map blur
          document.getElementById("map").style.filter = "blur(0px)";

          // Change a div's CSS properties with ID
          let divById = document.getElementById("map");
          divById.style.pointerEvents = "auto"; // Enable pointer events

          //////////////////////

          // Part where I personalize the svg value by the user's lcz median height ect...
          // Load CSV file using d3-request
          d3.csv("data/csv/info_lcz.csv", function (error, data) {
            if (error) throw error;

            // Function to get "hauteurMoy" value by ID
            function getHauteurById(id) {
              const row = data.find((row) => row.ID === id.toString());
              if (!row) {
                return null;
              }
              const usersSvf = row.SVF;
              const hauteurMoy = row.hauteur_moy;
              return [hauteurMoy, usersSvf];
            }

            const [hauteurMoy, usersSvf] = getHauteurById(lczId);
            console.log("users lcz", lczId);

            let userSvfElement = document.getElementById("users-svf");
            userSvfElement.innerHTML = usersSvf;
            let userHauteurMoy = document.getElementById(
              "users-building-height"
            );
            userHauteurMoy.innerHTML = hauteurMoy;
          });
        });
      })
      .catch((error) => {
        console.error(error);
      });
    // set the value of the input field to the text content of the clicked list item
    input.value = value;
  }
  // hide the suggestion list
  suggestionList.innerHTML = "";
  suggestionList.classList.remove("border");

  // removing adress search box  and text after having chosen an adresse
  document.getElementById("search-container").remove();
  document.getElementById("entrer-adresse").remove();
  // changing the input in the search bar to none
  input.value = "";
});
