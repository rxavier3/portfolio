console.log('IT’S ALIVE!');

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }

// let navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
//   );

// currentLink?.classList.add('current');
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
        Theme:
        <select>
          <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    `
  );

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'https://github.com/rxavier3/portfolio', title: 'GitHub' },
    { url: 'Resume/', title: 'Resume/CV' },
    { url: 'meta/', title: 'Meta'},
  ];
const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );
    
    if (a.host !== location.host) {
        a.target = "_blank";
    }
    nav.append(a);  
  }
  const select = document.querySelector('.color-scheme select');

  select.addEventListener('input', function(event) {
      document.documentElement.style.setProperty('color-scheme', event.target.value);
      localStorage.colorScheme = event.target.value;
  });
  
  if ("colorScheme" in localStorage) {
      const savedScheme = localStorage.colorScheme;
      document.documentElement.style.setProperty('color-scheme', savedScheme);
      select.value = savedScheme;
  }

export async function fetchJSON(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
    }
}
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = ''; // Clear the container first

  projects.forEach(project => {
      const article = document.createElement('article');
      article.innerHTML = `
          <${headingLevel}>${project.title}</${headingLevel}>
          <img src="${project.image}" alt="${project.title}">
          <div class = "project-details">

            <p>${project.description}</p>
            <p class = "project-year">${project.year}</p>
          </div>
      `;
      containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  try {
    // Fetch data from GitHub API
    const response = await fetch(`https://api.github.com/users/${username}`);
    
    // If the response is not OK, throw an error
    if (!response.ok) {
      throw new Error(`Failed to fetch GitHub data for ${username}: ${response.statusText}`);
    }
    
    // Parse the response as JSON and return the data
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing GitHub data:', error);
  }
}

