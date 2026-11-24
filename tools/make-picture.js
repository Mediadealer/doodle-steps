#!/usr/bin/env node
// One command from an idea to a playable picture:
//
//   node tools/make-picture.js --id treehouse --name "Treehouse" --steps 45 \
//        --prompt "a girl with braids reading a book in a cozy treehouse"
//
// It runs, in order:  gen-image.js (Kie.ai, costs credits)  ->  png2svg.js
// (trace)  ->  svg2steps.js (steps)  ->  check-lessons.js, and records the
// picture in art/SOURCES.md.
//
// Other options: --colors N (palette size for tracing, default 16)
//                --model <kie model id>
//                --image <file>  use an existing image instead of generating
//                                (also the way to re-trace without paying again)

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const opt = { steps: '45', colors: '16' };
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
if (!/^[a-z][a-z0-9]*$/.test(opt.id || '') || (!opt.prompt && !opt.image)) {
  console.error('usage: node tools/make-picture.js --id lowercaseid --name "Name" --prompt "what to draw" [--steps 45] [--colors 16] [--model id] [--image file]');
  process.exit(2);
}

const run = (script, args) => {
  const r = spawnSync(process.execPath, [path.join(__dirname, script), ...args], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
};

let image = opt.image;
if (!image) {
  image = `art/${opt.id}.png`;
  run('gen-image.js', ['--prompt', opt.prompt, '--out', image, ...(opt.model ? ['--model', opt.model] : [])]);
}
const svg = `art/${opt.id}.svg`;
run('png2svg.js', [image, svg, '--colors', opt.colors]);

const source = opt.image ? `image supplied: ${path.basename(opt.image)}` : `AI-generated with Kie.ai (${opt.model || 'seedream/5-lite-text-to-image'})`;
const license = opt.image ? 'see art/SOURCES.md' : 'Generated for this project';
run('svg2steps.js', [svg, '--id', opt.id, '--name', opt.name || opt.id, '--steps', opt.steps, '--source', source, '--license', license]);

const sources = path.join(root, 'art', 'SOURCES.md');
const line = `| ${opt.id}.svg | ${opt.id} | ${source}${opt.prompt ? `; prompt: "${opt.prompt.replace(/\|/g, '/')}"` : ''} | ${license} |\n`;
let text = fs.existsSync(sources) ? fs.readFileSync(sources, 'utf8') : '# Art sources\n\n| File | Picture id | Source | Licence |\n|---|---|---|---|\n';
text = text.split('\n').filter(l => !l.startsWith(`| ${opt.id}.svg |`)).join('\n');
fs.writeFileSync(sources, text.replace(/\n*$/, '\n') + line);

run('check-lessons.js', [opt.id]);
console.log(`\nNext: open http://localhost:5173/tools/check.html?id=${opt.id} and LOOK at it. If it is muddy, regenerate with a simpler prompt, or re-trace the same image with a different --colors (use --image ${image} so it is not paid for twice).`);
