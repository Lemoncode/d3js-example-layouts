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


interface TreemapData {
  name: string;
  children?: TreemapData[];
  value?: number;
}

const provData: TreemapData[] = ccaaList.map(ccaa=>({name: ccaa, 
  children: data.filter(prov=>prov.ccaa===ccaa)
            .map(prov=>({name: prov.name, value: prov.cases}))
}));

const treemapData:TreemapData = {name: "España", children: provData}


const hierarchy = d3.hierarchy(treemapData)
.sum(d=>d.value)
.sort((a,b)=>b.value-a.value);


const treemap = d3.treemap()
                  .size([chartDimensions.width, chartDimensions.height])
                  .padding(1);  

const root = treemap(hierarchy) as d3.HierarchyRectangularNode<TreemapData>;

const colorScale = ["#1f77b4","#ff7f0e", "#2ca02c","#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"];
const getColor = (ccaa:string) => {
  const ccaaId = ccaaList.findIndex(d=>d===ccaa)
  return colorScale[ccaaId]
}


const svg = d3
  .select("body")
  .append("svg")
  .attr("width", chartDimensions.width)
  .attr("height", chartDimensions.height)
  .attr("style", "background-color: #FBFAF0");

const leaf = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`);

leaf.append("rect")
      
      .attr("width",  d=>d.x1 - d.x0)
      .attr("height", d=>d.y1 - d.y0)
      .attr("fill", d=> getColor(d.parent.data.name))

leaf.append("title").text(d=>`${d.data.name}: ${d.data.value}`)

leaf.append("text")
      .attr("x", 3)
      .attr("y", 15)
      .text(d => d.data.name);
leaf.append("text")
      .attr("x", 3)
      .attr("y", 35)
      .text(d => new Intl.NumberFormat().format(d.data.value));