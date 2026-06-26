/* =============================================
   VITA PREMIUM COWORKING — script.js
   Advanced Interactions & Animations
   ============================================= */

"use strict";

/* =========================================
   1. LENIS — Smooth Scroll
   ========================================= */
const lenis = new Lenis({
  duration: 1.3,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1,
  touchMultiplier: 2,
});

// Use ONLY gsap.ticker to drive Lenis (avoids double RAF bug)
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);


/* =========================================
   2. LOADING SCREEN
   ========================================= */
const loader = document.getElementById('loader');
const loaderProgress = document.getElementById('loaderProgress');

let progress = 0;
const progressInterval = setInterval(() => {
  progress += Math.random() * 15;
  if (progress >= 100) {
    progress = 100;
    clearInterval(progressInterval);
    setTimeout(hideLoader, 300);
  }
  loaderProgress.style.width = progress + '%';
}, 80);

function hideLoader() {
  gsap.to(loader, {
    opacity: 0,
    duration: 0.8,
    ease: 'power2.inOut',
    onComplete: () => {
      loader.style.display = 'none';
      initAnimations();
    }
  });
}

function initAnimations() {
  revealHeroText();
  initScrollAnimations();
  initParallax();
}


/* =========================================
   3. THREE.JS — Hero Particle Background
   ========================================= */
(function initThreeJS() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 4;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Reduce particles on mobile for performance
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const particleCount = isMobile ? 600 : 1800;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const copperColor = new THREE.Color(0xc8814a);
  const goldColor = new THREE.Color(0xd4a853);
  const whiteColor = new THREE.Color(0xf5f0eb);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    const rand = Math.random();
    const col = rand < 0.4 ? copperColor : rand < 0.7 ? goldColor : whiteColor;
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // Mouse tracking
  let mouseX = 0, mouseY = 0;
  let targetX = 0, targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Animation loop
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    particles.rotation.y = elapsed * 0.04 + targetX * 0.3;
    particles.rotation.x = elapsed * 0.02 - targetY * 0.2;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();


/* =========================================
   4. CUSTOM CURSOR
   ========================================= */
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;
  if (window.matchMedia('(pointer: coarse)').matches) {
    cursor.style.display = 'none';
    follower.style.display = 'none';
    document.body.style.cursor = 'auto';
    return;
  }

  let cx = -100, cy = -100;
  let fx = -100, fy = -100;

  window.addEventListener('mousemove', (e) => {
    cx = e.clientX;
    cy = e.clientY;
  });

  function animateCursor() {
    fx += (cx - fx) * 0.12;
    fy += (cy - fy) * 0.12;

    cursor.style.left = cx + 'px';
    cursor.style.top  = cy + 'px';
    follower.style.left = fx + 'px';
    follower.style.top  = fy + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const interactables = document.querySelectorAll('a, button, .service-card, .gallery-item, .social-link, select');
  interactables.forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();


/* =========================================
   5. MAGNETIC BUTTONS
   ========================================= */
(function initMagnetic() {
  const magneticEls = document.querySelectorAll('.magnetic');
  magneticEls.forEach(el => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      gsap.to(el, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
    });
  });
})();


/* =========================================
   6. HEADER — Scroll Behavior
   ========================================= */
(function initHeader() {
  const header = document.getElementById('header');
  ScrollTrigger.create({
    start: 80,
    onEnter: () => header.classList.add('scrolled'),
    onLeaveBack: () => header.classList.remove('scrolled'),
  });
})();


/* =========================================
   7. MOBILE MENU
   ========================================= */
(function initMobileMenu() {
  const toggle = document.getElementById('menuToggle');
  const menu   = document.getElementById('mobileMenu');
  const links  = menu.querySelectorAll('a');

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.classList.toggle('active');
    toggle.setAttribute('aria-expanded', open);
    lenis[open ? 'stop' : 'start']();
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', false);
      lenis.start();
    });
  });
})();


/* =========================================
   8. HERO TEXT REVEAL (GSAP SplitText)
   ========================================= */
function revealHeroText() {
  const words = document.querySelectorAll('.hero-title .word');
  gsap.to(words, {
    y: '0%',
    duration: 1.0,
    ease: 'expo.out',
    stagger: 0.08,
    delay: 0.2,
  });

  // Fade-in elements
  const revealEls = document.querySelectorAll('.hero-content .reveal-up');
  revealEls.forEach((el, i) => {
    const delay = parseFloat(el.dataset.delay || 0);
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.4 + delay,
    });
  });

  // Hero image
  gsap.fromTo('.hero-image-frame',
    { opacity: 0, scale: 0.95, y: 40 },
    { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: 'expo.out', delay: 0.5 }
  );

  gsap.fromTo('.hero-float-card',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out', delay: 1.2 }
  );

  gsap.fromTo('.scroll-indicator',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 1.5 }
  );
}


/* =========================================
   9. ON-SCROLL ANIMATIONS
   ========================================= */
function initScrollAnimations() {
  // Generic reveal-up
  const reveals = document.querySelectorAll('.reveal-up');
  reveals.forEach(el => {
    const delay = parseFloat(el.dataset.delay || 0);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: delay,
          ease: 'power3.out',
        });
      }
    });
  });

  // Service cards staggered
  const serviceCards = document.querySelectorAll('.service-card');
  ScrollTrigger.create({
    trigger: '.services-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.fromTo(serviceCards,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out'
        }
      );
    }
  });

  // Gallery items
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, y: 50, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 90%',
          once: true,
        },
        delay: (i % 3) * 0.1
      }
    );
  });

  // Testimonials
  const testimonials = document.querySelectorAll('.testimonial-card');
  ScrollTrigger.create({
    trigger: '.testimonials-grid',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.fromTo(testimonials,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
      );
    }
  });

  // About visual
  gsap.fromTo('.about-img-main',
    { opacity: 0, x: -60 },
    {
      opacity: 1,
      x: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.about-visual', start: 'top 80%', once: true }
    }
  );
  gsap.fromTo('.about-img-secondary',
    { opacity: 0, x: 60, y: 40 },
    {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 1.0,
      delay: 0.2,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.about-visual', start: 'top 80%', once: true }
    }
  );
  gsap.fromTo('.about-float-stat',
    { opacity: 0, scale: 0.8 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.7,
      delay: 0.4,
      ease: 'back.out(1.7)',
      scrollTrigger: { trigger: '.about-visual', start: 'top 75%', once: true }
    }
  );

  // Counter animation for about stat
  ScrollTrigger.create({
    trigger: '.about-float-stat',
    start: 'top 85%',
    once: true,
    onEnter: () => {
      const numEl = document.querySelector('.float-number');
      if (!numEl) return;
      let count = 0;
      const target = 500;
      const dur = 1500;
      const step = target / (dur / 16);
      const interval = setInterval(() => {
        count += step;
        if (count >= target) { count = target; clearInterval(interval); }
        numEl.textContent = Math.floor(count) + '+';
      }, 16);
    }
  });

  // Value items stagger
  const valueItems = document.querySelectorAll('.value-item');
  ScrollTrigger.create({
    trigger: '.about-values',
    start: 'top 80%',
    once: true,
    onEnter: () => {
      gsap.fromTo(valueItems,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }
      );
    }
  });
}


/* =========================================
   10. PARALLAX EFFECTS
   ========================================= */
function initParallax() {
  // Hero image parallax
  ScrollTrigger.create({
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      const heroImgContainer = document.querySelector('.hero-image-container');
      if (heroImgContainer) {
        gsap.set(heroImgContainer, { y: self.progress * 80 });
      }
    }
  });

  // Gallery items parallax
  const galleryItems = document.querySelectorAll('.gallery-item[data-speed]');
  galleryItems.forEach(item => {
    const speed = parseFloat(item.dataset.speed || 0);
    gsap.to(item, {
      y: speed * 200,
      ease: 'none',
      scrollTrigger: {
        trigger: '.gallery-track',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  });

  // About visual parallax
  const aboutEl = document.querySelector('.about-inner .about-visual');
  if (aboutEl) {
    gsap.to(aboutEl, {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: '.about',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  // Marquee speed on scroll — only on non-touch
  if (!window.matchMedia('(pointer: coarse)').matches) {
    lenis.on('scroll', ({ velocity }) => {
      const track = document.querySelector('.marquee-content');
      if (track) {
        const speed = 1 + Math.abs(velocity) * 0.5;
        track.style.animationDuration = (30 / speed) + 's';
      }
    });
  }
}


/* =========================================
   11. HOVER IMAGE DISTORTION EFFECT (Cards)
   ========================================= */
(function initImageHover() {
  // Skip tilt/distort on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const cards = document.querySelectorAll('.service-card .card-img-wrap');
  cards.forEach(wrap => {
    const img = wrap.querySelector('img');
    if (!img) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 14;
      gsap.to(img, { x, y, scale: 1.08, duration: 0.4, ease: 'power2.out' });
    });

    wrap.addEventListener('mouseleave', () => {
      gsap.to(img, { x: 0, y: 0, scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
    });
  });
})();


/* =========================================
   12. GALLERY HOVER TILT
   ========================================= */
(function initGalleryTilt() {
  // Skip tilt on touch devices
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    item.addEventListener('mousemove', (e) => {
      const rect = item.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 10;
      gsap.to(item, {
        rotateX: -y,
        rotateY: x,
        scale: 1.02,
        transformPerspective: 600,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    item.addEventListener('mouseleave', () => {
      gsap.to(item, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  });
})();


/* =========================================
   13. CONTACT FORM
   ========================================= */
(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const success   = document.getElementById('formSuccess');
  const resetBtn  = document.getElementById('resetForm');
  const submitBtn = document.getElementById('formSubmit');
  const submitText    = document.querySelector('.btn-submit-text');
  const submitLoading = document.querySelector('.btn-submit-loading');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Basic validation — also add input listeners to clear error state
    const name    = document.getElementById('formName');
    const email   = document.getElementById('formEmail');
    const service = document.getElementById('formService');

    [name, email, service].forEach(field => {
      field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
    });

    let valid = true;

    [name, email, service].forEach(field => {
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = 'rgba(220, 80, 80, 0.6)';
        gsap.fromTo(field, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(3, 0.5)', clearProps: 'x' });
      }
    });

    if (email.value && !/\S+@\S+\.\S+/.test(email.value)) {
      valid = false;
      email.style.borderColor = 'rgba(220, 80, 80, 0.6)';
      gsap.fromTo(email, { x: -8 }, { x: 0, duration: 0.4, ease: 'elastic.out(3, 0.5)', clearProps: 'x' });
      setTimeout(() => { email.style.borderColor = ''; }, 2000);
    }

    if (!valid) return;

    // Show loading
    submitText.style.display    = 'none';
    submitLoading.style.display = 'flex';
    submitBtn.disabled = true;

    // Simulate async submit
    setTimeout(() => {
      gsap.to(form, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        onComplete: () => {
          form.style.display    = 'none';
          success.style.display = 'block';
          gsap.fromTo(success,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
          );
        }
      });
    }, 1800);
  });

  resetBtn && resetBtn.addEventListener('click', () => {
    gsap.to(success, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => {
        success.style.display  = 'none';
        form.style.display     = 'block';
        form.reset();
        submitText.style.display    = 'inline';
        submitLoading.style.display = 'none';
        submitBtn.disabled = false;
        gsap.fromTo(form, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      }
    });
  });
})();


/* =========================================
   14. SECTION TITLE CHAR ANIMATION
   ========================================= */
(function initTitleAnimations() {
  const titles = document.querySelectorAll('.section-title');
  titles.forEach(title => {
    ScrollTrigger.create({
      trigger: title,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        gsap.fromTo(title,
          { backgroundPositionX: '0%' },
          { backgroundPositionX: '100%', duration: 1.5, ease: 'power3.inOut' }
        );
      }
    });
  });
})();


/* =========================================
   15. HERO BADGE GLOW PULSE
   ========================================= */
(function initBadgePulse() {
  gsap.to('.hero-badge', {
    boxShadow: '0 0 24px rgba(200, 129, 74, 0.3)',
    repeat: -1,
    yoyo: true,
    duration: 2.5,
    ease: 'sine.inOut',
    delay: 2,
  });
})();


/* =========================================
   16. SMOOTH ANCHOR NAV
   ========================================= */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (!href || href === '#') return; // Skip bare # links
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    }
  });
});


/* =========================================
   17. ACTIVE NAV HIGHLIGHT
   ========================================= */
(function initActiveNav() {
  const sections = ['#hero', '#services', '#gallery', '#about', '#contact'];
  const navLinks = document.querySelectorAll('.nav-link');

  sections.forEach(id => {
    const el = document.querySelector(id);
    if (!el) return;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 60%',
      end: 'bottom 60%',
      onEnter: () => setActiveNav(id),
      onEnterBack: () => setActiveNav(id),
    });
  });

  function setActiveNav(id) {
    navLinks.forEach(link => {
      link.style.color = link.getAttribute('href') === id ? 'var(--white)' : '';
    });
  }
})();


/* =========================================
   18. SERVICE CARD 3D TILT
   ========================================= */
(function initCardTilt() {
  const cards = document.querySelectorAll('.service-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 8;
      const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 8;
      gsap.to(card, {
        rotateX: -y,
        rotateY: x,
        transformPerspective: 800,
        duration: 0.3,
        ease: 'power2.out',
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotateX: 0, rotateY: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)',
      });
    });
  });
})();


/* =========================================
   19. FOOTER GLOW LINE
   ========================================= */
(function initFooterGlow() {
  ScrollTrigger.create({
    trigger: '.footer',
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.fromTo('.footer-glow',
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.2, ease: 'power3.out' }
      );
    }
  });
})();


/* =========================================
   20. PERFORMANCE: Observe off-screen cleanup
   ========================================= */
if ('IntersectionObserver' in window) {
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const observer = new IntersectionObserver(([entry]) => {
      canvas.style.opacity = entry.isIntersecting ? '1' : '0';
    }, { threshold: 0 });
    observer.observe(document.querySelector('.hero'));
  }
}


/* =========================================
   21. COOKIE CONSENT BANNER
   ========================================= */
(function initCookieBanner() {
  const banner   = document.getElementById('cookieBanner');
  const confirm  = document.getElementById('cookieConfirm');
  const reject   = document.getElementById('cookieReject');
  const checkbox = document.getElementById('cookieAccept');
  const cookieLink = banner ? banner.querySelector('.cookie-link') : null;

  if (!banner) return;

  // Check if user already responded
  const consent = localStorage.getItem('vita_cookie_consent');
  if (!consent) {
    // Show after 1.5s
    setTimeout(() => {
      banner.classList.add('visible');
      gsap.fromTo(banner,
        { y: 60, opacity: 0.6 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
      );
    }, 1500);
  }

  function dismissBanner(type) {
    localStorage.setItem('vita_cookie_consent', type);
    gsap.to(banner, {
      y: 80,
      opacity: 0,
      duration: 0.45,
      ease: 'power2.in',
      onComplete: () => {
        banner.classList.add('hidden');
        banner.classList.remove('visible');
      }
    });
  }

  confirm && confirm.addEventListener('click', () => {
    if (!checkbox.checked) {
      // Require checkbox
      gsap.fromTo(checkbox.parentElement,
        { x: -6 },
        { x: 0, duration: 0.4, ease: 'elastic.out(3, 0.5)' }
      );
      return;
    }
    dismissBanner('all');
  });

  reject && reject.addEventListener('click', () => {
    dismissBanner('essential');
  });

  // Cookie link in banner opens privacy modal
  cookieLink && cookieLink.addEventListener('click', (e) => {
    e.preventDefault();
    const modal = document.getElementById('privacyModal');
    if (modal) {
      modal.style.display = 'flex';
      gsap.fromTo(modal.querySelector('.privacy-modal-inner'),
        { scale: 0.92, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }
      );
    }
  });
})();


/* =========================================
   22. PRIVACY MODAL
   ========================================= */
(function initPrivacyModal() {
  const openBtn  = document.getElementById('openPrivacy');
  const modal    = document.getElementById('privacyModal');
  const closeBtn = document.getElementById('privacyModalClose');

  if (!modal) return;

  function openModal() {
    modal.style.display = 'flex';
    gsap.fromTo(modal.querySelector('.privacy-modal-inner'),
      { scale: 0.9, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' }
    );
  }

  function closeModal() {
    gsap.to(modal.querySelector('.privacy-modal-inner'), {
      scale: 0.92, opacity: 0, y: 10, duration: 0.25,
      onComplete: () => { modal.style.display = 'none'; }
    });
  }

  openBtn  && openBtn.addEventListener('click',  (e) => { e.preventDefault(); openModal(); });
  closeBtn && closeBtn.addEventListener('click', closeModal);

  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });
})();


/* =========================================
   23. FAQ ACCORDION
   ========================================= */
(function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn    = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      items.forEach(other => {
        const otherBtn    = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (otherBtn && otherAnswer) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherAnswer.classList.remove('open');
        }
      });

      // Toggle clicked
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');

        // GSAP subtle highlight
        gsap.fromTo(answer, { opacity: 0.6 }, { opacity: 1, duration: 0.3 });
      }
    });
  });
})();


/* =========================================
   24. WHATSAPP FLOAT — Entrance
   ========================================= */
(function initWhatsAppFloat() {
  const btn = document.getElementById('whatsappFloat');
  if (!btn) return;

  // Bounce entrance after 2s
  gsap.fromTo(btn,
    { scale: 0, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(1.7)', delay: 2.5 }
  );
})();


/* =========================================
   25. TESTIMONIALS — Dynamic System
   ========================================= */
(function initTestimonials() {
  const STORAGE_KEY = 'vita_testimonials';

  const grid          = document.getElementById('testimonialsGrid');
  const emptyState    = document.getElementById('testimonialsEmpty');
  const openBtn       = document.getElementById('openTestimonialFormBtn');
  const closeBtn      = document.getElementById('closeTestimonialFormBtn');
  const formWrap      = document.getElementById('testimonialFormWrap');
  const form          = document.getElementById('testimonialForm');
  const stars         = document.querySelectorAll('#starRating .star');
  const ratingInput   = document.getElementById('tRating');

  if (!grid || !form) return;

  // ── Helpers ──────────────────────────────────────────────
  function getInitials(name) {
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  function starsHTML(count) {
    return '★'.repeat(Math.max(1, Math.min(5, count))) + '☆'.repeat(5 - Math.max(1, Math.min(5, count)));
  }

  function saveTestimonials(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function loadTestimonials() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }

  // ── Render ────────────────────────────────────────────────
  function renderCard(t, prepend = false) {
    const card = document.createElement('div');
    card.className = 'testimonial-card glass-card';
    card.innerHTML = `
      <div class="stars">${starsHTML(t.rating)}</div>
      <p>"${t.message}"</p>
      <div class="testimonial-author">
        <div class="author-avatar">${getInitials(t.name)}</div>
        <div>
          <strong>${t.name}</strong>
          ${t.role ? `<span>${t.role}</span>` : ''}
        </div>
      </div>`;

    // Animate in
    gsap.fromTo(card, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });

    if (prepend && grid.firstChild) {
      grid.insertBefore(card, grid.firstChild);
    } else {
      grid.appendChild(card);
    }
  }

  function renderAll() {
    const list = loadTestimonials();
    // Remove any existing cards (but keep emptyState)
    Array.from(grid.children).forEach(c => {
      if (c.id !== 'testimonialsEmpty') c.remove();
    });

    if (list.length === 0) {
      emptyState.style.display = '';
    } else {
      emptyState.style.display = 'none';
      list.forEach(t => renderCard(t));
    }
  }

  // ── Star Rating ──────────────────────────────────────────
  let selectedRating = 5;

  function updateStars(hovered) {
    stars.forEach(s => {
      s.classList.toggle('active', parseInt(s.dataset.value) <= hovered);
    });
  }

  stars.forEach(star => {
    star.addEventListener('mouseenter', () => updateStars(parseInt(star.dataset.value)));
    star.addEventListener('mouseleave', () => updateStars(selectedRating));
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      ratingInput.value = selectedRating;
      updateStars(selectedRating);
    });
  });

  // Init stars display
  updateStars(selectedRating);

  // ── Open / Close ─────────────────────────────────────────
  openBtn && openBtn.addEventListener('click', () => {
    formWrap.style.display = '';
    gsap.fromTo(formWrap, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
    formWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    openBtn.style.display = 'none';
  });

  closeBtn && closeBtn.addEventListener('click', () => {
    gsap.to(formWrap, {
      opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        formWrap.style.display = 'none';
        openBtn.style.display = '';
      }
    });
  });

  // ── Submit ────────────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('tName').value.trim();
    const role    = document.getElementById('tRole').value.trim();
    const message = document.getElementById('tMessage').value.trim();
    const rating  = parseInt(ratingInput.value) || 5;

    if (!name || !message) {
      // Shake invalid fields
      [document.getElementById('tName'), document.getElementById('tMessage')].forEach(el => {
        if (!el.value.trim()) {
          gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1,0.3)', repeat: 2, yoyo: true });
        }
      });
      return;
    }

    const entry = { name, role, message, rating, date: new Date().toISOString() };
    const list  = loadTestimonials();
    list.unshift(entry);
    saveTestimonials(list);

    // Hide empty state and render new card
    emptyState.style.display = 'none';
    renderCard(entry, true);

    // Reset form
    form.reset();
    selectedRating = 5;
    ratingInput.value = 5;
    updateStars(5);

    // Close form
    gsap.to(formWrap, {
      opacity: 0, y: 20, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        formWrap.style.display = 'none';
        openBtn.style.display = '';
      }
    });
  });

  // ── Init on load ─────────────────────────────────────────
  renderAll();
})();
