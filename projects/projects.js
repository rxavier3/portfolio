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
    // Get the filtered projects based on search query
    let filteredProjects = setQuery(event.target.value);
    renderProjects(filteredProjects, projectsContainer, 'h2');
    
    // Re-calculate rolled data
    let newRolledData = d3.rollups(
      filteredProjects,
      (v) => v.length,
      (d) => d.year
    );
    
    // Re-calculate data
    let data = newRolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
  
    // Re-calculate slice generator, arc data, arc, etc.
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);

    // Clear any previous content in the SVG before appending new paths
    d3.select("#pie-chart").selectAll("*").remove();

    // Append paths to the SVG
    let svg = d3.select("#pie-chart");
    arcData.forEach((d, idx) => {
    svg.append("path")
        .attr("d", arcGenerator(d))
        .attr("fill", colors(idx));
    });

    // Clear and update legend
    let legend = d3.select(".legend").html("");

    data.forEach((d, idx) => {
    legend.append("li")
        .attr("style", `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
});

let selectedIndex = -1;
function recalculate(projectsGiven) {
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year,
    );
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    return newData;
}

  const svgNS = "http://www.w3.org/2000/svg";
  d3.select("#pie-chart").selectAll("path").remove();

  for (let i = 0; i < arcs.length; i++) {
      let path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", arcsGiven[i]);
      path.setAttribute("fill", colors(i));

      path.addEventListener("click", () => {
      selectedIndex = selectedIndex === i ? -1 : i;

      document.querySelectorAll("path").forEach((p, idx) => {
          if (idx === selectedIndex) {
          p.classList.add("selected");
          } else {
          p.classList.remove("selected");
          }
      });
  if (selectedIndex !== -1) {
          // retrieve the selected year
        let selectedYear = dataGiven[selectedIndex].label;
          // filter projects by the selected year
        let filteredProjects = projectsGiven.filter((p) => p.year === selectedYear);
          // render filtered projects
        renderProjects(filteredProjects, projectsContainer, "h2");
      } else {
          // render projects directly
        renderProjects(projects, projectsContainer, "h2");
      }
      // update the legend
      let newData = recalculate(projects);
      
      let newLegend = d3.select(".legend");
      newLegend.selectAll('path').remove(); 
      newData.forEach((d, idx) => {
          newLegend.append('li').attr('style', `--color:${colors(idx)}`).html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
      });      });
      d3.select("#pie-chart").node().appendChild(path);
  }
    
  
    // let li = document.createElement('li');
    // li.style.setProperty('--color', colors(i));
  
    // // Create the swatch span
    // let swatch = document.createElement('span');
    // swatch.className = 'swatch';
    // swatch.style.backgroundColor = colors(i);
    
    // // Append the swatch to the list item
    // li.appendChild(swatch);
  
    // // Set the label and value
    // li.innerHTML += `${data[i].label} <em>(${data[i].value})</em>`;
    // newLegend.appendChild(li);
    
    // svg.appendChild(path);
    


  
  


 




    