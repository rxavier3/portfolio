
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');


const projectsCount = projects.length;

const projectsTitle = document.querySelector('.projects-title');

// Update the text content of the projects title with the count
if (projectsTitle) {
    projectsTitle.textContent = `${projectsCount} Projects`;
}

function renderProjects(projects, container, headerTag) {
    container.innerHTML = ''; // Clear existing content

    projects.forEach(project => {
        // Create project item element
        const projectElement = document.createElement('div');
        projectElement.classList.add('project-item');
        
        // Create and append the project title
        const projectTitle = document.createElement(headerTag);
        projectTitle.textContent = project.title;
        projectElement.appendChild(projectTitle);

        // Create a new div to wrap both the description and the year
        const projectDetails = document.createElement('div');
        projectDetails.classList.add('project-details'); // Optional, for styling

        // Create and append the project description
        const projectDescription = document.createElement('p');
        projectDescription.textContent = project.description;
        projectDetails.appendChild(projectDescription);

        // Create and append the project year
        const projectYear = document.createElement('p');
        projectYear.textContent = `Year: ${project.year}`;
        projectYear.classList.add('project-year');  // Optional, for styling
        projectDetails.appendChild(projectYear);

        // Append the details div to the project element
        projectElement.appendChild(projectDetails);

        // Append the project element to the container
        container.appendChild(projectElement);
    });
}
