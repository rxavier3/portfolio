import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
const projects = await fetchJSON('lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');
const githubData = await fetchGitHubData('rxavier3');
if (githubData) {
    // Select the container element where the stats will be displayed
    const profileStats = document.querySelector('#profile-stats');

    if (profileStats) {
      // Dynamically update the content using template literals
      profileStats.innerHTML = `
        <dl>
          <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
          <dt>Followers:</dt><dd>${githubData.followers}</dd>
          <dt>Following:</dt><dd>${githubData.following}</dd>
          <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
        </dl>
        <p>View profile: <a href="${githubData.html_url}" target="_blank">GitHub Profile</a></p>
      `;
    } else {
      console.error('Element #profile-stats not found.');
    }
  
    const toggleButton = document.querySelector('.toggle-stats');
    toggleButton.addEventListener('click', () => {
        const isContentVisible = statsContent.style.display === 'block';
        statsContent.style.display = isContentVisible ? 'none' : 'block';
        toggleButton.textContent = isContentVisible ? 'Show Profile Stats' : 'Hide Profile Stats';
    });
  }else {
    console.error('Failed to fetch GitHub data.');
  }
  