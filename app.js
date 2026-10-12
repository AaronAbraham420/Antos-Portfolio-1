/**
 * Antos Jr - Official Artist Portfolio
 * Client-Side JavaScript Engine (Red Theme Edition)
 * Optimized for Mobile & Desktop
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initAudioPlayer();
  initDiscographyFilter();
  initLightbox();
  initEmailCopy();
  initScrollAnimations();
});

/* ==========================================================================
   1. MOBILE DRAWER NAVIGATION
   ========================================================================== */
function initMobileNav() {
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  if (!menuToggle || !mobileDrawer) return;

  function toggleMenu() {
    const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', !isExpanded);
    mobileDrawer.classList.toggle('active');
    document.body.style.overflow = !isExpanded ? 'hidden' : '';
  }

  function closeMenu() {
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', toggleMenu);

  mobileNavItems.forEach(item => {
    item.addEventListener('click', closeMenu);
  });
}

/* ==========================================================================
   2. INTERACTIVE AUDIO & SYNTH PREVIEW PLAYER
   ========================================================================== */
function initAudioPlayer() {
  const bannerPlayToggle = document.getElementById('banner-play-toggle');
  const bannerPlayIcon = document.getElementById('banner-play-icon');
  const soundwaveViz = document.getElementById('soundwave-viz');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressBarClick = document.getElementById('progress-bar-click');
  const timeCurrent = document.getElementById('time-current');
  const timeTotal = document.getElementById('time-total');
  const playerTitle = document.getElementById('player-track-title');
  const playerArtist = document.getElementById('player-track-artist');
  const cardPlayButtons = document.querySelectorAll('.card-play-btn');

  let isPlaying = false;
  let currentSeconds = 0;
  const totalSeconds = 194; // 3:14
  let playInterval = null;

  // Web Audio Context for realistic ambient beat preview
  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;

  function initWebAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function startAudioSynth() {
    try {
      initWebAudio();
      if (!audioCtx) return;

      // Create a smooth subterranean sub-bass pulse
      oscillator = audioCtx.createOscillator();
      gainNode = audioCtx.createGain();

      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(55, audioCtx.currentTime); // Low A note

      gainNode.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
    } catch (e) {
      console.warn('Audio synthesis not supported or permitted:', e);
    }
  }

  function stopAudioSynth() {
    try {
      if (gainNode && audioCtx) {
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
        setTimeout(() => {
          if (oscillator) {
            oscillator.stop();
            oscillator.disconnect();
            oscillator = null;
          }
        }, 150);
      }
    } catch (e) {
      // safe fallback
    }
  }

  function formatTime(sec) {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function playTrack() {
    isPlaying = true;
    soundwaveViz.classList.add('playing');
    bannerPlayIcon.innerHTML = '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>';
    startAudioSynth();

    clearInterval(playInterval);
    playInterval = setInterval(() => {
      currentSeconds++;
      if (currentSeconds >= totalSeconds) {
        currentSeconds = 0;
        pauseTrack();
      }
      updateProgress();
    }, 1000);
  }

  function pauseTrack() {
    isPlaying = false;
    soundwaveViz.classList.remove('playing');
    bannerPlayIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    clearInterval(playInterval);
    stopAudioSynth();
  }

  function updateProgress() {
    const percentage = (currentSeconds / totalSeconds) * 100;
    progressBarFill.style.width = `${percentage}%`;
    timeCurrent.textContent = formatTime(currentSeconds);
  }

  if (bannerPlayToggle) {
    bannerPlayToggle.addEventListener('click', () => {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack();
      }
    });
  }

  // Click on progress bar to seek
  if (progressBarClick) {
    progressBarClick.addEventListener('click', (e) => {
      const rect = progressBarClick.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const seekRatio = Math.max(0, Math.min(1, clickX / width));
      currentSeconds = Math.floor(seekRatio * totalSeconds);
      updateProgress();
      if (!isPlaying) {
        playTrack();
      }
    });
  }

  // Hook Discography Track Play Buttons
  cardPlayButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const trackName = btn.getAttribute('data-track');
      const artistName = btn.getAttribute('data-artist');

      if (playerTitle) playerTitle.textContent = trackName;
      if (playerArtist) playerArtist.textContent = artistName;

      // Scroll smoothly to player banner
      if (bannerPlayToggle) {
        bannerPlayToggle.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      currentSeconds = 0;
      updateProgress();
      playTrack();
    });
  });
}

/* ==========================================================================
   3. DISCOGRAPHY CATEGORY FILTER
   ========================================================================== */
function initDiscographyFilter() {
  const filterPills = document.querySelectorAll('.filter-pill');
  const trackCards = document.querySelectorAll('.track-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');

      const filterValue = pill.getAttribute('data-filter');

      trackCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'flex';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transition = 'opacity 0.3s ease';
          }, 50);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. LIGHTBOX IMAGE MODAL
   ========================================================================== */
function initLightbox() {
  const modal = document.getElementById('lightbox-modal');
  const modalImg = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close');
  const backdrop = document.getElementById('lightbox-backdrop');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (!modal || !modalImg) return;

  function openLightbox(src, alt, title) {
    modalImg.src = src;
    modalImg.alt = alt || 'Antos Jr Gallery Photo';
    caption.textContent = title || alt || '';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  galleryItems.forEach(item => {
    const img = item.querySelector('img');
    const titleEl = item.querySelector('.overlay-title');
    const title = titleEl ? titleEl.textContent : '';

    item.addEventListener('click', () => {
      if (img) openLightbox(img.src, img.alt, title);
    });

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (img) openLightbox(img.src, img.alt, title);
      }
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (backdrop) backdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeLightbox();
    }
  });
}

/* ==========================================================================
   5. EMAIL COPY TO CLIPBOARD
   ========================================================================== */
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailTextEl = document.getElementById('artist-email');
  const copyBtnText = document.getElementById('copy-btn-text');

  if (!copyBtn || !emailTextEl) return;

  copyBtn.addEventListener('click', async () => {
    const email = emailTextEl.textContent.trim();
    try {
      await navigator.clipboard.writeText(email);
      if (copyBtnText) copyBtnText.textContent = 'Copied!';
      copyBtn.classList.add('btn-primary');
      copyBtn.classList.remove('btn-secondary');

      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copy Email';
        copyBtn.classList.remove('btn-primary');
        copyBtn.classList.add('btn-secondary');
      }, 2500);
    } catch (err) {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = email;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);

      if (copyBtnText) copyBtnText.textContent = 'Copied!';
      setTimeout(() => {
        if (copyBtnText) copyBtnText.textContent = 'Copy Email';
      }, 2500);
    }
  });
}

/* ==========================================================================
   6. SCROLL ANIMATIONS & ACTIVE NAV OBSERVER
   ========================================================================== */
function initScrollAnimations() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.desktop-nav .nav-item');

  function updateActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
}
