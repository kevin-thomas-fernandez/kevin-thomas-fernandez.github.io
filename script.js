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

// Spotlight Gallery Images
const galleryImages = [
  { src: './assets/WhatsApp Image 2025-05-25 at 15.38.00_cd04e5aa.jpg', caption: 'Graduation, Lane Hall, Virginia Tech (2025)' },
  { src: './assets/Winning.png', caption: 'CREATe Poster Competion First Place Win, McBryde 660, Virginia Tech (2024)' },
  { src: './assets/Poster.png', caption: 'Supercooled Droplet Research, Virginia Tech (2024)' },
  { src: './assets/IMG-20250610-WA0004.jpg', caption: 'Wisk 6th Generation Aircraft, Houston Xponential (2025)' },
  { src: './assets/HOUSTON XPO.jpg', caption: 'XPONENTIAL Conference Materials, Houston, TX (2025)' },
  { src: './assets/AAM Stakeholder Reception.png', caption: 'AAM Stakeholder Reception' },
  { src: './assets/AUVSI Ridge Valley Chapter.jpg', caption: 'AUVSI Roundtable Discussion' },
  { src: './assets/Michal oborne, inventor of Mission Planner.jpg', caption: 'Conference Presentation' },
  { src: './assets/Electra EL2.jpg', caption: 'ELECTRA EL2 Aircraft, Virginia Tech' },
  { src: './assets/Hokie Bird.jpg', caption: 'Virginia Tech Hokie Bird Mascot' },
  { src: './assets/EmceeTeam.jpg', caption: 'The Emcee Team, Dayananda Sagar Institutions (2019)' },
  { src: './assets/WhatsApp Image 2025-05-18 at 22.08.46_650b9d9d.jpg', caption: 'Graduation Ceremony, Cassell Coliseum , Virginia Tech (2025)' }, 
  { src: './assets/IMG_20250118_192034.jpg', caption: 'Research Setup Image' },
];

// Video data
const galleryVideos = [
  { src: './assets/Coherent.mp4', caption: 'Coherent Flow Analysis showing Large Eddy\'s forming at the center of a Mach 1.5 time-resolved supersonic jet planar axial Velocity data' },
  { src: './assets/uuCorr.mp4', caption: 'Velocity Correlation Analysis using Taylor Microscale (λ) = 0.0557 mm a Mach 1.5 time-resolved supersonic jet planar axial Velocity data' },
  { src: './assets/Media1.mp4', caption: '4mm ambient water droplet, dropped at a height (∆d) of ~7 cm onto a Laser Etched Aluminum at -5°C' },
  { src: './assets/Media2.mp4', caption: 'PZT induced Vibration at 30KHz shown using ABAQUS' },
  { src: './assets/Carbon black_C1S0001.mp4', caption: 'Carbon Black superhydrophobic Fabrication' },
];

// Image data
const galleryImageItems = [
  { src: './assets/Box_Assembly_v32.JPG', caption: 'Protoype Supercooling Box - Generation 2' },
  { src: './assets/Picture2.png', caption: 'Effect of superhydrophobic on impact dynamics of water droplet' },
  { src: './assets/Pipe edge support.SLDPRT.PNG', caption: 'Custom designed supports for supercooling chamber pipes that were 3D printed' },
  { src: './assets/counter.png', caption: 'Pressure Contour for blended wing Tri-copter' },
  { src: './assets/Picture1.png', caption: 'Anti-icing Drop test setup' },
  { src: './assets/Laser holder.PNG', caption: 'Custom laser holder design for delay generator trigger setup' },
  { src: './assets/2.svg', caption: 'Laser Vibromete Study Setup' },
  { src: './assets/Optical Microscope Imaging.png', caption: 'Optical Microscope Imaging' },
  { src: './assets/Plate base with plate holder.PNG', caption: 'Six-plate mounting base for laser vibrometry testing' },
];

function initializeSpotlightScroll() {
  const contentContainer = document.getElementById('spotlight-scroll-content');
  const duplicateContainer = document.getElementById('spotlight-scroll-content-duplicate');
  
  if (!contentContainer || !duplicateContainer) return;
  
  // Clear existing content
  contentContainer.innerHTML = '';
  duplicateContainer.innerHTML = '';
  
  // Create image elements for original
  galleryImages.forEach(image => {
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.caption;
    img.title = image.caption;
    img.onclick = () => openImageModal(image.src);
    contentContainer.appendChild(img);
  });
  
  // Duplicate for seamless loop
  galleryImages.forEach(image => {
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.caption;
    img.title = image.caption;
    img.onclick = () => openImageModal(image.src);
    duplicateContainer.appendChild(img);
  });
}

function initializeVideosScroll() {
  const contentContainer = document.getElementById('videos-scroll-content');
  const duplicateContainer = document.getElementById('videos-scroll-content-duplicate');
  
  if (!contentContainer || !duplicateContainer) return;
  
  // Clear existing content
  contentContainer.innerHTML = '';
  duplicateContainer.innerHTML = '';
  
  // Create video elements for original
  galleryVideos.forEach(video => {
    const videoWrapper = document.createElement('div');
    videoWrapper.style.width = '400px';
    videoWrapper.style.flexShrink = '0';
    videoWrapper.style.display = 'flex';
    videoWrapper.style.flexDirection = 'column';
    
    const videoEl = document.createElement('video');
    videoEl.controls = true;
    videoEl.preload = 'metadata';
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.title = video.caption;
    videoEl.style.width = '400px';
    videoEl.style.height = '300px';
    videoEl.style.objectFit = 'cover';
    videoEl.style.borderRadius = '8px';
    videoEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    videoEl.style.display = 'block';
    
    const source = document.createElement('source');
    source.src = video.src;
    source.type = 'video/mp4';
    videoEl.appendChild(source);
    
    videoWrapper.appendChild(videoEl);
    contentContainer.appendChild(videoWrapper);
  });
  
  // Duplicate for seamless loop
  galleryVideos.forEach(video => {
    const videoWrapper = document.createElement('div');
    videoWrapper.style.width = '400px';
    videoWrapper.style.flexShrink = '0';
    videoWrapper.style.display = 'flex';
    videoWrapper.style.flexDirection = 'column';
    
    const videoEl = document.createElement('video');
    videoEl.controls = true;
    videoEl.preload = 'metadata';
    videoEl.muted = true;
    videoEl.playsInline = true;
    videoEl.title = video.caption;
    videoEl.style.width = '400px';
    videoEl.style.height = '300px';
    videoEl.style.objectFit = 'cover';
    videoEl.style.borderRadius = '8px';
    videoEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    videoEl.style.display = 'block';
    
    const source = document.createElement('source');
    source.src = video.src;
    source.type = 'video/mp4';
    videoEl.appendChild(source);
    
    videoWrapper.appendChild(videoEl);
    duplicateContainer.appendChild(videoWrapper);
  });
}

function initializeImagesScroll() {
  const contentContainer = document.getElementById('images-scroll-content');
  const duplicateContainer = document.getElementById('images-scroll-content-duplicate');
  
  if (!contentContainer || !duplicateContainer) return;
  
  // Clear existing content
  contentContainer.innerHTML = '';
  duplicateContainer.innerHTML = '';
  
  // Create image elements for original
  galleryImageItems.forEach(image => {
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.caption;
    img.title = image.caption;
    img.onclick = () => openImageModal(image.src);
    contentContainer.appendChild(img);
  });
  
  // Duplicate for seamless loop
  galleryImageItems.forEach(image => {
    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.caption;
    img.title = image.caption;
    img.onclick = () => openImageModal(image.src);
    duplicateContainer.appendChild(img);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  initializeSpotlightScroll();
  initializeVideosScroll();
  initializeImagesScroll();
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
