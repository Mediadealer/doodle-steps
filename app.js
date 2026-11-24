(() => {
  'use strict';

  const SIZE = 600;            // logical page size (lesson coordinates)
  const PX = 900;              // real canvas pixels
  const K = PX / SIZE;
  const S = 300;               // small buffer used to score the colouring
  const SK = S / SIZE;
  const BRUSHES = [4, 8, 16, 30, 50, 80];
  const CAN_NEXT = 0.6;        // how much must be coloured before Next unlocks
  const AUTO_NEXT = 0.95;      // lift the finger above this and it moves on by itself

  const $ = s => document.querySelector(s);
  const LESSONS = window.LESSONS;

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem('doodle.' + k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('doodle.' + k, JSON.stringify(v)); } catch { /* private mode */ } },
  };

  // ---------- elements ----------
  const home = $('#home'), draw = $('#draw'), finish = $('#finish');
  const stage = $('#stage'), pop = $('#pop');
  const paper = $('#paper').getContext('2d');
  const ink = $('#ink').getContext('2d');
  const guide = $('#guide').getContext('2d');
  const nextBtn = $('#nextBtn'), nextLabel = $('#nextLabel');
  const eraseBtn = $('#eraseBtn'), soundBtn = $('#soundBtn');

  const small = document.createElement('canvas');
  small.width = small.height = S;
  const sctx = small.getContext('2d', { willReadFrequently: true });

  // ---------- state ----------
  let lesson = null, stepIdx = 0, cur = null;
  let strokes = [], live = null;
  let brush = 30, erasing = false, busy = false;
  let stars = [], coverage = 0, spill = 0;
  let autoTimer = 0, lastMeasure = 0;
  let soundOn = store.get('sound', true);
  let outsidePx = 0;

  // racing a friend (see the "racing" section near the bottom)
  const RACE_NEXT = 0.8;       // races ask for a fuller shape than solo play
  const race = {
    peer: null, conn: null, host: false, connected: false,
    on: false,                 // a race is being drawn right now
    them: 'Friend', pick: null,
    t0: 0, myTime: null, theirTime: null, theirImg: null,
    theirStep: 0, theirCov: 0, theirLeft: false, lastSent: 0,
  };

  // ---------- sound ----------
  let actx;
  function tone(freq, at = 0, dur = 0.18) {
    if (!soundOn) return;
    try {
      actx ??= new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      const t0 = actx.currentTime + at;
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.2, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(actx.destination);
      o.start(t0); o.stop(t0 + dur + 0.05);
    } catch { /* no audio, no problem */ }
  }
  const chime = n => [523, 659, 784].slice(0, n).forEach((f, i) => tone(f, i * 0.11));
  const fanfare = () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.25));

  // ---------- pictures as SVG (home cards + reference) ----------
  function picSvg(l) {
    // a step's d is one path, or a list of separate shapes of the same color
    // l.base (optional) is scenery that is already on the page before step 1
    const shapes = [...(l.base || []), ...l.steps].map(s => s.line
      ? `<path d="${[].concat(s.d).join('')}" fill="none" stroke="${s.color}" stroke-width="${s.line}" stroke-linecap="round" stroke-linejoin="round"/>`
      : [].concat(s.d).map(d => `<path d="${d}" fill="${s.color}"${s.eo ? ' fill-rule="evenodd"' : ''}/>`).join('')).join('');
    return `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${l.name}"><rect width="${SIZE}" height="${SIZE}" fill="${l.bg}"/>${shapes}</svg>`;
  }
  const starText = (n, of = 3) => '★'.repeat(n) + `<i>${'★'.repeat(of - n)}</i>`;

  function renderHome() {
    const best = store.get('best', {});
    const progress = store.get('progress', {});
    const cards = $('#cards');
    cards.innerHTML = '';
    for (const l of LESSONS) {
      const at = progress[l.id] && progress[l.id].step < l.steps.length ? progress[l.id].step : 0;
      const b = document.createElement('button');
      b.className = 'card';
      b.innerHTML = `${picSvg(l)}
        <div class="card-foot"><span class="card-name">${l.name}</span><span class="card-stars">${starText(best[l.id] || 0)}</span></div>
        <div class="card-steps${at ? ' going' : ''}">${at ? `Keep going: step ${at + 1} of ${l.steps.length}` : `${l.steps.length} steps`}</div>`;
      b.addEventListener('click', () => startLesson(l));
      cards.append(b);
    }
  }

  function show(screen) {
    home.hidden = screen !== 'home';
    draw.hidden = screen === 'home';
    finish.hidden = screen !== 'finish';
    if (screen === 'home') renderHome();
  }

  // ---------- step preparation: masks used for scoring ----------
  function traceShape(ctx, step, path, grow) {
    ctx.lineCap = ctx.lineJoin = 'round';
    for (const p of path) {
      if (step.line) {
        ctx.lineWidth = step.line + grow;
        ctx.stroke(p);
      } else {
        ctx.fill(p, step.eo ? 'evenodd' : 'nonzero');
        if (grow) { ctx.lineWidth = grow; ctx.stroke(p); }
      }
    }
  }

  function mask(step, path, grow) {
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, S, S);
    sctx.setTransform(SK, 0, 0, SK, 0, 0);
    sctx.fillStyle = sctx.strokeStyle = '#000';
    traceShape(sctx, step, path, grow);
    const data = sctx.getImageData(0, 0, S, S).data;
    const out = new Uint8Array(S * S);
    let area = 0;
    for (let i = 0; i < out.length; i++) if (data[i * 4 + 3] > 100) { out[i] = 1; area++; }
    // edge length, used to judge how thick the shape is (for picking a brush)
    let edge = 0;
    for (let y = 0; y < S; y++) {
      for (let x = 0; x < S; x++) {
        const i = y * S + x;
        if (out[i] && (x === 0 || y === 0 || x === S - 1 || y === S - 1 || !out[i - 1] || !out[i + 1] || !out[i - S] || !out[i + S])) edge++;
      }
    }
    return { bits: out, area, edge };
  }

  function prepStep(step) {
    const path = [].concat(step.d).map(d => new Path2D(d));   // always a list
    const exact = mask(step, path, 0);
    const tol = mask(step, path, step.line ? 40 : 26);   // forgiving edge
    let points = null;
    if (step.line) {
      // points along the line; each one counts as traced if there is paint near it
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', [].concat(step.d).join(''));
      $('#measure').append(p);
      const len = p.getTotalLength();
      const n = Math.max(6, Math.round(len / 6));
      points = [];
      for (let i = 0; i <= n; i++) {
        const pt = p.getPointAtLength((len * i) / n);
        points.push([Math.round(pt.x * SK), Math.round(pt.y * SK)]);
      }
      p.remove();
    }
    return { step, path, exact, tol, points };
  }

  function measure() {
    lastMeasure = performance.now();
    sctx.setTransform(1, 0, 0, 1, 0, 0);
    sctx.clearRect(0, 0, S, S);
    sctx.drawImage(ink.canvas, 0, 0, S, S);
    const data = sctx.getImageData(0, 0, S, S).data;
    const painted = i => data[i * 4 + 3] > 90;

    let inside = 0, outside = 0;
    for (let i = 0; i < S * S; i++) {
      if (!painted(i)) continue;
      if (cur.exact.bits[i]) inside++;
      else if (!cur.tol.bits[i]) outside++;
    }

    if (cur.points) {
      const R = 5;
      let hit = 0;
      for (const [x, y] of cur.points) {
        let found = false;
        for (let dy = -R; dy <= R && !found; dy++) {
          for (let dx = -R; dx <= R && !found; dx++) {
            const px = x + dx, py = y + dy;
            if (px >= 0 && py >= 0 && px < S && py < S && painted(py * S + px)) found = true;
          }
        }
        if (found) hit++;
      }
      coverage = hit / cur.points.length;
      spill = outside / Math.max(1, cur.tol.area);
    } else {
      coverage = inside / Math.max(1, cur.exact.area);
      spill = outside / Math.max(1, cur.exact.area);
    }
    outsidePx = outside;
    updateNext();
    raceTick(false);
  }

  // In a race, scribbling over the whole page is not allowed: too much paint
  // outside the shape blocks Next until it is erased.
  const needed = () => (race.on ? RACE_NEXT : CAN_NEXT);
  function isMessy() {
    if (!race.on || !cur) return false;
    const ref = cur.points ? cur.tol.area : cur.exact.area;
    return outsidePx > Math.max(ref * 0.5, 250);
  }
  const canFinish = () => !!cur && coverage >= needed() && !isMessy();

  function updateNext() {
    const ready = canFinish();
    const last = stepIdx === lesson.steps.length - 1;
    nextBtn.disabled = !ready;
    nextBtn.classList.toggle('ready', ready);
    nextBtn.style.setProperty('--p', Math.round(Math.min(1, coverage / needed()) * 100) + '%');
    nextLabel.textContent = isMessy() ? 'Too messy! Tidy up' : ready ? (last ? 'Finish!' : 'Next →') : (coverage > 0.02 ? 'Keep going!' : (cur.step.line ? 'Trace the line' : 'Color it in'));
  }

  // ---------- guide (the dashed shape to colour) ----------
  function drawGuide() {
    guide.setTransform(1, 0, 0, 1, 0, 0);
    guide.clearRect(0, 0, PX, PX);
    if (!cur) return;
    guide.setTransform(K, 0, 0, K, 0, 0);
    const { step, path } = cur;
    guide.lineCap = guide.lineJoin = 'round';
    guide.setLineDash([]);

    guide.globalAlpha = step.line ? 0.4 : 0.28;
    guide.fillStyle = guide.strokeStyle = step.color;
    traceShape(guide, step, path, 0);
    guide.globalAlpha = 1;

    // two-tone dashes so the outline shows on any colour
    guide.lineCap = 'butt';
    guide.lineWidth = step.line ? 2 : 3;
    guide.setLineDash([9, 9]);
    for (const p of path) {
      guide.strokeStyle = '#ffffff';
      guide.lineDashOffset = 0;
      guide.stroke(p);
      guide.strokeStyle = 'rgba(30,30,45,.75)';
      guide.lineDashOffset = 9;
      guide.stroke(p);
    }
    guide.setLineDash([]);
  }

  // ---------- painting ----------
  function paintSegment(st, from, to) {
    ink.setTransform(K, 0, 0, K, 0, 0);
    ink.globalCompositeOperation = st.erase ? 'destination-out' : 'source-over';
    ink.strokeStyle = ink.fillStyle = st.color;
    ink.lineCap = ink.lineJoin = 'round';
    ink.lineWidth = st.size;
    ink.beginPath();
    if (!from) { ink.arc(to[0], to[1], st.size / 2, 0, Math.PI * 2); ink.fill(); }
    else { ink.moveTo(from[0], from[1]); ink.lineTo(to[0], to[1]); ink.stroke(); }
    ink.globalCompositeOperation = 'source-over';
  }

  function clearInk() {
    ink.setTransform(1, 0, 0, 1, 0, 0);
    ink.clearRect(0, 0, PX, PX);
  }

  function replay() {
    clearInk();
    for (const st of strokes) st.pts.forEach((p, i) => paintSegment(st, i ? st.pts[i - 1] : null, p));
  }

  function pos(e) {
    const r = stage.getBoundingClientRect();
    return [((e.clientX - r.left - stage.clientLeft) / stage.clientWidth) * SIZE,
            ((e.clientY - r.top - stage.clientTop) / stage.clientHeight) * SIZE];
  }

  stage.addEventListener('pointerdown', e => {
    if (busy || !cur || (e.pointerType === 'mouse' && e.button !== 0)) return;
    e.preventDefault();
    clearTimeout(autoTimer);
    // iPad only lets sound start from a touch, so wake the audio up here
    if (soundOn) {
      try {
        actx ??= new (window.AudioContext || window.webkitAudioContext)();
        if (actx.state === 'suspended') actx.resume();
      } catch { /* ignore */ }
    }
    try { stage.setPointerCapture(e.pointerId); } catch { /* ignore */ }
    const p = pos(e);
    live = { id: e.pointerId, st: { size: brush, erase: erasing, color: cur.step.color, pts: [p] } };
    strokes.push(live.st);
    paintSegment(live.st, null, p);
  });

  stage.addEventListener('pointermove', e => {
    if (!live || e.pointerId !== live.id) return;
    const events = e.getCoalescedEvents ? e.getCoalescedEvents() : [];
    for (const ev of events.length ? events : [e]) {
      const p = pos(ev), pts = live.st.pts, last = pts[pts.length - 1];
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 1) continue;
      paintSegment(live.st, last, p);
      pts.push(p);
    }
    if (performance.now() - lastMeasure > 120) measure();
  });

  function endStroke(e) {
    if (!live || e.pointerId !== live.id) return;
    live = null;
    measure();
    if (coverage >= AUTO_NEXT && canFinish()) autoTimer = setTimeout(finishStep, 450);
  }
  stage.addEventListener('pointerup', endStroke);
  stage.addEventListener('pointercancel', endStroke);

  // ---------- tools ----------
  function setBrush(size) {
    brush = size;
    document.querySelectorAll('.brush').forEach(b => b.classList.toggle('on', +b.dataset.size === size));
  }
  function setErasing(on) {
    erasing = on;
    eraseBtn.classList.toggle('on', on);
  }

  for (const size of BRUSHES) {
    const b = document.createElement('button');
    b.className = 'btn brush';
    b.dataset.size = size;
    b.setAttribute('aria-label', `Brush size ${size}`);
    const dot = 5 + BRUSHES.indexOf(size) * 5.4;
    b.innerHTML = `<i style="width:${dot}px;height:${dot}px"></i>`;
    b.addEventListener('click', () => setBrush(size));
    $('#brushes').append(b);
  }

  $('#undoBtn').addEventListener('click', () => {
    if (busy || !strokes.length) return;
    clearTimeout(autoTimer);
    strokes.pop(); replay(); measure();
  });
  $('#clearBtn').addEventListener('click', () => {
    if (busy) return;
    clearTimeout(autoTimer);
    strokes = []; clearInk(); measure();
  });
  eraseBtn.addEventListener('click', () => setErasing(!erasing));
  nextBtn.addEventListener('click', finishStep);
  $('#homeBtn').addEventListener('click', () => {
    if (race.on && !confirm('Leave the race?')) return;
    clearTimeout(autoTimer);
    if (race.on) endRace();
    show('home');
  });

  function paintSound() {
    soundBtn.classList.toggle('off', !soundOn);
    soundBtn.setAttribute('aria-pressed', soundOn);
  }
  soundBtn.addEventListener('click', () => { soundOn = !soundOn; store.set('sound', soundOn); paintSound(); tone(659); });
  paintSound();

  // ---------- lesson flow ----------
  // Progress is kept on the device after every step, so a long picture can be
  // finished later. Only the four most recent unfinished pictures are kept.
  function saveProgress(nextStep) {
    if (race.on) return;
    const p = store.get('progress', {});
    p[lesson.id] = { step: nextStep, stars, img: paper.canvas.toDataURL('image/png'), t: Date.now() };
    Object.keys(p).sort((a, b) => p[b].t - p[a].t).slice(4).forEach(id => delete p[id]);
    store.set('progress', p);
  }
  function clearProgress(id) {
    const p = store.get('progress', {});
    delete p[id];
    store.set('progress', p);
  }

  function startLesson(l, fresh = false) {
    lesson = l; stars = []; busy = false;
    clearTimeout(autoTimer);
    paper.setTransform(1, 0, 0, 1, 0, 0);
    paper.clearRect(0, 0, PX, PX);
    stage.style.background = l.bg;
    for (const b of l.base || []) {             // pre-drawn background pattern
      paper.setTransform(K, 0, 0, K, 0, 0);
      paper.fillStyle = paper.strokeStyle = b.color;
      traceShape(paper, b, [].concat(b.d).map(d => new Path2D(d)), 0);
    }
    $('#refPic').innerHTML = picSvg(l);
    pop.hidden = true;
    show('draw');

    if (fresh && !race.on) clearProgress(l.id);
    const saved = race.on ? null : store.get('progress', {})[l.id];
    if (saved && saved.img && saved.step > 0 && saved.step < l.steps.length) {
      stars = Array.isArray(saved.stars) ? saved.stars.slice(0, saved.step) : [];
      const img = new Image();
      img.onload = () => {
        if (lesson !== l) return;
        paper.setTransform(1, 0, 0, 1, 0, 0);
        paper.globalCompositeOperation = 'destination-over';   // under anything painted since
        paper.drawImage(img, 0, 0);
        paper.globalCompositeOperation = 'source-over';
      };
      img.src = saved.img;
      startStep(saved.step);
    } else {
      startStep(0);
    }
  }

  function startStep(i) {
    stepIdx = i;
    const step = lesson.steps[i];
    cur = prepStep(step);
    strokes = []; live = null;
    clearInk();
    setErasing(false);

    // pick a brush that suits the size of the shape
    // (thickness of the shape is roughly 2 x area / edge length)
    const want = step.line || (0.6 * (2 * cur.exact.area) / Math.max(1, cur.exact.edge)) / SK;
    setBrush(BRUSHES.reduce((a, b) => (Math.abs(b - want) < Math.abs(a - want) ? b : a)));

    $('#stepCount').textContent = `Step ${i + 1} of ${lesson.steps.length}`;
    $('#stepName').textContent = step.name;
    $('#swatch').style.background = step.color;
    $('#stepHint').textContent = step.line ? 'Trace over the dashed line.' : 'Color inside the dashed shape.';
    document.querySelectorAll('.brush i').forEach(d => { d.style.background = step.color; });

    const dots = $('#dots');
    dots.innerHTML = '';
    dots.classList.toggle('many', lesson.steps.length > 16);
    lesson.steps.forEach((_, n) => {
      const d = document.createElement('span');
      d.className = 'dot' + (n < i ? ' done' : n === i ? ' now' : '');
      dots.append(d);
    });

    drawGuide();
    measure();
    raceTick(true);
  }

  function finishStep() {
    clearTimeout(autoTimer);
    if (busy || !cur || !canFinish()) return;
    busy = true;

    const q = coverage - 0.5 * Math.min(1, spill);
    const n = q >= 0.85 ? 3 : q >= 0.65 ? 2 : 1;
    stars.push(n);

    // Tidy up: paint that strayed well outside the shape is wiped (it already
    // cost stars), so the finished picture still looks like the picture.
    const keep = document.createElement('canvas');
    keep.width = keep.height = PX;
    const kctx = keep.getContext('2d');
    kctx.setTransform(K, 0, 0, K, 0, 0);
    traceShape(kctx, cur.step, cur.path, cur.step.line ? 40 : 26);
    ink.setTransform(1, 0, 0, 1, 0, 0);
    ink.globalCompositeOperation = 'destination-in';
    ink.drawImage(keep, 0, 0);
    ink.globalCompositeOperation = 'source-over';

    // keep her colouring: it becomes part of the picture
    paper.setTransform(1, 0, 0, 1, 0, 0);
    paper.drawImage(ink.canvas, 0, 0);
    clearInk();
    cur = null;
    drawGuide();

    pop.innerHTML = `<b>${starText(n)}</b><span>${['Good try!', 'Nice!', 'Wow!'][n - 1]}</span>`;
    pop.hidden = false;
    chime(n);

    setTimeout(() => {
      pop.hidden = true;
      busy = false;
      if (stepIdx + 1 < lesson.steps.length) { saveProgress(stepIdx + 1); startStep(stepIdx + 1); }
      else showFinish();
    }, 900);
  }

  // ---------- finished picture ----------
  function finalCanvas() {
    const c = document.createElement('canvas');
    c.width = c.height = PX;
    const x = c.getContext('2d');
    x.fillStyle = lesson.bg;
    x.fillRect(0, 0, PX, PX);
    x.drawImage(paper.canvas, 0, 0);
    return c;
  }

  function showFinish() {
    const avg = Math.max(1, Math.round(stars.reduce((a, b) => a + b, 0) / stars.length));
    const best = store.get('best', {});
    best[lesson.id] = Math.max(best[lesson.id] || 0, avg);
    store.set('best', best);
    if (!race.on) clearProgress(lesson.id);

    $('#finalPic').src = finalCanvas().toDataURL('image/png');
    $('#origPic').innerHTML = picSvg(lesson);
    $('#finalStars').innerHTML = starText(avg);

    const conf = $('#confetti');
    conf.innerHTML = '';
    const colors = ['#ff6b6b', '#20b8a8', '#ffd84a', '#ff7eb6', '#58c7f3', '#8fe0c0'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('i');
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = 2 + Math.random() * 2.5 + 's';
      p.style.animationDelay = Math.random() * 1.2 + 's';
      conf.append(p);
    }
    if (race.on) raceFinished();
    renderRaceResult();
    show('finish');
    fanfare();
  }

  $('#saveBtn').addEventListener('click', () => {
    finalCanvas().toBlob(blob => {
      // on iPad the share sheet offers "Save Image" straight to Photos
      const file = new File([blob], `my-${lesson.id}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        navigator.share({ files: [file] }).catch(() => {});
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `my-${lesson.id}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    });
  });
  $('#againBtn').addEventListener('click', () => startLesson(lesson, true));
  $('#restartBtn').addEventListener('click', () => {
    if (busy || !lesson) return;
    if (race.on) { toast('No starting over in a race!'); return; }
    if (stepIdx === 0 || confirm('Start this picture over from the beginning?')) startLesson(lesson, true);
  });
  $('#moreBtn').addEventListener('click', () => { endRace(); show('home'); });


  // ---------- racing ----------
  // Two browsers connect straight to each other (WebRTC, via the PeerJS
  // library and its free matchmaking server). No accounts: the host gets a
  // four-letter code and the friend types it in. Only names, progress numbers
  // and the two finished drawings are exchanged.
  const PEER_SRC = 'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
  const PREFIX = 'doodlesteps-race-';
  const LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ';
  const raceEl = $('#race'), toastEl = $('#toast'), countEl = $('#count');
  const nameIn = $('#raceName'), codeIn = $('#codeIn');
  let toastTimer = 0, joinTimer = 0;

  nameIn.value = store.get('name', '');
  const myName = () => (nameIn.value.trim() || 'Player').slice(0, 12);

  function toast(text) {
    toastEl.textContent = text;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3500);
  }

  function raceView(v) {
    $('#raceMenu').hidden = v !== 'menu';
    $('#raceHost').hidden = v !== 'host';
    $('#raceGuest').hidden = v !== 'guest';
    raceEl.hidden = false;
  }
  const hostStatus = t => { $('#hostStatus').textContent = t; };
  const guestStatus = t => { $('#guestStatus').textContent = t; };

  function loadPeer() {
    if (window.Peer) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = PEER_SRC;
      s.onload = res;
      s.onerror = () => { s.remove(); rej(new Error('offline')); };
      document.head.append(s);
    });
  }

  const send = msg => { try { if (race.conn && race.conn.open) race.conn.send(msg); } catch { /* ignore */ } };

  function errText(e) {
    if (e && e.type === 'peer-unavailable') return 'No race found with that code.';
    if (e && (e.type === 'network' || e.type === 'server-error' || e.type === 'socket-error')) return 'Could not reach the race server. Check the internet and try again.';
    return 'Something went wrong. Close this and try again.';
  }

  function endRace() {
    clearTimeout(joinTimer);
    race.on = false; race.connected = false;
    try { if (race.peer) race.peer.destroy(); } catch { /* ignore */ }
    race.peer = race.conn = null;
    $('#raceStrip').hidden = true;
    raceEl.hidden = true;
    countEl.hidden = true;
  }

  // ----- lobby -----
  function buildPicker() {
    const box = $('#racePicker');
    box.innerHTML = '';
    if (!race.pick) race.pick = LESSONS[0].id;
    for (const l of LESSONS) {
      const b = document.createElement('button');
      b.innerHTML = picSvg(l);
      b.title = `${l.name} (${l.steps.length} steps)`;
      b.classList.toggle('on', l.id === race.pick);
      b.addEventListener('click', () => {
        race.pick = l.id;
        box.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
        send({ t: 'pick', id: l.id });
      });
      box.append(b);
    }
  }

  function showGuestPick(id) {
    const l = LESSONS.find(x => x.id === id);
    if (!l) return;
    $('#guestPic').innerHTML = picSvg(l);
    $('#guestPicName').textContent = `${l.name} · ${l.steps.length} steps`;
  }

  function lobby() {
    race.on = false;
    $('#raceStrip').hidden = true;
    if (race.host) {
      buildPicker();
      $('#startRaceBtn').disabled = !race.connected;
      $('#startRaceBtn').classList.toggle('ready', race.connected);
      hostStatus(race.connected ? `${race.them} is here. Pick a picture and start!` : 'Waiting for your friend to join…');
      raceView('host');
    } else {
      guestStatus(race.connected ? `Connected to ${race.them}. Waiting for them to start…` : 'Your friend left.');
      raceView('guest');
    }
  }

  async function hostRace() {
    store.set('name', myName());
    endRace();
    race.host = true; race.them = 'Friend';
    $('#raceCode').textContent = '····';
    lobby();
    hostStatus('Getting a code…');
    try { await loadPeer(); } catch { hostStatus('Could not reach the race server. Check the internet and try again.'); return; }
    openHost(0);
  }

  function openHost(tries) {
    let code = '';
    for (let i = 0; i < 4; i++) code += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    const peer = new window.Peer(PREFIX + code);
    race.peer = peer;
    peer.on('open', () => {
      $('#raceCode').textContent = code;
      hostStatus('Waiting for your friend to join…');
    });
    peer.on('connection', c => {
      if (race.conn) {                         // only two players per race
        c.on('open', () => { try { c.send({ t: 'full' }); } catch { /* ignore */ } setTimeout(() => c.close(), 500); });
        return;
      }
      wire(c);
    });
    peer.on('error', e => {
      if (race.peer !== peer) return;
      if (e.type === 'unavailable-id' && tries < 5) { peer.destroy(); openHost(tries + 1); }
      else hostStatus(errText(e));
    });
  }

  async function joinRace() {
    const code = codeIn.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (code.length !== 4) { codeIn.focus(); return; }
    store.set('name', myName());
    endRace();
    race.host = false; race.them = 'Friend';
    $('#guestPic').innerHTML = ''; $('#guestPicName').textContent = '';
    raceView('guest');
    guestStatus('Connecting…');
    try { await loadPeer(); } catch { guestStatus('Could not reach the race server. Check the internet and try again.'); return; }
    const peer = new window.Peer();
    race.peer = peer;
    peer.on('open', () => {
      wire(peer.connect(PREFIX + code, { reliable: true }));
      joinTimer = setTimeout(() => {
        if (race.peer === peer && !race.connected) guestStatus('Could not connect. Check the code, or try a different Wi-Fi.');
      }, 12000);
    });
    peer.on('error', e => { if (race.peer === peer) { clearTimeout(joinTimer); guestStatus(errText(e)); } });
  }

  function wire(c) {
    race.conn = c;
    c.on('open', () => {
      race.connected = true; race.theirLeft = false;
      clearTimeout(joinTimer);
      send({ t: 'hello', name: myName() });
      if (race.host) send({ t: 'pick', id: race.pick });
    });
    c.on('data', onData);
    c.on('close', () => onGone(c));
    c.on('error', () => onGone(c));
  }

  function onGone(c) {
    if (race.conn !== c) return;
    race.conn = null; race.connected = false; race.theirLeft = true;
    if (race.on) { toast(`${race.them} left the race`); raceTick(true); }
    else if (!raceEl.hidden) lobby();
    if (!finish.hidden) renderRaceResult();
  }

  // Everything from the other player is treated as untrusted: checked for
  // shape, and only ever shown as plain text or as an image.
  function onData(m) {
    if (!m || typeof m !== 'object') return;
    switch (m.t) {
      case 'hello':
        race.them = (typeof m.name === 'string' && m.name.trim() ? m.name.trim() : 'Friend').slice(0, 12);
        if (!raceEl.hidden) lobby();
        break;
      case 'pick':
        if (!race.host && typeof m.id === 'string') showGuestPick(m.id);
        break;
      case 'full':
        guestStatus('That race already has two players.');
        break;
      case 'start':
        if (!race.host && !race.on && typeof m.id === 'string') beginRace(m.id);
        break;
      case 'prog':
        race.theirStep = Math.max(0, Math.floor(+m.step) || 0);
        race.theirCov = Math.min(1, Math.max(0, +m.cov || 0));
        raceTick(false);
        break;
      case 'done':
        if (race.theirTime != null || !(+m.time > 0)) break;
        race.theirTime = +m.time;
        if (typeof m.img === 'string' && m.img.startsWith('data:image/jpeg;base64,') && m.img.length < 600000) race.theirImg = m.img;
        if (race.on && race.myTime == null) toast(`${race.them} finished! Keep going!`);
        raceTick(false);
        if (!finish.hidden) renderRaceResult();
        break;
    }
  }

  // ----- the race itself -----
  function beginRace(id) {
    const l = LESSONS.find(x => x.id === id);
    if (!l) return;
    Object.assign(race, { on: true, myTime: null, theirTime: null, theirImg: null, theirStep: 0, theirCov: 0 });
    raceEl.hidden = true;
    $('#themName').textContent = race.them;
    $('#raceStrip').hidden = false;
    startLesson(l, true);
    busy = true;                                // hands off until GO
    let n = 3;
    countEl.hidden = false;
    countEl.textContent = n;
    tone(440);
    const tick = setInterval(() => {
      n--;
      if (!race.on) { clearInterval(tick); countEl.hidden = true; busy = false; return; }
      if (n > 0) { countEl.textContent = n; tone(440); }
      else if (n === 0) { countEl.textContent = 'GO!'; tone(880, 0, 0.35); busy = false; race.t0 = performance.now(); }
      else { clearInterval(tick); countEl.hidden = true; }
    }, 900);
  }

  // update the two progress bars and tell the other player where we are
  function raceTick(force) {
    if (!race.on || !lesson) return;
    const n = lesson.steps.length;
    const mine = race.myTime != null ? n : stepIdx + Math.min(1, coverage / needed()) * 0.95;
    const theirs = race.theirTime != null ? n : Math.min(n, race.theirStep + race.theirCov * 0.95);
    $('#myBar').style.width = (mine / n) * 100 + '%';
    $('#themBar').style.width = (theirs / n) * 100 + '%';
    $('#myCount').textContent = `${Math.min(n, race.myTime != null ? n : stepIdx + 1)}/${n}`;
    $('#themCount').textContent = race.theirLeft && race.theirTime == null ? 'left' : `${Math.min(n, race.theirTime != null ? n : race.theirStep + 1)}/${n}`;
    const now = performance.now();
    if (force || now - race.lastSent > 400) {
      race.lastSent = now;
      send({ t: 'prog', step: stepIdx, cov: Math.min(1, coverage / needed()) });
    }
  }

  function raceFinished() {
    race.myTime = Math.max(1, Math.round(performance.now() - race.t0));
    const c = document.createElement('canvas');
    c.width = c.height = 450;
    c.getContext('2d').drawImage(finalCanvas(), 0, 0, 450, 450);
    send({ t: 'done', time: race.myTime, img: c.toDataURL('image/jpeg', 0.8) });
    raceTick(false);
  }

  const secs = ms => {
    const s = Math.round(ms / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  function renderRaceResult() {
    const racing = race.on && race.myTime != null;
    $('#theirFig').hidden = !racing;
    $('#raceResult').hidden = !racing;
    $('#raceAgainBtn').hidden = !racing;
    $('#againBtn').hidden = racing;
    if (!racing) { $('#finishTitle').textContent = 'You did it!'; return; }

    const theirPic = $('#theirPic'), wait = $('#theirWait');
    $('#theirCap').textContent = race.them;
    theirPic.hidden = !race.theirImg;
    wait.hidden = !!race.theirImg;
    if (race.theirImg) theirPic.src = race.theirImg;

    if (race.theirTime == null) {
      $('#finishTitle').textContent = 'You win!';
      $('#raceResult').textContent = race.theirLeft ? `${race.them} left the race. Your time: ${secs(race.myTime)}` : `Your time: ${secs(race.myTime)}. ${race.them} is still drawing…`;
      wait.textContent = race.theirLeft ? 'Left the race' : 'Still drawing…';
    } else {
      const won = race.myTime <= race.theirTime;
      $('#finishTitle').textContent = won ? 'You win!' : `${race.them} wins!`;
      $('#raceResult').textContent = `You ${secs(race.myTime)} · ${race.them} ${secs(race.theirTime)}`;
      wait.textContent = 'No picture';
    }
    $('#raceAgainBtn').disabled = !race.connected;
  }

  $('#raceBtn').addEventListener('click', () => { endRace(); raceView('menu'); });
  $('#raceClose').addEventListener('click', endRace);
  $('#hostBtn').addEventListener('click', hostRace);
  $('#joinBtn').addEventListener('click', joinRace);
  codeIn.addEventListener('keydown', e => { if (e.key === 'Enter') joinRace(); });
  $('#startRaceBtn').addEventListener('click', () => {
    if (!race.connected) return;
    send({ t: 'start', id: race.pick });
    beginRace(race.pick);
  });
  $('#raceAgainBtn').addEventListener('click', () => { show('home'); lobby(); });

  show('home');
})();
