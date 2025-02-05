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

let data = rolledData.map(([year, count]) => {
    return { value: count, label: year };
});

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);

function attachPieChartEventListeners() {
    d3.select("#pie-chart").selectAll("path").each(function (d, i) {
        d3.select(this).on("click", () => {
            selectedIndex = selectedIndex === i ? -1 : i;

            document.querySelectorAll("path").forEach((p, idx) => {
                if (idx === selectedIndex) {
                    p.classList.add("selected");
                } else {
                    p.classList.remove("selected");
                }
            });

            document.querySelectorAll(".legend li").forEach((p, idx) => {
                if (idx === selectedIndex) {
                    p.classList.add("selected");
                    p.querySelector('.swatch').style.backgroundColor = 'oklch(60% 45% 0)';
                } else {
                    p.classList.remove("selected");
                    p.querySelector('.swatch').style.backgroundColor = colors(idx);
                }
            });

            if (selectedIndex !== -1) {
                let selectedYear = data[selectedIndex].label;
                let filteredProjects = filterProjects(projects, query, selectedYear);
                renderProjects(filteredProjects, projectsContainer, "h2");
            } else {
                renderProjects(projects, projectsContainer, "h2");
            }
        });
    });
}

// Initial rendering of the pie chart and legend
arcs.forEach((arc, idx) => {
    d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(idx));
});

let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch" style="background-color: ${colors(idx)}"></span> ${d.label} <em>(${d.value})</em>`);
});

attachPieChartEventListeners();

let query = '';
let selectedYear = null;
let selectedIndex = -1;

function filterProjects(projects, query, selectedYear) {
    let filteredProjects = projects;

    if (query) {
        filteredProjects = filteredProjects.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
        });
    }

    if (selectedYear) {
        filteredProjects = filteredProjects.filter((project) => project.year === selectedYear);
    }

    return filteredProjects;
}

let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    query = event.target.value;

    let filteredProjects = filterProjects(projects, query, selectedYear);
    renderProjects(filteredProjects, projectsContainer, 'h2');

    let newRolledData = d3.rollups(
        filteredProjects,
        (v) => v.length,
        (d) => d.year
    );

    data = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    arcData = sliceGenerator(data);
    arcs = arcData.map((d) => arcGenerator(d));

    d3.select("#pie-chart").selectAll("*").remove();
    arcs.forEach((arc, idx) => {
        d3.select("#pie-chart")
            .append("path")
            .attr("d", arc)
            .attr("fill", colors(idx));
    });

    legend.html("");
    data.forEach((d, idx) => {
        legend.append("li")
            .attr("style", `--color:${colors(idx)}`)
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });

    attachPieChartEventListeners();
});