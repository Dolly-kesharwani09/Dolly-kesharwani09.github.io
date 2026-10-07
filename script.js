/* ==========================================
   PORTFOLIO — script.js
   GSAP 3 + ScrollTrigger + Lenis + Custom Cursor
   ========================================== */
(function () {
  'use strict';

  /* ---- Register GSAP plugins ---- */
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  /* ==========================================
     REDUCED MOTION & DEVICE DETECTION
     ========================================== */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const isMobileScreen = window.innerWidth < 768;

  // On touch devices, immediately remove custom cursor element to eliminate overhead
  if (isTouchDevice) {
    const cursorEl = document.getElementById('cursor');
    if (cursorEl) cursorEl.remove();
  }

  /* ==========================================
     PRELOADER
     ========================================== */
  const preloader = document.getElementById('preloader');
  const plCounter = document.getElementById('preloader-counter');
  const plName = document.getElementById('preloader-name');

  function initHeroAnim() {
    const heroLine1 = document.getElementById('heroLine1');
    const heroLine2 = document.getElementById('heroLine2');
    const heroEyebrow = document.getElementById('heroEyebrow');
    const heroSubtitle = document.getElementById('heroSubtitle');
    const heroCta = document.getElementById('heroCta');

    if (prefersReducedMotion) {
      fitHeroName();
      if (heroEyebrow) heroEyebrow.style.opacity = '1';
      if (heroSubtitle) heroSubtitle.style.opacity = '1';
      if (heroCta) heroCta.style.opacity = '1';
      return;
    }

    // Split text into character spans inside mask wrappers with padding-bottom
    function splitChars(el) {
      if (!el) return [];
      const text = el.textContent.trim();
      el.innerHTML = text.split('').map(function (c) {
        if (c === ' ') return '<span class="char-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.1em"><span class="char" style="display:inline-block;width:0.25em">&nbsp;</span></span>';
        return '<span class="char-wrap" style="display:inline-block;overflow:hidden;vertical-align:bottom;padding-bottom:0.1em"><span class="char" style="display:inline-block;will-change:transform,opacity">' + c + '</span></span>';
      }).join('');
      return el.querySelectorAll('.char');
    }

    const chars1 = splitChars(heroLine1);
    const chars2 = splitChars(heroLine2);

    // Recalculate fit-text after character-split animation setup
    fitHeroName();

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: function () {
        // Remove mask after animation ends so no characters are clipped
        document.querySelectorAll('.char-wrap').forEach(function (wrap) {
          wrap.style.overflow = 'visible';
        });
        fitHeroName();
      }
    });

    if (heroEyebrow) {
      tl.to(heroEyebrow, { opacity: 1, duration: 0.5, y: 0 }, 0);
    }

    if (chars1.length) {
      tl.fromTo(chars1,
        { y: '115%', rotate: 8, opacity: 0 },
        { y: '0%', rotate: 0, opacity: 1, duration: 0.8, stagger: 0.04 },
        0.1
      );
    }

    if (chars2.length) {
      tl.fromTo(chars2,
        { y: '115%', rotate: -6, opacity: 0 },
        { y: '0%', rotate: 0, opacity: 1, duration: 0.8, stagger: 0.04 },
        0.2
      );
    }

    if (heroSubtitle) {
      tl.to(heroSubtitle, { opacity: 1, y: 0, duration: 0.6 }, 0.75);
    }

    if (heroCta) {
      tl.to(heroCta, { opacity: 1, y: 0, duration: 0.5 }, 0.9);
    }
  }

  if (prefersReducedMotion) {
    if (preloader) preloader.style.display = 'none';
    initHeroAnim();
  } else if (preloader && plCounter && plName) {
    const startTime = performance.now();
    // Shorten preloader duration on mobile/touch (~1.2s total)
    const duration = (isTouchDevice || isMobileScreen) ? 550 : 1100;

    function runCounter(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth easeOut
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(easeProgress * 100);
      plCounter.textContent = val;

      if (progress < 1) {
        requestAnimationFrame(runCounter);
      } else {
        plCounter.textContent = '100';
        // Reveal designer name
        gsap.to(plName, {
          clipPath: 'inset(0 0% 0 0)',
          opacity: 1,
          y: 0,
          duration: (isTouchDevice || isMobileScreen) ? 0.25 : 0.45,
          ease: 'power3.out',
          onComplete: function () {
            // Slide preloader up
            gsap.to(preloader, {
              yPercent: -100,
              duration: (isTouchDevice || isMobileScreen) ? 0.4 : 0.7,
              ease: 'power4.inOut',
              delay: (isTouchDevice || isMobileScreen) ? 0.05 : 0.15,
              onComplete: function () {
                preloader.style.display = 'none';
                initHeroAnim();
              }
            });
          }
        });
      }
    }
    requestAnimationFrame(runCounter);
  } else {
    initHeroAnim();
  }

  /* ==========================================
     LENIS SMOOTH SCROLL
     ========================================== */
  const lenis = new Lenis({
    duration: isTouchDevice ? 0.8 : 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false, // native momentum scrolling on mobile
    syncTouch: true,
  });

  function lenisRaf(time) {
    lenis.raf(time);
    ScrollTrigger.update();
    requestAnimationFrame(lenisRaf);
  }
  requestAnimationFrame(lenisRaf);

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]:not(#mobile-nav a)').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
    });
  });

  /* ==========================================
     SCROLL PROGRESS BAR
     ========================================== */
  const progressBar = document.getElementById('scroll-progress');
  lenis.on('scroll', ({ progress }) => {
    if (progressBar) progressBar.style.width = (progress * 100) + '%';
  });

  /* ==========================================
     HERO NAME FIT-TEXT
     Calculates font-size so DOLLY and KESHARWANI
     each precisely fill window width with 5vw side padding (90vw total)
     without clipping on any phone width (360px - 414px)
     ========================================== */
  function fitHeroName() {
    const line1 = document.getElementById('heroLine1');
    const line2 = document.getElementById('heroLine2');
    if (!line1 || !line2) return;

    const vw = window.innerWidth;
    // Target width: 90% of screen (5vw side padding on each side)
    const targetW = Math.floor(vw * 0.90) - 2;

    function calcSize(text) {
      const measurer = document.createElement('span');
      measurer.style.cssText = [
        'display: inline-block',
        'white-space: nowrap',
        'font-family: "Syne", sans-serif',
        'font-weight: 800',
        'font-size: 100px',
        'letter-spacing: -0.04em',
        'padding-left: 0.02em',
        'padding-right: 0.02em',
        'position: absolute',
        'left: -9999px',
        'top: -9999px',
        'visibility: hidden',
        'pointer-events: none'
      ].join(';');
      measurer.textContent = text;
      document.body.appendChild(measurer);
      const measuredW = measurer.getBoundingClientRect().width;
      document.body.removeChild(measurer);
      if (measuredW <= 0) return 60;
      return (targetW / measuredW) * 100;
    }

    let fs1 = calcSize('DOLLY');
    let fs2 = calcSize('KESHARWANI');

    line1.style.fontSize = Math.floor(fs1) + 'px';
    line2.style.fontSize = Math.floor(fs2) + 'px';

    // Verify actual scroll width after rendering (safety check for letter 'I')
    requestAnimationFrame(() => {
      if (line1.scrollWidth > targetW && line1.scrollWidth > 0) {
        fs1 = fs1 * (targetW / line1.scrollWidth);
        line1.style.fontSize = Math.floor(fs1) + 'px';
      }
      if (line2.scrollWidth > targetW && line2.scrollWidth > 0) {
        fs2 = fs2 * (targetW / line2.scrollWidth);
        line2.style.fontSize = Math.floor(fs2) + 'px';
      }
    });
  }

  // Run fit-text only after document.fonts.ready resolves
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitHeroName);
  } else {
    window.addEventListener('load', fitHeroName);
  }

  // Recalculate on window resize and orientation change
  let heroResizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(heroResizeTimer);
    heroResizeTimer = setTimeout(fitHeroName, 60);
  });
  window.addEventListener('orientationchange', function () {
    setTimeout(fitHeroName, 100);
  });

  /* ==========================================
     NAV — Hide on scroll down, show on scroll up
     ========================================== */
  const nav = document.getElementById('nav');
  const burger = document.querySelector('.nav-burger');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavClose = document.getElementById('mobileNavClose');

  let lastScrollY = 0;
  function updateNavOffset() {
    if (!nav) return;
    const isHidden = nav.classList.contains('nav-hidden');
    const h = isHidden ? 0 : nav.offsetHeight;
    document.documentElement.style.setProperty('--nav-offset', h + 'px');
  }

  lenis.on('scroll', ({ scroll }) => {
    nav.classList.toggle('scrolled', scroll > 60);

    // Keep nav visible if mobile overlay is open
    if (!mobileNav.classList.contains('open')) {
      if (scroll > lastScrollY + 8 && scroll > 120) {
        nav.classList.add('nav-hidden');
      } else if (scroll < lastScrollY - 4) {
        nav.classList.remove('nav-hidden');
      }
    }
    lastScrollY = scroll;
    updateNavOffset();
  });

  function openMobileNav() {
    mobileNav.classList.add('open');
    burger.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    lenis.stop();
    document.body.style.overflow = 'hidden';

    // Staggered fade-up animation for mobile nav links
    const items = mobileNav.querySelectorAll('li');
    gsap.fromTo(items,
      { y: 35, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.08, ease: 'power3.out', overwrite: 'auto' }
    );
  }

  function closeMobileNav() {
    mobileNav.classList.remove('open');
    burger.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    lenis.start();
    document.body.style.overflow = '';
  }

  if (burger) {
    burger.addEventListener('click', () => {
      if (mobileNav.classList.contains('open')) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', closeMobileNav);
  }

  mobileNav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileNav();
      const targetId = a.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        setTimeout(() => {
          lenis.scrollTo(target, { offset: -70, duration: 1.2 });
        }, 150);
      }
    });
  });

  window.addEventListener('resize', updateNavOffset);
  updateNavOffset();

  /* ==========================================
     SECTION HEADINGS — Mask reveal on scroll
     ========================================== */
  if (!prefersReducedMotion) {
    document.querySelectorAll('.reveal-heading').forEach((el) => {
      const inner = document.createElement('span');
      inner.className = 'reveal-heading-inner';
      inner.innerHTML = el.innerHTML;
      el.innerHTML = '';
      el.appendChild(inner);

      ScrollTrigger.create({
        trigger: el,
        start: 'top 92%',
        onEnter: () => {
          gsap.to(inner, { y: '0%', duration: 0.85, ease: 'power3.out' });
        },
        once: true,
      });
    });
  }

  /* ==========================================
     MARQUEE — Velocity reaction & reverse on up-scroll
     ========================================== */
  const marqueeTrack = document.getElementById('heroMarqueeTrack');
  let marqueeDirection = 1;
  const baseMarqueeDuration = 45;

  if (marqueeTrack) {
    lenis.on('scroll', ({ velocity }) => {
      const speed = Math.abs(velocity);
      const boost = 1 + Math.min(speed * 0.15, 3.5);
      marqueeTrack.style.animationDuration = (baseMarqueeDuration / boost) + 's';

      const dir = velocity >= 0 ? 1 : -1;
      if (dir !== marqueeDirection) {
        marqueeDirection = dir;
        marqueeTrack.style.animationDirection = dir === 1 ? 'normal' : 'reverse';
      }
    });
  }

  /* ==========================================
     WORK CARDS — Stagger reveal + 3D Tilt + Parallax
     ========================================== */
  function addTilt(card) {
    if (isTouchDevice || card._hasTilt) return;
    card._hasTilt = true;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      gsap.to(card, {
        rotateX: -dy * 6,
        rotateY: dx * 6,
        transformPerspective: 800,
        duration: 0.4,
        ease: 'power2.out',
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
    });
  }

  /* ==========================================
     IMAGE PATH NORMALIZATION & HELPERS
     Ensures relative paths with no leading slashes.
     Works cleanly on subfolder URLs like /portfolio/
     ========================================== */
  function cleanImagePath(path) {
    if (!path) return '';
    return String(path).replace(/^\/+/, '');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  let allCardsList = [];
  let loadMoreCards = [];
  let loadMoreIndex = 0;
  let cardScrollTriggers = [];

  function setupWorkCards() {
    // Clean up any existing ScrollTriggers on work cards
    cardScrollTriggers.forEach((st) => st.kill());
    cardScrollTriggers = [];

    allCardsList = Array.from(document.querySelectorAll('.work-card'));
    loadMoreCards = Array.from(document.querySelectorAll('.work-card.load-more-card'));

    // Attach lightbox click handlers
    allCardsList.forEach((card) => {
      card.addEventListener('click', () => {
        currentCardIndex = allCardsList.indexOf(card);
        try {
          const rawPages = JSON.parse(card.dataset.pages || '[]');
          const pages = (Array.isArray(rawPages) ? rawPages : []).map(cleanImagePath);
          openLightbox(pages, card.dataset.title, card.dataset.desc);
        } catch (err) {
          console.error(err);
        }
      });
    });

    // Initial non-load-more cards reveal & tilt
    document.querySelectorAll('.work-card:not(.load-more-card)').forEach((card, i) => {
      addTilt(card);

      if (!prefersReducedMotion) {
        const st = ScrollTrigger.create({
          trigger: card,
          start: 'top 92%',
          onEnter: () => {
            gsap.to(card, {
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: isMobileScreen ? 0.5 : 0.75,
              delay: isMobileScreen ? 0.04 : (i % 3) * 0.1,
              ease: 'power3.out',
            });
            card.classList.add('card-revealed');
          },
          once: true,
        });
        cardScrollTriggers.push(st);

        // Card image parallax on scroll (desktop only)
        if (!isTouchDevice && window.innerWidth >= 768) {
          const img = card.querySelector('.card-img-wrap img');
          if (img) {
            const tween = gsap.to(img, {
              yPercent: -8,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
              },
            });
            if (tween.scrollTrigger) cardScrollTriggers.push(tween.scrollTrigger);
          }
        }
      } else {
        card.classList.add('card-revealed');
      }
    });

    // Bind cursor hover listeners
    if (window._bindCursorCard) {
      allCardsList.forEach(window._bindCursorCard);
    }
  }

  function createCardElement(work, index) {
    const card = document.createElement('article');
    card.className = 'work-card';
    if (index >= 9) {
      card.classList.add('load-more-card');
    }
    const cat = (work.category || 'all').toLowerCase();
    card.dataset.category = cat;

    const rawPages = Array.isArray(work.pages) && work.pages.length > 0
      ? work.pages
      : (work.image ? [work.image] : []);
    const cleanPages = rawPages.map(cleanImagePath);

    card.dataset.pages = JSON.stringify(cleanPages);
    card.dataset.title = work.title || '';
    card.dataset.desc = work.type || '';

    const coverImg = cleanImagePath(work.image || cleanPages[0] || '');
    const pageBadge = cleanPages.length > 1
      ? `<span class="card-page-badge">${cleanPages.length} pages</span>`
      : '';

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${coverImg}" alt="${escapeHtml(work.title || '')}" loading="lazy" decoding="async" />
        <div class="card-overlay"></div>
        ${pageBadge}
      </div>
      <div class="card-info">
        <h3>${escapeHtml(work.client || work.title || '')}</h3>
        <p>${escapeHtml(work.type || '')}</p>
      </div>
    `;

    return card;
  }

  function loadWorksFromData() {
    fetch('data/works.json')
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then((data) => {
        if (!data || !Array.isArray(data.works) || data.works.length === 0) return;
        const workGrid = document.getElementById('workGrid');
        if (!workGrid) return;

        const works = data.works.slice().sort((a, b) => {
          const ordA = typeof a.order === 'number' ? a.order : 999;
          const ordB = typeof b.order === 'number' ? b.order : 999;
          return ordA - ordB;
        });

        workGrid.innerHTML = '';
        works.forEach((w, i) => {
          const card = createCardElement(w, i);
          workGrid.appendChild(card);
        });

        loadMoreIndex = 0;
        setupWorkCards();

        // Update Featured section if a project has featured: true
        const feat = works.find((w) => w.featured === true);
        if (feat) {
          const featImg = document.querySelector('#featuredParallax img');
          if (featImg && feat.image) {
            featImg.src = cleanImagePath(feat.image);
            featImg.alt = feat.title || '';
          }
          const featBtn = document.querySelector('.featured-open');
          if (featBtn) {
            const featPages = Array.isArray(feat.pages) && feat.pages.length > 0
              ? feat.pages
              : [feat.image];
            featBtn.dataset.pages = JSON.stringify(featPages.map(cleanImagePath));
            if (feat.title) featBtn.dataset.title = feat.title;
            if (feat.type) featBtn.dataset.desc = feat.type;
          }
        }

        applyFilter(currentFilterCategory);
        ScrollTrigger.refresh();
      })
      .catch((err) => {
        // Plain static fallback: keep existing hardcoded HTML cards
        console.warn('data/works.json not fetched (using static HTML):', err);
      });
  }

  /* ==========================================
     LOAD MORE BUTTON
     Initial 9 shown, Load More reveals next 9, then remaining 6
     ========================================== */
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  const BATCH_SIZE = 9;

  function revealNextBatch() {
    const batch = loadMoreCards.slice(loadMoreIndex, loadMoreIndex + BATCH_SIZE);
    if (!batch.length) return;

    batch.forEach((card, i) => {
      card.classList.add('load-more-revealed');
      addTilt(card);

      if (!prefersReducedMotion) {
        gsap.fromTo(card,
          { clipPath: 'inset(0% 0% 100% 0%)', opacity: 0 },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            opacity: 1,
            duration: isMobileScreen ? 0.5 : 0.75,
            delay: isMobileScreen ? 0.04 : (i % 3) * 0.08,
            ease: 'power3.out',
            onComplete: () => card.classList.add('card-revealed'),
          }
        );
      } else {
        card.classList.add('card-revealed');
      }

      // Re-bind cursor listeners for newly revealed cards (desktop fine pointer only)
      if (window._bindCursorCard) window._bindCursorCard(card);
    });

    loadMoreIndex += BATCH_SIZE;

    if (loadMoreIndex >= loadMoreCards.length) {
      if (loadMoreWrap) loadMoreWrap.style.display = 'none';
    }

    applyFilter(currentFilterCategory);
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', revealNextBatch);
  }

  /* ==========================================
     FILTER TABS
     Works across all cards seamlessly
     ========================================== */
  const tabs = document.querySelectorAll('.tab');
  let currentFilterCategory = 'all';

  function applyFilter(category) {
    currentFilterCategory = category;
    const allCards = Array.from(document.querySelectorAll('.work-card'));

    const visibleCards = [];
    const hiddenCards = [];

    allCards.forEach((c) => {
      // In 'all' mode: respect load more status
      if (category === 'all') {
        if (c.classList.contains('load-more-card') && !c.classList.contains('load-more-revealed')) {
          c.classList.add('hidden');
          return;
        }
        visibleCards.push(c);
        c.classList.remove('hidden');
      } else {
        // Specific category: filter across all matching cards
        if (c.dataset.category === category) {
          visibleCards.push(c);
          c.classList.remove('hidden');
          c.classList.add('card-revealed');
        } else {
          hiddenCards.push(c);
          c.classList.add('hidden');
        }
      }
    });

    // Animate matching cards in
    if (!prefersReducedMotion && visibleCards.length > 0) {
      gsap.fromTo(visibleCards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.04 }
      );
    }

    // Toggle Load More button visibility
    if (loadMoreWrap) {
      if (category !== 'all' || loadMoreIndex >= loadMoreCards.length) {
        loadMoreWrap.style.display = 'none';
      } else {
        loadMoreWrap.style.display = 'flex';
      }
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      applyFilter(tab.dataset.filter);
    });
  });

  /* ==========================================
     FEATURED SECTION — ScrollTrigger pin & scale
     (Disabled below 768px for clean mobile stacking)
     ========================================== */
  const featuredWrap = document.getElementById('featuredImgWrap');
  if (featuredWrap && !prefersReducedMotion && window.innerWidth >= 768) {
    gsap.fromTo(featuredWrap,
      { scale: 0.8 },
      {
        scale: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '#featured',
          start: 'top 70%',
          end: 'top 20%',
          scrub: 1.2,
        },
      }
    );

    const featParallax = document.getElementById('featuredParallax');
    if (featParallax) {
      gsap.fromTo(featParallax,
        { y: -30 },
        {
          y: 30,
          ease: 'none',
          scrollTrigger: {
            trigger: '#featured',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      );
    }
  } else if (featuredWrap) {
    featuredWrap.style.transform = 'none';
  }

  /* About profile photo parallax (desktop only) */
  const profilePhotoFrame = document.getElementById('aboutPhotoFrame');
  if (profilePhotoFrame && !prefersReducedMotion && window.innerWidth >= 768) {
    gsap.fromTo(profilePhotoFrame,
      { y: -25 },
      {
        y: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: '#about',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        },
      }
    );
  }

  /* Skills strip pause on hover */
  const skillsTrack = document.querySelector('.skills-track');
  if (skillsTrack) {
    skillsTrack.addEventListener('mouseenter', () => skillsTrack.style.animationPlayState = 'paused');
    skillsTrack.addEventListener('mouseleave', () => skillsTrack.style.animationPlayState = 'running');
  }

  /* ==========================================
     LIGHTBOX — Multi-page support with Prev / Next & Touch Swipe
     ========================================== */
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbTitle = document.getElementById('lb-title');
  const lbDesc = document.getElementById('lb-desc');
  const lbCounter = document.getElementById('lb-counter');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  let currentPages = [];
  let currentPageIndex = 0;

  function updateLightboxPage(idx) {
    if (!currentPages.length) return;
    currentPageIndex = (idx + currentPages.length) % currentPages.length;

    gsap.to(lbImg, {
      opacity: 0,
      duration: 0.15,
      onComplete: () => {
        lbImg.src = cleanImagePath(currentPages[currentPageIndex]);
        gsap.to(lbImg, { opacity: 1, duration: 0.2 });
      }
    });

    if (lbCounter) {
      lbCounter.textContent = currentPages.length > 1
        ? (currentPageIndex + 1) + ' / ' + currentPages.length
        : '';
    }
  }

  function openLightbox(pages, title, desc) {
    if (!pages || !pages.length) return;
    currentPages = (pages || []).map(cleanImagePath);
    currentPageIndex = 0;

    lbTitle.textContent = title || '';
    lbDesc.innerHTML = desc || '';
    lbImg.src = cleanImagePath(currentPages[0]);
    lbImg.alt = title || '';

    if (currentPages.length > 1) {
      lightbox.classList.add('multi-page');
      if (lbCounter) lbCounter.textContent = '1 / ' + currentPages.length;
    } else {
      lightbox.classList.remove('multi-page');
      if (lbCounter) lbCounter.textContent = '';
    }

    lightbox.classList.add('open');
    lenis.stop();
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open', 'multi-page');
    lenis.start();
    document.body.style.overflow = '';
    currentCardIndex = -1;
    setTimeout(() => { lbImg.src = ''; }, 350);
  }

  function handleLightboxNext() {
    if (currentPages.length > 1 && currentPageIndex < currentPages.length - 1) {
      updateLightboxPage(currentPageIndex + 1);
    } else if (currentCardIndex >= 0) {
      const visibleCards = allCardsList.filter(c => !c.classList.contains('hidden'));
      const curPos = visibleCards.findIndex(c => allCardsList.indexOf(c) === currentCardIndex);
      if (curPos !== -1 && curPos < visibleCards.length - 1) {
        const nextCard = visibleCards[curPos + 1];
        currentCardIndex = allCardsList.indexOf(nextCard);
        try {
          const pages = JSON.parse(nextCard.dataset.pages || '[]');
          openLightbox(pages, nextCard.dataset.title, nextCard.dataset.desc);
        } catch (e) {}
      } else if (currentPages.length > 1) {
        updateLightboxPage(0);
      }
    } else if (currentPages.length > 1) {
      updateLightboxPage(currentPageIndex + 1);
    }
  }

  function handleLightboxPrev() {
    if (currentPages.length > 1 && currentPageIndex > 0) {
      updateLightboxPage(currentPageIndex - 1);
    } else if (currentCardIndex >= 0) {
      const visibleCards = allCardsList.filter(c => !c.classList.contains('hidden'));
      const curPos = visibleCards.findIndex(c => allCardsList.indexOf(c) === currentCardIndex);
      if (curPos > 0) {
        const prevCard = visibleCards[curPos - 1];
        currentCardIndex = allCardsList.indexOf(prevCard);
        try {
          const pages = JSON.parse(prevCard.dataset.pages || '[]');
          openLightbox(pages, prevCard.dataset.title, prevCard.dataset.desc);
        } catch (e) {}
      } else if (currentPages.length > 1) {
        updateLightboxPage(currentPages.length - 1);
      }
    } else if (currentPages.length > 1) {
      updateLightboxPage(currentPageIndex - 1);
    }
  }

  // Featured open button
  document.querySelectorAll('.featured-open').forEach((btn) => {
    btn.addEventListener('click', () => {
      try {
        const rawPages = JSON.parse(btn.dataset.pages || '[]');
        const pages = (Array.isArray(rawPages) ? rawPages : []).map(cleanImagePath);
        openLightbox(pages, btn.dataset.title, btn.dataset.desc);
      } catch (err) {
        console.error(err);
      }
    });
  });

  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbPrev) lbPrev.addEventListener('click', handleLightboxPrev);
  if (lbNext) lbNext.addEventListener('click', handleLightboxNext);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target === document.getElementById('lb-inner')) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') handleLightboxPrev();
    if (e.key === 'ArrowRight') handleLightboxNext();
  });

  // Mobile Lightbox Swipe Gestures
  let lbTouchStartX = 0;
  let lbTouchStartY = 0;
  let lbTouchEndX = 0;
  let lbTouchEndY = 0;

  lightbox.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      lbTouchStartX = e.touches[0].clientX;
      lbTouchStartY = e.touches[0].clientY;
      lbTouchEndX = lbTouchStartX;
      lbTouchEndY = lbTouchStartY;
    }
  }, { passive: true });

  lightbox.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      lbTouchEndX = e.touches[0].clientX;
      lbTouchEndY = e.touches[0].clientY;
    }
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const diffX = lbTouchEndX - lbTouchStartX;
    const diffY = lbTouchEndY - lbTouchStartY;
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
      if (diffX < 0) {
        handleLightboxNext();
      } else {
        handleLightboxPrev();
      }
    }
  }, { passive: true });

  /* ==========================================
     MAGNETIC BUTTONS (Desktop fine pointer only)
     ========================================== */
  if (!isTouchDevice) {
    document.querySelectorAll('.mag-target').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        gsap.to(btn, { x: dx * 0.22, y: dy * 0.22, duration: 0.3, ease: 'power2.out' });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ==========================================
     NEW CUSTOM CURSOR
     Single outer element (#cursor) + inner child (#cursor-inner)
     - translate3d on outer with RAF lerp (~0.18)
     - scaling & velocity stretch/squash on inner
     - centered with negative margins (-8px for 16px, -40px for 80px, -30px for 60px)
     ========================================== */
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isFinePointer) {
    const cursor = document.getElementById('cursor');
    const cursorInner = document.getElementById('cursor-inner');

    if (cursor && cursorInner) {
      let mouseX = 0, mouseY = 0;
      let curX = 0, curY = 0;
      let prevX = 0, prevY = 0;
      let hasMoved = false;
      let isMouseDown = false;
      let activeMagnet = null;
      let mode = 'default'; // 'default', 'link', 'card', 'profile'

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!hasMoved) {
          hasMoved = true;
          curX = mouseX;
          curY = mouseY;
          prevX = mouseX;
          prevY = mouseY;
          cursor.style.opacity = '1';
        }
      });

      document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
      });

      document.addEventListener('mouseenter', () => {
        if (hasMoved) cursor.style.opacity = '1';
      });

      window.addEventListener('mousedown', () => {
        isMouseDown = true;
      });

      window.addEventListener('mouseup', () => {
        isMouseDown = false;
      });

      // RAF Lerp loop
      function renderCursor() {
        if (hasMoved) {
          let targetX = mouseX;
          let targetY = mouseY;

          // Magnetic attraction towards element center (capped at 8px)
          if (activeMagnet && mode !== 'card' && mode !== 'profile') {
            const rect = activeMagnet.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = cx - mouseX;
            const dy = cy - mouseY;
            const dist = Math.hypot(dx, dy);
            const pull = Math.min(8, dist * 0.25);
            const angle = Math.atan2(dy, dx);
            targetX = mouseX + Math.cos(angle) * pull;
            targetY = mouseY + Math.sin(angle) * pull;
          }

          // Lerp factor ~0.18
          curX += (targetX - curX) * 0.18;
          curY += (targetY - curY) * 0.18;

          cursor.style.transform = 'translate3d(' + curX + 'px, ' + curY + 'px, 0)';

          // Velocity calculation
          const vx = curX - prevX;
          const vy = curY - prevY;
          prevX = curX;
          prevY = curY;
          const speed = Math.hypot(vx, vy);

          // Base scale
          let baseScale = 1;
          if (mode === 'link') {
            baseScale = 2.5;
          }
          if (isMouseDown) {
            baseScale *= 0.85; // 15% scale down on click
          }

          // Velocity stretch effect
          if (mode === 'default' && speed > 0.4) {
            const stretch = Math.min(1 + speed * 0.045, 1.4);
            const squash = 1 / stretch;
            const angleDeg = Math.atan2(vy, vx) * (180 / Math.PI);
            cursorInner.style.transform = 'rotate(' + angleDeg + 'deg) scale(' + (stretch * baseScale) + ', ' + (squash * baseScale) + ')';
          } else {
            cursorInner.style.transform = 'scale(' + baseScale + ')';
          }
        }

        requestAnimationFrame(renderCursor);
      }
      requestAnimationFrame(renderCursor);

      // Links, buttons, filter tabs hover (magnetic + 2.5x scale)
      function bindCursorLink(el) {
        el.addEventListener('mouseenter', () => {
          if (mode === 'card' || mode === 'profile') return;
          activeMagnet = el;
          mode = 'link';
          document.body.classList.add('cursor-link');
        });

        el.addEventListener('mouseleave', () => {
          if (activeMagnet === el) activeMagnet = null;
          if (mode === 'link') {
            mode = 'default';
            document.body.classList.remove('cursor-link');
          }
        });
      }

      document.querySelectorAll('a, button, .tab, .mag-target').forEach(bindCursorLink);

      // Work cards hover (80px, #FF6B2C fill, blend mode off, ↗ arrow)
      function bindCursorCard(card) {
        card.addEventListener('mouseenter', () => {
          mode = 'card';
          activeMagnet = null;
          document.body.classList.remove('cursor-link', 'cursor-profile');
          document.body.classList.add('cursor-card');
        });

        card.addEventListener('mouseleave', () => {
          mode = 'default';
          document.body.classList.remove('cursor-card');
        });
      }

      document.querySelectorAll('.work-card, .featured-image-wrap').forEach(bindCursorCard);
      window._bindCursorCard = bindCursorCard;

      // Profile photo hover (60px ring with no fill)
      const profilePhoto = document.getElementById('aboutPhotoFrame');
      if (profilePhoto) {
        profilePhoto.addEventListener('mouseenter', () => {
          mode = 'profile';
          activeMagnet = null;
          document.body.classList.remove('cursor-link', 'cursor-card');
          document.body.classList.add('cursor-profile');
        });

        profilePhoto.addEventListener('mouseleave', () => {
          mode = 'default';
          document.body.classList.remove('cursor-profile');
        });
      }
    }
  }

  /* ==========================================
     INITIALIZE WORKS & LOAD DYNAMIC DATA
     ========================================== */
  setupWorkCards();
  loadWorksFromData();

})();
