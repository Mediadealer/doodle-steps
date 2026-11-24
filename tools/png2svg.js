#!/usr/bin/env node
// Trace a flat-color image (PNG / JPG / WebP) into a layered SVG that
// tools/svg2steps.js can turn into a picture.
//
//   node tools/png2svg.js art/treehouse.png art/treehouse.svg [--colors 16] [--min 60]
//
// How: shrink to 600 x 600, reduce to a few colors, clean up the edges, find
// every patch of one color, and write each patch as a smooth closed outline.
// Patches are written biggest first WITH THEIR HOLES FILLED IN, so the picture
// is a stack: a whole face first, then the eyes on top of it. That is exactly
// the order the app wants. Needs ffmpeg on the PATH to read the image.

const fs = require('fs');
const { execFileSync } = require('child_process');

const argv = process.argv.slice(2);
const opt = { colors: '16', min: '60' };
const pos = [];
for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i]; else pos.push(argv[i]); }
if (pos.length !== 2) { console.error('usage: node tools/png2svg.js <image> <out.svg> [--colors 16] [--min 60]'); process.exit(2); }
const KMAX = Math.max(2, Math.min(40, parseInt(opt.colors, 10) || 16));
const MIN_AREA = Math.max(8, parseInt(opt.min, 10) || 60);
const W = 600, H = 600, NPX = W * H;

let rgb;
try {
  rgb = execFileSync('ffmpeg', ['-v', 'error', '-i', pos[0], '-vf', `scale=${W}:${H}:force_original_aspect_ratio=decrease:flags=area,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=white`, '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', 'pipe:1'], { maxBuffer: 1 << 26 });
} catch (e) { console.error('ffmpeg could not read ' + pos[0] + ': ' + (e.stderr ? e.stderr.toString().trim() : e.message)); process.exit(1); }
if (rgb.length !== NPX * 3) { console.error('unexpected image data from ffmpeg'); process.exit(1); }

// ---------- 1. reduce to a few colors (k-means, fixed seed so reruns match) ----------
let seed = 12345;
const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const sample = [];
for (let i = 0; i < NPX; i += 7) sample.push(i);
const px = i => [rgb[i * 3], rgb[i * 3 + 1], rgb[i * 3 + 2]];
const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

let cents = [px(sample[Math.floor(rnd() * sample.length)])];
const near = new Float64Array(sample.length).fill(Infinity);
while (cents.length < KMAX) {                       // k-means++ start
  let total = 0;
  const last = cents[cents.length - 1];
  for (let s = 0; s < sample.length; s++) { const v = d2(px(sample[s]), last); if (v < near[s]) near[s] = v; total += near[s]; }
  if (total < 1) break;
  let r = rnd() * total, pick = 0;
  for (let s = 0; s < sample.length; s++) { r -= near[s]; if (r <= 0) { pick = s; break; } }
  cents.push(px(sample[pick]));
}
const nearest = c => { let b = 0, bd = Infinity; for (let k = 0; k < cents.length; k++) { const v = d2(c, cents[k]); if (v < bd) { bd = v; b = k; } } return b; };
for (let it = 0; it < 12; it++) {
  const sum = cents.map(() => [0, 0, 0, 0]);
  for (const i of sample) { const c = px(i), k = nearest(c); sum[k][0] += c[0]; sum[k][1] += c[1]; sum[k][2] += c[2]; sum[k][3]++; }
  cents = cents.map((c, k) => (sum[k][3] ? [sum[k][0] / sum[k][3], sum[k][1] / sum[k][3], sum[k][2] / sum[k][3]] : c));
}
// colors that ended up nearly identical become one
for (let a = 0; a < cents.length; a++) for (let b = cents.length - 1; b > a; b--) if (d2(cents[a], cents[b]) < 18 * 18) cents.splice(b, 1);
const K = cents.length;

let lab = new Uint8Array(NPX);
for (let i = 0; i < NPX; i++) lab[i] = nearest(px(i));

// ---------- 2. tidy edges: each pixel takes the most common color around it ----------
for (let pass = 0; pass < 2; pass++) {
  const out = new Uint8Array(NPX), cnt = new Uint16Array(K);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    cnt.fill(0);
    for (let dy = -1; dy <= 1; dy++) { const yy = y + dy; if (yy < 0 || yy >= H) continue; for (let dx = -1; dx <= 1; dx++) { const xx = x + dx; if (xx >= 0 && xx < W) cnt[lab[yy * W + xx]]++; } }
    let b = lab[y * W + x], bc = cnt[b];
    for (let k = 0; k < K; k++) if (cnt[k] > bc) { bc = cnt[k]; b = k; }
    out[y * W + x] = b;
  }
  lab = out;
}

// ---------- 3. patches of one color; tiny ones melt into a neighbour ----------
function components() {
  const id = new Int32Array(NPX).fill(-1), list = [], stack = new Int32Array(NPX);
  for (let s = 0; s < NPX; s++) {
    if (id[s] >= 0) continue;
    const c = { id: list.length, label: lab[s], area: 0, x0: W, y0: H, x1: 0, y1: 0, start: s };
    let top = 0; stack[top++] = s; id[s] = c.id;
    while (top) {
      const p = stack[--top], x = p % W, y = (p - x) / W;
      c.area++; if (x < c.x0) c.x0 = x; if (x > c.x1) c.x1 = x; if (y < c.y0) c.y0 = y; if (y > c.y1) c.y1 = y;
      if (x > 0 && id[p - 1] < 0 && lab[p - 1] === c.label) { id[p - 1] = c.id; stack[top++] = p - 1; }
      if (x < W - 1 && id[p + 1] < 0 && lab[p + 1] === c.label) { id[p + 1] = c.id; stack[top++] = p + 1; }
      if (y > 0 && id[p - W] < 0 && lab[p - W] === c.label) { id[p - W] = c.id; stack[top++] = p - W; }
      if (y < H - 1 && id[p + W] < 0 && lab[p + W] === c.label) { id[p + W] = c.id; stack[top++] = p + W; }
    }
    list.push(c);
  }
  return { id, list };
}
let comp = components();
for (let round = 0; round < 4; round++) {
  const small = comp.list.filter(c => c.area < MIN_AREA).sort((a, b) => a.area - b.area);
  if (!small.length) break;
  for (const c of small) {
    const cnt = new Uint32Array(K);
    for (let y = c.y0; y <= c.y1; y++) for (let x = c.x0; x <= c.x1; x++) {
      const p = y * W + x;
      if (comp.id[p] !== c.id) continue;
      if (x > 0 && comp.id[p - 1] !== c.id) cnt[lab[p - 1]]++;
      if (x < W - 1 && comp.id[p + 1] !== c.id) cnt[lab[p + 1]]++;
      if (y > 0 && comp.id[p - W] !== c.id) cnt[lab[p - W]]++;
      if (y < H - 1 && comp.id[p + W] !== c.id) cnt[lab[p + W]]++;
    }
    let b = c.label, bc = 0;
    for (let k = 0; k < K; k++) if (k !== c.label && cnt[k] > bc) { bc = cnt[k]; b = k; }
    if (b === c.label) continue;
    for (let y = c.y0; y <= c.y1; y++) for (let x = c.x0; x <= c.x1; x++) { const p = y * W + x; if (comp.id[p] === c.id) lab[p] = b; }
  }
  comp = components();
}

// ---------- 4. outline of each patch (grown by a pixel so neighbours overlap, no gaps) ----------
function outline(c) {
  const bx = c.x0 - 2, by = c.y0 - 2, w = c.x1 - c.x0 + 5, h = c.y1 - c.y0 + 5;
  const own = new Uint8Array(w * h), m = new Uint8Array(w * h);
  for (let y = c.y0; y <= c.y1; y++) for (let x = c.x0; x <= c.x1; x++) if (comp.id[y * W + x] === c.id) own[(y - by) * w + (x - bx)] = 1;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const p = y * w + x;
    if (own[p] || own[p - 1] || own[p + 1] || own[p - w] || own[p + w] || own[p - w - 1] || own[p - w + 1] || own[p + w - 1] || own[p + w + 1]) m[p] = 1;
  }
  // every pixel side that faces outside becomes an edge, walked clockwise
  const vw = w + 1, edges = new Map();
  const add = (a, b) => { const e = edges.get(a); if (e) e.push(b); else edges.set(a, [b]); };
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const p = y * w + x;
    if (!m[p]) continue;
    if (!m[p - w]) add(y * vw + x, y * vw + x + 1);
    if (!m[p + 1]) add(y * vw + x + 1, (y + 1) * vw + x + 1);
    if (!m[p + w]) add((y + 1) * vw + x + 1, (y + 1) * vw + x);
    if (!m[p - 1]) add((y + 1) * vw + x, y * vw + x);
  }
  let best = null, bestArea = 0;
  for (const [start, outs] of edges) {
    while (outs.length) {
      const loop = [start];
      let cur = start, nxt = outs.pop(), dx = (nxt % vw) - (cur % vw), dy = Math.floor(nxt / vw) - Math.floor(cur / vw);
      for (let guard = 0; guard < 4 * w * h + 8; guard++) {
        cur = nxt;
        if (cur === start) break;
        loop.push(cur);
        const o = edges.get(cur);
        if (!o || !o.length) break;
        // prefer turning left (away from the inside) so pinched shapes stay one loop
        let pick = 0, score = -9;
        for (let k = 0; k < o.length; k++) {
          const ex = (o[k] % vw) - (cur % vw), ey = Math.floor(o[k] / vw) - Math.floor(cur / vw);
          const s = ex === dy && ey === -dx ? 2 : ex === dx && ey === dy ? 1 : 0;
          if (s > score) { score = s; pick = k; }
        }
        nxt = o.splice(pick, 1)[0];
        dx = (nxt % vw) - (cur % vw); dy = Math.floor(nxt / vw) - Math.floor(cur / vw);
      }
      let a = 0;
      const pts = loop.map(v => [(v % vw) + bx, Math.floor(v / vw) + by]);
      for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; }
      if (Math.abs(a) > bestArea) { bestArea = Math.abs(a); best = pts; }
    }
  }
  return best ? { pts: best.map(p => [Math.max(0, Math.min(W, p[0])), Math.max(0, Math.min(H, p[1]))]), area: bestArea / 2 } : null;
}

// ---------- 5. fewer points, then gentle curves that keep real corners sharp ----------
function simplify(pts, eps) {
  const n = pts.length;
  if (n < 8) return pts;
  let far = 0, fd = -1;
  for (let i = 1; i < n; i++) { const d = (pts[i][0] - pts[0][0]) ** 2 + (pts[i][1] - pts[0][1]) ** 2; if (d > fd) { fd = d; far = i; } }
  const keep = new Uint8Array(n); keep[0] = keep[far] = 1;
  const run = (a, b) => {              // a < b, indices into pts (b may equal n meaning pts[0])
    const stack = [[a, b]];
    while (stack.length) {
      const [s, e] = stack.pop();
      const P = pts[s], Q = pts[e % n], vx = Q[0] - P[0], vy = Q[1] - P[1], len = Math.hypot(vx, vy) || 1;
      let md = 0, mi = -1;
      for (let i = s + 1; i < e; i++) { const d = Math.abs((pts[i][0] - P[0]) * vy - (pts[i][1] - P[1]) * vx) / len; if (d > md) { md = d; mi = i; } }
      if (md > eps && mi > 0) { keep[mi] = 1; stack.push([s, mi], [mi, e]); }
    }
  };
  run(0, far); run(far, n);
  return pts.filter((p, i) => keep[i]);
}
const f1 = v => String(Math.round(v * 10) / 10);
function toPath(pts) {
  const n = pts.length;
  if (n < 3) return '';
  const A = [], B = [];
  for (let i = 0; i < n; i++) {
    const P = pts[i], L = pts[(i + n - 1) % n], R = pts[(i + 1) % n];
    const l1 = Math.hypot(L[0] - P[0], L[1] - P[1]) || 1, l2 = Math.hypot(R[0] - P[0], R[1] - P[1]) || 1;
    const cos = ((P[0] - L[0]) * (R[0] - P[0]) + (P[1] - L[1]) * (R[1] - P[1])) / (l1 * l2);
    let r = Math.min(l1, l2) / 2;
    if (cos < 0.64) r = Math.min(r, 2.5);          // a turn sharper than about 50 degrees is a real corner
    A.push([P[0] + ((L[0] - P[0]) * r) / l1, P[1] + ((L[1] - P[1]) * r) / l1]);
    B.push([P[0] + ((R[0] - P[0]) * r) / l2, P[1] + ((R[1] - P[1]) * r) / l2]);
  }
  let d = `M${f1(A[0][0])} ${f1(A[0][1])}`;
  for (let i = 0; i < n; i++) {
    if (i && Math.hypot(A[i][0] - B[i - 1][0], A[i][1] - B[i - 1][1]) > 0.15) d += `L${f1(A[i][0])} ${f1(A[i][1])}`;
    d += `Q${f1(pts[i][0])} ${f1(pts[i][1])} ${f1(B[i][0])} ${f1(B[i][1])}`;
  }
  return d + 'Z';
}

const hex = c => '#' + c.map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
const shapes = [];
// The color around the edge of the image is the page itself: write it once as
// a full-page backdrop and skip its patches, even if the subject cuts it in two.
const edgeCount = new Uint32Array(K);
for (let x = 0; x < W; x++) { edgeCount[lab[x]]++; edgeCount[lab[(H - 1) * W + x]]++; }
for (let y = 0; y < H; y++) { edgeCount[lab[y * W]]++; edgeCount[lab[y * W + W - 1]]++; }
let pageLabel = -1;
for (let k = 0; k < K; k++) if (edgeCount[k] >= (W + H) && (pageLabel < 0 || edgeCount[k] > edgeCount[pageLabel])) pageLabel = k;
if (pageLabel >= 0) shapes.push({ d: `M0 0L${W} 0L${W} ${H}L0 ${H}Z`, area: Infinity, fill: hex(cents[pageLabel]) });
for (const c of comp.list) {
  if (c.area < MIN_AREA) continue;
  if (c.label === pageLabel && (c.x0 === 0 || c.y0 === 0 || c.x1 === W - 1 || c.y1 === H - 1)) continue;
  const o = outline(c);
  if (!o) continue;
  const d = toPath(simplify(o.pts, 1.1));
  if (d) shapes.push({ d, area: o.area, fill: hex(cents[c.label]) });
}
shapes.sort((a, b) => b.area - a.area);          // biggest (outermost) first = back to front

fs.writeFileSync(pos[1], `<?xml version="1.0" encoding="UTF-8"?>
<!-- traced from ${pos[0].replace(/\\/g, '/').split('/').pop()} by tools/png2svg.js -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
${shapes.map(s => `<path fill="${s.fill}" d="${s.d}"/>`).join('\n')}
</svg>
`);
console.log(`${pos[1]}: ${K} colors, ${shapes.length} shapes`);
