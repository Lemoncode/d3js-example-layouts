
import * as d3 from "d3";

interface ProvinciaData {
  code: string;
  name: string;
  ccaa: string;
  cases: number;
}
const data: ProvinciaData[] = require("./casos_provincia.json");


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

const scale = d3.scaleLinear()
              .domain([0, d3.max(data, d=>d.cases)])
              .range([1, chartDimensions.width - 30]);

svg.selectAll("rect")
  .data(data)
  .join("rect")
  .attr("x", 0)
  .attr("y", (d, i)=>i*30)
  .attr("height", 25)
  .attr("width", d=>scale(d.cases))
  .attr("fill", (d, i) => d3.schemeSet3[i%d3.schemeSet3.length])

