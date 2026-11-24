// Each picture is a list of steps, painted back-to-front on a 600 x 600 page.
// A step is one colour and one shape (an SVG path in `d`).
//   - no `line`  -> a shape to colour in
//   - `line: n`  -> a line to trace, n units thick
// To add a picture, copy one of these and change the shapes.

(() => {
  const f = n => +n.toFixed(1);

  // Ellipse as a path. rot is in degrees.
  function E(cx, cy, rx, ry, rot = 0) {
    const a = (rot * Math.PI) / 180;
    const dx = rx * Math.cos(a), dy = rx * Math.sin(a);
    const p1 = `${f(cx - dx)} ${f(cy - dy)}`, p2 = `${f(cx + dx)} ${f(cy + dy)}`;
    return `M${p1}A${rx} ${ry} ${rot} 1 0 ${p2}A${rx} ${ry} ${rot} 1 0 ${p1}Z`;
  }
  const C = (cx, cy, r) => E(cx, cy, r, r, 0);

  const INK = '#2b2b3a';

  window.LESSONS = [
    {
      id: 'chick', name: 'Chick', bg: '#bfe6ff',
      steps: [
        { name: 'Big round body', color: '#ffd84a', d: C(300, 330, 175) },
        { name: 'Wings', color: '#ffb92e', d: E(140, 360, 38, 75, 20) + E(460, 360, 38, 75, -20) },
        { name: 'Rosy cheeks', color: '#ff9eb0', d: C(205, 350, 26) + C(395, 350, 26) },
        { name: 'Eyes', color: INK, d: C(240, 290, 18) + C(360, 290, 18) },
        { name: 'Beak', color: '#ff8a1f', d: 'M268 322L332 322L300 368Z' },
        { name: 'Feet', color: '#ff8a1f', line: 8, d: 'M255 500L255 555M235 558L255 545L275 558M345 500L345 555M325 558L345 545L365 558' },
        { name: 'Fluffy hair', color: '#ffb92e', line: 8, d: 'M300 158Q292 120 268 108M300 158Q312 118 340 112' },
      ],
    },
    {
      id: 'flower', name: 'Flower', bg: '#d6f0ff',
      steps: [
        { name: 'Stem', color: '#4caf50', line: 16, d: 'M300 320Q285 450 300 575' },
        { name: 'Leaves', color: '#6bcf63', d: E(238, 465, 58, 24, 25) + E(355, 430, 58, 24, -25) },
        { name: 'Petals', color: '#ff7eb6', d: C(392, 225, 60) + C(346, 304.7, 60) + C(254, 304.7, 60) + C(208, 225, 60) + C(254, 145.3, 60) + C(346, 145.3, 60) },
        { name: 'Sunny middle', color: '#ffd84a', d: C(300, 225, 68) },
        { name: 'Eyes', color: INK, d: C(278, 212, 9) + C(322, 212, 9) },
        { name: 'Smile', color: INK, line: 8, d: 'M270 240Q300 270 330 240' },
      ],
    },
    {
      id: 'fish', name: 'Fish', bg: '#bdeeff',
      steps: [
        { name: 'Tail', color: '#ff7b3a', d: 'M165 300L55 215L80 300L55 385Z' },
        { name: 'Fins', color: '#ff7b3a', d: 'M240 205Q310 105 395 200ZM270 400Q300 470 350 405Z' },
        { name: 'Body', color: '#ffa63d', d: E(310, 300, 185, 118) },
        { name: 'Stripes', color: '#ffffff', d: 'M262 194Q300 300 262 406L326 412Q364 300 326 188ZM175 235Q195 300 175 365L205 380Q228 300 205 220Z' },
        { name: 'Eye', color: '#ffffff', d: C(415, 270, 30) },
        { name: 'Pupil', color: INK, d: C(423, 272, 14) },
        { name: 'Smile', color: INK, line: 8, d: 'M482 335Q455 352 438 338' },
        { name: 'Bubbles', color: '#ffffff', d: C(530, 190, 20) + C(560, 130, 14) + C(520, 90, 9) },
      ],
    },
    {
      id: 'icecream', name: 'Ice cream', bg: '#fff1c9',
      steps: [
        { name: 'Cone', color: '#e3a455', d: 'M205 330L395 330L300 575Z' },
        { name: 'Waffle lines', color: '#b97a35', line: 8, d: 'M255 335L335 480M345 335L265 480' },
        { name: 'Strawberry scoop', color: '#ff8fb3', d: C(300, 270, 108) },
        { name: 'Mint scoop', color: '#8fe0c0', d: C(300, 160, 82) },
        { name: 'Sprinkles', color: '#ffffff', line: 8, d: 'M240 250L258 262M330 300L350 290M285 320L300 335M355 245L372 258M225 300L240 290' },
        { name: 'Cherry', color: '#e63950', d: C(300, 78, 27) },
        { name: 'Cherry stem', color: '#5a8f3c', line: 8, d: 'M304 54Q312 26 340 22' },
      ],
    },
    {
      id: 'cat', name: 'Cat', bg: '#cdeccf',
      steps: [
        { name: 'Pointy ears', color: '#f59a3c', d: 'M135 250L160 85L285 180ZM465 250L440 85L315 180Z' },
        { name: 'Head', color: '#f59a3c', d: E(300, 335, 195, 165) },
        { name: 'Stripes', color: '#d9781f', line: 16, d: 'M300 182L300 228M258 190L266 226M342 190L334 226' },
        { name: 'Inside the ears', color: '#ffb3c1', d: 'M172 185L178 125L232 168ZM428 185L422 125L368 168Z' },
        { name: 'Fuzzy muzzle', color: '#fff3e0', d: E(300, 405, 85, 58) },
        { name: 'Green eyes', color: '#7ed957', d: E(222, 315, 26, 32) + E(378, 315, 26, 32) },
        { name: 'Pupils', color: INK, d: E(222, 315, 9, 24) + E(378, 315, 9, 24) },
        { name: 'Nose', color: '#ff7a90', d: 'M280 372L320 372L300 396Z' },
        { name: 'Mouth', color: INK, line: 8, d: 'M300 396Q298 425 270 424M300 396Q302 425 330 424' },
        { name: 'Whiskers', color: INK, line: 8, d: 'M215 395L110 375M215 415L110 430M385 395L490 375M385 415L490 430' },
      ],
    },
    {
      id: 'rocket', name: 'Rocket', bg: '#1d2452',
      steps: [
        { name: 'Fins', color: '#ff5a5f', d: 'M232 370L150 490L232 465ZM368 370L450 490L368 465Z' },
        { name: 'Fire', color: '#ff9f1c', d: 'M250 465Q300 610 350 465Z' },
        { name: 'Rocket body', color: '#f1f3ff', d: 'M300 70C385 160 392 310 368 470L232 470C208 310 215 160 300 70Z' },
        { name: 'Nose cone', color: '#ff5a5f', d: 'M300 70C335 108 355 150 365 195L235 195C245 150 265 108 300 70Z' },
        { name: 'Window', color: '#58c7f3', d: C(300, 285, 48) },
        { name: 'Window rim', color: '#3d4a7a', line: 8, d: C(300, 285, 48) },
        { name: 'Hot flame', color: '#ffe14d', d: 'M275 472Q300 545 325 472Z' },
        { name: 'Stars', color: '#ffe14d', d: C(110, 120, 10) + C(500, 90, 8) + C(520, 300, 10) + C(90, 340, 8) + C(470, 560, 7) + C(130, 540, 9) },
      ],
    },

    // ---------- more detailed pictures ----------
    {
      id: 'butterfly', name: 'Butterfly', bg: '#e8f7d4',
      steps: [
        { name: 'Top wings', color: '#b46be0', d: E(195, 225, 120, 105, 20) + E(405, 225, 120, 105, -20) },
        { name: 'Bottom wings', color: '#ff7eb6', d: E(215, 400, 85, 95, -20) + E(385, 400, 85, 95, 20) },
        { name: 'Yellow patches', color: '#ffd84a', d: E(190, 225, 70, 60, 20) + E(410, 225, 70, 60, -20) },
        { name: 'Blue spots', color: '#58c7f3', d: C(190, 225, 25) + C(410, 225, 25) },
        { name: 'Cream patches', color: '#ffe9a8', d: C(215, 405, 45) + C(385, 405, 45) },
        { name: 'Purple spots', color: '#b46be0', d: C(215, 405, 18) + C(385, 405, 18) },
        { name: 'Wing dots', color: '#ffffff', d: C(120, 170, 9) + C(110, 230, 9) + C(480, 170, 9) + C(490, 230, 9) },
        { name: 'Body', color: '#4a3b6b', d: E(300, 320, 26, 125) },
        { name: 'Head', color: '#4a3b6b', d: C(300, 180, 36) },
        { name: 'Body stripes', color: '#8f7fc0', line: 8, d: 'M282 290L318 290M280 330L320 330M282 370L318 370M286 410L314 410' },
        { name: 'Feelers', color: '#4a3b6b', line: 8, d: 'M288 150Q270 95 240 85M312 150Q330 95 360 85' },
        { name: 'Feeler tips', color: '#ff7eb6', d: C(238, 83, 10) + C(362, 83, 10) },
        { name: 'Eyes', color: '#ffffff', d: C(288, 175, 7) + C(312, 175, 7) },
        { name: 'Smile', color: '#ffffff', line: 6, d: 'M288 193Q300 205 312 193' },
      ],
    },
    {
      id: 'sailboat', name: 'Sailboat', bg: '#bfe6ff',
      steps: [
        { name: 'Sun', color: '#ffd84a', d: C(480, 110, 55) },
        { name: 'Sunbeams', color: '#ffd84a', line: 8, d: 'M480 38L480 18M552 110L575 110M408 110L385 110M531 59L547 43M429 59L413 43M531 161L547 177M429 161L413 177' },
        { name: 'Cloud', color: '#ffffff', d: C(120, 110, 34) + C(165, 95, 42) + C(215, 112, 32) + E(168, 125, 75, 22) },
        { name: 'Sea', color: '#3fa7d6', d: 'M0 430Q75 410 150 430T300 430T450 430T600 430L600 600L0 600Z' },
        { name: 'Boat', color: '#e4572e', d: 'M150 400L450 400L400 480L200 480Z' },
        { name: 'Boat stripe', color: '#ffffff', line: 8, d: 'M176 425L424 425' },
        { name: 'Mast', color: '#7a4b2a', line: 8, d: 'M300 400L300 90' },
        { name: 'Big sail', color: '#ffffff', d: 'M312 140L312 380L460 380Z' },
        { name: 'Little sail', color: '#ff9eb0', d: 'M288 180L288 380L170 380Z' },
        { name: 'Sail stripes', color: '#58c7f3', line: 16, d: 'M322 300L396 300M322 240L358 240' },
        { name: 'Flag', color: '#e4572e', d: 'M304 92L355 108L304 124Z' },
        { name: 'Splashy wave', color: '#d4f1ff', line: 8, d: 'M0 485Q50 465 100 485T200 485T300 485T400 485T500 485T600 485' },
        { name: 'Birds', color: INK, line: 6, d: 'M70 220Q85 205 100 220Q115 205 130 220M150 280Q162 268 174 280Q186 268 198 280' },
      ],
    },
    {
      id: 'dino', name: 'Dinosaur', bg: '#ffe9c7',
      steps: [
        { name: 'Grassy ground', color: '#c8e6a0', d: E(300, 560, 280, 40) },
        { name: 'Tail', color: '#5cbf6a', d: 'M210 400Q90 420 40 330Q110 470 250 470Z' },
        { name: 'Legs', color: '#4aad5c', d: 'M225 440L225 515Q225 532 242 532L263 532Q280 532 280 515L280 440ZM340 440L340 515Q340 532 357 532L378 532Q395 532 395 515L395 440Z' },
        { name: 'Body', color: '#5cbf6a', d: E(300, 400, 140, 95) },
        { name: 'Long neck', color: '#5cbf6a', d: 'M360 360L400 180L470 190L440 400Z' },
        { name: 'Head', color: '#5cbf6a', d: E(455, 170, 75, 50) },
        { name: 'Tummy', color: '#c9efb0', d: E(300, 440, 95, 45) },
        { name: 'Back spikes', color: '#ff8a3c', d: 'M215 335L235 285L260 318ZM270 312L295 265L318 306ZM328 308L352 268L370 318Z' },
        { name: 'Spots', color: '#3f9e52', d: C(250, 370, 14) + C(330, 350, 11) + C(385, 395, 13) + C(200, 400, 9) },
        { name: 'Rosy cheek', color: '#ff9eb0', d: C(440, 190, 11) },
        { name: 'Eye', color: '#ffffff', d: C(470, 155, 13) },
        { name: 'Pupil', color: INK, d: C(474, 156, 6) },
        { name: 'Smile', color: INK, line: 6, d: 'M478 195Q505 200 520 180' },
        { name: 'Grass', color: '#6bcf63', line: 8, d: 'M70 545L80 518L90 545M130 562L140 538L150 562M480 550L490 524L500 550M530 565L540 542L550 565' },
      ],
    },
    {
      id: 'owl', name: 'Night owl', bg: '#2a2f5e',
      steps: [
        { name: 'Moon', color: '#fff3b0', d: C(480, 110, 60) },
        { name: 'Branch', color: '#7a4b2a', line: 16, d: 'M60 500Q300 470 540 505' },
        { name: 'Ear tufts', color: '#9b6b43', d: 'M185 225L170 120L255 185ZM415 225L430 120L345 185Z' },
        { name: 'Body', color: '#9b6b43', d: E(300, 330, 150, 175) },
        { name: 'Tummy', color: '#e8c79a', d: E(300, 385, 95, 110) },
        { name: 'Tummy feathers', color: '#c79a63', line: 8, d: 'M265 350L280 365L295 350M305 350L320 365L335 350M285 395L300 410L315 395M265 440L280 455L295 440M305 440L320 455L335 440' },
        { name: 'Wings', color: '#7a4f2e', d: E(165, 350, 40, 105, 10) + E(435, 350, 40, 105, -10) },
        { name: 'Eye patches', color: '#f5e6c8', d: C(245, 255, 58) + C(355, 255, 58) },
        { name: 'Big eyes', color: '#ffc93c', d: C(245, 255, 36) + C(355, 255, 36) },
        { name: 'Pupils', color: INK, d: C(245, 255, 18) + C(355, 255, 18) },
        { name: 'Eye sparkle', color: '#ffffff', d: C(252, 247, 6) + C(362, 247, 6) },
        { name: 'Beak', color: '#ff8a1f', d: 'M282 290L318 290L300 325Z' },
        { name: 'Toes', color: '#ff8a1f', line: 8, d: 'M255 478L255 500M270 478L270 500M285 478L285 500M315 478L315 500M330 478L330 500M345 478L345 500' },
        { name: 'Leaves', color: '#6bcf63', d: E(110, 472, 30, 14, -30) + E(505, 480, 30, 14, 25) },
        { name: 'Stars', color: '#fff3b0', d: C(90, 90, 8) + C(200, 60, 6) + C(370, 50, 7) + C(545, 240, 7) + C(70, 250, 6) },
      ],
    },
  ];
})();
