#!/usr/bin/env node
// Static check of every picture: run `node tools/check-lessons.js` (optionally
// with picture ids to limit the report). Exits 1 if any picture has an error.
// It cannot see the picture; use tools/check.html in a browser for that.

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const only = process.argv.slice(2);

const sb = {};
sb.window = sb;
vm.createContext(sb);
const load = file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sb, { filename: file });

load('lessons.js');
const picDir = path.join(root, 'pictures');
const picFiles = fs.existsSync(picDir) ? fs.readdirSync(picDir).filter(f => f.endsWith('.js')).sort() : [];
for (const f of picFiles) {
  try { load('pictures/' + f); } catch (e) { console.log(`ERROR  pictures/${f}: does not run: ${e.message}`); process.exitCode = 1; }
}

// every pictures/*.js must be listed in index.html, before app.js
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const f of picFiles) {
  if (!html.includes(`pictures/${f}`)) { console.log(`ERROR  pictures/${f} has no <script> tag in index.html`); process.exitCode = 1; }
}

const HEX = /^#[0-9a-f]{6}$/i;
const LINES = [4, 5, 6, 8, 16];
const ARGS = { M: 2, L: 2, T: 2, Q: 4, S: 4, C: 6, A: 7, H: 1, V: 1, Z: 0 };

// absolute end points and control points of a path, or a string describing what is wrong
function points(d) {
  if (typeof d !== 'string' || !d.startsWith('M')) return 'path must be a string starting with M';
  if (/NaN|undefined|Infinity/.test(d)) return 'path contains NaN/undefined';
  if (/[a-z]/.test(d.replace(/e[-+]?\d/g, ''))) return 'use absolute (UPPERCASE) path commands only';
  const tokens = d.match(/[MLTQSCAHVZ]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tokens || tokens.join('').length !== d.replace(/[\s,]/g, '').length) return 'path has characters that are not commands or numbers';
  const pts = [];
  let i = 0, cmd = null, x = 0, y = 0;
  while (i < tokens.length) {
    if (/[A-Z]/.test(tokens[i])) { cmd = tokens[i++]; if (cmd === 'Z') continue; }
    if (!cmd || cmd === 'Z') return 'number without a command';
    const n = ARGS[cmd];
    const a = tokens.slice(i, i + n).map(Number);
    if (a.length < n || a.some(v => !isFinite(v))) return `command ${cmd} needs ${n} numbers`;
    i += n;
    if (cmd === 'H') x = a[0];
    else if (cmd === 'V') y = a[0];
    else if (cmd === 'A') { x = a[5]; y = a[6]; }
    else { for (let k = 0; k < n; k += 2) pts.push([a[k], a[k + 1]]); x = a[n - 2]; y = a[n - 1]; }
    pts.push([x, y]);
    if (cmd === 'M') cmd = 'L';
  }
  return pts;
}

let errors = 0, warnings = 0, shown = 0, shownE = 0, shownW = 0;
const ids = new Set();

for (const l of sb.LESSONS) {
  const E = [], W = [];
  if (!/^[a-z][a-z0-9]*$/.test(l.id || '')) E.push(`id "${l.id}" must be lowercase letters/digits`);
  if (ids.has(l.id)) E.push(`id "${l.id}" is used twice`);
  ids.add(l.id);
  if (!l.name || l.name.length > 16) E.push(`name "${l.name}" missing or longer than 16 characters`);
  if (!HEX.test(l.bg || '')) E.push(`bg "${l.bg}" must be #rrggbb`);
  if (!Array.isArray(l.steps) || l.steps.length < 5) E.push('needs at least 5 steps');

  const names = new Set();
  (l.steps || []).forEach((s, i) => {
    const at = `step ${i + 1} "${s.name}"`;
    if (!s.name || s.name.length > 24) E.push(`${at}: name missing or longer than 24 characters`);
    if (names.has(s.name)) W.push(`${at}: another step has the same name`);
    names.add(s.name);
    if (!HEX.test(s.color || '')) E.push(`${at}: color "${s.color}" must be #rrggbb`);
    if (s.line !== undefined && !LINES.includes(s.line)) E.push(`${at}: line must be one of ${LINES.join(', ')}`);
    const p = points(s.d);
    if (typeof p === 'string') { E.push(`${at}: ${p}`); return; }
    const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    if (x0 < -40 || y0 < -40 || x1 > 640 || y1 > 640) E.push(`${at}: goes off the 600 x 600 page (x ${x0}..${x1}, y ${y0}..${y1})`);
    if (!s.line && !/[AQC]/.test(s.d) && x1 - x0 < 7 && y1 - y0 < 7) E.push(`${at}: too small to color (under 7 units)`);
    if (i === 0 && s.line) W.push(`${at}: the first step should be a big shape, not a line`);
  });

  errors += E.length; warnings += W.length;
  if (only.length && !only.includes(l.id)) continue;
  shown++; shownE += E.length; shownW += W.length;
  const tag = E.length ? 'ERROR ' : W.length ? 'WARN  ' : 'OK    ';
  console.log(`${tag} ${l.id.padEnd(12)} ${String((l.steps || []).length).padStart(3)} steps  ${l.name}`);
  E.forEach(m => console.log('         error: ' + m));
  W.forEach(m => console.log('         warning: ' + m));
}

console.log(`\n${shown} checked: ${shownE} errors, ${shownW} warnings` + (only.length ? ` (all ${sb.LESSONS.length} pictures: ${errors} errors, ${warnings} warnings)` : ''));
if (errors) process.exitCode = 1;
