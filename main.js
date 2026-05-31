'use strict';

/* ============================================================
   PRASIA — main.js  v3
   Navbar · Reveal · Counters · Quiz · Forms
   ============================================================ */

// ── 1. NAVBAR ─────────────────────────────────────────────────
(function initNavbar() {
  const nav  = document.getElementById('navbar');
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('navLinks');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 55);
  }, { passive: true });

  if (ham && menu) {
    ham.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      ham.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        ham.classList.remove('active');
        document.body.style.overflow = '';
      })
    );
  }
})();


// ── 2. DARK CARD SCROLL EXPAND ────────────────────────────────
(function initDarkCardExpand() {
  const section = document.getElementById('darkCardSection');
  const card    = document.getElementById('darkCardEl');
  const dcBody  = card && card.querySelector('.dc-body');
  if (!section || !card) return;

  const RADIUS_MAX = 20;
  const PAD_V_END  = 30;
  const scrollEnd   = section.offsetTop * 1.15;
  const LERP        = 0.05;

  // Slow start, slight bounce near the end (like before)
  function easeInOutBack(t) {
    const s = 1.15;
    if (t < 0.5) return 2 * t * t;
    const u = 2 * t - 1;
    return 0.5 + (1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2)) * 0.5;
  }

  let currentP = 0, targetP = 0, rafId = null;

  function applyP(p) {
    const vw = window.innerWidth;
    const padStart = Math.max(40, (vw - 1160) / 2);
    const pC  = Math.max(0, Math.min(1, p));
    const pad = padStart * (1 - pC);

    section.style.paddingLeft  = pad + 'px';
    section.style.paddingRight = pad + 'px';
    card.style.borderRadius    = `${RADIUS_MAX * (1 - pC)}px`;
    // 85% compensation: text drifts slightly left as card expands, stays there
    if (dcBody) dcBody.style.paddingLeft = (72 + (padStart - pad) * 0.85) + 'px';

    const over = p - pC;
    if (over > 0) {
      const extra = over * padStart;
      card.style.marginLeft  = `-${extra}px`;
      card.style.marginRight = `-${extra}px`;
    } else {
      card.style.marginLeft = card.style.marginRight = '';
    }
  }

  function tick() {
    currentP += (targetP - currentP) * LERP;
    applyP(currentP);
    if (Math.abs(targetP - currentP) > 0.0005) {
      rafId = requestAnimationFrame(tick);
    } else {
      currentP = targetP;
      applyP(currentP);
      rafId = null;
    }
  }

  function update() {
    if (window.innerWidth <= 768) {
      section.style.paddingLeft = section.style.paddingRight = '';
      card.style.borderRadius = card.style.marginLeft = card.style.marginRight = '';
      if (dcBody) dcBody.style.paddingLeft = '';
      currentP = targetP = 0;
      return;
    }
    // Once dark card reaches viewport top: unconditional snap to p=1, kill lerp
    if (window.scrollY >= section.offsetTop) {
      currentP = targetP = 1;
      applyP(1);
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      return;
    }
    targetP = easeInOutBack(Math.max(0, Math.min(1, window.scrollY / scrollEnd)));
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  // Vertical growth: expands on first scroll down, collapses back at scrollY=0
  const V_EASE       = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
  const V_TRANSITION = `padding-top 1.2s ${V_EASE}, padding-bottom 1.2s ${V_EASE}`;
  let vExpanded = false, vTimer = null;

  function updateVertical() {
    if (window.innerWidth <= 768) return;
    const shouldExpand = window.scrollY > 0;
    if (shouldExpand === vExpanded) return;
    vExpanded = shouldExpand;
    clearTimeout(vTimer);
    const vPad = vExpanded ? PAD_V_END : 0;
    card.style.transition      = V_TRANSITION;
    card.style.paddingTop      = vPad + 'px';
    card.style.paddingBottom   = vPad + 'px';
    // Compensate section margin so content below doesn't shift
    section.style.transition   = `margin-bottom 1.2s ${V_EASE}`;
    section.style.marginBottom = `-${vPad * 2}px`;
    vTimer = setTimeout(() => { card.style.transition = ''; section.style.transition = ''; }, 1300);
  }

  window.addEventListener('scroll', updateVertical, { passive: true });

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();


// ── 3. SCROLL REVEAL ──────────────────────────────────────────

(function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal-up').forEach(el => io.observe(el));
})();


// ── 3. COUNTER ANIMATION ──────────────────────────────────────
(function initCounters() {
  function run(el) {
    const target = +el.dataset.target;
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const dur    = 1500;
    const t0     = performance.now();

    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(e * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.dataset.target !== undefined) {
        run(e.target);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-val[data-target]').forEach(el => io.observe(el));
})();


// ── 4. QUIZ ───────────────────────────────────────────────────
(function initQuiz() {
  const wrapper = document.getElementById('quizWrapper');
  if (!wrapper) return;

  const I = {
    restaurant:  `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>`,
    clinic:      `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>`,
    chart:       `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M4 9h4v11H4V9zm6-5h4v16h-4V4zm6 8h4v8h-4v-8z"/></svg>`,
    school:      `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>`,
    home:        `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
    work:        `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM10 4h4v2h-4V4zm10 15H4V8h16v11z"/></svg>`,
    bolt:        `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M7 2v13h3v7l7-12h-4l4-8z"/></svg>`,
    clock:       `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>`,
    warning:     `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>`,
    checkCircle: `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>`,
    smartphone:  `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/></svg>`,
    cancel:      `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>`,
    laptop:      `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/></svg>`,
    clipboard:   `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>`,
    person:      `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
    settings:    `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`,
    edit:        `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
    volumeOff:   `<svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`,
  };

  const QS = [
    {
      q: '¿Cuál es el sector de tu negocio?',
      opts: [
        { icon: I.restaurant,  text: 'Restauración / Hostelería', score: 0 },
        { icon: I.clinic,      text: 'Clínica / Salud',           score: 0 },
        { icon: I.chart,       text: 'Asesoría / Consultoría',    score: 0 },
        { icon: I.school,      text: 'Academia / Formación',      score: 0 },
        { icon: I.home,        text: 'Inmobiliaria',              score: 0 },
        { icon: I.work,        text: 'Otro sector',               score: 0 },
      ],
    },
    {
      q: '¿Cuántas horas a la semana dedicas a tareas repetitivas (facturación, emails, informes...)?',
      opts: [
        { icon: I.bolt,    text: 'Menos de 5 horas',   score: 1 },
        { icon: I.clock,   text: 'Entre 5 y 15 horas', score: 2 },
        { icon: I.warning, text: 'Más de 15 horas',    score: 3 },
      ],
    },
    {
      q: '¿Tienes algún sistema para captar y hacer seguimiento de clientes potenciales?',
      opts: [
        { icon: I.checkCircle, text: 'Sí, tengo un CRM',         score: 1 },
        { icon: I.smartphone,  text: 'Solo WhatsApp o teléfono', score: 2 },
        { icon: I.cancel,      text: 'No tengo ningún sistema',  score: 3 },
      ],
    },
    {
      q: '¿Cómo gestionas tus citas o pedidos?',
      opts: [
        { icon: I.laptop,    text: 'Con un software específico', score: 1 },
        { icon: I.clipboard, text: 'En Excel o en papel',        score: 2 },
        { icon: I.person,    text: 'Lo llevo en la cabeza',      score: 3 },
      ],
    },
    {
      q: '¿Envías comunicaciones automáticas a tus clientes?',
      opts: [
        { icon: I.settings,   text: 'Sí, todo automatizado',      score: 1 },
        { icon: I.edit,       text: 'A veces, pero manualmente',  score: 2 },
        { icon: I.volumeOff,  text: 'No enviamos comunicaciones', score: 3 },
      ],
    },
  ];

  const RESULTS = {
    red: {
      pill: 'red', emoji: '🔴', label: 'Potencial alto',
      title: 'Tu negocio está dejando dinero en la mesa',
      desc:  'Las tareas manuales están frenando tu crecimiento. Con las automatizaciones correctas podrías recuperar horas cada semana y multiplicar tu capacidad.',
      recs:  [
        'CRM automático con seguimiento inteligente de leads',
        'Sistema de citas y recordatorios sin intervención manual',
        'Emails y WhatsApps automatizados según el comportamiento de cada cliente',
      ],
    },
    yellow: {
      pill: 'yellow', emoji: '🟡', label: 'Buen camino',
      title: 'Vas bien, pero hay mucho margen de mejora',
      desc:  'Ya tienes algunas piezas en su lugar. Ahora toca optimizar y conectar todo para que el sistema trabaje solo, sin fricciones.',
      recs:  [
        'Dashboard financiero en tiempo real con alertas automáticas',
        'Chatbot de atención al cliente disponible 24/7',
        'Reportes semanales automáticos para decisiones basadas en datos',
      ],
    },
    green: {
      pill: 'green', emoji: '🟢', label: 'Nivel avanzado',
      title: 'Estás avanzado — podemos llevarte al siguiente nivel',
      desc:  'Tienes buenas bases. Ahora podemos aplicar IA avanzada para que tu negocio no solo trabaje solo, sino que también escale de forma autónoma.',
      recs:  [
        'Análisis predictivo de negocio con inteligencia artificial',
        'Sistema de prospección B2B completamente automatizado',
        'Integración avanzada entre todas tus herramientas',
      ],
    },
  };

  const state = { answers: [], sector: '' };

  function score() {
    return state.answers.slice(1).reduce((s, idx, qi) =>
      s + (QS[qi + 1].opts[idx]?.score ?? 0), 0);
  }
  function profile(s) {
    if (s >= 10) return 'red';
    if (s >= 7)  return 'yellow';
    return 'green';
  }

  function renderQ(idx) {
    const q   = QS[idx];
    const pct = (idx / QS.length) * 100;

    wrapper.innerHTML = `
      <div class="quiz-step">
        <div class="quiz-progress">
          <div class="qpbar"><div class="qpfill" style="width:${pct}%"></div></div>
          <span class="qptxt">Pregunta ${idx + 1} de ${QS.length}</span>
        </div>
        <p class="quiz-q">${q.q}</p>
        <div class="quiz-opts">
          ${q.opts.map((o, i) => `
            <button class="quiz-opt" data-i="${i}">
              <span class="qo-icon">${o.icon}</span>${o.text}
            </button>`).join('')}
        </div>
      </div>`;

    wrapper.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i;
        wrapper.querySelectorAll('.quiz-opt').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        state.answers[idx] = i;
        if (idx === 0) state.sector = q.opts[i].text;
        setTimeout(() => idx < QS.length - 1 ? renderQ(idx + 1) : renderLead(), 340);
      });
    });
  }

  function renderLead() {
    wrapper.innerHTML = `
      <div class="quiz-step">
        <div class="quiz-progress">
          <div class="qpbar"><div class="qpfill" style="width:100%"></div></div>
          <span class="qptxt">¡Casi listo!</span>
        </div>
        <div class="qlead-hdr">
          <h3>Tu diagnóstico está listo</h3>
          <p>Deja tu nombre y email para ver el resultado con tus automatizaciones recomendadas.</p>
        </div>
        <div class="quiz-fields">
          <input id="qn" class="quiz-input" type="text"  placeholder="Tu nombre"    autocomplete="name">
          <input id="qe" class="quiz-input" type="email" placeholder="tu@email.com" autocomplete="email">
        </div>
        <button class="btn-primary btn-full" id="qBtn">Ver mi diagnóstico</button>
        <p class="quiz-privacy">Sin spam. Solo tu resultado personalizado.</p>
      </div>`;

    document.getElementById('qBtn').addEventListener('click', submit);
    document.getElementById('qe').addEventListener('keypress', e => e.key === 'Enter' && submit());
  }

  function submit() {
    const n  = document.getElementById('qn');
    const e  = document.getElementById('qe');
    const ok = n.value.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value.trim());

    n.classList.toggle('err', !n.value.trim());
    e.classList.toggle('err', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.value.trim()));
    if (!ok) return;

    const s = score(), p = profile(s);

    fetch('https://prasia.es/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'quiz', name: n.value.trim(), email: e.value.trim(), sector: state.sector, score: s, profile: p, answers: state.answers }),
    }).catch(() => {});

    renderResult(p);
  }

  function renderResult(key) {
    const r = RESULTS[key];
    wrapper.innerHTML = `
      <div class="quiz-step quiz-result">
        <div class="result-pill ${r.pill}">${r.emoji} ${r.label}</div>
        <h3 class="result-ttl">${r.title}</h3>
        <p class="result-dsc">${r.desc}</p>
        <div class="result-recs">
          <span class="recs-lbl">Automatizaciones recomendadas para ti</span>
          ${r.recs.map(rec => `<div class="rec-item"><span>${rec}</span></div>`).join('')}
        </div>
        <a href="#contacto" class="btn-primary btn-full">Quiero mi análisis completo en 24h</a>
      </div>`;
  }

  renderQ(0);
})();


// ── 5. CONTACT FORM ───────────────────────────────────────────
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  const btnText = document.getElementById('btnText');
  const spinner = document.getElementById('btnSpinner');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    if (btnText) btnText.textContent = 'Enviando...';
    if (spinner) spinner.classList.remove('hidden');

    fetch('https://prasia.es/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'contact-form',
        name:    form.name.value,
        email:   form.email.value,
        sector:  form.sector.value,
        message: form.message.value,
      }),
    }).catch(() => {});

    await new Promise(r => setTimeout(r, 900));
    form.classList.add('hidden');
    success.classList.remove('hidden');
  });
})();
