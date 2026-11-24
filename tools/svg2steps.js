#!/usr/bin/env node
// Turn a finished SVG illustration into a Doodle Steps picture.
//
//   node tools/svg2steps.js art/fox.svg --id fox --name "Fox" --steps 45
//
// Options: --id (required)  --name  --steps N (target, default 45)  --bg #rrggbb
//          --source URL  --license TEXT   (recorded in the picture file)
//
// It reads the drawing back to front, turns every shape into an absolute path
// on the 600 x 600 page, merges shapes of the same (then similar) color until
// the step count is near the target, names the steps by color, writes
// pictures/<id>.js and adds its <script> tag to index.html.
// No AI and no packages: flat, solid-color art converts best.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const opt = { steps: '45' };
const files = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
  else files.push(argv[i]);
}
if (files.length !== 1 || !/^[a-z][a-z0-9]*$/.test(opt.id || '')) {
  console.error('usage: node tools/svg2steps.js <file.svg> --id lowercaseid [--name "Name"] [--steps 45] [--bg #rrggbb] [--source URL] [--license TEXT]');
  process.exit(2);
}
const TARGET = Math.max(5, parseInt(opt.steps, 10) || 45);

// ---------- tiny XML reader ----------
function parseXml(src) {
  src = src.replace(/<!DOCTYPE[^\[>]*(\[[\s\S]*?\])?\s*>/i, '');
  const rootNode = { tag: '#root', attrs: {}, kids: [], text: '' };
  const stack = [rootNode];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[([\s\S]*?)\]\]>|<\?[\s\S]*?\?>|<![^>]*>|<\/([\w:.-]+)\s*>|<([\w:.-]+)((?:"[^"]*"|'[^']*'|[^>"'])*)>|([^<]+)/g;
  let m;
  while ((m = re.exec(src))) {
    const top = stack[stack.length - 1];
    if (m[1] !== undefined) top.text += m[1];
    else if (m[2]) { if (stack.length > 1) stack.pop(); }
    else if (m[3]) {
      let a = m[4] || '';
      const selfClose = /\/\s*$/.test(a);
      const attrs = {};
      const ar = /([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
      let am;
      while ((am = ar.exec(a))) attrs[am[1]] = (am[2] !== undefined ? am[2] : am[3]).replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      const node = { tag: m[3].replace(/^.*:/, ''), attrs, kids: [], text: '' };
      top.kids.push(node);
      if (!selfClose) stack.push(node);
    } else if (m[5]) top.text += m[5];
  }
  return rootNode;
}

// ---------- matrices: [a b c d e f] ----------
const I = [1, 0, 0, 1, 0, 0];
const mul = (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]];
const apply = (m, x, y) => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
function parseTransform(str) {
  let M = I;
  const re = /(matrix|translate|scale|rotate|skewX|skewY)\s*\(([^)]*)\)/g;
  let m;
  while ((m = re.exec(str || ''))) {
    const v = m[2].split(/[\s,]+/).filter(Boolean).map(Number);
    let T = I;
    if (m[1] === 'matrix' && v.length === 6) T = v;
    else if (m[1] === 'translate') T = [1, 0, 0, 1, v[0] || 0, v[1] || 0];
    else if (m[1] === 'scale') T = [v[0], 0, 0, v.length > 1 ? v[1] : v[0], 0, 0];
    else if (m[1] === 'rotate') {
      const a = (v[0] * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
      T = [c, s, -s, c, 0, 0];
      if (v.length === 3) T = mul(mul([1, 0, 0, 1, v[1], v[2]], T), [1, 0, 0, 1, -v[1], -v[2]]);
    } else if (m[1] === 'skewX') T = [1, 0, Math.tan((v[0] * Math.PI) / 180), 1, 0, 0];
    else if (m[1] === 'skewY') T = [1, Math.tan((v[0] * Math.PI) / 180), 0, 1, 0, 0];
    M = mul(M, T);
  }
  return M;
}

// ---------- colors ----------
const NAMED = { black: '000000', white: 'ffffff', red: 'ff0000', green: '008000', blue: '0000ff', yellow: 'ffff00', orange: 'ffa500', purple: '800080', pink: 'ffc0cb', brown: 'a52a2a', gray: '808080', grey: '808080', silver: 'c0c0c0', gold: 'ffd700', navy: '000080', teal: '008080', maroon: '800000', olive: '808000', lime: '00ff00', aqua: '00ffff', cyan: '00ffff', magenta: 'ff00ff', fuchsia: 'ff00ff', beige: 'f5f5dc', tan: 'd2b48c', khaki: 'f0e68c', salmon: 'fa8072', coral: 'ff7f50', crimson: 'dc143c', indigo: '4b0082', violet: 'ee82ee', turquoise: '40e0d0', skyblue: '87ceeb', lightblue: 'add8e6', darkgreen: '006400', darkblue: '00008b', lightgreen: '90ee90', lightgray: 'd3d3d3', lightgrey: 'd3d3d3', darkgray: 'a9a9a9', darkgrey: 'a9a9a9', ivory: 'fffff0', chocolate: 'd2691e', sienna: 'a0522d', peru: 'cd853f', orchid: 'da70d6', plum: 'dda0dd', tomato: 'ff6347', wheat: 'f5deb3', darkred: '8b0000', forestgreen: '228b22', royalblue: '4169e1', steelblue: '4682b4', saddlebrown: '8b4513', hotpink: 'ff69b4', lavender: 'e6e6fa', yellowgreen: '9acd32', orangered: 'ff4500', dimgray: '696969', dimgrey: '696969' };
function parseColor(v, grads) {
  if (!v) return null;
  v = v.trim();
  if (v === 'none' || v === 'transparent') return null;
  let m;
  if ((m = /^url\(\s*['"]?#([^)'"\s]+)/.exec(v))) return grads[m[1]] || null;
  if ((m = /^#([0-9a-f]{3})$/i.exec(v))) return m[1].split('').map(c => parseInt(c + c, 16));
  if ((m = /^#([0-9a-f]{6})/i.exec(v))) return [0, 2, 4].map(i => parseInt(m[1].slice(i, i + 2), 16));
  if ((m = /^rgba?\(([^)]+)\)/i.exec(v))) {
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).slice(0, 3);
    return p.map(s => Math.max(0, Math.min(255, Math.round(s.endsWith('%') ? parseFloat(s) * 2.55 : parseFloat(s)))));
  }
  const n = NAMED[v.toLowerCase()];
  if (n) return [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16));
  return v === 'currentColor' ? [0, 0, 0] : [128, 128, 128];
}
const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);

function colorName(c) {
  const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d) h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  if (l > 0.93) return 'White';
  if (l < 0.13) return 'Black';
  if (s < 0.14) return l > 0.7 ? 'Light gray' : l < 0.35 ? 'Dark gray' : 'Gray';
  let n = h < 15 || h >= 345 ? 'Red' : h < 42 ? 'Orange' : h < 68 ? 'Yellow' : h < 165 ? 'Green' : h < 195 ? 'Teal' : h < 255 ? 'Blue' : h < 290 ? 'Purple' : 'Pink';
  if ((n === 'Orange' || n === 'Red' || n === 'Yellow') && l < 0.42 && s < 0.85) return l < 0.25 ? 'Dark brown' : 'Brown';
  if (n === 'Orange' && l > 0.78) return 'Cream';
  if (n === 'Red' && l > 0.72) return 'Pink';
  return (l > 0.74 ? 'Light ' : l < 0.3 ? 'Dark ' : '') + (l > 0.74 || l < 0.3 ? n.toLowerCase() : n);
}

// ---------- geometry: everything becomes absolute M / L / C / Q / Z ----------
function arc(x1, y1, rx, ry, phi, fa, fs, x2, y2, out) {
  if (!rx || !ry || (x1 === x2 && y1 === y2)) { out.push(['L', x2, y2]); return; }
  rx = Math.abs(rx); ry = Math.abs(ry);
  const p = (phi * Math.PI) / 180, cp = Math.cos(p), sp = Math.sin(p);
  const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
  const x1p = cp * dx + sp * dy, y1p = -sp * dx + cp * dy;
  const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (lam > 1) { const s = Math.sqrt(lam); rx *= s; ry *= s; }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  let co = Math.sqrt(Math.max(0, num / den));
  if (fa === fs) co = -co;
  const cxp = (co * rx * y1p) / ry, cyp = (-co * ry * x1p) / rx;
  const cx = cp * cxp - sp * cyp + (x1 + x2) / 2, cy = sp * cxp + cp * cyp + (y1 + y2) / 2;
  const ang = (ux, uy, vx, vy) => Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const ux = (x1p - cxp) / rx, uy = (y1p - cyp) / ry;
  let t = ang(1, 0, ux, uy), dt = ang(ux, uy, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!fs && dt > 0) dt -= 2 * Math.PI; else if (fs && dt < 0) dt += 2 * Math.PI;
  const n = Math.max(1, Math.ceil(Math.abs(dt) / (Math.PI / 2) - 1e-9)), d = dt / n, k = (4 / 3) * Math.tan(d / 4);
  const pt = (a, b) => [cp * rx * a - sp * ry * b + cx, sp * rx * a + cp * ry * b + cy];
  for (let i = 0; i < n; i++) {
    const c1 = Math.cos(t), s1 = Math.sin(t), c2 = Math.cos(t + d), s2 = Math.sin(t + d);
    const a = pt(c1 - k * s1, s1 + k * c1), b = pt(c2 + k * s2, s2 - k * c2), e = pt(c2, s2);
    out.push(['C', a[0], a[1], b[0], b[1], e[0], e[1]]);
    t += d;
  }
}

function parsePath(d) {
  const segs = [];
  let i = 0, cmd = '', x = 0, y = 0, sx = 0, sy = 0, px = 0, py = 0, prev = '';
  const n = d.length;
  const ws = () => { while (i < n && /[\s,]/.test(d[i])) i++; };
  const num = () => {
    ws();
    const m = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(d.slice(i, i + 40));
    if (!m) return NaN;
    i += m[0].length;
    return +m[0];
  };
  const flag = () => { ws(); return d[i++] === '1' ? 1 : 0; };
  for (;;) {
    ws();
    if (i >= n) break;
    if (/[a-zA-Z]/.test(d[i])) cmd = d[i++];
    else if (!cmd || cmd === 'Z' || cmd === 'z') break;
    else if (cmd === 'M') cmd = 'L';
    else if (cmd === 'm') cmd = 'l';
    const rel = cmd !== cmd.toUpperCase(), C = cmd.toUpperCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    let a, b, c, e, f, g;
    if (C === 'M') { a = num(); b = num(); if (isNaN(b)) break; x = ox + a; y = oy + b; sx = x; sy = y; segs.push(['M', x, y]); }
    else if (C === 'L') { a = num(); b = num(); if (isNaN(b)) break; x = ox + a; y = oy + b; segs.push(['L', x, y]); }
    else if (C === 'H') { a = num(); if (isNaN(a)) break; x = ox + a; segs.push(['L', x, y]); }
    else if (C === 'V') { a = num(); if (isNaN(a)) break; y = oy + a; segs.push(['L', x, y]); }
    else if (C === 'C') { a = num(); b = num(); c = num(); e = num(); f = num(); g = num(); if (isNaN(g)) break; segs.push(['C', ox + a, oy + b, ox + c, oy + e, ox + f, oy + g]); px = ox + c; py = oy + e; x = ox + f; y = oy + g; }
    else if (C === 'S') { c = num(); e = num(); f = num(); g = num(); if (isNaN(g)) break; const rx = prev === 'C' || prev === 'S' ? 2 * x - px : x, ry = prev === 'C' || prev === 'S' ? 2 * y - py : y; segs.push(['C', rx, ry, ox + c, oy + e, ox + f, oy + g]); px = ox + c; py = oy + e; x = ox + f; y = oy + g; }
    else if (C === 'Q') { a = num(); b = num(); f = num(); g = num(); if (isNaN(g)) break; segs.push(['Q', ox + a, oy + b, ox + f, oy + g]); px = ox + a; py = oy + b; x = ox + f; y = oy + g; }
    else if (C === 'T') { f = num(); g = num(); if (isNaN(g)) break; const rx = prev === 'Q' || prev === 'T' ? 2 * x - px : x, ry = prev === 'Q' || prev === 'T' ? 2 * y - py : y; segs.push(['Q', rx, ry, ox + f, oy + g]); px = rx; py = ry; x = ox + f; y = oy + g; }
    else if (C === 'A') { a = num(); b = num(); c = num(); if (isNaN(c)) break; const fa = flag(), fs2 = flag(); f = num(); g = num(); if (isNaN(g)) break; arc(x, y, a, b, c, fa, fs2, ox + f, oy + g, segs); x = ox + f; y = oy + g; }
    else if (C === 'Z') { segs.push(['Z']); x = sx; y = sy; }
    else break;
    prev = C;
  }
  return segs;
}

const N = v => parseFloat(v) || 0;
function shapeToPath(node) {
  const a = node.attrs;
  switch (node.tag) {
    case 'path': return a.d || '';
    case 'rect': {
      const x = N(a.x), y = N(a.y), w = N(a.width), h = N(a.height);
      if (w <= 0 || h <= 0) return '';
      let rx = a.rx !== undefined ? N(a.rx) : a.ry !== undefined ? N(a.ry) : 0;
      let ry = a.ry !== undefined ? N(a.ry) : rx;
      rx = Math.min(rx, w / 2); ry = Math.min(ry, h / 2);
      if (!rx || !ry) return `M${x} ${y}H${x + w}V${y + h}H${x}Z`;
      return `M${x + rx} ${y}H${x + w - rx}A${rx} ${ry} 0 0 1 ${x + w} ${y + ry}V${y + h - ry}A${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${ry} 0 0 1 ${x} ${y + h - ry}V${y + ry}A${rx} ${ry} 0 0 1 ${x + rx} ${y}Z`;
    }
    case 'circle': case 'ellipse': {
      const cx = N(a.cx), cy = N(a.cy), rx = node.tag === 'circle' ? N(a.r) : N(a.rx), ry = node.tag === 'circle' ? N(a.r) : N(a.ry);
      if (rx <= 0 || ry <= 0) return '';
      return `M${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}Z`;
    }
    case 'line': return `M${N(a.x1)} ${N(a.y1)}L${N(a.x2)} ${N(a.y2)}`;
    case 'polyline': case 'polygon': {
      const p = (a.points || '').trim().split(/[\s,]+/).map(Number).filter(v => !isNaN(v));
      if (p.length < 4) return '';
      let d = `M${p[0]} ${p[1]}`;
      for (let i = 2; i + 1 < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`;
      return d + (node.tag === 'polygon' ? 'Z' : '');
    }
  }
  return null;
}

// ---------- read the drawing ----------
const file = files[0];
const doc = parseXml(fs.readFileSync(file, 'utf8'));
const svg = (function find(n) { if (n.tag === 'svg') return n; for (const k of n.kids) { const r = find(k); if (r) return r; } return null; })(doc);
if (!svg) { console.error('No <svg> element found in ' + file); process.exit(1); }

const byId = {}, css = {}, gradNodes = {};
(function index(n) {
  if (n.attrs.id) byId[n.attrs.id] = n;
  if (n.tag === 'linearGradient' || n.tag === 'radialGradient') gradNodes[n.attrs.id] = n;
  if (n.tag === 'style') {
    const re = /([^{}]+)\{([^}]*)\}/g;
    let m;
    while ((m = re.exec(n.text.replace(/\/\*[\s\S]*?\*\//g, '')))) {
      const decl = {};
      m[2].split(';').forEach(s => { const k = s.indexOf(':'); if (k > 0) decl[s.slice(0, k).trim()] = s.slice(k + 1).trim(); });
      m[1].split(',').forEach(sel => { sel = sel.trim(); css[sel] = Object.assign(css[sel] || {}, decl); });
    }
  }
  n.kids.forEach(index);
})(svg);

const PROPS = ['fill', 'stroke', 'stroke-width', 'opacity', 'fill-opacity', 'stroke-opacity', 'fill-rule', 'display', 'visibility'];
function ownStyle(n) {
  const s = {};
  for (const p of PROPS) if (n.attrs[p] !== undefined) s[p] = n.attrs[p];
  Object.assign(s, css[n.tag] || {});
  (n.attrs.class || '').split(/\s+/).filter(Boolean).forEach(c => Object.assign(s, css['.' + c] || {}));
  if (n.attrs.id) Object.assign(s, css['#' + n.attrs.id] || {});
  (n.attrs.style || '').split(';').forEach(d => { const k = d.indexOf(':'); if (k > 0) s[d.slice(0, k).trim()] = d.slice(k + 1).trim(); });
  for (const p of Object.keys(s)) if (!PROPS.includes(p)) delete s[p];
  return s;
}
const href = n => (n.attrs['xlink:href'] || n.attrs.href || '').replace(/^#/, '');

// a gradient becomes the average of its stop colors
const grads = {};
function gradColor(id, depth = 0) {
  const g = gradNodes[id];
  if (!g || depth > 5) return null;
  const stops = g.kids.filter(k => k.tag === 'stop').map(k => {
    const st = {};
    if (k.attrs['stop-color']) st.c = k.attrs['stop-color'];
    (k.attrs.style || '').split(';').forEach(d => { const i = d.indexOf(':'); if (i > 0 && d.slice(0, i).trim() === 'stop-color') st.c = d.slice(i + 1).trim(); });
    return parseColor(st.c || '#000', {});
  }).filter(Boolean);
  if (!stops.length) return href(g) ? gradColor(href(g), depth + 1) : null;
  return [0, 1, 2].map(i => stops.reduce((a, c) => a + c[i], 0) / stops.length);
}
for (const id of Object.keys(gradNodes)) grads[id] = gradColor(id);

const SKIP = new Set(['defs', 'clipPath', 'mask', 'pattern', 'marker', 'symbol', 'metadata', 'title', 'desc', 'linearGradient', 'radialGradient', 'filter', 'text', 'image', 'style', 'script', 'namedview', 'foreignObject', 'switch']);
const raw = [];   // { segs, fill:[r,g,b]|null, fa, stroke, sa, sw, eo }
function walk(n, m, st, depth) {
  if (SKIP.has(n.tag) || depth > 40) return;
  const own = ownStyle(n);
  if (own.display === 'none') return;
  const s = Object.assign({}, st, own);
  s.opacity = (st.opacity === undefined ? 1 : st.opacity) * (own.opacity !== undefined ? Math.max(0, Math.min(1, parseFloat(own.opacity))) : 1);
  if (n.attrs.transform) m = mul(m, parseTransform(n.attrs.transform));
  if (n.tag === 'use') {
    const t = byId[href(n)];
    if (t) walk(t, mul(m, [1, 0, 0, 1, N(n.attrs.x), N(n.attrs.y)]), s, depth + 1);
    return;
  }
  const d = shapeToPath(n);
  if (d === null) { n.kids.forEach(k => walk(k, m, s, depth + 1)); return; }
  if (!d || s.visibility === 'hidden') return;
  const segs = parsePath(d).map(seg => {
    const o = [seg[0]];
    for (let i = 1; i < seg.length; i += 2) { const p = apply(m, seg[i], seg[i + 1]); o.push(p[0], p[1]); }
    return o;
  });
  if (segs.length < 2) return;
  const fill = parseColor(s.fill === undefined ? '#000' : s.fill, grads);
  const stroke = parseColor(s.stroke, grads);
  const num = (v, d0) => (v === undefined || isNaN(parseFloat(v)) ? d0 : parseFloat(v));
  raw.push({
    segs, fill, stroke,
    fa: s.opacity * num(s['fill-opacity'], 1), sa: s.opacity * num(s['stroke-opacity'], 1),
    sw: num(s['stroke-width'], 1) * Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])),
    eo: s['fill-rule'] === 'evenodd',
  });
}
svg.kids.forEach(k => walk(k, I, {}, 0));
if (!raw.length) { console.error('No drawable shapes found. Is this a traced bitmap or text-only file?'); process.exit(1); }
if (raw.length > 4000) { console.error(`${raw.length} shapes is too detailed to make a good coloring picture. Pick simpler art.`); process.exit(1); }

const bboxOf = segs => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const s of segs) for (let i = 1; i < s.length; i += 2) { x0 = Math.min(x0, s[i]); x1 = Math.max(x1, s[i]); y0 = Math.min(y0, s[i + 1]); y1 = Math.max(y1, s[i + 1]); }
  return [x0, y0, x1, y1];
};
const areaOf = b => Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);
const union = (a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])];
const overlap = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3];

// ---------- fit onto the 600 x 600 page ----------
let view = (svg.attrs.viewBox || '').trim().split(/[\s,]+/).map(Number);
if (view.length !== 4 || view.some(isNaN) || !view[2] || !view[3]) view = N(svg.attrs.width) && N(svg.attrs.height) ? [0, 0, N(svg.attrs.width), N(svg.attrs.height)] : null;
raw.forEach(r => { r.bb = bboxOf(r.segs); });
const content = raw.filter(r => (r.fill && r.fa >= 0.2) || (r.stroke && r.sa >= 0.2)).reduce((a, r) => (a ? union(a, r.bb) : r.bb), null) || [0, 0, 600, 600];
const first = raw.find(r => r.fill && r.fa >= 0.2);
const hasBackdrop = !!(view && first && areaOf(first.bb) >= 0.9 * view[2] * view[3]);
const region = hasBackdrop ? [view[0], view[1], view[0] + view[2], view[1] + view[3]] : content;
const margin = hasBackdrop ? 0 : 20;
const K = (600 - 2 * margin) / Math.max(region[2] - region[0], region[3] - region[1]);
const ox = 300 - (K * (region[0] + region[2])) / 2, oy = 300 - (K * (region[1] + region[3])) / 2;
const clampPt = v => Math.max(-30, Math.min(630, v));
raw.forEach(r => {
  r.segs = r.segs.map(s => { const o = [s[0]]; for (let i = 1; i < s.length; i += 2) o.push(clampPt(s[i] * K + ox), clampPt(s[i + 1] * K + oy)); return o; });
  r.bb = bboxOf(r.segs);
  r.sw *= K;
});

// ---------- one item per visible fill or outline, back to front ----------
const items = [];
const under = bb => {
  const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
  for (let i = items.length - 1; i >= 0; i--) { const t = items[i]; if (!t.line && cx > t.bb[0] && cx < t.bb[2] && cy > t.bb[1] && cy < t.bb[3]) return t.color; }
  return [255, 255, 255];
};
const WIDTHS = [3, 4, 5, 6, 8, 10, 12, 16, 20];
for (const r of raw) {
  const big = Math.max(r.bb[2] - r.bb[0], r.bb[3] - r.bb[1]);
  if (r.bb[2] < 0 || r.bb[3] < 0 || r.bb[0] > 600 || r.bb[1] > 600) continue;
  if (r.fill && r.fa >= 0.2 && big >= 5) {
    items.push({ segs: r.segs, bb: r.bb, eo: r.eo, line: 0, color: r.fa < 0.95 ? mix(under(r.bb), r.fill, r.fa) : r.fill });
  }
  if (r.stroke && r.sa >= 0.2 && r.sw >= 1.5 && big >= 4) {
    const w = WIDTHS.reduce((a, b) => (Math.abs(b - r.sw) < Math.abs(a - r.sw) ? b : a));
    const g = w / 2;
    items.push({ segs: r.segs, bb: [r.bb[0] - g, r.bb[1] - g, r.bb[2] + g, r.bb[3] + g], eo: false, line: w, color: r.sa < 0.95 ? mix(under(r.bb), r.stroke, r.sa) : r.stroke });
  }
}
if (!items.length) { console.error('Nothing visible to convert.'); process.exit(1); }

// ---------- merge shapes into steps ----------
let steps = items.map(t => ({ parts: [t], bb: t.bb, color: t.color, line: t.line, eo: t.eo, area: areaOf(t.bb) }));
// Step j may join another step of the same kind and (nearly) the same color,
// as long as nothing that overlaps it sits between them in the stack: then
// painting it earlier or later looks exactly the same.
function tryMerge(j, tol) {
  const b = steps[j];
  const ok = a => a.line === b.line && a.eo === b.eo && dist(a.color, b.color) <= tol;
  const blocks = a => overlap(a.bb, b.bb) && !(a.line === b.line && dist(a.color, b.color) <= 1);
  const join = (a, first) => {
    if (b.area > a.area) a.color = b.color;
    a.parts = first ? b.parts.concat(a.parts) : a.parts.concat(b.parts);
    a.bb = union(a.bb, b.bb); a.area += b.area;
    steps.splice(j, 1);
    return true;
  };
  for (let i = j - 1; i >= 0; i--) { if (ok(steps[i])) return join(steps[i], false); if (blocks(steps[i])) break; }
  for (let k = j + 1; k < steps.length; k++) { if (ok(steps[k])) return join(steps[k], true); if (blocks(steps[k])) break; }
  return false;
}
const maxDim = s => Math.max(s.bb[2] - s.bb[0], s.bb[3] - s.bb[1]);

// 1. tiny bits always join their own color (ten windows are one step, not ten)
for (let again = true; again;) {
  again = false;
  for (let j = steps.length - 1; j >= 0; j--) if (maxDim(steps[j]) < 14 && tryMerge(j, 0)) again = true;
}
// 2. while there are more steps than asked for, fold the smallest ones in:
//    first into the same color, then into more and more similar colors
for (const tol of [0, 10, 18, 28, 40, 55, 75]) {
  while (steps.length > TARGET) {
    const order = steps.map((s, i) => i).sort((a, b) => steps[a].area - steps[b].area);
    if (!order.some(j => tryMerge(j, tol))) break;
  }
}
// 3. slivers and specks too small to color on their own join a similar color,
//    or are dropped if there is none
function inkArea(s) {                       // rough painted area in page units
  let total = 0;
  for (const p of s.parts) {
    let a = 0, len = 0, sx = 0, sy = 0, x = 0, y = 0, started = false;
    const close = () => { if (started) { a += x * sy - sx * y; total += s.line ? len * s.line : Math.abs(a) / 2; } a = 0; len = 0; };
    for (const seg of p.segs) {
      if (seg[0] === 'Z') continue;
      if (seg[0] === 'M') { close(); sx = x = seg[1]; sy = y = seg[2]; started = true; continue; }
      for (let i = 1; i < seg.length; i += 2) { a += x * seg[i + 1] - seg[i] * y; len += Math.hypot(seg[i] - x, seg[i + 1] - y); x = seg[i]; y = seg[i + 1]; }
    }
    close();
  }
  return total;
}
const tooSmall = s => (s.line ? maxDim(s) < 6 : maxDim(s) < 7) || inkArea(s) < 90;
for (let j = steps.length - 1; j >= 0; j--) {
  if (!tooSmall(steps[j])) continue;
  if (!tryMerge(j, 0) && !tryMerge(j, 45)) steps.splice(j, 1);
}

// ---------- write the picture ----------
const r1 = v => String(Math.round(v * 10) / 10);
const dOf = segs => segs.map(s => s[0] + s.slice(1).map(r1).join(' ')).join('');
const used = {};
const out = steps.map((s, i) => {
  const base = i === 0 && hasBackdrop ? 'Background' : `${colorName(s.color)} ${s.line ? 'lines' : s.parts.length > 1 ? 'parts' : 'shape'}`;
  used[base] = (used[base] || 0) + 1;
  const step = { name: used[base] > 1 ? `${base} ${used[base]}` : base, color: hex(s.color) };
  if (s.line) { step.line = s.line; step.d = s.parts.map(p => dOf(p.segs)).join(''); }
  else { if (s.eo) step.eo = true; step.d = s.parts.length === 1 ? dOf(s.parts[0].segs) : s.parts.map(p => dOf(p.segs)); }
  return step;
});

let bg = opt.bg && /^#[0-9a-f]{6}$/i.test(opt.bg) ? opt.bg.toLowerCase() : null;
if (!bg) {
  let c = hasBackdrop ? mix(steps[0].color, [255, 255, 255], 0.7) : [251, 247, 239];
  if (dist(c, steps[0].color) < 45) c = mix(steps[0].color, dist(steps[0].color, [255, 255, 255]) < 120 ? [120, 130, 150] : [255, 255, 255], 0.55);
  bg = hex(c);
}

const name = (opt.name || opt.id[0].toUpperCase() + opt.id.slice(1)).slice(0, 16);
const js = `// pictures/${opt.id}.js — made by tools/svg2steps.js from ${path.basename(file)}
// Source: ${opt.source || 'not recorded'}
// License: ${opt.license || 'not recorded'}
(() => {
  LESSONS.push({
    id: ${JSON.stringify(opt.id)}, name: ${JSON.stringify(name)}, bg: ${JSON.stringify(bg)},
    steps: [
${out.map(s => '      ' + JSON.stringify(s) + ',').join('\n')}
    ],
  });
})();
`;
fs.mkdirSync(path.join(root, 'pictures'), { recursive: true });
fs.writeFileSync(path.join(root, 'pictures', opt.id + '.js'), js);

// make sure index.html loads it (before app.js)
const indexPath = path.join(root, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes(`pictures/${opt.id}.js`)) {
  const m = /^(\s*)<script src="app\.js(\?v=\d+)?"><\/script>/m.exec(html);
  if (m) {
    html = html.replace(m[0], `${m[1]}<script src="pictures/${opt.id}.js${m[2] || ''}"></script>\n${m[0]}`);
    fs.writeFileSync(indexPath, html);
  } else console.log('Could not find the app.js script tag in index.html: add the picture tag by hand.');
}

console.log(`${opt.id}: ${raw.length} shapes in the SVG -> ${items.length} visible pieces -> ${out.length} steps (target ${TARGET})`);
console.log(`wrote pictures/${opt.id}.js (${Math.round(js.length / 1024)} KB), bg ${bg}`);
if (out.length > TARGET * 1.3) console.log('More steps than asked for: the art has many colors that overlap. Try simpler art or a higher --steps.');
if (out.length < Math.min(TARGET, 12)) console.log('Few steps: this art has few colors. It will be a short picture.');
