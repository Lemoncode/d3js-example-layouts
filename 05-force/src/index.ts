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
  group?: string;
  children?: CirclePackData[];
  value?: number;
}

const provData: CirclePackData[] = ccaaList.map(ccaa=>({name: ccaa, 
  group: ccaa, 
  children: data.filter(prov=>prov.ccaa===ccaa)
            .map(prov=>({name: prov.name, group:ccaa, value: prov.cases}))
}));

const circlePackData:CirclePackData = {name: "España", children: provData}


const colorScale = ["#1f77b4","#ff7f0e", "#2ca02c","#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf", "#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"];
const getColor = (ccaa:string) => {
  const ccaaId = ccaaList.findIndex(d=>d===ccaa)
  return colorScale[ccaaId]
}

const hierarchy = d3.hierarchy(circlePackData)
.sum(d=>d.value);


const pack = d3.pack()
            .size([chartDimensions.width, chartDimensions.height])
            .padding(1);  


interface HierarchyClusteredForceNode extends  d3.HierarchyCircularNode<CirclePackData>{
  vx?: number;
  vy?: number;
}
const root = pack(hierarchy) as HierarchyClusteredForceNode;
const nodes = root.leaves();

function centroid(nodes) {
  let x = 0;
  let y = 0;
  let z = 0;
  for (const d of nodes) {
    let k = d.r ** 2;
    x += d.x * k;
    y += d.y * k;
    z += k;
  }
  return {x: x / z, y: y / z};
}

function forceCluster() {
  const strength = 0.2;
  let nodes: HierarchyClusteredForceNode[];

  function force(alpha:number) {
    const centroids = d3.rollup(nodes, centroid, d => d.data.group);
    const l = alpha * strength;
    for (const d of nodes) {
      const {x: cx, y: cy} = centroids.get(d.data.group);
      d.vx -= (d.x - cx) * l;
      d.vy -= (d.y - cy) * l;
    }
  }

  force.initialize = _ => nodes = _;

  return force;
}

const isQuadtreeLeaf = (node: (d3.QuadtreeInternalNode<HierarchyClusteredForceNode>|d3.QuadtreeLeaf<HierarchyClusteredForceNode>)): node is d3.QuadtreeLeaf<HierarchyClusteredForceNode> => {
  return (node as d3.QuadtreeLeaf<HierarchyClusteredForceNode>).data !== undefined;
}

function forceCollide() {
  const alpha = 0.4; // fixed for greater rigidity!
  const padding1 = 2; // separation between same-color nodes
  const padding2 = 6; // separation between different-color nodes
  let nodes: HierarchyClusteredForceNode[];
  let maxRadius;

  function force() {
    const quadtree = d3.quadtree(nodes, d => d.x, d => d.y);
    for (const d of nodes) {
      const r = d.r + maxRadius;
      const nx1 = d.x - r, ny1 = d.y - r;
      const nx2 = d.x + r, ny2 = d.y + r;
      quadtree.visit((q, x1, y1, x2, y2) => {
        if (isQuadtreeLeaf(q) && !q.length) do {
          if ( q.data !== d) {
            const r = d.r + q.data.r + (d.data.group === q.data.data.group ? padding1 : padding2);
            let x = d.x - q.data.x, y = d.y - q.data.y, l = Math.hypot(x, y);
            if (l < r) {
              l = (l - r) / l * alpha;
              d.x -= x *= l, d.y -= y *= l;
              q.data.x += x, q.data.y += y;
            }
          }
        } while (q = q.next);
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    }
  }

  force.initialize = _ => maxRadius = d3.max(nodes = _, (d: HierarchyClusteredForceNode) => d.r) + Math.max(padding1, padding2);

  return force;
}

const drag = (simulation:d3.Simulation<HierarchyClusteredForceNode, undefined>) => {
  
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

const simulation = d3.forceSimulation(nodes)
      .force("x", d3.forceX(svgDimensions.width / 2).strength(0.01))
      .force("y", d3.forceY(svgDimensions.height / 2).strength(0.01))
      .force("cluster", forceCluster())
      .force("collide", forceCollide());




const svg = d3
  .select("body")
  .append("svg")
  .attr("width", chartDimensions.width)
  .attr("height", chartDimensions.height)
  .attr("style", "background-color: #FBFAF0");


  const node = svg.append("g")
    .selectAll("circle")
    .data(nodes)
    .join("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("fill", d => getColor(d.data.group))

svg.selectAll("circle").call(drag(simulation));
svg.selectAll("circle")
  .append("title")
  .text((d:HierarchyClusteredForceNode)=>`${d.data.name}: ${new Intl.NumberFormat().format(d.data.value)}`)

node.transition()
    .delay((d, i) => Math.random() * 500)
    .duration(750)
    .attrTween("r", d => {
      const i = d3.interpolate(0, d.r);
      return t => {d.r = i(t); return d.r.toString()};
    });

simulation.on("tick", () => {
      node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y);
    });
  
