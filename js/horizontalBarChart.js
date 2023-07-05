var margin = { top: 20, right: 20, bottom: 30, left: 150 },
  width =
    parseInt(d3.select("#bar-graph").style("width")) -
    margin.left -
    margin.right,
  height = 285 - margin.top - margin.bottom;

// set the ranges
var y = d3.scaleBand().range([height, 0]).padding(0.3);

var x = d3.scaleLinear().range([0, width]);

// create a color scale
var color = d3
  .scaleOrdinal()
  .range(["#757782", "#DB727E", "#DBB846", "#51DB6F", "#515FDB"]);

// append the svgBar object to the body of the page
// append a 'group' element to 'svgBar'
// moves the 'group' element to the top left margin
var svgBar = d3
  .select("#bar-graph")
  .append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr(
    "viewBox",
    "0 0 " +
      (width + margin.left + margin.right + 200) +
      " " +
      (height + margin.top + margin.bottom)
  )
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

export function updateBarChart(varLcz) {
  // get the data
  d3.csv(
    "data/csv/lcz_treemap_datadata_treated_for_onehundredpercent.csv",
    function (error, data) {
      if (error) throw error;

      // finding index of selected zone
      var index = data
        .map(function (e) {
          return e.Quartiers;
        })
        .indexOf("Moyenne");

      // finding index of selected zone

      // finding index of selected zone
      var chosenIndex = data
        .map(function (e) {
          return e.Quartiers;
        })
        .indexOf(String(varLcz));

      // selecting the zone wanted by its index and putting it in a list so that the forEach method works
      data = [data[index], data[chosenIndex]];

      // format the data
      data.forEach(function (d) {
        d.Bâties = +d.Bâties;
        d.Surf_Imper = +d.Surf_Imper;
        d.Vég = +d.Vég;
        d.Vég_basse = +d.Vég_basse;
        d.Eau = +d.Eau;
      });

      // create a stacked layout
      var stack = d3
        .stack()
        .keys(["Bâties", "Surf_Imper", "Vég", "Vég_basse", "Eau"])
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

      var layers = stack(data);

      // Scale the range of the data in the domains
      x.domain([0, 100]);
      y.domain(
        data.map(function (d) {
          return d.Quartiers;
        })
      );

      // append the rectangles for the bar chart
      var bar = svgBar
        .selectAll(".bar")
        .data(layers)
        .enter()
        .append("g")
        .attr("class", "bar")
        .attr("fill", function (d) {
          return color(d.key);
        });

      bar
        .selectAll("rect")
        .data(function (d) {
          return d;
        })
        .enter()
        .append("rect")
        .attr("y", function (d) {
          return y(d.data.Quartiers);
        })
        .attr("height", y.bandwidth())
        .attr("x", function (d) {
          return x(d[0]);
        })
        .attr("width", function (d) {
          return x(d[1]) - x(d[0]);
        })
        .on("mousemove", function (event) {
          // get the x and y coordinates of the mouse cursor
          var xPos = d3.event.pageX;
          var yPos = d3.event.pageY;

          // use the x and y coordinates to determine which bar the mouse is over
          var data = d3.select(this).data();
          var index = Math.floor(
            (xPos - margin.left) / (width / data[0].length)
          );
          let value = data[0].data;
          let key = data[0].data.Quartiers;

          if (!isNaN(key)) {
            key = "Votre LCZ";
          }

          var subgroupName = d3.select(this.parentNode).datum().key;
          var subgroupValue = event.data[subgroupName].toFixed(1);

          value = `${subgroupValue}%`;
          // update the tooltip with the information about the bar
          d3.select("#tooltip")
            .style("left", xPos + "px")
            .style("top", yPos + "px")
            .select("#key")
            .text(key);
          d3.select("#tooltip").select("#value").text(value);

          // show the tooltip
          d3.select("#tooltip").style("visibility", "visible");
        })
        .on("mouseover", function () {
          d3.select("#tooltip").style("display", null);
        })
        .on("mouseout", function () {
          d3.select("#tooltip").style("display", "none");
        });

      // add the y Axis
      svgBar
        .append("g")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .style("font-size", "17px")
        .attr("id", (d, i) => "barchart-label-" + i);
    }
  );
}
