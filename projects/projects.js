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
let selectedYear = null; 

function filterProjects(projects, query, selectedYear) {
  let filteredProjects = projects;

  // Apply search query filter
  if (query) {
      filteredProjects = filteredProjects.filter((project) => {
          let values = Object.values(project).join('\n').toLowerCase();
          return values.includes(query.toLowerCase());
      });
  }

  // Apply selected year filter
  if (selectedYear) {
      filteredProjects = filteredProjects.filter((project) => project.year === selectedYear);
  }

  return filteredProjects;
}

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

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  console.log('changing!');
    // Get the filtered projects based on search query
    let filteredProjects = filterProjects(projects, query, selectedYear);
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
searchInput.addEventListener('input', (event) => {
    query = event.target.value;

    let filteredProjects = projects;

    if (selectedIndex !== -1) {
        let selectedYear = data[selectedIndex].label;
        filteredProjects = filteredProjects.filter((p) => p.year === selectedYear);
    }

    if (query) {
        filteredProjects = filteredProjects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
        });
    }

    renderProjects(filteredProjects, projectsContainer, 'h2');

    // Re-calculate rolled data, arc data, etc.
    let newRolledData = d3.rollups(
        filteredProjects,
        (v) => v.length,
        (d) => d.year
    );

    let data = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let arcData = sliceGenerator(data);

    d3.select("#pie-chart").selectAll("*").remove();

    let svg = d3.select("#pie-chart");
    arcData.forEach((d, idx) => {
        svg.append("path")
            .attr("d", arcGenerator(d))
            .attr("fill", colors(idx));
    });

    let legend = d3.select(".legend").html("");
    data.forEach((d, idx) => {
        legend.append("li")
            .attr("style", `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
});
  const svgNS = "http://www.w3.org/2000/svg";
  d3.select("#pie-chart").selectAll("path").remove();

  for (let i = 0; i < arcs.length; i++) {
    let path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", arcs[i]);
    path.setAttribute("fill", colors(i));

    path.addEventListener("click", () => {
    selectedIndex = selectedIndex === i ? -1 : i;

    document.querySelectorAll("path").forEach((p, i) => {
        console.log("pie selected")
        if (i === selectedIndex) {
          p.classList.add("selected");
        } else {
          p.classList.remove("selected");
         }
      });
      document.querySelectorAll(".legend li").forEach((p, i) => {
        if (i === selectedIndex) {
          p.classList.add("selected");
          p.querySelector('.swatch').style.backgroundColor = 'oklch(60% 45% 0)';
        } else {
          p.classList.remove("selected");
          p.querySelector('.swatch').style.backgroundColor = colors(i);
         }
      });

      
    
    if (selectedIndex !== -1) {
          // retrieve the selected year
        let selectedYear = data[selectedIndex].label;
          // filter projects by the selected year
        let filteredProjects = filterProjects(projects, query, selectedYear);
        renderProjects(filteredProjects, projectsContainer, "h2");
          } else {
          // render projects directly
        renderProjects(projects, projectsContainer, "h2");
      }


      
  });
      d3.select("#pie-chart").node().appendChild(path);
      d3.select(".legend")
  }


  
   
    


  
  


 




    