import * as d3 from "d3";

const svgDimensions = { width: 1024, height: 768 };
const margin = { left: 5, right: 5, top: 10, bottom: 10 };
const chartDimensions = {
  width: svgDimensions.width - margin.left - margin.right,
  height: svgDimensions.height - margin.bottom - margin.top,
};

const svg = d3
  .select("body")
  .append("svg")
  .attr("width", chartDimensions.width)
  .attr("height", chartDimensions.height)
  .attr("style", "background-color: #FBFAF0");
