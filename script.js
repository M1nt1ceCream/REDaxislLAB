document.addEventListener('DOMContentLoaded', () => {

  /* ===== BURGER MENU ===== */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
    burger.classList.toggle('active');
  });
  document.querySelectorAll('.header__link').forEach(link => {
    link.addEventListener('click', () => { nav.classList.remove('open'); burger.classList.remove('active'); });
  });

  /* ===== SCROLL ANIMATIONS ===== */
  const animEls = document.querySelectorAll('[data-animate]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  animEls.forEach(el => observer.observe(el));

  /* ===== CAROUSEL ENGINE ===== */
  function initCarousel(id) {
    const wrap = document.getElementById(id);
    if (!wrap) return;
    const track = wrap.querySelector('.carousel__track');
    let slides = Array.from(track.querySelectorAll('.carousel__slide'));
    const prevBtn = wrap.querySelector('.carousel__btn--prev');
    const nextBtn = wrap.querySelector('.carousel__btn--next');
    const isInfinite = wrap.dataset.infinite === 'true';
    
    let index = 0;
    let isAnimating = false;

    function getVisible() {
      const w = wrap.querySelector('.carousel__track-wrapper').offsetWidth;
      const sw = slides[0].offsetWidth;
      return Math.round(w / sw);
    }

    if (isInfinite) {
      function moveInfinite(dir) {
        if (isAnimating) return;
        isAnimating = true;
        
        const slideWidth = slides[0].offsetWidth;
        track.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
        
        if (dir === 1) {
          track.style.transform = `translateX(-${slideWidth}px)`;
          setTimeout(() => {
            track.style.transition = 'none';
            track.appendChild(track.firstElementChild);
            track.style.transform = 'translateX(0)';
            slides = Array.from(track.querySelectorAll('.carousel__slide'));
            isAnimating = false;
          }, 500);
        } else {
          track.style.transition = 'none';
          track.insertBefore(track.lastElementChild, track.firstElementChild);
          track.style.transform = `translateX(-${slideWidth}px)`;
          void track.offsetWidth;
          
          track.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1)';
          track.style.transform = 'translateX(0)';
          
          setTimeout(() => {
            slides = Array.from(track.querySelectorAll('.carousel__slide'));
            isAnimating = false;
          }, 500);
        }
      }
      
      if(prevBtn) prevBtn.addEventListener('click', () => moveInfinite(-1));
      if(nextBtn) nextBtn.addEventListener('click', () => moveInfinite(1));

      let startX = 0;
      track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) moveInfinite(diff > 0 ? 1 : -1);
      });
      
    } else {
      function move(dir) {
        const vis = getVisible();
        const max = slides.length - vis;
        index = Math.max(0, Math.min(index + dir, max));
        track.style.transform = `translateX(-${index * (100 / slides.length)}%)`;
      }

      if(prevBtn) prevBtn.addEventListener('click', () => move(-1));
      if(nextBtn) nextBtn.addEventListener('click', () => move(1));

      let startX = 0;
      track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
      track.addEventListener('touchend', e => {
        const diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) move(diff > 0 ? 1 : -1);
      });
    }
  }
  initCarousel('researchCarousel');
  initCarousel('specialistsCarousel');

  /* ===== HEADER SHRINK ON SCROLL ===== */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    header.style.background = window.scrollY > 60
      ? 'rgba(255,255,255,.95)'
      : 'rgba(255,255,255,.8)';
  });

  /* ===== CONTACT FORM ===== */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Отправлено ✓';
      btn.style.pointerEvents = 'none';
      setTimeout(() => { btn.textContent = 'Отправить'; btn.style.pointerEvents = ''; form.reset(); }, 2500);
    });
  }

  /* ===== ADVANTAGE CARDS HOVER DIRECTION ===== */
  const advantageCards = document.querySelectorAll('.advantage-card');
  advantageCards.forEach(card => {
    const updateMouse = e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    };
    card.addEventListener('mouseenter', updateMouse);
    card.addEventListener('mouseleave', updateMouse);
  });

  /* ===== COOKIE BANNER ===== */
  const cookieBanner = document.getElementById('cookieBanner');
  const acceptBtn = document.getElementById('acceptCookies');
  const declineBtn = document.getElementById('declineCookies');
  if (cookieBanner && acceptBtn) {
    if (localStorage.getItem('cookiesAccepted') || localStorage.getItem('cookiesDeclined')) {
      cookieBanner.classList.add('cookie-banner--hidden');
    } else {
      // Small delay to animate in
      setTimeout(() => cookieBanner.classList.remove('cookie-banner--hidden'), 500);
    }
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      cookieBanner.classList.add('cookie-banner--hidden');
    });
    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesDeclined', 'true');
        cookieBanner.classList.add('cookie-banner--hidden');
      });
    }
  }

  /* ===== HERO CANVAS VECTOR BACKGROUND ===== */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = 0;
    let height = 0;
    const spacing = 20;
    const maxRadius = 9.5;
    
    const img = new Image();
    img.src = 'assets/hero-bg.png';
    
    let imgData = null;
    let offCanvas = document.createElement('canvas');
    let offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    let cols = 0;
    let rows = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      
      if (img.complete && img.naturalWidth > 0) {
        processImage();
        draw();
      }
    }
    
    function processImage() {
      cols = Math.ceil(width / spacing);
      rows = Math.ceil(height / spacing);
      
      offCanvas.width = cols;
      offCanvas.height = rows;
      
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;
      
      let drawWidth = cols;
      let drawHeight = rows;
      let offsetX = 0;
      let offsetY = 0;
      
      if (canvasRatio > imgRatio) {
        drawHeight = cols / imgRatio;
        offsetY = (rows - drawHeight) / 2;
      } else {
        drawWidth = rows * imgRatio;
        offsetX = (cols - drawWidth) / 2;
      }
      
      offCtx.fillStyle = '#ffffff';
      offCtx.fillRect(0, 0, cols, rows);
      offCtx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      imgData = offCtx.getImageData(0, 0, cols, rows).data;
    }

    const zones = [
      { type: 'circular', cx: 0.38, cy: 0.22, r: 0.18, speed: 0.25 },
      { type: 'circular', cx: 0.53, cy: 0.11, r: 0.05, speed: 0.4 },
      { type: 'circular', cx: 0.59, cy: 0.11, r: 0.05, speed: 0.4 },
      { type: 'circular', cx: 0.53, cy: 0.25, r: 0.05, speed: 0.4 },
      { type: 'circular', cx: 0.59, cy: 0.25, r: 0.05, speed: 0.4 },
      
      /* Horizontal strips (generous bounds to fit any resolution) */
      { type: 'horizontal', x: 0.65, y: 0.0, w: 0.35, h: 0.3, speed: 0.2, dir: 1 },    /* Top right original */
      { type: 'horizontal', x: 0.4, y: 0.5, w: 0.5, h: 0.25, speed: 0.25, dir: 1 },    /* Middle right (highlighted line) */
      { type: 'horizontal', x: 0.4, y: 0.7, w: 0.25, h: 0.3, speed: 0.3, dir: 1 },     /* Bottom center-right (circle 1) */
      { type: 'horizontal', x: 0.7, y: 0.7, w: 0.3, h: 0.3, speed: 0.3, dir: 1 },      /* Bottom right (circle 2) */

      /* Vertical strips (generous bounds) */
      { type: 'vertical', x: 0.0, y: 0.0, w: 0.15, h: 0.5, speed: 0.2, dir: 1 },       /* Top left (highlighted vertical line) */
      { type: 'vertical', x: 0.0, y: 0.4, w: 0.2, h: 0.3, speed: 0.15, dir: -1 },
      { type: 'vertical', x: 0.8, y: 0.3, w: 0.2, h: 0.4, speed: 0.25, dir: 1 },
      { type: 'vertical', x: 0.0, y: 0.7, w: 0.2, h: 0.3, speed: 0.2, dir: -1 }
    ];

    let animationId = null;

    function draw() {
      if (!imgData) return;
      if (animationId) cancelAnimationFrame(animationId);
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ff0000';
      
      const time = performance.now() / 1000;
      const aspect = width / height;
      
      for (let i = 0; i < cols; i++) {
        const u = i / cols;
        for (let j = 0; j < rows; j++) {
          const v = j / rows;
          const index = (j * cols + i) * 4;
          const g = imgData[index + 1];
          const darkness = 1 - (g / 255);
          
          if (darkness > 0.05) {
            let radius = maxRadius * darkness;
            let extraScale = 0;
            
            for (const zone of zones) {
              if (zone.type === 'circular') {
                const dx = u - zone.cx;
                const dy = v - zone.cy;
                const dist = Math.sqrt(dx * dx * aspect * aspect + dy * dy);
                if (dist < zone.r) {
                  let angle = Math.atan2(dy, dx * aspect);
                  let normalizedAngle = (angle + Math.PI) / (Math.PI * 2);
                  let wavePos = (time * zone.speed) % 1;
                  let diff = Math.abs(normalizedAngle - wavePos);
                  if (diff > 0.5) diff = 1 - diff;
                  extraScale = Math.max(extraScale, Math.max(0, 1 - diff * 4));
                }
              } else if (zone.type === 'horizontal') {
                if (u >= zone.x && u <= zone.x + zone.w && v >= zone.y && v <= zone.y + zone.h) {
                  let wavePos = (time * zone.speed) % 1;
                  if (zone.dir === -1) wavePos = 1 - wavePos;
                  let diff = Math.abs((u - zone.x) / zone.w - wavePos);
                  if (diff > 0.5) diff = 1 - diff;
                  extraScale = Math.max(extraScale, Math.max(0, 1 - diff * 4));
                }
              } else if (zone.type === 'vertical') {
                if (u >= zone.x && u <= zone.x + zone.w && v >= zone.y && v <= zone.y + zone.h) {
                  let wavePos = (time * zone.speed) % 1;
                  if (zone.dir === -1) wavePos = 1 - wavePos;
                  let diff = Math.abs((v - zone.y) / zone.h - wavePos);
                  if (diff > 0.5) diff = 1 - diff;
                  extraScale = Math.max(extraScale, Math.max(0, 1 - diff * 4));
                }
              }
            }
            
            radius += extraScale * 5.5;
            
            const x = i * spacing + spacing / 2;
            const y = j * spacing + spacing / 2;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      animationId = requestAnimationFrame(draw);
    }

    img.onload = () => resize();
    window.addEventListener('resize', () => {
      clearTimeout(window.heroResizeTimeout);
      window.heroResizeTimeout = setTimeout(resize, 100);
    });
    resize();
  }
  initHeroCanvas();

  /* ===== CONTACTS CANVAS BACKGROUND ===== */
  function initContactsCanvas() {
    const canvas = document.getElementById('contactsCanvas');
    const section = document.getElementById('contacts');
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    
    // Grid settings
    const spacing = 30;
    const baseRadius = 3.5;
    const maxRadiusAdd = 15;
    const interactionRadius = 500;
    const fadeMargin = 40;
    
    let mouseX = -1000;
    let mouseY = -1000;
    let targetStrength = 0;
    let currentStrength = 0;

    function resize() {
      const rect = section.getBoundingClientRect();
      if (width === rect.width && height === rect.height) return;
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      drawFrame();
    }

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      targetStrength = 1;
    });

    section.addEventListener('mouseleave', () => {
      targetStrength = 0;
    });

    const resizeObserver = new ResizeObserver(() => {
      resize();
    });
    resizeObserver.observe(section);
    resize();

    function drawFrame() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ff0000';
      
      currentStrength += (targetStrength - currentStrength) * 0.08;

      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      
      const offsetX = (width - (cols * spacing)) / 2 + spacing/2;
      const offsetY = (height - (rows * spacing)) / 2 + spacing/2;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = offsetX + i * spacing;
          const y = offsetY + j * spacing;
          
          const distToTop = y;
          const distToBottom = height - y;
          const edgeDist = Math.min(distToTop, distToBottom);
          
          let edgeScale = 1;
          if (edgeDist < fadeMargin) {
            edgeScale = Math.max(0, edgeDist / fadeMargin);
          }
          if (edgeScale <= 0) continue;

          let radius = baseRadius;
          const dx = x - mouseX;
          const dy = y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < interactionRadius && currentStrength > 0.01) {
            const factor = 1 - (dist / interactionRadius);
            radius += maxRadiusAdd * (factor * factor) * currentStrength;
          }
          
          radius *= edgeScale;

          ctx.globalAlpha = edgeScale * 0.9;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    let animationId = null;
    function loop() {
      drawFrame();
      animationId = requestAnimationFrame(loop);
    }
    loop();
  }
  
  initContactsCanvas();

  /* ===== PARTNERS MARQUEE SMOOTH HOVER ===== */
  const partnersMarquee = document.querySelector('.partners__marquee');
  if (partnersMarquee) {
    const tracks = partnersMarquee.querySelectorAll('.partners__track');
    let targetRate = 1;
    let currentRate = 1;
    let animationFrameId = null;

    function updateRate() {
      currentRate += (targetRate - currentRate) * 0.05;
      
      tracks.forEach(track => {
        const animations = track.getAnimations();
        animations.forEach(anim => {
          anim.playbackRate = currentRate;
        });
      });

      if (Math.abs(targetRate - currentRate) > 0.001) {
        animationFrameId = requestAnimationFrame(updateRate);
      } else {
        currentRate = targetRate;
        tracks.forEach(track => {
          const animations = track.getAnimations();
          animations.forEach(anim => {
            anim.playbackRate = currentRate;
          });
        });
      }
    }

    partnersMarquee.addEventListener('mouseenter', () => {
      targetRate = 0.05; // 5% speed (very slow)
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      updateRate();
    });

    partnersMarquee.addEventListener('mouseleave', () => {
      targetRate = 1; // 100% speed
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      updateRate();
    });
  }

  /* ===== PAGE TRANSITION LOGIC ===== */
  const pages = ['index', 'services', 'research', 'contacts'];
  const transitionEl = document.getElementById('pageTransition');

  // Helper to extract clean page name
  function getPageName(path) {
    if (!path || path === '/') return 'index';
    let name = path.split('/').pop().split('?')[0].replace('.html', '');
    return name === '' ? 'index' : name;
  }

  // 1. Handle arriving on the page (ENTER)
  const storedTransition = sessionStorage.getItem('pageTransition');
  if (transitionEl) {
    if (storedTransition) {
      transitionEl.classList.add('is-entering', storedTransition);
      setTimeout(() => transitionEl.classList.add('is-hidden'), 50);
      setTimeout(() => transitionEl.classList.remove('is-entering', 'dir-right', 'dir-left'), 650);
      sessionStorage.removeItem('pageTransition');
    } else {
      setTimeout(() => transitionEl.classList.add('is-hidden'), 50);
    }
  }

  // 2. Handle leaving the page (LEAVE)
  document.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      // Only handle internal HTML links
      if (href && (href.endsWith('.html') || pages.includes(href.replace('.html', '')))) {
        const currentPageName = getPageName(window.location.pathname);
        const targetPageName = getPageName(href);

        if (targetPageName !== currentPageName) {
          e.preventDefault();
          const currentIndex = pages.indexOf(currentPageName);
          const targetIndex = pages.indexOf(targetPageName);
          
          // Determine direction based on menu order
          const dir = (currentIndex !== -1 && targetIndex !== -1 && targetIndex > currentIndex) 
            ? 'dir-right' 
            : 'dir-left';
          
          if (transitionEl) {
            transitionEl.classList.remove('is-hidden');
            transitionEl.classList.add('is-active', dir);
            sessionStorage.setItem('pageTransition', dir);
            
            setTimeout(() => window.location.href = href, 600);
          } else {
            window.location.href = href;
          }
        }
      }
    });
  });

});
