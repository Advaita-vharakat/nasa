const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const logoExpanded = document.getElementById('logo-expanded');
const logoCollapsed = document.getElementById('logo-collapsed');
let isSidebarOpen = false;

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


  // Init
  document.addEventListener('DOMContentLoaded', () => {
    generateNavigationLinks();
    updateSidebarState(false); // Always start collapsed
  });

function fetchResults() {
  const query = document.getElementById('searchInput').value; // match your input id
  const resultsContainer = document.getElementById('results'); // match HTML section id
  resultsContainer.innerHTML = ''; // Clear previous results

  if (query.trim() === "") {
    resultsContainer.innerHTML = '<p class="no-results">Please enter a search term.</p>';
    return;
  }

  fetch(`/chat/search?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(data => {
      if (data.message) {
        resultsContainer.innerHTML = `<p class="no-results">${data.message}</p>`;
        return;
      }

      data.forEach(item => {
        const card = document.createElement('article');
        card.classList.add('result-card');

        // Add title, snippet, image or link
        let mediaContent = '';
        if (item.imageUrl) {
          mediaContent = `<a href="${item.url}" target="_blank" class="card-image-link">
                              <img src="${item.imageUrl}" alt="${item.title}" class="card-image">
                          </a>`;
        } else {
          const linkText = item.source === 'Wikipedia' ? 'View Page' : 'View Asset';
          mediaContent = `<a href="${item.url}" target="_blank" class="card-link">${linkText} &rarr;</a>`;
        }

        card.innerHTML = `
          <div class="card-header">
            <h2 class="card-title"><a href="${item.url}" target="_blank">${item.title}</a></h2>
            <span class="card-source">${item.source}</span>
          </div>
          <p class="card-snippet">${item.snippet}</p>
          ${mediaContent}
        `;

        resultsContainer.appendChild(card);
      });
    })
    .catch(err => {
      console.error("Error fetching search results:", err);
      resultsContainer.innerHTML = `<p class="no-results">Error fetching results.</p>`;
    });
}



