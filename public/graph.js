// Sidebar + Navigation (unchanged)
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const logoExpanded = document.getElementById('logo-expanded');
const logoCollapsed = document.getElementById('logo-collapsed');
let isSidebarOpen = window.innerWidth >= 1024;
if (window.top !== window.self) {
      window.top.location = window.location.href;
    }

const navItems = [
  ['M3 12l2-2 4 4 2-2 4 4 2-2', 'Home', '/home'],
  ['M19 19V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14l5-2 5 2 5-2 5 2z', 'Chat', '/chat/get'],
  ['M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2', 'Draft idea', '/draft'],
  ['M12 20a8 8 0 100-16 8 8 0 000 16zM12 12V6', 'Visualizations', '/graph'],
  ['M6 4v16M18 4v16M6 8h12M6 16h12', 'Storyline', '/storyline'],
];



function setNavTextVisibility(show) {
  sidebar.querySelectorAll('.nav-item span').forEach(el => show ? el.classList.remove('hidden') : el.classList.add('hidden'));
}

function updateSidebarState(open) {
  const isDesktop = window.innerWidth >= 1024;
  if (isDesktop) {
    if (open) {
      sidebar.classList.replace('w-20', 'w-64');
      mainContent.classList.replace('ml-20', 'ml-64');
      logoCollapsed.classList.add('hidden'); logoExpanded.classList.remove('hidden');
      setNavTextVisibility(true);
    } else {
      sidebar.classList.replace('w-64', 'w-20');
      mainContent.classList.replace('ml-64', 'ml-20');
      logoExpanded.classList.add('hidden'); logoCollapsed.classList.remove('hidden');
      setNavTextVisibility(false);
    }
  } else {
    if (open) {
      sidebar.classList.replace('w-20', 'w-64'); sidebar.classList.add('z-40');
      logoCollapsed.classList.add('hidden'); logoExpanded.classList.remove('hidden');
      setNavTextVisibility(true);
    } else {
      sidebar.classList.replace('w-64', 'w-20'); sidebar.classList.remove('z-40');
      logoExpanded.classList.add('hidden'); logoCollapsed.classList.remove('hidden');
      setNavTextVisibility(false);
    }
  }
  isSidebarOpen = open;
}

function toggleSidebar() { updateSidebarState(!isSidebarOpen); }

function generateNavigationLinks() {
  const navContainer = document.getElementById('nav-links');
  navContainer.innerHTML = '';
  navItems.forEach(([path, name, url]) => {
    const item = document.createElement('a'); item.href = url;
    item.className = 'nav-item flex items-center h-12 py-2 px-3 lg:px-6 text-white hover:bg-blue-600/30 transition duration-150 ease-in-out cursor-pointer rounded-r-full group';
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('class', 'nav-icon w-6 h-6 mr-0 lg:mr-4 transition-all duration-300 stroke-2 group-hover:text-blue-300');
    svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('viewBox', '0 0 24 24');
    const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    iconPath.setAttribute('stroke-linecap', 'round'); iconPath.setAttribute('stroke-linejoin', 'round'); iconPath.setAttribute('d', path);
    svg.appendChild(iconPath); item.appendChild(svg);
    const text = document.createElement('span'); text.textContent = name;
    text.className = 'lg:inline hidden text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-300';
    item.appendChild(text); navContainer.appendChild(item);
  });
}
async function fetchGraphs(query = '') {
  const container = document.getElementById('graphsContainer');
  container.innerHTML = ''; // clear existing

  try {
    const res = await fetch(`/graph/get?search=${encodeURIComponent(query)}`);
    const graphs = await res.json();

    graphs.forEach(graph => {
      const canvas = document.createElement('canvas');
      container.appendChild(canvas);

      new Chart(canvas, {
        type: graph.type,       // e.g., 'bar', 'line', 'pie'
        data: graph.data,       // { labels: [...], datasets: [...] }
        options: { responsive: true, maintainAspectRatio: false }
      });
    });
  } catch (err) {
    console.error('Error fetching graphs:', err);
  }
}
// Search on pressing the search button
document.getElementById('search-graph-btn').addEventListener('click', () => {
    const query = document.getElementById('graph-search').value.trim();
    fetchGraphs(query);
});


// Initial fetch
document.addEventListener('DOMContentLoaded', () => {
  fetchGraphs();
});

document.getElementById('generate-graph-btn').addEventListener('click', async (e) => {
  e.preventDefault(); // prevent anchor navigation

  const description = document.getElementById('graph-description').value.trim();
  if (!description) return alert('Please enter a graph description');

  try {
    const res = await fetch('/graph/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description }) // <-- send input as description
    });

    const newGraph = await res.json();

    // Render the new graph at the top
    const container = document.getElementById('graphsContainer');
    const canvas = document.createElement('canvas');
    container.prepend(canvas);

    new Chart(canvas, {
      type: newGraph.type,
      data: newGraph.data,
      options: { responsive: true, maintainAspectRatio: false }
    });

    // Clear input
    document.getElementById('graph-description').value = '';

  } catch (err) {
    console.error('Error generating graph:', err);
  }
});

document.getElementById('graph-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        fetchGraphs(query);
    }
});


document.addEventListener('DOMContentLoaded', () => {
  generateNavigationLinks();
  if (window.innerWidth < 1024) updateSidebarState(false); else updateSidebarState(true);
});

window.addEventListener('resize', () => {
  if (window.innerWidth < 1024 && isSidebarOpen) updateSidebarState(false);
  if (window.innerWidth >= 1024 && !isSidebarOpen) updateSidebarState(true);
});
