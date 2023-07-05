import { graphUpdater, result } from "./radarChart.js";

// Create a flag to track if the function is called for the first time
let firstCall = true;

export function drawHeatMap() {
  anychart.onDocumentReady(function () {
    // create data
    var data = result;

    // Find the date with the highest value
    var highestValue = -Infinity;
    var highestDate = null;
    for (var i = 0; i < data.length; i++) {
      var value = data[i].heat; // Access the 'heat' property
      if (value > highestValue) {
        highestValue = value;
        highestDate = data[i].x; // Access the 'x' property
      }
    }

    graphUpdater(formatDate(highestDate));

    // If it's not the first call, clear the container before drawing a new chart
    if (!firstCall) {
      const container = document.getElementById("container");
      if (container) {
        container.innerHTML = "";
      }
    } else {
      firstCall = false;
    }

    // create a chart and set the data
    var chart = anychart.heatMap(data);

    // set the chart title
    // chart.title(
    //   "Écart de température entre votre LCZ et la station de référence"
    // );

    // create and configure the color scale.
    var customColorScale = anychart.scales.linearColor();
    customColorScale.colors([
      "#fff5f0",
      "#fee0d2",
      "#fcbba1",
      "#fc9272",
      "#fb6a4a",
      "#de2d26",
      "#a50f15",
    ]);

    // set the color scale as the color scale of the chart
    chart.colorScale(customColorScale);

    // set the container id
    chart.container("container");

    // set the font size of the heat map labels to 15 pixels
    chart.labels().fontSize(10);

    // set the font size of the x-axis labels to 25 pixels
    chart.xAxis().labels().fontSize(10);

    // add a click event listener to the chart to log the selected date
    chart.listen("pointClick", function (e) {
      graphUpdater(formatDate(e.iterator.get("x")));
    });
    chart.tooltip(false);

    // Custom formatting for the temperature values
    chart.labels().format(function () {
      return this.heat.toFixed(1) + "°C";
    });

    // initiate drawing the chart
    chart.draw();
  });
}

// formatting selected date
function formatDate(dateString) {
  const [day, month, year] = dateString.split("/");
  const date = new Date(`${year}-${month}-${day}`);
  return `${year}-${month}-${day}`;
}
