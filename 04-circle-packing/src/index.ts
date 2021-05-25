import * as d3 from "d3";

const svgDimensions = { width: 1024, height: 768 };
const margin = { left: 5, right: 5, top: 10, bottom: 10 };
const chartDimensions = {
  width: svgDimensions.width - margin.left - margin.right,
  height: svgDimensions.height - margin.bottom - margin.top,
};

interface ProvinciaData {
  code: string;
  name: string;
  ccaa: string;
  cases: number;
}
const data: ProvinciaData[] = require("./casos_provincia.json");

const ccaaList = Array.from(new Set(data.map(d=>d.ccaa)));


interface CirclePackData {
  name: string;
  children?: CirclePackData[];
  value?: number;
}

const provData: CirclePackData[] = ccaaList.map(ccaa=>({name: ccaa, 
  children: data.filter(prov=>prov.ccaa===ccaa)
            .map(prov=>({name: prov.name, value: prov.cases}))
}));

const circlePackData:CirclePackData = {name: "España", children: provData}


const hierarchy = d3.hierarchy(circlePackData)
.sum(d=>d.value)
.sort((a,b)=>b.value-a.value);


const pack = d3.pack()
            .size([chartDimensions.width, chartDimensions.height])
            .padding(1);  

const root = pack(hierarchy) as d3.HierarchyCircularNode<CirclePackData>;

const colorScale = ["#1f77b4","#ff7f0e", "#2ca02c","#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"];

const getColor = (ccaa:string, isCCAA: boolean) => {
  const ccaaId = ccaaList.findIndex(d=>d===ccaa);
  const ccaaColor = colorScale[ccaaId];
  
  return isCCAA ? ccaaColor : (d3.color(ccaaColor)??d3.color("#000000")).brighter(Math.random()).formatHex();
}


const svg = d3
  .select("body")
  .append("svg")
  .attr("width", chartDimensions.width)
  .attr("height", chartDimensions.height)
  .attr("style", "background-color: #FBFAF0");


const leaf = svg.selectAll("g")
    .data(d3.group(root.descendants(), d => d.height))
    .join("g")
    .selectAll("g")
    .data(d => d[1])
    .join("g")
      .attr("transform", d => `translate(${d.x + 1},${d.y + 1})`);

leaf.append("circle")
      .attr("r", d => d.r)
      .attr("fill", (d, i) =>d.depth>0 && getColor(d.depth===1?d.data.name:d.parent.data.name, d.depth===1))
      .attr("stroke", "#000000")
      .attr("stroke-width", 0.5);

leaf.append("title").text(d=>`${d.data.name} ${d.depth===2?new Intl.NumberFormat().format(d.data.value):""}`)

