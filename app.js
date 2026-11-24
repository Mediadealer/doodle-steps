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
    const shapes = l.steps.map(s => s.line
      ? `<path d="${s.d}" fill="none" stroke="${s.color}" stroke-width="${s.line}" stroke-linecap="round" stroke-linejoin="round"/>`
      : `<path d="${s.d}" fill="${s.color}"/>`).join('');
    return `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${l.name}"><rect width="${SIZE}" height="${SIZE}" fill="${l.bg}"/>${shapes}</svg>`;
  }
  const starText = (n, of = 3) => '★'.repeat(n) + `<i>${'★'.repeat(of - n)}</i>`;

  function renderHome() {
    const best = store.get('best', {});
    const cards = $('#cards');
    cards.innerHTML = '';
    for (const l of LESSONS) {
      const b = document.createElement('button');
      b.className = 'card';
      b.innerHTML = `${picSvg(l)}
        <div class="card-foot"><span class="card-name">${l.name}</span><span class="card-stars">${starText(best[l.id] || 0)}</span></div>
        <div class="card-steps">${l.steps.length} steps</div>`;
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
    if (step.line) {
      ctx.lineWidth = step.line + grow;
      ctx.stroke(path);
    } else {
      ctx.fill(path);
      if (grow) { ctx.lineWidth = grow; ctx.stroke(path); }
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
    return { bits: out, area };
  }

  function prepStep(step) {
    const path = new Path2D(step.d);
    const exact = mask(step, path, 0);
    const tol = mask(step, path, step.line ? 40 : 26);   // forgiving edge
    let points = null;
    if (step.line) {
      // points along the line; each one counts as traced if there is paint near it
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', step.d);
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
    updateNext();
  }

  function updateNext() {
    const ready = coverage >= CAN_NEXT;
    const last = stepIdx === lesson.steps.length - 1;
    nextBtn.disabled = !ready;
    nextBtn.classList.toggle('ready', ready);
    nextBtn.style.setProperty('--p', Math.round(Math.min(1, coverage / CAN_NEXT) * 100) + '%');
    nextLabel.textContent = ready ? (last ? 'Finish!' : 'Next →') : (coverage > 0.02 ? 'Keep going!' : (cur.step.line ? 'Trace the line' : 'Color it in'));
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
    if (step.line) { guide.lineWidth = step.line; guide.stroke(path); }
    else guide.fill(path);
    guide.globalAlpha = 1;

    // two-tone dashes so the outline shows on any colour
    guide.lineCap = 'butt';
    guide.lineWidth = step.line ? 2 : 3;
    guide.setLineDash([9, 9]);
    guide.strokeStyle = '#ffffff';
    guide.lineDashOffset = 0;
    guide.stroke(path);
    guide.strokeStyle = 'rgba(30,30,45,.75)';
    guide.lineDashOffset = 9;
    guide.stroke(path);
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
    if (coverage >= AUTO_NEXT) autoTimer = setTimeout(finishStep, 450);
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
  $('#homeBtn').addEventListener('click', () => { clearTimeout(autoTimer); show('home'); });

  function paintSound() {
    soundBtn.classList.toggle('off', !soundOn);
    soundBtn.setAttribute('aria-pressed', soundOn);
  }
  soundBtn.addEventListener('click', () => { soundOn = !soundOn; store.set('sound', soundOn); paintSound(); tone(659); });
  paintSound();

  // ---------- lesson flow ----------
  function startLesson(l) {
    lesson = l; stars = []; busy = false;
    clearTimeout(autoTimer);
    paper.setTransform(1, 0, 0, 1, 0, 0);
    paper.clearRect(0, 0, PX, PX);
    stage.style.background = l.bg;
    $('#refPic').innerHTML = picSvg(l);
    pop.hidden = true;
    show('draw');
    startStep(0);
  }

  function startStep(i) {
    stepIdx = i;
    const step = lesson.steps[i];
    cur = prepStep(step);
    strokes = []; live = null;
    clearInk();
    setErasing(false);

    // pick a brush that suits the size of the shape
    const want = step.line || Math.sqrt(cur.exact.area / (SK * SK)) / 5;
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
  }

  function finishStep() {
    clearTimeout(autoTimer);
    if (busy || !cur || coverage < CAN_NEXT) return;
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
      if (stepIdx + 1 < lesson.steps.length) startStep(stepIdx + 1);
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

    $('#finalPic').src = finalCanvas().toDataURL('image/png');
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
  $('#againBtn').addEventListener('click', () => startLesson(lesson));
  $('#moreBtn').addEventListener('click', () => show('home'));

  show('home');
})();
