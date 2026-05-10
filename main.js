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
  if (!section || !card) return;

  const RADIUS_MAX   = 20;
  const SCROLL_START = 60;   // px scrolled before expansion begins
  const SCROLL_END   = 320;  // px scrolled when fully expanded

  function update() {
    if (window.innerWidth <= 768) {
      section.style.paddingLeft = section.style.paddingRight = '';
      card.style.borderRadius = '';
      return;
    }

    const scrollY = window.scrollY;
    const padMax  = Math.max(40, (window.innerWidth - 1160) / 2);

    const raw = (scrollY - SCROLL_START) / (SCROLL_END - SCROLL_START);
    const p   = Math.max(0, Math.min(1, raw));

    // Left edge stays fixed → text never moves
    // Only the right side expands toward the viewport edge
    section.style.paddingLeft  = padMax + 'px';
    section.style.paddingRight = padMax * (1 - p) + 'px';

    // Only right corners lose the radius; left stays rounded
    const r = RADIUS_MAX * (1 - p);
    card.style.borderRadius = `${RADIUS_MAX}px ${r}px ${r}px ${RADIUS_MAX}px`;
  }

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

  const QS = [
    {
      q: '¿Cuál es el sector de tu negocio?',
      opts: [
        { icon: '🍽️', text: 'Restauración / Hostelería',   score: 0 },
        { icon: '🏥', text: 'Clínica / Salud',             score: 0 },
        { icon: '📊', text: 'Asesoría / Consultoría',      score: 0 },
        { icon: '🎓', text: 'Academia / Formación',        score: 0 },
        { icon: '🏠', text: 'Inmobiliaria',                score: 0 },
        { icon: '💼', text: 'Otro sector',                 score: 0 },
      ],
    },
    {
      q: '¿Cuántas horas a la semana dedicas a tareas repetitivas (facturación, emails, informes...)?',
      opts: [
        { icon: '⚡', text: 'Menos de 5 horas',   score: 1 },
        { icon: '⏱️', text: 'Entre 5 y 15 horas', score: 2 },
        { icon: '🔴', text: 'Más de 15 horas',    score: 3 },
      ],
    },
    {
      q: '¿Tienes algún sistema para captar y hacer seguimiento de clientes potenciales?',
      opts: [
        { icon: '✅', text: 'Sí, tengo un CRM',           score: 1 },
        { icon: '📱', text: 'Solo WhatsApp o teléfono',   score: 2 },
        { icon: '❌', text: 'No tengo ningún sistema',    score: 3 },
      ],
    },
    {
      q: '¿Cómo gestionas tus citas o pedidos?',
      opts: [
        { icon: '💻', text: 'Con un software específico', score: 1 },
        { icon: '📋', text: 'En Excel o en papel',        score: 2 },
        { icon: '🧠', text: 'Lo llevo en la cabeza',      score: 3 },
      ],
    },
    {
      q: '¿Envías comunicaciones automáticas a tus clientes?',
      opts: [
        { icon: '🤖', text: 'Sí, todo automatizado',             score: 1 },
        { icon: '✍️', text: 'A veces, pero manualmente',        score: 2 },
        { icon: '🔇', text: 'No enviamos comunicaciones',        score: 3 },
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
