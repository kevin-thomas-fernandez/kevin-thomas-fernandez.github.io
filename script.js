function toggleMenu() {
  const menu = document.querySelector(".menu-links");
  const icon = document.querySelector(".hamburger-icon");
  menu.classList.toggle("open");
  icon.classList.toggle("open");
}

// Interactive Gallery Carousel
const galleryImages = [
  { src: './assets/windtunnel.png', caption: 'Virginia Tech Stability Wind Tunnel (2021)' },
  { src: './assets/Manufacturing.png', caption: 'V.S.T. Tillers Tractors Ltd, Production Floor (2022)' },
  { src: './assets/Winning.png', caption: 'CREATe Poster Competion First Place Win, McBryde 660, Virginia Tech (2024)' },
  { src: './assets/Poster.png', caption: 'Supercooled Droplet Research, Virginia Tech (2024)' },
  { src: './assets/IMG-20250610-WA0004.jpg', caption: 'Wisk 6th Generation Aircraft, Houston Xponential (2025)' },
  { src: './assets/EmceeTeam.jpg', caption: 'The Emcee Team, Dayananda Sagar Institutions (2019)' },
  { src: './assets/Windtunnel.jpg', caption: 'Particle Shadow Velocimetry study with Water Tunnel,GoodWin Hall, Virginia Tech(2024)' },
  { src: './assets/WhatsApp Image 2025-05-25 at 15.38.00_cd04e5aa.jpg', caption: 'Graduation, Lane Hall, Virginia Tech (2025)' },
  { src: './assets/WhatsApp Image 2025-05-18 at 22.08.46_650b9d9d.jpg', caption: 'Graduation Ceremony, Cassell Coliseum , Virginia Tech (2035' },
];
let currentGalleryIndex = 0;

function updateGallery() {
  const img = document.getElementById('carousel-image');
  const caption = document.getElementById('carousel-caption');
  if (img && caption) {
    img.src = galleryImages[currentGalleryIndex].src;
    img.alt = galleryImages[currentGalleryIndex].caption;
    caption.textContent = galleryImages[currentGalleryIndex].caption;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const leftBtn = document.getElementById('carousel-left');
  const rightBtn = document.getElementById('carousel-right');
  if (leftBtn && rightBtn) {
    leftBtn.addEventListener('click', function() {
      currentGalleryIndex = (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
      updateGallery();
    });
    rightBtn.addEventListener('click', function() {
      currentGalleryIndex = (currentGalleryIndex + 1) % galleryImages.length;
      updateGallery();
    });
  }
  updateGallery();
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
