import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
// svg
const attributes = [
  "Food_Quality",
  "Speed_of_Service",
  "Value_for_Money_Spent",
  "Healthy_Options",
  "Overall_Cleanliness",
  "Staff_Friendliness",
  "Curb_Appeal",
  "Atmosphere",
];
const radius = [0, 25, 50, 75, 100];

const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 65, right: 30, bottom: 65, left: 30 };

// group
const g = svg
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

// scale
let minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
const radiusScale = d3.scaleLinear().domain([0, 100]).range([0, minLen]);

const angleScale = d3
  .scaleLinear()
  .domain([0, attributes.length])
  .range([0, 2 * Math.PI]);

//color
const pointcolor = "orange";

// console.log(width + "," + height);
// line radial
const radarLine = d3
  .lineRadial()
  .curve(d3.curveCardinalClosed)
  .angle((d, i) => angleScale(i))
  .radius((d) => radiusScale(selectedBrand[d]));

// svg elements
let brands, selectedBrand;
let selectedName = "Five Guys";
let radiusAxis, angleAxis;
let path, points, labels;
////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
// data
let data = [];

d3.json("data/best_burgers.json")
  .then((raw_data) => {
    console.log(raw_data.map((d) => d.Brand));

    brands = raw_data.map((d) => d.Brand);
    data = raw_data;
    selectedBrand = data.filter((d) => d.Brand == selectedName)[0];
    console.log(selectedBrand);

    // Add dropdown
    const dropdown = document.getElementById("options");
    brands.map((d) => {
      const option = document.createElement("option");
      option.value = d; //text 가지고 있는 의미
      option.innerHTML = d; //d ="test"라고 하면 이름 + test라고 보임
      option.selected = d === selectedBrand ? true : false;
      dropdown.appendChild(option);
    });

    dropdown.addEventListener("change", function () {
      selectedName = dropdown.value;
      // console.log(selectedBrand);
      updateBrand();
    });

    // console.log(brands);

    //line
    radarLine.radius((d) => radiusScale(selectedBrand[d]));

    //axis
    radiusAxis = g
      .selectAll("radius-axis")
      .data(radius)
      .enter()
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", (d) => radiusScale(d))
      .attr("fill", "rgba(10,10,10,0.02")
      .attr("stroke", "#c3c3c3")
      .attr("stroke-width", 0.5);

    angleAxis = g
      .selectAll("angle-axis")
      .data(attributes)
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", (d, i) => getXPos(100, i))
      .attr("y2", (d, i) => getYPos(100, i))
      .attr("stroke", "#ccc")
      .attr("stroke-width", 0.5);

    //path
    path = g
      .append("path")
      .datum(attributes)
      .attr("d", radarLine)
      .attr("fill", pointcolor)
      .attr("stroke", pointcolor)
      .attr("stroke-width", 1.3)
      .attr("fill-opacity", 0.1);

    //labels
    labels = g
      .selectAll("labels")
      .data(attributes)
      .enter()
      .append("text")
      .attr("x", (d, i) => getXPos(120, i))
      .attr("y", (d, i) => getYPos(120, i))
      .text((d) => d)
      .attr("class", "labels");

    //brand name
    d3.select("#brand-name").text(selectedBrand.Brand);
  })
  .catch((error) => {
    console.error("Error loading CSV data: ", error);
  });

//Update
const updateBrand = () => {
  selectedBrand = data.filter((d) => d.Brand === selectedName)[0];

  //line updated
  radarLine.radius((d) => radiusScale(selectedBrand[d]));
  //path updated
  path.transition().duration(700).attr("d", radarLine);
  // console.log(selectedBrand);
  //points
  points
    .transition()
    .duration(600)
    .attr("cx", (d, i) => getXPos(selectedBrand[d], i))
    .attr("cy", (d, i) => getYPos(selectedBrand[d], i));
  //brand name
  d3.select("#burger-name").text(selectedBrand.Brand);
};

//Resize
window.addEventListener("resize", () => {
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  //g updated
  g.attr("transform", `translate(${width / 2}, ${height / 2})`);
  //scale updated
  minLen = d3.min([height / 2 - margin.top, width / 2 - margin.right]);
  radiusScale.range([0, minLen]);
  //axis updated
  radiusAxis.attr("r", (d) => radiusScale(d));

  angleAxis
    .attr("x2", (d, i) => getXPos(100, i))
    .attr("y2", (d, i) => getYPos(100, i));
  //line
  radarLine.radius((d) => radiusScale(selectedBrand[d]));
  //points

  //path
  path.attr("d", radarLine);

  //labels
  labels
    .attr("x", (d, i) => getXPos(120, i))
    .attr("y", (d, i) => getYPos(120, i));
});

//function
const getXPos = (dist, index) => {
  //radius*cos(theta)
  return radiusScale(dist) * Math.cos(angleScale(index) - Math.PI / 2);
};
const getYPos = (dist, index) => {
  //radius*sin(theta)
  return radiusScale(dist) * Math.sin(angleScale(index) - Math.PI / 2);
};
