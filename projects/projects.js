
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');


// const projectsCount = projects.length;

// const projectsTitle = document.querySelector('.projects-title');

// Update the text content of the projects title with the count
if (projectsTitle) {
    projectsTitle.textContent = `${projectsCount} Projects`;
}

// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arc = arcGenerator({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
//   });
//   d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// // let data = [1, 2];
// // let total = 0;

// // for (let d of data) {
// //     total += d;
// // }
// // let angle = 0;
// // let arcData = [];

// // for (let d of data) {
// //   let endAngle = angle + (d / total) * 2 * Math.PI;
// //   arcData.push({ startAngle: angle, endAngle });
// //   angle = endAngle;
// // }
// // let arcs = arcData.map((d) => arcGenerator(d));

// // let colors = ['gold', 'purple'];
// // arcs.forEach((arc, i) => {
// //   d3.select('svg')
// //     .append("path")
// //     .attr("d", arc)
// //     .attr('fill', colors[i]); 
// // });
// let data = [1, 2, 3, 4, 5, 5];
// let colors = d3.scaleOrdinal(d3.schemeTableau10);

// let sliceGenerator = d3.pie();
// let arcData = sliceGenerator(data);
// let arcs = arcData.map((d) => arcGenerator(d));
// arcs.forEach((arc, i) => {
//    d3.select('svg')
//      .append("path")
//      .attr("d", arc)
//     .attr('fill', colors(i)); 
// });

const projectsCount = projects.length;
const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
    projectsTitle.textContent = `${projectsCount} Projects`;
}

// Create a pie chart
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Data for pie chart (adjusted based on lab instructions)
let data = [1, 2, 3, 4, 5, 5];

// Use D3's ordinal scale to generate color for each slice
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Create the pie generator function
let sliceGenerator = d3.pie();

// Generate the pie chart data
let arcData = sliceGenerator(data);

// Map the pie chart data to arc paths
let arcs = arcData.map((d) => arcGenerator(d));

// Append the paths to the SVG and set colors dynamically
arcs.forEach((arc, i) => {
   d3.select('svg')
     .append('path')
     .attr('d', arc)  // The d attribute is the SVG path data
     .attr('fill', colors(i)); // Use the color scale for each slice
});