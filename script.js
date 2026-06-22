document.addEventListener('DOMContentLoaded', () => {

  /* ===== THEME TOGGLE ===== */
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  if (themeToggle) {
    function applyTheme(newTheme) {
      htmlEl.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      const slider = themeToggle.querySelector('.theme-toggle__slider');
      if (slider) slider.style.transform = newTheme === 'dark' ? 'translateX(36px)' : 'translateX(0)';
    }

    let tLast = 0;
    function doToggle() {
      const now = Date.now();
      if (now - tLast < 500) return;
      tLast = now;
      applyTheme(htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }
    themeToggle.addEventListener('click', doToggle);
    themeToggle.addEventListener('touchend', (e) => { e.preventDefault(); doToggle(); }, { passive: false });

    if (htmlEl.getAttribute('data-theme') === 'dark') {
      const slider = themeToggle.querySelector('.theme-toggle__slider');
      if (slider) slider.style.transform = 'translateX(36px)';
    }
  }

  /* Live-follow the OS theme until the user makes a manual choice */
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onSysTheme = (e) => {
      if (localStorage.getItem('theme')) return;   // manual choice always wins
      const t = e.matches ? 'dark' : 'light';
      htmlEl.setAttribute('data-theme', t);
      const slider = themeToggle && themeToggle.querySelector('.theme-toggle__slider');
      if (slider) slider.style.transform = t === 'dark' ? 'translateX(36px)' : 'translateX(0)';
    };
    if (mq.addEventListener) mq.addEventListener('change', onSysTheme);
    else if (mq.addListener) mq.addListener(onSysTheme);   // older Safari
  }

  /* ===== BURGER MENU ===== */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
      burger.classList.toggle('active');
    });
    document.querySelectorAll('.header__link').forEach(link => {
      link.addEventListener('click', () => { nav.classList.remove('open'); burger.classList.remove('active'); });
    });
    document.addEventListener('click', (e) => {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(e.target) && !burger.contains(e.target)) {
        nav.classList.remove('open');
        burger.classList.remove('active');
      }
    });
  }

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

  /* ===== HEADER SHRINK ON SCROLL ===== */
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  });

  /* ===== CONTACT FORM ===== */
  const form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = window.getI18n('form.sent');
      btn.style.pointerEvents = 'none';
      setTimeout(() => { btn.textContent = window.getI18n('form.submit'); btn.style.pointerEvents = ''; form.reset(); }, 2500);
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
      document.body.classList.add('has-cookie-banner');
      setTimeout(() => cookieBanner.classList.remove('cookie-banner--hidden'), 500);
    }
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      cookieBanner.classList.add('cookie-banner--hidden');
      document.body.classList.remove('has-cookie-banner');
    });
    if (declineBtn) {
      declineBtn.addEventListener('click', () => {
        localStorage.setItem('cookiesDeclined', 'true');
        cookieBanner.classList.add('cookie-banner--hidden');
        document.body.classList.remove('has-cookie-banner');
      });
    }
  }

  /* ===== HERO CANVAS — LAVA LAMP + GLASS STRIPS ===== */
  function initHeroCanvas() {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0, animId = null, lastTs = 0;

    // Lava blobs: origin (ox,oy), drift amplitude (ax,ay),
    // sine phase (px,py) + speed (spx,spy), base radius (bR),
    // radius oscillation phase/speed/amplitude (rP,rS,rA), color (c)
    const blobs = [
      { ox:0.28, oy:0.52, ax:0.18, ay:0.12, px:0.00, py:1.70, spx:0.00022, spy:0.00018, bR:0.56, rP:0.4, rS:0.00014, rA:0.09, c:[195,28,0],  cl:[255,70,30]  },
      { ox:0.68, oy:0.40, ax:0.14, ay:0.17, px:3.20, py:0.90, spx:0.00017, spy:0.00025, bR:0.46, rP:2.0, rS:0.00011, rA:0.07, c:[235,75,8],  cl:[255,120,55] },
      { ox:0.50, oy:0.80, ax:0.16, ay:0.10, px:1.10, py:4.10, spx:0.00019, spy:0.00015, bR:0.42, rP:3.8, rS:0.00017, rA:0.06, c:[165,22,4],  cl:[255,90,40]  },
      { ox:0.16, oy:0.28, ax:0.10, ay:0.14, px:5.40, py:2.20, spx:0.00013, spy:0.00020, bR:0.33, rP:0.9, rS:0.00009, rA:0.05, c:[255,95,18], cl:[255,150,85] },
      { ox:0.86, oy:0.64, ax:0.12, ay:0.09, px:2.60, py:5.70, spx:0.00015, spy:0.00012, bR:0.39, rP:5.2, rS:0.00016, rA:0.06, c:[145,14,0],  cl:[240,60,30]  },
      { ox:0.42, oy:0.18, ax:0.21, ay:0.08, px:4.00, py:3.50, spx:0.00021, spy:0.00010, bR:0.31, rP:1.6, rS:0.00013, rA:0.05, c:[210,52,4],  cl:[255,110,50] },
    ];

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
    }

    function isDark() {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function draw(ts) {
      const dt = Math.min(ts - lastTs, 50);
      lastTs = ts;

      ctx.clearRect(0, 0, W, H);

      const dark = isDark();
      if (dark) {                       // dark theme: dramatic burgundy backdrop
        ctx.fillStyle = '#0d0100';
        ctx.fillRect(0, 0, W, H);
      }
      // light theme: no fill — blobs sit visibly on the light page background
      const a0 = dark ? 0.90 : 0.58;
      const a1 = dark ? 0.55 : 0.34;
      const a2 = dark ? 0.18 : 0.14;

      const dim = Math.min(W, H);

      // Lava blobs
      for (const b of blobs) {
        b.px += b.spx * dt;
        b.py += b.spy * dt;
        b.rP += b.rS  * dt;

        const cx = (b.ox + Math.sin(b.px) * b.ax) * W;
        const cy = (b.oy + Math.cos(b.py) * b.ay) * H;
        const r  = (b.bR + Math.sin(b.rP) * b.rA) * dim;

        const [rr, gg, bb] = dark ? b.c : b.cl;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,    `rgba(${rr},${gg},${bb},${a0})`);
        g.addColorStop(0.35, `rgba(${rr},${gg},${bb},${a1})`);
        g.addColorStop(0.65, `rgba(${rr},${gg},${bb},${a2})`);
        g.addColorStop(1,    `rgba(${rr},${gg},${bb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', () => {
      clearTimeout(window._heroResize);
      window._heroResize = setTimeout(resize, 100);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(animId); animId = null; }
      else if (!animId) { lastTs = performance.now(); animId = requestAnimationFrame(draw); }
    });

    lastTs = performance.now();
    animId = requestAnimationFrame(draw);
  }
  initHeroCanvas();

  /* ===== CONTACTS CANVAS BACKGROUND ===== */
  function initContactsCanvas() {
    const canvas = document.getElementById('contactsCanvas');
    const section = document.getElementById('contacts');
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, placed = false;
    let mouseX = -9999, mouseY = -9999, mouseActive = false;

    const rand = (a, b) => a + Math.random() * (b - a);
    const palette      = [[195,28,0],[235,75,8],[165,22,4],[255,95,18],[145,14,0],[210,52,4]];     // dark theme: deep red → orange
    const paletteLight = [[255,70,30],[255,120,55],[255,90,40],[255,150,85],[240,60,30],[255,110,50]]; // light theme: bright, visible on white
    const COUNT = 7;
    const blobs = [];
    for (let i = 0; i < COUNT; i++) {
      blobs.push({
        bx: Math.random(), by: Math.random(),                 // base pos, normalized 0..1
        vx: rand(-0.0003, 0.0003), vy: rand(-0.00022, 0.00022), // base drift velocity
        x: 0, y: 0,                                            // rendered pos (px)
        rf: rand(0.34, 0.56),                                  // radius as fraction of min(w,h) — big, like hero
        c:  palette[i % palette.length],
        cl: paletteLight[i % paletteLight.length]
      });
    }

    function resize() {
      const rect = section.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!placed) {
        for (const b of blobs) { b.x = b.bx * width; b.y = b.by * height; }
        placed = true;
      }
    }

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
    });
    section.addEventListener('mouseleave', () => { mouseActive = false; });

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(section);
    resize();

    function step() {
      if (!width || !height) { requestAnimationFrame(step); return; }
      const dim = Math.min(width, height);
      const dark = document.documentElement.dataset.theme === 'dark';

      ctx.clearRect(0, 0, width, height);
      if (dark) {
        ctx.fillStyle = '#0d0100';          // dark burgundy backdrop (dark theme only)
        ctx.fillRect(0, 0, width, height);
      }
      // light theme: no fill — blobs sit visibly on the light section background
      const a0 = dark ? 0.90 : 0.58;
      const a1 = dark ? 0.55 : 0.34;
      const a2 = dark ? 0.18 : 0.14;

      for (const b of blobs) {
        // advance base drift, bounce inside bounds
        b.bx += b.vx; b.by += b.vy;
        if (b.bx < 0.06 || b.bx > 0.94) b.vx *= -1;
        if (b.by < 0.06 || b.by > 0.94) b.vy *= -1;
        b.bx = Math.min(0.94, Math.max(0.06, b.bx));
        b.by = Math.min(0.94, Math.max(0.06, b.by));

        const baseX = b.bx * width, baseY = b.by * height;
        let tx = baseX, ty = baseY;

        // magnetism toward cursor
        if (mouseActive) {
          const dx = mouseX - baseX, dy = mouseY - baseY;
          const d = Math.hypot(dx, dy) || 1;
          const R = 420;
          if (d < R) {
            const pull = 1 - d / R;
            const k = pull * pull * 0.7;   // up to 70% toward cursor
            tx = baseX + dx * k;
            ty = baseY + dy * k;
          }
        }

        // smooth follow (deviate from / return to base trajectory)
        b.x += (tx - b.x) * 0.06;
        b.y += (ty - b.y) * 0.06;

        const r = b.rf * dim;
        const [rr, gg, bb] = dark ? b.c : b.cl;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        g.addColorStop(0,    `rgba(${rr},${gg},${bb},${a0})`);
        g.addColorStop(0.35, `rgba(${rr},${gg},${bb},${a1})`);
        g.addColorStop(0.65, `rgba(${rr},${gg},${bb},${a2})`);
        g.addColorStop(1,    `rgba(${rr},${gg},${bb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }

      requestAnimationFrame(step);
    }
    step();
  }
  
  initContactsCanvas();

  /* ===== RESEARCH CANVAS BACKGROUND ===== */
  function initResearchCanvas() {
    const canvas = document.getElementById('researchCanvas');
    const section = document.getElementById('research');
    if (!canvas || !section) return;

    const ctx = canvas.getContext('2d');
    let width = 0, height = 0, placed = false;
    let mouseX = -9999, mouseY = -9999, mouseActive = false;

    const rand = (a, b) => a + Math.random() * (b - a);
    const palette      = [[195,28,0],[235,75,8],[165,22,4],[255,95,18],[145,14,0],[210,52,4]];
    const paletteLight = [[255,70,30],[255,120,55],[255,90,40],[255,150,85],[240,60,30],[255,110,50]];
    const COUNT = 9;
    const blobs = [];
    for (let i = 0; i < COUNT; i++) {
      blobs.push({
        bx: Math.random(), by: Math.random(),
        vx: rand(-0.0003, 0.0003), vy: rand(-0.00016, 0.00016),
        x: 0, y: 0,
        rf: rand(0.30, 0.50),
        c:  palette[i % palette.length],
        cl: paletteLight[i % paletteLight.length]
      });
    }

    function resize() {
      const rect = section.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!placed) { for (const b of blobs) { b.x = b.bx * width; b.y = b.by * height; } placed = true; }
    }

    section.addEventListener('mousemove', (e) => {
      const rect = section.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      mouseActive = true;
    });
    section.addEventListener('mouseleave', () => { mouseActive = false; });

    // Debounce so the filter height-animation doesn't re-create (clear) the
    // canvas on every frame — that caused the background to flash/disappear.
    let roTimer;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(roTimer);
      roTimer = setTimeout(resize, 160);
    });
    resizeObserver.observe(section);
    window.addEventListener('resize', () => {
      clearTimeout(window.researchResizeTimeout);
      window.researchResizeTimeout = setTimeout(resize, 100);
    });
    resize();

    function step() {
      if (!width || !height) { requestAnimationFrame(step); return; }
      const dim = Math.min(width, height);
      const dark = document.documentElement.dataset.theme === 'dark';

      ctx.clearRect(0, 0, width, height);
      if (dark) { ctx.fillStyle = '#0d0100'; ctx.fillRect(0, 0, width, height); }
      const a0 = dark ? 0.90 : 0.58;
      const a1 = dark ? 0.55 : 0.34;
      const a2 = dark ? 0.18 : 0.14;

      for (const b of blobs) {
        b.bx += b.vx; b.by += b.vy;
        if (b.bx < 0.06 || b.bx > 0.94) b.vx *= -1;
        if (b.by < 0.03 || b.by > 0.97) b.vy *= -1;
        b.bx = Math.min(0.94, Math.max(0.06, b.bx));
        b.by = Math.min(0.97, Math.max(0.03, b.by));

        const baseX = b.bx * width, baseY = b.by * height;
        let tx = baseX, ty = baseY;
        if (mouseActive) {
          const dx = mouseX - baseX, dy = mouseY - baseY;
          const d = Math.hypot(dx, dy) || 1;
          const R = 420;
          if (d < R) { const pull = 1 - d / R; const k = pull * pull * 0.7; tx = baseX + dx * k; ty = baseY + dy * k; }
        }
        b.x += (tx - b.x) * 0.06;
        b.y += (ty - b.y) * 0.06;

        const r = b.rf * dim;
        const [rr, gg, bb] = dark ? b.c : b.cl;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, r);
        g.addColorStop(0,    `rgba(${rr},${gg},${bb},${a0})`);
        g.addColorStop(0.35, `rgba(${rr},${gg},${bb},${a1})`);
        g.addColorStop(0.65, `rgba(${rr},${gg},${bb},${a2})`);
        g.addColorStop(1,    `rgba(${rr},${gg},${bb},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }
      requestAnimationFrame(step);
    }
    step();
  }
  initResearchCanvas();

  /* ===== HOW WE WORK LINE ===== */
  function initHowWeWork() {
    const stepsEl = document.querySelector('.hww__steps');
    const svg = document.getElementById('hwwLineSvg');
    const path = document.getElementById('hwwLinePath');
    if (!stepsEl || !svg || !path) return;
    const numEls = Array.from(stepsEl.querySelectorAll('.hww__step-num-wrap'));
    if (numEls.length < 2) return;

    let totalLen = 0;

    function rebuild() {
      const sr = stepsEl.getBoundingClientRect();
      const pts = numEls.map(el => {
        const r = el.getBoundingClientRect();
        return { x: r.left - sr.left + r.width / 2, y: r.top - sr.top + r.height / 2 };
      });

      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        const midY = (a.y + b.y) / 2;
        d += ` L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;
      }

      path.setAttribute('d', d);
      svg.setAttribute('viewBox', `0 0 ${stepsEl.offsetWidth} ${stepsEl.offsetHeight}`);
      totalLen = path.getTotalLength();
      path.style.strokeDasharray = totalLen;
      tick();
    }

    function tick() {
      if (!totalLen) return;
      const sr = stepsEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const progress = Math.max(0, Math.min(1, (vh * 0.85 - sr.top) / sr.height));
      path.style.strokeDashoffset = totalLen * (1 - progress);
    }

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', () => requestAnimationFrame(rebuild));
    requestAnimationFrame(rebuild);
  }
  initHowWeWork();

  /* ===== COVERAGE MAP — PARTICLE ASSEMBLY ===== */
  function initCoverageMap() {
    const section = document.getElementById('coverage-map');
    if (!section) return;
    const wrap = section.querySelector('.coverage-map__wrap');
    const img  = section.querySelector('.coverage-map__img');
    const markers = Array.from(section.querySelectorAll('.map-marker'));
    if (!wrap || !img) return;

    // ---- tunables ----
    const MAP_AR = 1009.6727 / 665.96301;            // svg aspect ratio
    const COUNT  = window.innerWidth < 700 ? 7000 : 16000;
    const STAGGER = 0.5;                              // 0..1 assembly spread
    const PARTICLE = 2.6;                             // base dot size (px)
    const progressFn = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      return Math.max(0, Math.min(1, (vh * 0.7 - rect.top) / (vh * 0.65)));
    };
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    // marker reveal (used by both particle mode and fallback)
    function revealMarkers(p, after) {
      markers.forEach((m, i) => {
        const th = after + (i + 0.5) / markers.length * (0.97 - after);
        if (p >= th) m.classList.add('is-active');
        else m.classList.remove('is-active');
      });
    }

    function fallback() {
      const onScroll = () => revealMarkers(
        Math.max(0, Math.min(1, (window.innerHeight - section.getBoundingClientRect().top) / (window.innerHeight * 0.65))),
        0.1
      );
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    const canvas = document.createElement('canvas');
    canvas.className = 'coverage-map__canvas';
    canvas.setAttribute('aria-hidden', 'true');
    wrap.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let pts = [], W = 0, H = 0, mx = 0, my = 0, mw = 0, mh = 0;
    let sampled = false, running = false, raf = 0;

    function sample() {
      const sw = 460, sh = Math.round(sw / MAP_AR);
      const off = document.createElement('canvas');
      off.width = sw; off.height = sh;
      const octx = off.getContext('2d');
      try {
        octx.drawImage(img, 0, 0, sw, sh);
        const d = octx.getImageData(0, 0, sw, sh).data;
        const cand = [];
        for (let y = 0; y < sh; y += 1) {
          for (let x = 0; x < sw; x += 1) {
            if (d[(y * sw + x) * 4 + 3] > 110) cand.push([x / sw, y / sh]);
          }
        }
        if (!cand.length) return false;
        for (let i = cand.length - 1; i > 0; i--) {       // shuffle
          const j = (Math.random() * (i + 1)) | 0;
          const t = cand[i]; cand[i] = cand[j]; cand[j] = t;
        }
        pts = cand.slice(0, COUNT).map(c => ({
          nx: c[0], ny: c[1],
          sx: Math.random(), sy: Math.random(),         // scattered start
          d: Math.random() * STAGGER,                    // per-particle delay
          r: PARTICLE * (0.55 + Math.random() * 0.9)     // varied dot sizes
        }));
        sampled = true;
        return true;
      } catch (e) { return false; }
    }

    function resize() {
      const wr = wrap.getBoundingClientRect();
      if (!wr.width || !wr.height) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = wr.width; H = wr.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const ir = img.getBoundingClientRect();              // map sits exactly over the <img>
      mw = ir.width || W; mh = ir.height || (W / MAP_AR);
      mx = ir.left - wr.left; my = ir.top - wr.top;
    }

    function draw() {
      raf = 0;
      const p = progressFn();
      ctx.clearRect(0, 0, W, H);
      // dense particles already form the map; the solid SVG only fills the gaps
      // right at the very end, in the SAME colour, so the handoff is invisible
      const solid = Math.max(0, Math.min(1, (p - 0.86) / 0.14));
      img.style.opacity = solid;
      if (sampled) {
        const dark = document.documentElement.dataset.theme === 'dark';
        const col = dark ? '48,46,46' : '214,212,212';
        const span = 1 - STAGGER;
        const base = (dark ? 0.92 : 0.9) * (1 - solid); // dots dissolve as the fill takes over
        if (base > 0.001) {
          for (let i = 0; i < pts.length; i++) {
            const pt = pts[i];
            let lp = (p - pt.d) / span;
            if (lp <= 0) continue;
            if (lp > 1) lp = 1;
            const e = easeOut(lp);
            const tx = mx + pt.nx * mw, ty = my + pt.ny * mh;
            const sx = mx + pt.sx * mw, sy = my + pt.sy * mh;
            const x = sx + (tx - sx) * e, y = sy + (ty - sy) * e;
            ctx.fillStyle = 'rgba(' + col + ',' + (e * base) + ')';
            ctx.fillRect(x, y, pt.r, pt.r);
          }
        }
      }
      revealMarkers(p, 0.7);                               // dots appear once map is ~filled
      if (running) raf = requestAnimationFrame(draw);
    }

    function start() { if (!running) { running = true; if (!raf) raf = requestAnimationFrame(draw); } }
    function stop()  { running = false; if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    function boot() {
      resize();
      if (!sample()) { canvas.remove(); fallback(); return; }
      img.style.opacity = '0';                             // particles replace the static map
      const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { rootMargin: '250px' });
      io.observe(section);
      let rt;
      window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
    }

    if (img.complete && img.naturalWidth) boot();
    else img.addEventListener('load', boot, { once: true });
  }
  initCoverageMap();

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
