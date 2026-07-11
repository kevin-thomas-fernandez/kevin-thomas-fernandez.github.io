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

// Highlights — one curated list in display order.
// Blend: me + group shots alternating, videos mixed among photos,
// Zipline items placed in their timeline position (newest first).
const highlightsItems = [
  // 2026 — Zipline first, then the rest (photos and videos mixed)
  { src: './assets/IMG_1422.mp4', caption: 'Zipline, Esparto, Sacramento , CA (2026)', type: 'video' },
  { src: './assets/Pictures%204_29_2026/Maintenance%20Dock%20at%20NestZ.jpeg', caption: 'Maintenance Dock at NestZ, Zipline (2026)' },
  { src: './assets/Pictures%204_29_2026/P2%20Zipline%20taking%20off%20from%20legacy%20portal.mp4', caption: 'P2 Zipline takeoff from legacy portal, Zipline (2026)', type: 'video' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 7.44.16 PM (6).jpeg', caption: 'Flight hangar at test facility (2026)' },
  { src: './assets/Pictures%204_29_2026/Zipline%20Lunch%20delivery.mp4', caption: 'Zipline lunch delivery (2026)', type: 'video' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 7.44.15 PM (2).jpeg', caption: 'Joby S4 eVTOL (2026)' },
  { src: './assets/Pictures%204_29_2026/View%20from%20Air%20Traffic%20Control%20tower%20at%20NestZ.mp4', caption: 'View from Air Traffic Control tower at NestZ (2026)', type: 'video' },
  { src: './assets/7_10_2026/Screenshot 2026-07-10 063607.png', caption: 'Taiwan-U.S. Drone Industry Business Visit & Exchange Program (2026)' },
  { src: './assets/7_10_2026/WhatsApp Video 2026-07-01 at 7.44.16 PM.mp4', caption: 'Joby eVTOL demo flight (2026)', type: 'video' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 7.44.15 PM (3).jpeg', caption: 'Inside the Joby S4 cabin (2026)' },
  { src: './assets/7_10_2026/Screenshot 2026-07-10 063714.png', caption: 'Taiwan-U.S. Drone Industry Exchange, Intrinsic (2026)' },
  { src: './assets/7_10_2026/WhatsApp Video 2026-07-01 at 7.44.16 PM (1).mp4', caption: 'Robot dog at test facility (2026)', type: 'video' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 7.44.16 PM (5).jpeg', caption: 'Pivotal aircraft (2026)' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 7.44.16 PM.jpeg', caption: 'Joby "Dream of Flight" postcard, flown on a Joby test flight (2026)' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 7.44.15 PM (4).jpeg', caption: 'With the Joby team (2026)' },
  { src: './assets/7_10_2026/Screenshot 2026-07-10 063629.png', caption: 'Startup Island Taiwan pitch session (2026)' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 7.44.15 PM (1).jpeg', caption: 'Y Combinator, San Francisco (2026)' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 7.44.16 PM (3).jpeg', caption: 'Group discussion at Intrinsic (2026)' },
  { src: './assets/AUVSI NC.jpg', caption: 'AUVSI NC advanced mobility symposiym (2026)' },
  { src: './assets/IMG_1239.png', caption: 'Ian Muceus, CTO , Firestorm, AUVSI NC advanced mobility symposiym (2026)' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 8.11.52 PM.jpeg', caption: 'Ferrari Challenge race paddock (2026)' },
  { src: './assets/7_10_2026/WhatsApp Image 2026-07-01 at 7.44.16 PM (4).jpeg', caption: 'Ulysses pitch, Startup Island Taiwan (2026)' },
  { src: './assets/IMG_1288.png', caption: 'Alison, Consultant at ASTM International, AUVSI NC advanced mobility symposiym (2026)' },
  { src: './assets/Pictures%204_29_2026/DJI%20test%20video.mp4', caption: 'DJI test flight (2026)', type: 'video' },
  { src: './assets/IMG_1290.png', caption: 'Host Team (Airavat, RTI, Nuair),AUVSI NC advanced mobility symposiym (2026)' },
  { src: './assets/IMG_1298.png', caption: 'Rob Knochenhauer, Director of Regulatory Affairs, Censys Technologies, AUVSI NC advanced mobility symposiym (2026)' },
  { src: './assets/IMG_1153.png', caption: 'NASA, Portable UTM, Freefly Alta, VABA Reception (2026) ' },
  { src: './assets/IMG_1163.png', caption: 'VABA Reception (2026)' },
  { src: './assets/Wing_and_tombo.png', caption: 'Tombo Jones, Director of Mid-Atlantic Aviation Partnership (MAAP),VABA Reception (2026)' },
  { src: './assets/John_coggins.png', caption: 'John Coggin, Associate Director of Mid-Atlantic Aviation Partnership (MAAP),VABA Reception (2026)' },
  // 2025
  { src: './assets/WhatsApp Image 2025-05-25 at 15.38.00_cd04e5aa.jpg', caption: 'Graduation, Lane Hall, Virginia Tech (2025)' },
  { src: './assets/IMG-20250610-WA0004.jpg', caption: 'Wisk 6th Generation Aircraft, Houston Xponential (2025)' },
  { src: './assets/HOUSTON XPO.jpg', caption: 'XPONENTIAL Conference Materials, Houston, TX (2025)' },
  { src: './assets/AUVSI Ridge Valley Chapter.jpg', caption: 'AUVSI Roundtable Discussion (2025)' },
  { src: './assets/Michal oborne, inventor of Mission Planner.jpg', caption: 'Michael Oborne, inventor of Mission Planner (2025)' },
  { src: './assets/Electra EL2.jpg', caption: 'ELECTRA EL2 Aircraft, Virginia Tech (2025)' },
  { src: './assets/WhatsApp Image 2025-05-18 at 22.08.46_650b9d9d.jpg', caption: 'Graduation Ceremony, Cassell Coliseum , Virginia Tech (2025)' },
  { src: './assets/IMG_1105.jpg', caption: 'DJI Mini 4K (2025)' },
  // 2024
  { src: './assets/Poster.png', caption: 'Supercooled Droplet Research, Virginia Tech (2024)' },
  { src: './assets/AAM Stakeholder Reception.png', caption: 'AAM Stakeholder Reception (2024)' },
  { src: './assets/Winning.png', caption: 'CREATe Poster Competion First Place Win, McBryde 660, Virginia Tech (2024)' },
  // 2023 and earlier / undated
  { src: './assets/IMG_20250118_192034.jpg', caption: 'APS conference, Washington DC, (2023)' },
  { src: './assets/Eileen Collins.jpg', caption: 'Eileen Collins, NASA Astronaut' },
  { src: './assets/Hokie Bird.jpg', caption: 'Virginia Tech Hokie Bird Mascot' },
  { src: './assets/IMG_1060.jpg', caption: 'Setup' },
  { src: './assets/EmceeTeam.jpg', caption: 'The Emcee Team, Dayananda Sagar Institutions (2019)' },
];

function initializeHighlightsGrid() {
  const gridContainer = document.getElementById('highlights-grid-content');
  if (!gridContainer) return;

  // Rendered exactly in the curated order defined above
  const ordered = highlightsItems.map(i => ({ ...i, type: i.type || 'image' }));

  gridContainer.innerHTML = '';
  ordered.forEach(entry => {
    const item = document.createElement('div');
    item.className = 'highlights-grid-item';
    if (entry.type === 'video') {
      const videoEl = document.createElement('video');
      videoEl.controls = true;
      videoEl.preload = 'metadata';
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.title = entry.caption;
      const source = document.createElement('source');
      source.src = entry.src;
      source.type = entry.src.endsWith('.mp4') ? 'video/mp4' : 'video/quicktime';
      videoEl.appendChild(source);
      const caption = document.createElement('p');
      caption.className = 'highlights-caption';
      caption.textContent = entry.caption;
      item.appendChild(videoEl);
      item.appendChild(caption);
    } else {
      const img = document.createElement('img');
      img.src = entry.src;
      img.alt = entry.caption;
      img.title = entry.caption;
      img.onclick = () => openImageModal(entry.src);
      const caption = document.createElement('p');
      caption.className = 'highlights-caption';
      caption.textContent = entry.caption;
      item.appendChild(img);
      item.appendChild(caption);
    }
    gridContainer.appendChild(item);
  });
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
