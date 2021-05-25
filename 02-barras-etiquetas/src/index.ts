import * as d3 from "d3";

interface ProvinciaData {
  code: string;
  name: string;
  ccaa: string;
  cases: number;
}
const data: ProvinciaData[] = require("./casos_provincia.json");


const svgDimensions = { width: 1024, height: 1100 };
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
              .range([1, chartDimensions.width - 120]);

// https://nanx.me/ggsci/reference/pal_d3.html
const ccaaList = Array.from(new Set(data.map(d=>d.ccaa)));
const colorScale = ["#1f77b4","#ff7f0e", "#2ca02c","#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"]

const getColor = (ccaa:string) => {
  const ccaaId = ccaaList.findIndex(d=>d===ccaa)
  return colorScale[ccaaId]
}



const province = svg.selectAll("g")
  .data(data.sort((a, b)=>a.ccaa.localeCompare(b.ccaa)))
  .join("g")

province.append("rect")
  .attr("x", 0)
  .attr("y", (d, i)=>i*20)
  .attr("height", 15)
  .attr("width", 0)
  .attr("fill", d => getColor(d.ccaa))
  .transition()
  .duration(1000)
  .attr("width", d=>scale(d.cases))

province.append("text")
  .attr("x", d=>scale(d.cases)+5)
  .attr("y", (d, i)=>(i+0.6)*20 )
  .attr("opacity", 0)
  .text(d=>`${d.name}: ${new Intl.NumberFormat().format(d.cases)}`)
  .transition()
  .delay(1000)
  .attr("opacity", 1)

