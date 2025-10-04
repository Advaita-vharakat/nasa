// ===== Sidebar + Nav + Fact script (replace your previous script) =====

const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('main-content');
const logoExpanded = document.getElementById('logo-expanded');
const logoCollapsed = document.getElementById('logo-collapsed');
let isSidebarOpen = window.innerWidth >= 1024; // desktop starts open
const navbar = document.getElementById("navbar");

if (window.top !== window.self) {
      window.top.location = window.location.href;
    }

const authBtn = document.getElementById('auth-btn');

async function checkAuth() {
    try {
        const res = await fetch('/user/me');
        const data = await res.json();

        if (data.loggedIn) {
            authBtn.textContent = 'Logout';
            authBtn.onclick = handleLogout;
        } else {
            authBtn.textContent = 'Login';
            authBtn.onclick = () => window.location.href = '/user/login';
        }
    } catch (err) {
        console.error(err);
        authBtn.textContent = 'Login';
        authBtn.onclick = () => window.location.href = '/user/login';
    }
}

async function handleLogout() {
    try {
        await fetch('/user/logout', { method: 'POST' });
        window.location.reload();
    } catch (err) {
        console.error(err);
    }
}

window.onload = checkAuth;


const navItems = [
  ['M3 12l2-2 4 4 2-2 4 4 2-2', 'Home', '/home'],
  ['M19 19V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14l5-2 5 2 5-2 5 2z', 'Chat', '/chat/get'],
  ['M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2', 'Draft idea', '/draft'],
  ['M12 20a8 8 0 100-16 8 8 0 000 16zM12 12V6', 'Visualizations', '/graph'],
  ['M6 4v16M18 4v16M6 8h12M6 16h12', 'Storyline', '/storyline'],
];


function setNavTextVisibility(show) {
  const navTextElements = sidebar.querySelectorAll('.nav-item span');
  navTextElements.forEach(el => {
    if (show) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}


function updateSidebarState(open) {
  const isDesktop = window.innerWidth >= 1024;

  if (isDesktop) {
    // Desktop: we *do* shift the main content when sidebar expands/collapses
    if (open) {
      sidebar.classList.remove('w-20');
      sidebar.classList.add('w-64');
      mainContent.classList.remove('ml-20');
      mainContent.classList.add('ml-64');

      logoCollapsed.classList.add('hidden');
      logoExpanded.classList.remove('hidden');

      setNavTextVisibility(true);
    } else {
      sidebar.classList.remove('w-64');
      sidebar.classList.add('w-20');
      mainContent.classList.remove('ml-64');
      mainContent.classList.add('ml-20');

      logoExpanded.classList.add('hidden');
      logoCollapsed.classList.remove('hidden');

      setNavTextVisibility(false);
    }
  } else {
    if (open) {
      sidebar.classList.remove('w-20');
      sidebar.classList.add('w-64');
      sidebar.classList.add('z-40');

      logoCollapsed.classList.add('hidden');
      logoExpanded.classList.remove('hidden');

      setNavTextVisibility(true);
    } else {
      sidebar.classList.remove('w-64');
      sidebar.classList.add('w-20');
      sidebar.classList.remove('z-40');

      logoExpanded.classList.add('hidden');
      logoCollapsed.classList.remove('hidden');

      setNavTextVisibility(false);
    }
  }

  isSidebarOpen = open;
}


function toggleSidebar() {
  updateSidebarState(!isSidebarOpen);
}


async function displayRandomFact() {
  const factTextElement = document.getElementById("fact-text");
  const factImageElement = document.getElementById("fact-image");

  try {
    const response = await fetch(`/api/fact?ts=${Date.now()}`);
    const data = await response.json();

    factTextElement.textContent = data.fact;
    factImageElement.src = data.image_url || factImageElement.src;

  } catch (error) {
    console.error("Error fetching fact:", error);
    factTextElement.textContent = "Could not load fact.";
    factImageElement.src = "https://placehold.co/64x64/000/fff?text=Error";
  }
}


function generateNavigationLinks() {
    const navContainer = document.getElementById('nav-links');
    navContainer.innerHTML = '';

    navItems.forEach(([path, name, url]) => {
        const item = document.createElement('a');
        item.href = url; 
        item.className = 'nav-item flex items-center h-12 py-2 px-3 lg:px-6 text-white hover:bg-blue-600/30 transition duration-150 ease-in-out cursor-pointer rounded-r-full group';

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

        // Text
        const text = document.createElement('span');
        text.textContent = name;
        text.className = 'lg:inline hidden text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-300';
        item.appendChild(text);

        navContainer.appendChild(item);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    generateNavigationLinks();


    if (window.innerWidth < 1024) {
        updateSidebarState(false); // collapsed for small
    } else {
        updateSidebarState(true);  // expanded for large
    }

    displayRandomFact();
});

window.addEventListener('resize', () => {
    if (window.innerWidth < 1024 && isSidebarOpen) {
        updateSidebarState(false); // force collapse on mobile
    }
    if (window.innerWidth >= 1024 && !isSidebarOpen) {
        updateSidebarState(true); // force expand on desktop
    }
});