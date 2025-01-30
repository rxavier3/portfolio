import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

const projects = await fetchJSON('lib/projects.json');
const latestProjects = projects.slice(0, 3);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');

const githubData = await fetchGitHubData('rxavier3');
if (githubData) {
    const statsContent = document.querySelector('.stats-content');
    if (statsContent) {
        // Update only the dd elements with new values
        statsContent.querySelector('.public-repos').textContent = githubData.public_repos;
        statsContent.querySelector('.followers').textContent = githubData.followers;
        statsContent.querySelector('.following').textContent = githubData.following;
        statsContent.querySelector('.public-gists').textContent = githubData.public_gists;
        
        const profileLink = statsContent.querySelector('.github-profile-link');
        if (profileLink) {
            profileLink.href = githubData.html_url;
        }

        const toggleButton = document.querySelector('.toggle-stats');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => {
                statsContent.classList.toggle('hidden');
                toggleButton.textContent = statsContent.classList.contains('hidden') 
                    ? 'Show Profile Stats' 
                    : 'Hide Profile Stats';
            });
        }
    } else {
        console.error('Stats content container not found.');
    }
} else {
    console.error('Failed to fetch GitHub data.');
}