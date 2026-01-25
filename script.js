/* ========================================================
   1. DOM ELEMENTS & VARIABLES
   ======================================================== */
const header = document.querySelector('.header');
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navLinks = document.querySelectorAll('.nav-link');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const preloader = document.getElementById('preloader');

/* ========================================================
   2. PRELOADER
   ======================================================== */
window.addEventListener('load', () => {
    // Artificial delay for smooth experience (optional)
    setTimeout(() => {
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        
        // Start animations after load
        initScrollReveal();
    }, 800);
});

/* ========================================================
   3. NAVIGATION MENU (MOBILE)
   ======================================================== */
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show-menu');
    });
}

if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
}

// Close menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show-menu');
    });
});

/* ========================================================
   4. STICKY HEADER & SCROLL SPY
   ======================================================== */
const sections = document.querySelectorAll('section[id]');

function scrollActive() {
    const scrollY = window.pageYOffset;

    // 1. Sticky Header
    if (scrollY >= 50) {
        header.classList.add('scroll-header');
    } else {
        header.classList.remove('scroll-header');
    }

    // 2. Scroll Spy (Active Link)
    sections.forEach(current => {
        const sectionHeight = current.offsetHeight;
        const sectionTop = current.offsetTop - 100; // Offset for header
        const sectionId = current.getAttribute('id');
        const scrollLink = document.querySelector('.nav-menu a[href*=' + sectionId + ']');

        if (scrollLink) {
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                scrollLink.classList.add('active-link');
            } else {
                scrollLink.classList.remove('active-link');
            }
        }
    });
}
window.addEventListener('scroll', scrollActive);

/* ========================================================
   5. THEME TOGGLE (DARK / LIGHT)
   ======================================================== */
// Colors for Canvas Animation based on theme
let canvasColors = [];

const lightThemeColors = ['#DD7A83', '#E3BFC3', '#FF9AA2']; // Pinks
const darkThemeColors = ['#DAD4B6', '#5C0120', '#3D0015']; // Khaki & Bordeaux

const selectedTheme = localStorage.getItem('selected-theme');

// Apply saved theme
if (selectedTheme) {
    document.documentElement.setAttribute('data-theme', selectedTheme);
    updateCanvasColors(selectedTheme === 'dark');
} else {
    // Default Light
    updateCanvasColors(false);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('selected-theme', newTheme);
    
    // Update Canvas Colors
    updateCanvasColors(newTheme === 'dark');
});

function updateCanvasColors(isDark) {
    canvasColors = isDark ? darkThemeColors : lightThemeColors;
}

/* ========================================================
   6. CUSTOM CURSOR
   ======================================================== */
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

// Mouse Movement
window.addEventListener('mousemove', (e) => {
    const posX = e.clientX;
    const posY = e.clientY;

    // Dot follows exactly
    cursorDot.style.left = `${posX}px`;
    cursorDot.style.top = `${posY}px`;

    // Outline follows with lag (animation logic below)
    cursorOutline.animate({
        left: `${posX}px`,
        top: `${posY}px`
    }, { duration: 500, fill: "forwards" });
});

// Hover Effect on clickable elements
const interactables = document.querySelectorAll('a, button, .project-card, input, textarea');

interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        body.classList.add('hovering');
    });
    el.addEventListener('mouseleave', () => {
        body.classList.remove('hovering');
    });
});

/* ========================================================
   7. SCROLL REVEAL ANIMATION (Intersection Observer)
   ======================================================== */
function initScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const elementsToReveal = document.querySelectorAll('.scroll-reveal');
    elementsToReveal.forEach(el => observer.observe(el));
}

/* ========================================================
   8. FLUID BACKGROUND ANIMATION (CANVAS)
   ======================================================== */
const canvas = document.getElementById('fluid-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

// Resize Canvas
function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Particle Class (The floating blobs)
class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.5; // Velocity X
        this.vy = (Math.random() - 0.5) * 0.5; // Velocity Y
        this.radius = Math.random() * 150 + 100; // Large blobs
        // Pick random color from current palette
        this.color = canvasColors[Math.floor(Math.random() * canvasColors.length)];
        this.alpha = Math.random() * 0.3 + 0.1; // Transparency
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < -this.radius || this.x > width + this.radius) this.vx *= -1;
        if (this.y < -this.radius || this.y > height + this.radius) this.vy *= -1;
        
        // Dynamic color update (smooth transition is hard in vanilla without complex logic, 
        // so we just re-assign color on reset or keep current logic simple)
        // Checks if palette changed significantly (simple check)
        if (!canvasColors.includes(this.color) && Math.random() < 0.01) {
             this.color = canvasColors[Math.floor(Math.random() * canvasColors.length)];
        }
    }

    draw() {
        ctx.beginPath();
        // Create radial gradient for soft edges
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
        
        // Convert hex to rgb for alpha handling
        g.addColorStop(0, hexToRgba(this.color, this.alpha));
        g.addColorStop(1, hexToRgba(this.color, 0));

        ctx.fillStyle = g;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Helper: Hex to RGBA
function hexToRgba(hex, alpha) {
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Initialize Particles
function initParticles() {
    particles = [];
    const particleCount = window.innerWidth < 768 ? 6 : 12; // Fewer on mobile
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}
initParticles();

// Animation Loop
function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Optional: Global Composite Operation for blending effect
    // 'screen' or 'overlay' works well for light modes, but 'source-over' is safer for mixed themes
    ctx.globalCompositeOperation = 'source-over';

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}
animate();

// Re-init particles on drastic resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resize();
        initParticles();
    }, 200);
});

/* ========================================================
   9. CONTACT FORM HANDLING
   ======================================================== */
contactForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector("button");
  const original = btn.innerHTML;
  btn.innerHTML = "Sending...";
  btn.disabled = true;

  const formData = new FormData(contactForm);

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData
  });

  const result = await response.json();

  if (result.success) {
    btn.innerHTML = "Message Sent!";
    contactForm.reset();
  } else {
    btn.innerHTML = "Error!";
  }

  setTimeout(() => {
    btn.innerHTML = original;
    btn.disabled = false;
  }, 3000);
});
