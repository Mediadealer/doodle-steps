#!/usr/bin/env node
// Generate one flat-style illustration with the Kie.ai image API.
//
//   node tools/gen-image.js --prompt "a girl with braids reading in a treehouse" --out art/treehouse.png
//
// Options: --model <kie model id>   (default seedream/5-lite-text-to-image)
//          --raw                    (send the prompt as written, without the house style)
//
// The API key is read from the KIE_API_KEY environment variable, or from a
// line KIE_API_KEY=... in a file named .env in the project folder. That file
// is git-ignored; never put the key anywhere else. Each call costs credits on
// that Kie account. Only the prompt is sent.

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const argv = process.argv.slice(2);
const opt = { model: 'seedream/5-lite-text-to-image' };
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--raw') opt.raw = true;
  else if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
}
if (!opt.prompt || !opt.out) { console.error('usage: node tools/gen-image.js --prompt "..." --out art/name.png [--model id] [--raw]'); process.exit(2); }

// The house style: what makes an image trace cleanly into coloring steps.
const STYLE = 'Flat vector illustration in a cheerful sticker-book style. Solid flat colors only: no gradients, no shading, no soft shadows, no texture, no glow. No outlines around shapes. Clean, clearly separated shapes with crisp edges, each one a single color. A limited palette of about 14 distinct colors. Plain single-color background. The whole subject fits inside the square frame with a small margin. Original design: no text, no letters, no logos, no watermark, no existing characters or brands.';
// With --ref, the reference image is a sheet of this app's own hand-made
// pictures and the job is to draw a NEW scene that looks like it belongs with them.
const HOUSE = 'The reference image is a style sheet of four finished pictures. Draw a completely new picture, of the scene described below, that looks like it was made by the same artist for the same sticker-book: chunky rounded shapes, a bright candy palette with soft pastels, flat solid colors, no outlines, no gradients, no shading. Build every object from a few clearly separate solid-colored pieces layered back to front (a whole body shape, then a patch on it, then small features, then tiny shine dots), so it could be colored in one piece at a time. Add the same kind of small charming details: tiny dot eyes and rosy cheeks where a face fits, stitches, stripes, polka dots, and little hearts, sparkles and stars floating in the sky. Fill the whole square with the scene, with sky or a plain backdrop edge to edge. Do not copy any object from the reference. No text, no letters, no logos, no existing characters or brands. The new scene: ';
const prompt = opt.raw ? opt.prompt : opt.ref ? `${HOUSE}${opt.prompt.trim().replace(/[.\s]+$/, '')}.` : `${opt.prompt.trim().replace(/[.\s]+$/, '')}. ${STYLE}`;

function readKey() {
  if (process.env.KIE_API_KEY) return process.env.KIE_API_KEY.trim();
  try {
    const m = /^\s*KIE_API_KEY\s*=\s*["']?([^"'\r\n]+)["']?\s*$/m.exec(fs.readFileSync(path.join(root, '.env'), 'utf8'));
    if (m) return m[1].trim();
  } catch { /* no .env */ }
  return null;
}
const key = readKey();
if (!key) {
  console.error('No Kie API key found. Set the KIE_API_KEY environment variable, or create a file named .env in the project folder containing one line:\n  KIE_API_KEY=your-key-here');
  process.exit(3);
}

// request body per model family (see https://docs.kie.ai)
function inputFor(model) {
  if (model.startsWith('seedream/')) return { prompt, aspect_ratio: '1:1', quality: 'basic', output_format: 'png', nsfw_checker: true };
  if (model.startsWith('gpt-image-2-6/')) {
    // --format svg (Sunburst only): the model draws the image, then a text model writes it out as SVG
    const base = { prompt, aspect_ratio: '1:1', resolution: '1K', quality: 'medium', background: 'opaque', output_format: opt.format === 'svg' ? 'svg' : 'png' };
    if (opt.format === 'svg') base.svg = { model: opt['svg-model'] || 'gpt-5.6-luna' };
    if (opt.ref) base.input_urls = [opt.ref];      // --ref URL: a style reference (image-to-image models only)
    return base;
  }
  if (model.startsWith('gpt-image')) return { prompt, aspect_ratio: '1:1', resolution: '1K' };
  if (model.startsWith('flux-2/')) return { prompt, aspect_ratio: '1:1', resolution: '1K', nsfw_checker: true };
  if (model.startsWith('ideogram/')) return { prompt, image_size: 'square_hd', style: 'DESIGN', rendering_speed: 'BALANCED' };
  return { prompt, aspect_ratio: '1:1' };
}

const API = 'https://api.kie.ai/api/v1/jobs';
const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const made = await (await fetch(`${API}/createTask`, { method: 'POST', headers, body: JSON.stringify({ model: opt.model, input: inputFor(opt.model) }) })).json();
  if (made.code !== 200 || !made.data || !made.data.taskId) throw new Error(`Kie refused the request (code ${made.code}): ${made.msg || 'no message'}`);
  const taskId = made.data.taskId;
  process.stdout.write(`task ${taskId} `);

  let data = null, wait = 3000;
  for (const started = Date.now(); Date.now() - started < 6 * 60 * 1000;) {
    await sleep(wait);
    wait = Math.min(wait + 1000, 8000);
    const res = await (await fetch(`${API}/recordInfo?taskId=${encodeURIComponent(taskId)}`, { headers })).json();
    if (res.code !== 200 || !res.data) throw new Error(`Kie status check failed (code ${res.code}): ${res.msg || 'no message'}`);
    process.stdout.write('.');
    if (res.data.state === 'success') { data = res.data; break; }
    if (res.data.state === 'fail') throw new Error(`generation failed: ${res.data.failMsg || res.data.failCode || 'no reason given'}`);
  }
  if (!data) throw new Error('timed out after 6 minutes waiting for the image');

  const urls = (JSON.parse(data.resultJson || '{}').resultUrls) || [];
  if (!urls.length) throw new Error('Kie reported success but returned no image URL');
  const img = await fetch(urls[0]);
  if (!img.ok) throw new Error(`could not download the image (HTTP ${img.status})`);
  const buf = Buffer.from(await img.arrayBuffer());
  fs.mkdirSync(path.dirname(path.resolve(opt.out)), { recursive: true });
  fs.writeFileSync(opt.out, buf);
  console.log(`\nsaved ${opt.out} (${Math.round(buf.length / 1024)} KB), model ${opt.model}, credits used: ${data.creditsConsumed ?? 'not reported'}`);
})().catch(e => { console.error('\n' + e.message); process.exit(1); });
