// Theme toggle (dark / light) persisted in localStorage
(function(){
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  const KEY = 'theme-preference';

  function applyTheme(t){
    if(t === 'dark') root.setAttribute('data-theme','dark');
    else root.removeAttribute('data-theme');
    toggle.textContent = t === 'dark' ? '☀️' : '🌙';
  }

  const saved = localStorage.getItem(KEY) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  applyTheme(saved);

  toggle.addEventListener('click', ()=>{
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(KEY,next);
  });
})();

// Project gallery modal
(function(){
  const modal = document.getElementById('gallery-modal');
  if(!modal) return;
  const overlay = document.getElementById('gallery-overlay');
  const closeBtn = document.getElementById('gallery-close');
  const mainImg = document.getElementById('gallery-main-img');
  const thumbs = document.getElementById('gallery-thumbs');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');

  let currentImages = [];

  function openGallery(images, start=0){
    if(!images || images.length===0) return;
    currentImages = images;
    thumbs.innerHTML = '';
    images.forEach((src, i)=>{
      const t = document.createElement('img');
      t.src = src;
      t.className = 'gallery-thumb';
      t.alt = `Screenshot ${i+1}`;
      t.addEventListener('click', ()=> showImage(i));
      thumbs.appendChild(t);
    });
    showImage(start);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closeGallery(){
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    mainImg.src = '';
    thumbs.innerHTML = '';
    currentImages = [];
  }

  function showImage(i){
    i = Math.max(0, Math.min(i, currentImages.length-1));
    const src = currentImages[i];
    if(!src) return;
    mainImg.src = src;
    mainImg.dataset.index = i;
    Array.from(thumbs.children).forEach((el, idx)=> el.classList.toggle('active', idx===i));
    const activeThumb = thumbs.children[i];
    if(activeThumb) activeThumb.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});
  }

  document.querySelectorAll('.project-click').forEach(el=>{
    const raw = el.getAttribute('data-images') || '';
    const images = raw.split('|').map(s=>s.trim()).filter(Boolean).map(s=>decodeURIComponent(s));
    el.addEventListener('click', ()=> openGallery(images, 0));
    el.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); openGallery(images,0); } });
  });

  overlay.addEventListener('click', closeGallery);
  closeBtn.addEventListener('click', closeGallery);
  prevBtn?.addEventListener('click', ()=> thumbs.scrollBy({left:-180,behavior:'smooth'}));
  nextBtn?.addEventListener('click', ()=> thumbs.scrollBy({left:180,behavior:'smooth'}));

  mainImg.addEventListener('click', ()=>{
    if(document.fullscreenElement) document.exitFullscreen?.();
    else mainImg.requestFullscreen?.();
  });

  // close on ESC
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && !modal.classList.contains('hidden')) closeGallery(); });
})();

// Mobile nav toggle
(function(){
  const btn = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  if(!btn || !nav) return;

  btn.addEventListener('click', ()=>{
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(!expanded));
  });

  document.querySelectorAll('.nav a[href^="#"]').forEach((link)=>{
    link.addEventListener('click', ()=>{
      nav.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Reveal on scroll
(function(){
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('is-visible');
    });
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
})();

// Typing animation for hero line
(function(){
  const el = document.getElementById('typed-text');
  if(!el) return;
  const words = ['UI/UX Enthusiast','Future Tech Leader','Web Developer','Problem Solver'];
  let wordIndex = 0, charIndex = 0, deleting = false;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced){
    el.textContent = words[0];
    return;
  }

  function tick(){
    const current = words[wordIndex];
    if(!deleting){
      charIndex++;
      el.textContent = current.slice(0,charIndex);
      if(charIndex === current.length){
        deleting = true;
        setTimeout(tick, 1400);
      } else {
        setTimeout(tick, 80 + Math.random()*60);
      }
    } else {
      charIndex--;
      el.textContent = current.slice(0,charIndex);
      if(charIndex === 0){
        deleting = false;
        wordIndex = (wordIndex+1) % words.length;
        setTimeout(tick, 400);
      } else {
        setTimeout(tick, 40 + Math.random()*30);
      }
    }
  }
  // wait a moment to start
  setTimeout(tick, 700);
})();

// Parallax for decorative shapes (reduced-motion aware + throttled)
(function(){
  const container = document.querySelector('.decor-shapes');
  if(!container) return;
  const shapes = Array.from(container.querySelectorAll('.decor-shape'));

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced) return;

  let rafId = null;
  let lastX = null;
  let lastY = null;

  function apply(){
    rafId = null;
    if(lastX == null || lastY == null) return;

    const cx = window.innerWidth/2;
    const cy = window.innerHeight/2;
    const dx = (lastX - cx)/cx;
    const dy = (lastY - cy)/cy;

    shapes.forEach((s, i)=>{
      const depth = (i+1)/10; // smaller movement for further shapes
      const tx = dx * 20 * depth;
      const ty = dy * 14 * depth;
      s.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${1 - depth/6})`;
    });
  }

  function onMove(e){
    lastX = e.clientX;
    lastY = e.clientY;
    if(rafId == null) rafId = window.requestAnimationFrame(apply);
  }

  window.addEventListener('mousemove', onMove, {passive:true});
  window.addEventListener('touchmove', (ev)=>{
    const t = ev.touches && ev.touches[0];
    if(t) onMove(t);
  }, {passive:true});
})();

// Scroll-to-top button behavior
(function(){
  const btn = document.getElementById('scroll-top');
  if(!btn) return;
  function check(){
    if(window.scrollY > window.innerHeight/2) btn.classList.add('show');
    else btn.classList.remove('show');
  }
  window.addEventListener('scroll', check, {passive:true});
  check();
  btn.addEventListener('click', ()=>{
    window.scrollTo({top:0,behavior:'smooth'});
    btn.blur();
  });
})();

// Smooth internal link scrolling
(function(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const href = a.getAttribute('href');
      if(href.length>1){
        e.preventDefault();
        const target = document.querySelector(href);
        if(target) target.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });
})();

// Footer year
(function(){
  const y = new Date().getFullYear();
  const el = document.getElementById('year');
  if(el) el.textContent = y;
})();

// Contact form handling (client-side validation and mailto fallback)
(function(){
  const form = document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').toString();
    const email = (data.get('email') || '').toString();
    const message = (data.get('message') || '').toString();

    const nameInput = form.querySelector('input[name="name"]');
    const emailInput = form.querySelector('input[name="email"]');
    const messageInput = form.querySelector('textarea[name="message"]');

    // Basic client-side validation with focus
    if(!name.trim()){
      alert('Please enter your name.');
      (nameInput || form).focus && (nameInput || form).focus();
      return;
    }

    if(!email.trim() || !emailInput.checkValidity?.()){
      alert('Please enter a valid email address.');
      (emailInput || form).focus && (emailInput || form).focus();
      return;
    }

    if(!message.trim()){
      alert('Please enter a message.');
      (messageInput || form).focus && (messageInput || form).focus();
      return;
    }

    const subject = encodeURIComponent('Portfolio inquiry from ' + name.trim());
    const body = encodeURIComponent(message.trim() + '\n\n— ' + name.trim() + ' (' + email.trim() + ')');
    window.location.href = `mailto:you@example.com?subject=${subject}&body=${body}`;
  });
})();

