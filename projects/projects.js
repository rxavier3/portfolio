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

// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arc = arcGenerator({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
//   });
// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');
// let data = [1, 2];
// let total = 0;

// for (let d of data) {
//   total += d;
// }
// let angle = 0;
// let arcData = [];

// for (let d of data) {
//   let endAngle = angle + (d / total) * 2 * Math.PI;
//   arcData.push({ startAngle: angle, endAngle });
//   angle = endAngle;
// }
// let arcs = arcData.map((d) => arcGenerator(d));
// let colors = ['gold', 'purple'];
// arcs.forEach((arc, idx) => {
//     d3.select('svg') 
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors[idx]) 
//   });
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year
  );
// Data for the pie chart
let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
  });


// Use d3.pie() to calculate the start and end angles for each slice
let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);

// Now we use arcGenerator to create the path strings for each slice
let arcs = arcData.map((d) => arcGenerator(d));

// Use d3.scaleOrdinal to create a color scale
let colors = d3.scaleOrdinal(d3.schemeTableau10); // Automatically gets a color for each slice

// Select the SVG and append paths for each arc (slice)
arcs.forEach((arc, idx) => {
  d3.select('svg')
    .append('path')
    .attr('d', arc) // Apply the generated path for the slice
    .attr('fill', colors(idx));
});

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) 
          .html(`<span class="swatch" style="background-color: ${colors(idx)}"></span> ${d.label} <em>(${d.value})</em>`);
});
let query = '';

function setQuery(newQuery) {
  query = newQuery;

  let filteredProjects = projects.filter((project) => {
    if (query) {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query.toLowerCase());
    }

    return true;
  });

  return filteredProjects;
}

let searchInput = document.getElementsByClassName('searchBar')[0];
function renderFilteredProjects(filteredProjects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = ''; 
  
    // Render the filtered projects
    filteredProjects.forEach(project => {
      const article = document.createElement('article');
      article.innerHTML = `
        <${headingLevel}>${project.title}</${headingLevel}>
        <img src="${project.image}" alt="${project.title}">
        <div class="project-details">
          <p>${project.description}</p>
          <p class="project-year">${project.year}</p>
        </div>
      `;
      containerElement.appendChild(article);
    });
  }
searchInput.addEventListener('change', (event) => {
  let updatedProjects = setQuery(event.target.value);
  renderFilteredProjects(updatedProjects, projectsContainer);
});


let selectedIndex = -1;
const svg = d3.select('svg');
for (let i = 0; i < arcs.length; i++) {
  const svgNS = "http://www.w3.org/2000/svg";
  let path = document.createElementNS(svgNS, "path");

  path.setAttribute("d", arcs[i]);
  path.setAttribute("fill", colors(i));
  path.style.cursor = 'pointer';

  path.addEventListener('click', (event) => {
    selectedIndex = selectedIndex === i ? -1 : i;

    document.querySelectorAll('path').forEach((p, index) => {
      if (index === selectedIndex) {
        p.classList.add('selected');
      } else {
        p.classList.remove('selected');
      }
    });

    document.querySelectorAll('.legend li').forEach((li, index) => {
      if (index === selectedIndex) {
        li.classList.add('selected');
      } else {
        li.classList.remove('selected');
      }
    });
  });

  let li = document.createElement('li');
  li.style.setProperty('--color', colors(i));

  let swatch = document.createElement('span');
  swatch.className = 'swatch';
  swatch.style.backgroundColor = colors(i);

  li.appendChild(swatch);

  li.innerHTML += `${data[i].label} <em>(${data[i].value})</em>`;

  document.querySelector('.legend').appendChild(li);
  svg.appendChild(path);
}


