const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const logoExpanded = document.getElementById('logo-expanded');
const logoCollapsed = document.getElementById('logo-collapsed');
let isSidebarOpen = false;

const navItems = [
  ['M3 12l2-2 4 4 2-2 4 4 2-2', 'Home', '/'],
  ['M19 19V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14l5-2 5 2 5-2 5 2z', 'Chat', '/chat/get'],
  ['M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2', 'Draft idea', '/draft'],
  ['M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z', 'Your work', '/work'],
  ['M12 20a8 8 0 100-16 8 8 0 000 16zM12 12V6', 'Visualizations', '/graph'],
  ['M6 4v16M18 4v16M6 8h12M6 16h12', 'Storyline', '/storyline'],
];

// Sidebar Functions
function setNavTextVisibility(show) {
  const navTextElements = sidebar.querySelectorAll('.nav-item span');
  navTextElements.forEach(el => {
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}

function updateSidebarState(open) {
  if (open) {
    sidebar.classList.remove('w-20');
    sidebar.classList.add('w-64');
    logoCollapsed.classList.add('hidden');
    logoExpanded.classList.remove('hidden');
    setNavTextVisibility(true);
  } else {
    sidebar.classList.remove('w-64');
    sidebar.classList.add('w-20');
    logoExpanded.classList.add('hidden');
    logoCollapsed.classList.remove('hidden');
    setNavTextVisibility(false);
  }
  isSidebarOpen = open;
}

function toggleSidebar() {
  updateSidebarState(!isSidebarOpen);
}

// Generate Nav Links
function generateNavigationLinks() {
  const navContainer = document.getElementById('nav-links');
  navContainer.innerHTML = '';

  navItems.forEach(([path, name, url]) => {
    const item = document.createElement('a');
    item.href = url;
    item.className = 'nav-item flex items-center h-12 py-2 px-3 text-white hover:bg-blue-600/30 transition duration-150 ease-in-out cursor-pointer rounded-r-full group';

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('class', 'nav-icon w-6 h-6 mr-0 lg:mr-4 transition-all duration-300 stroke-2 group-hover:text-blue-300');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('viewBox', '0 0 24 24');

    const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    iconPath.setAttribute('stroke-linecap', 'round');
    iconPath.setAttribute('stroke-linejoin', 'round');
    iconPath.setAttribute('d', path);

    svg.appendChild(iconPath);
    item.appendChild(svg);

    const text = document.createElement('span');
    text.textContent = name;
    text.className = 'hidden text-sm font-medium whitespace-nowrap';
    item.appendChild(text);

    navContainer.appendChild(item);
  });
}

// Search Engine Simulation
function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (!query) {
    resultsContainer.innerHTML = `<p class="text-gray-400 text-center">Please enter something to search.</p>`;
    return;
  }

  // Dummy results for now
  const dummyResults = [
    { title: `Exploring ${query}`, desc: `Deep dive into ${query} in space context.` },
    { title: `${query} - Research Papers`, desc: `Collection of recent publications on ${query}.` },
    { title: `Visualizing ${query}`, desc: `Interactive models and visualizations related to ${query}.` }
  ];

  dummyResults.forEach(r => {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = `<h3 class="text-xl font-bold text-blue-300 mb-2">${r.title}</h3><p class="text-gray-300">${r.desc}</p>`;
    resultsContainer.appendChild(card);
  });
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  generateNavigationLinks();
  updateSidebarState(false); // Always start collapsed
});
