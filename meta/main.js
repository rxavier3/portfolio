const width = 1000;
const height = 600;

let data = []; // This will hold our CSV data
let commits = []; // This will store our processed commits data

// Set margins for the chart
const margin = { top: 10, right: 10, bottom: 30, left: 20 };

// Define usable area after margins
const usableArea = {
  top: margin.top,
  right: width - margin.right,
  bottom: height - margin.bottom,
  left: margin.left,
  width: width - margin.left - margin.right,
  height: height - margin.top - margin.bottom,
};
function brushSelector() {
    const svg = document.querySelector('svg');  // Select the SVG element
  
    // Apply the brush only if the SVG exists
    d3.select(svg)
      .call(d3.brush())
      .selectAll('.dots, .overlay ~ *')
      .raise();
  }
  
  


// Load CSV data (assumes 'loc.csv' is available)
async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: +row.line,
    depth: +row.depth,
    length: +row.length,
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  // Process commits
  processCommits();
  console.log(commits);

  displayStats();
  
  createScatterplot();
  brushSelector(); 
}

// Process commits into a usable format
function processCommits() {
  commits = d3
    .groups(data, (d) => d.commit)
    .map(([commit, lines]) => {
      let first = lines[0];
      let { author, date, time, timezone, datetime } = first;
      let ret = {
        id: commit,
        url: 'https://github.com/rxavier3/portfolio/commit/' + commit,
        author,
        date,
        time,
        timezone,
        datetime,
        hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
        totalLines: lines.length,
      };

      Object.defineProperty(ret, 'lines', {
        value: lines,
        configurable: false,
        writable: false,
        enumerable: false,
      });

      return ret;
    });
}


// Create the scatterplot
function createScatterplot() {
    const svg = d3
      .select('#chart')
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');
  
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([usableArea.left, usableArea.right])
      .nice();
  
    const yScale = d3
      .scaleLinear()
      .domain([0, 24])
      .range([usableArea.bottom, usableArea.top]);
  
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  
    const rScale = d3
      .scaleSqrt()
      .domain([minLines, maxLines])
      .range([5,50]); // Reduced max radius
  
    // Sort commits by total lines in descending order
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  
    // Add gridlines
    const gridlines = svg
      .append('g')
      .attr('class', 'gridlines')
      .attr('transform', `translate(${usableArea.left}, 0)`);
  
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
  
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
  
    svg
      .append('g')
      .attr('transform', `translate(0, ${usableArea.bottom})`)
      .call(xAxis);
  
    svg
      .append('g')
      .attr('transform', `translate(${usableArea.left}, 0)`)
      .call(yAxis);
  
    const dots = svg.append('g').attr('class', 'dots');
  
    dots
      .selectAll('circle')
      .data(sortedCommits)
      .join('circle')
      .attr('cx', (d) => xScale(d.datetime))
      .attr('cy', (d) => yScale(d.hourFrac))
      .attr('r', (d) => rScale(d.totalLines)) // Dot size mapped to lines edited
      .style('fill-opacity', 0.7)
      .on('mouseenter', function (event, d) {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        updateTooltipContent(d);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', function () {
        d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
        updateTooltipContent({});
        updateTooltipVisibility(false);
      });
  }
  
  

// Wait for DOMContentLoaded to load data and then initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});
function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
    time.textContent = commit.datetime?.toLocaleString('en', { timeStyle: 'short' });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX + 10}px`;  // Added offset to prevent overlap
    tooltip.style.top = `${event.clientY + 10}px`;
  }

  

  function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);
  
    // Calculate the number of unique files
    const uniqueFiles = d3.group(data, d => d.file);
    const numFiles = uniqueFiles.size;
  
    // Add number of files in the codebase
    dl.append('dt').text('Number of files in the codebase');
    dl.append('dd').text(numFiles);
    const maxFileLength = d3.max(data, (d) => d.length); // Maximum file length in lines
    dl.append('dt').text('Maximum file length (lines)');
    dl.append('dd').text(maxFileLength);

  // Add Longest Line Length
    const longestLine = d3.max(data, (d) => d.length); // Find longest line (in terms of characters)
    dl.append('dt').text('Longest line length (characters)');
    dl.append('dd').text(longestLine);
  }
  
  
  
  
