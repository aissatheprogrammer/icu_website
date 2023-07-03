export { graphUpdater };
export { removeRadarChart };

import { drawHeatMap } from "./HeatMap.js";
import { chosenRadar, closestPointsDict } from "./searchBar.js";
let dataDict;
let dataRefDict;

let data = [];
let features = [
  "00:00",
  "23:00",
  "22:00",
  "21:00",
  "20:00",
  "19:00",
  "18:00",
  "17:00",
  "16:00",
  "15:00",
  "14:00",
  "13:00",
  "12:00",
  "11:00",
  "10:00",
  "09:00",
  "08:00",
  "07:00",
  "06:00",
  "05:00",
  "04:00",
  "03:00",
  "02:00",
  "01:00",
];

let svg = d3
  .select("#radar-chart")
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 1 600");

// Define a linear scale to map the temperature values to
// the radius of the chart

let radialScale = d3.scaleLinear().domain([0, 10]).range([0, 250]);
let ticks = [6, 8, 10];

// Define an arc generator for the night time
const nightArcGenerator = d3
  .arc()
  .outerRadius(300)
  .innerRadius(0)
  .startAngle(Math.PI / 1.71)
  .endAngle(-Math.PI / 6);

const nightArc = svg
  .append("path")
  .attr("transform", "translate(300,300)")
  .attr("d", nightArcGenerator())
  .attr("fill", "#898CAB")
  .attr("opacity", 0.4);

const arcGenerator = d3
  .arc()
  .outerRadius(250)
  .innerRadius(0)
  .startAngle(Math.PI / 1.71)
  .endAngle(-Math.PI / 6);

const arc = svg
  .append("path")
  .attr("transform", "translate(300,300)")
  .attr("d", arcGenerator())
  .attr("fill", "#565E8F")
  .attr("opacity", 0.6);

/* 
svg
  .append("circle")
  .attr("cx", 300)
  .attr("cy", 300)
  .attr("fill", "yellow")
  .attr("fill-opacity", 0.30)
  .attr("stroke", "yellow")
  .attr("r", 250)
; */

ticks.forEach((t) =>
  svg
    .append("circle")
    .attr("cx", 300)
    .attr("cy", 300)
    .attr("fill", "none")
    .attr("stroke", "black")
    // circles
    .attr("r", radialScale(t))
    .attr("opacity", 0.55)
);

/*  text of every 
ticks.forEach((t) =>
  svg
    .append("text")
    .attr("x", 305)
    .attr("y", 300 - radialScale(t))
    .text(t.toString())
); */

function angleToCoordinate(angle, value) {
  let x = Math.cos(angle) * radialScale(value);
  let y = Math.sin(angle) * radialScale(value);
  return { x: 300 + x, y: 300 - y };
}

// Function that gets the Temp data for every time as input and makes new graph
function update(inputData, num) {
  data = [inputData];
  for (var i = 0; i < features.length; i++) {
    let ft_name = features[i];
    let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
    let line_coordinate = angleToCoordinate(angle, 10);
    let label_coordinate = angleToCoordinate(angle, 10.8);

    //draw axis line
    svg
      .append("line")
      .attr("x1", 300)
      .attr("y1", 300)
      .attr("x2", line_coordinate.x)
      .attr("y2", line_coordinate.y)
      .attr("stroke", "black")
      .attr("opacity", 0.2)
      .attr("stroke-width", 0.7);

    //draw axis label
    svg
      .append("text")
      .attr("x", label_coordinate.x - 18)
      .attr("y", label_coordinate.y + 7)
      .text(ft_name);
  }

  let line = d3
    .line()
    .x((d) => d.x)
    .y((d) => d.y);
  let colors = ["orange", "blue"];

  function getPathCoordinates(data_point, ref) {
    let coordinates = [];
    for (var i = 0; i < features.length; i++) {
      let ft_name = features[i];
      let angle = Math.PI / 2 + (2 * Math.PI * i) / features.length;
      // coordinates

      coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
    }
    return coordinates;
  }

  let radarColor = "#db7a58";
  if (num == 1) {
    radarColor = "#5C6FDB";
  }
  for (var i = 0; i < data.length; i++) {
    let d = data[i];
    let color = colors[i];
    let coordinates = getPathCoordinates(d);

    // Appending first dictionary to last position so the svg line can connect in a full circle

    coordinates.push(coordinates[0]);
    //draw the path element
    svg
      .append("path")
      .datum(coordinates)
      .attr("d", line)
      .attr("fill", "none")
      .attr("fill-opacity", 0.15)
      .attr("opacity", 1)
      .attr("stroke-width", 8)
      .attr("stroke", radarColor)
      .attr("stroke-opacity", 0.9)
      .attr("id", "hourlyChart");
  }
}

const date_value = document.getElementById("id_date");

// Dictionary that will have all of chosen day data
dataDict = {};
dataRefDict = {};
let i;
var radar;
// Changes the graph data every time the user changes the date
function graphUpdater(inputDate) {
  d3.csv("data/csv/fake_merged.csv", function (data) {
    if (!chosenRadar) {
      console.log("FERERERER");
      radar = closestPointsDict[1].id;
      console.log;
    } else {
      radar = chosenRadar;
    }
    console.log(data);
    console.log("77777777U77", parseFloat(radar).toFixed(1));
    // Looping all the data to find the exact day wanted
    for (i = 0; i < data.length; i++) {
      if (
        data[i].date == inputDate &&
        data[i].capteurs_id == parseFloat(radar).toFixed(1).toString()
      ) {
        // Appending for every time of chosen day the Temp data and time in a dictionary
        let time = data[i].time.toString();
        dataDict[time] = parseInt(data[i].valeurs_capteurs) / 4.5;
        dataRefDict[time] = parseInt(data[i].versoud_data) / 4.5;
      }
    }

    removeRadarChart();
    // Updating chart with new data
    update(dataDict, 0);
    update(dataRefDict, 1);
  });
}

// Removing last chart created by selecting the svg where he's located
function removeRadarChart() {
  d3.selectAll("#hourlyChart").remove();
}

export function dataHeatMap() {
  d3.csv("data/csv/fake_merged.csv", (error, data) => {
    console.log("UYTUTUTTYUTTYTUTYTUTTYTU");
    if (!chosenRadar) {
      console.log("FERERERER");
      radar = closestPointsDict[1].id;
      console.log;
    } else {
      radar = chosenRadar;
    }
    if (error) {
      console.error(error);
    }
    maxDifference(parseFloat(radar).toFixed(1).toString(), data);
  });
}

export let result;

function maxDifference(id, data) {
  result = [];
  const maxDiffByDate = {};
  data.forEach((row) => {
    if (row.capteurs_id === id) {
      const diff = row.valeurs_capteurs - row.versoud_data;
      const date = row.date.split("-").reverse().join("/");
      if (!maxDiffByDate[date] || diff > maxDiffByDate[date]) {
        maxDiffByDate[date] = diff;
      }
    }
  });
  Object.keys(maxDiffByDate).forEach((date) => {
    result.push({ x: date, y: "Votre LCZ", heat: maxDiffByDate[date] });
  });
  drawHeatMap();
  return result;
}
