function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  const body = document.body;
  
  if (menu && icon) {
    const isOpen = menu.classList.contains("open");
    menu.classList.toggle("open");
    icon.classList.toggle("open");
    
    // Add/remove backdrop
    if (!isOpen) {
      body.classList.add("menu-open");
    } else {
      body.classList.remove("menu-open");
    }
  }
}

function closeMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  const body = document.body;
  
  if (menu && icon) {
    menu.classList.remove("open");
    icon.classList.remove("open");
    body.classList.remove("menu-open");
  }
}

// Close menu when clicking outside or on backdrop
document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(event) {
    const hamburgerNav = document.getElementById('hamburger-nav');
    const menu = document.querySelector(".menu-links");
    const icon = document.querySelector(".hamburger-icon");
    
    if (hamburgerNav && menu && icon && menu.classList.contains('open')) {
      // Check if click is outside the hamburger menu area
      const clickedInsideMenu = hamburgerNav.contains(event.target);
      const clickedOnMenuLink = event.target.closest('.menu-links');
      
      if (!clickedInsideMenu && !clickedOnMenuLink) {
        closeMenu();
      }
    }
  });
  
  // Prevent body scroll when menu is open
  const body = document.body;
  const observer = new MutationObserver(function(mutations) {
    if (body.classList.contains('menu-open')) {
      body.style.overflow = 'hidden';
    } else {
      body.style.overflow = '';
    }
  });
  
  observer.observe(body, {
    attributes: true,
    attributeFilter: ['class']
  });
});

// Highlights: the list lives in highlights-data.js (window.HIGHLIGHTS).
// Edit that file by hand, or use the Edit photos button when the site runs
// locally with start-site.bat. editor.js draws the grid.
function initializeHighlightsGrid() {
  const gridContainer = document.getElementById('highlights-grid-content');
  if (!gridContainer || !window.PhotoEditor) return;
  window.PhotoEditor.mount(gridContainer, { name: 'highlights', global: 'HIGHLIGHTS', variant: 'grid', addAt: 'start' });
}

document.addEventListener('DOMContentLoaded', function() {
  initializeHighlightsGrid();
});


// Discord Invite Form Handler

const discordForm = document.getElementById('discord-invite-form');
if (discordForm) {
  discordForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // Show success message
    const successDiv = document.getElementById('discord-invite-success');
    if (successDiv) successDiv.style.display = 'block';
    // Clear form fields
    discordForm.reset();
    // Optionally, hide the message after a few seconds
    setTimeout(() => {
      if (successDiv) successDiv.style.display = 'none';
    }, 5000);
  });
}
