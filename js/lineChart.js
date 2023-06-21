// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svgLineChart object to the body of the page
var svgLineChart = d3
  .select("#my_dataviz")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv(
  "./data/csv/mean_bydate.csv",

  // When reading the csv, I must format variables:
  function (d) {
    return { date: d3.timeParse("%Y-%m-%d")(d.date), value: d.value };
  },

  // Now I can use this dataset:
  function (data) {
    // Add X axis --> it is a date format

    var x = d3
      .scaleTime()
      .domain(
        d3.extent(data, function (d) {
          return d.date;
        })
      )
      .range([0, width]);
    svgLineChart
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([
        15,
        d3.max(data, function (d) {
          return +d.value + 5;
        }),
      ])
      .range([height, 0]);
    svgLineChart.append("g").call(d3.axisLeft(y));

    // Add the line
    svgLineChart
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "rgb(82, 82, 82)")
      .attr("stroke-width", 3)
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.date);
          })
          .y(function (d) {
            return y(d.value);
          })
      )
      // When user interacts with Line Chart it updates the Radar Chart
      .on("mouseover", function (d) {
        const mousePosition = d3.mouse(this);

        // Getting date of where the user is hovering
        let day = x.invert(d3.mouse(this)[0]).getUTCDate();
        let month = x.invert(d3.mouse(this)[0]).getUTCMonth() + 1;
        let year = x.invert(d3.mouse(this)[0]).getFullYear();

        // Keeping the 0 before single digits
        day = String(day).padStart(2, "0");
        month = String(month).padStart(2, "0");

        // Formatted date of where user interacted with Line Chart
        var userInput = year + "-" + month + "-" + day;

        // Removing Last Radar Chart
        removeRadarChart();
        removeRadarChart();
        // Updating graph with new daily
        graphUpdater(userInput);
      });
    // Add the line
    svgLineChart
      .selectAll("myCircles")
      .data(data)
      .enter()
      .append("circle")
      .attr("fill", "black")
      .attr("stroke", "none")
      .attr("cx", function (d) {
        return x(d.date);
      })
      .attr("cy", function (d) {
        return y(d.value);
      })
      .attr("r", 4)
      // When user interacts with Line Chart it updates the Radar Chart
      .on("click", function (d) {
        const mousePosition = d3.mouse(this);

        // Getting date of where the user is hovering
        let day = x.invert(d3.mouse(this)[0]).getUTCDate();
        let month = x.invert(d3.mouse(this)[0]).getUTCMonth() + 1;
        let year = x.invert(d3.mouse(this)[0]).getFullYear();

        // Keeping the 0 before single digits
        day = String(day).padStart(2, "0");
        month = String(month).padStart(2, "0");

        // Formatted date of where user interacted with Line Chart
        var userInput = year + "-" + month + "-" + day;

        // Removing Last Radar Chart
        removeRadarChart();
        removeRadarChart();

        // Updating graph with new daily
        graphUpdater(userInput);
      });
  }
);
