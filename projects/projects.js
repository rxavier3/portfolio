import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');


const projectsCount = projects.length;

const projectsTitle = document.querySelector('.projects-title');

if (projectsTitle) {
    projectsTitle.textContent = `${projectsCount} Projects`;
}

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arc = arcGenerator({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
//   });
d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');
let data = [1, 2];
let total = 0;

for (let d of data) {
  total += d;
}
let angle = 0;
// let arcData = [];
let arcData = sliceGenerator(data);

for (let d of data) {
  let endAngle = angle + (d / total) * 2 * Math.PI;
  arcData.push({ startAngle: angle, endAngle });
  angle = endAngle;
}
// let arcs = arcData.map((d) => arcGenerator(d));
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

let sliceGenerator = d3.pie();


arcs.forEach((arc, idx) => {
    d3.select('svg') 
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx)) 
  });