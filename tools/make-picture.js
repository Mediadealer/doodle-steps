#!/usr/bin/env node
// One command from an idea to a playable picture:
//
//   node tools/make-picture.js --id treehouse --name "Treehouse" --steps 45 \
//        --prompt "a cozy treehouse in a big oak tree at sunset, a rope ladder, a sleeping cat, lanterns"
//
// Default route ("svg"): Kie's GPT Image 2.6 Sunburst draws the picture and
// returns it as real vector art, which converts directly. About 9 credits.
//
//   --route trace    generate a flat PNG with another model (default Seedream 5
//                    Lite, about 5.5 credits) and trace it with png2svg.js
//   --model <id>     Kie model id for the chosen route
//   --image <file>   skip generating: trace this PNG/JPG/WebP, or convert this
//                    SVG. Also the way to redo a picture without paying again.
//   --colors N       palette size when tracing (default 16)
//
// Then: svg2steps.js (steps) -> check-lessons.js, and a line in art/SOURCES.md.

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const opt = { steps: '45', colors: '16', route: 'svg' };
for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
if (!/^[a-z][a-z0-9]*$/.test(opt.id || '') || (!opt.prompt && !opt.image) || !['svg', 'trace'].includes(opt.route)) {
  console.error('usage: node tools/make-picture.js --id lowercaseid --name "Name" --prompt "what to draw" [--steps 45] [--route svg|trace] [--model id] [--colors 16] [--image file]');
  process.exit(2);
}

const run = (script, args) => {
  const r = spawnSync(process.execPath, [path.join(__dirname, script), ...args], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status || 1);
};

const svg = `art/${opt.id}.svg`;
let source;
if (opt.image) {
  source = `image supplied: ${path.basename(opt.image)}`;
  if (/\.svg$/i.test(opt.image)) { if (path.resolve(root, opt.image) !== path.resolve(root, svg)) fs.copyFileSync(path.resolve(root, opt.image), path.join(root, svg)); }
  else run('png2svg.js', [opt.image, svg, '--colors', opt.colors]);
} else if (opt.route === 'svg') {
  const model = opt.model || 'gpt-image-2-6/sunburst-text-to-image';
  run('gen-image.js', ['--prompt', opt.prompt, '--out', svg, '--model', model, '--format', 'svg']);
  source = `AI-generated with Kie.ai (${model}, SVG output)`;
} else {
  const model = opt.model || 'seedream/5-lite-text-to-image';
  const image = `art/${opt.id}.png`;
  run('gen-image.js', ['--prompt', opt.prompt, '--out', image, '--model', model]);
  run('png2svg.js', [image, svg, '--colors', opt.colors]);
  source = `AI-generated with Kie.ai (${model}), traced`;
}

// The SVG is kept in the repo and so is served by the public site: refuse
// anything in it that could run code or load from elsewhere.
const text = fs.readFileSync(path.join(root, svg), 'utf8');
if (!/<svg[\s>]/i.test(text)) { console.error(`${svg} is not an SVG file.`); process.exit(1); }
if (/<script|<foreignObject|<iframe|\son[a-z]+\s*=|javascript:|(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i.test(text)) {
  fs.unlinkSync(path.join(root, svg));
  console.error(`${svg} contains scripts or outside links, so it was deleted and not converted. Generate again.`);
  process.exit(1);
}

const license = opt.image ? 'see art/SOURCES.md' : 'Generated for this project';
run('svg2steps.js', [svg, '--id', opt.id, '--name', opt.name || opt.id, '--steps', opt.steps, '--source', source, '--license', license]);

const sources = path.join(root, 'art', 'SOURCES.md');
const line = `| ${opt.id}.svg | ${opt.id} | ${source}${opt.prompt ? `; prompt: "${opt.prompt.replace(/\|/g, '/')}"` : ''} | ${license} |\n`;
let md = fs.existsSync(sources) ? fs.readFileSync(sources, 'utf8') : '# Art sources\n\n| File | Picture id | Source | Licence |\n|---|---|---|---|\n';
md = md.split('\n').filter(l => !l.startsWith(`| ${opt.id}.svg |`)).join('\n');
fs.writeFileSync(sources, md.replace(/\n*$/, '\n') + line);

run('check-lessons.js', [opt.id]);
console.log(`\nNext: open http://localhost:5173/tools/check.html?id=${opt.id} and LOOK at it before publishing.`);
