// pictures/tkturkey.js — hand-drawn: a happy turkey in a pilgrim hat (Thanksgiving set)
(() => {
  const { E, C, INK } = DS;
  const ORANGE = '#ff8a1f', RIB = '#d96a10', STEM = '#5a8a3a';
  LESSONS.push({
    id: 'tkturkey',
    name: 'Gobble gobble',
    bg: '#f6e3b4',
    steps: [
      { name: 'Grass', color: '#8fbf5a', d: 'M0 480L600 480L600 600L0 600Z' },
      { name: 'Sun', color: '#ffd84a', d: C(90, 90, 45) },
      { name: 'Cloud', color: '#ffffff', d: E(470, 90, 60, 22) + E(430, 75, 34, 20) },
      // the tail fan
      { name: 'Red feathers', color: '#e4405a', d: E(431.6, 282.1, 90, 28, -20) + E(300, 190, 90, 28, 90) + E(168.4, 282.1, 90, 28, 20) },
      { name: 'Orange feathers', color: ORANGE, d: E(399, 231, 90, 28, -45) + E(201, 231, 90, 28, 45) },
      { name: 'Yellow feathers', color: '#ffc93c', d: E(347.9, 198.4, 90, 28, -70) + E(252.1, 198.4, 90, 28, 70) },
      { name: 'Feather spots', color: '#7a4a2a', d: C(488, 262, 9) + C(441, 189, 9) + C(368, 142, 9) + C(300, 130, 9) + C(232, 142, 9) + C(159, 189, 9) + C(112, 262, 9) },
      { name: 'Feather lines', color: '#a8552a', line: 4, d: 'M366 306L455 273M349 281L418 212M324 264L357 174M300 260L300 164M276 264L243 174M251 281L182 212M234 306L145 273' },
      // the turkey
      { name: 'Legs', color: '#f2a33a', line: 8, d: 'M270 470L265 530M330 470L335 530' },
      { name: 'Feet', color: '#f2a33a', line: 6, d: 'M265 530L245 545M265 530L265 548M265 530L285 545M335 530L315 545M335 530L335 548M335 530L355 545' },
      { name: 'Body', color: '#8a5a36', d: E(300, 400, 105, 95) },
      { name: 'Wings', color: '#6b4226', d: E(212, 405, 28, 55) + E(388, 405, 28, 55) },
      { name: 'Wing feathers', color: '#4f2f1a', line: 4, d: 'M200 380Q212 400 204 430M222 380Q232 400 224 430M378 380Q368 400 376 430M400 380Q388 400 396 430' },
      { name: 'Belly', color: '#c9966b', d: E(300, 425, 60, 55) },
      { name: 'Belly feathers', color: '#a8744a', line: 4, d: 'M262 405Q270 415 278 405M292 405Q300 415 308 405M322 405Q330 415 338 405M277 432Q285 442 293 432M307 432Q315 442 323 432M292 458Q300 468 308 458' },
      { name: 'Head', color: '#8a5a36', d: C(300, 270, 55) },
      { name: 'Eyes', color: '#ffffff', d: C(280, 260, 15) + C(320, 260, 15) },
      { name: 'Pupils', color: INK, d: C(283, 262, 7) + C(317, 262, 7) },
      { name: 'Eye sparkles', color: '#ffffff', d: C(286, 259, 4) + C(320, 259, 4) },
      { name: 'Beak', color: '#ffb81c', d: 'M286 282L314 282L300 308Z' },
      { name: 'Wattle', color: '#e4405a', d: 'M308 290Q326 300 316 326Q302 322 306 300Z' },
      { name: 'Blush', color: '#ff9a8a', d: E(255, 285, 10, 7) + E(345, 285, 10, 7) },
      // pilgrim hat
      { name: 'Hat brim', color: INK, d: E(300, 222, 62, 10) },
      { name: 'Hat top', color: INK, d: 'M265 222L270 160L330 160L335 222Z' },
      { name: 'Hat band', color: '#c9413b', d: 'M267 196L333 196L334 212L266 212Z' },
      { name: 'Hat buckle', color: '#ffc93c', d: 'M290 192L310 192L310 216L290 216Z' },
      { name: 'Buckle hole', color: INK, d: 'M296 198L304 198L304 210L296 210Z' },
      // pumpkins
      { name: 'Big pumpkin', color: ORANGE, d: E(90, 500, 55, 42) },
      { name: 'Big pumpkin lines', color: RIB, line: 4, d: 'M90 460Q70 500 90 540M90 460Q110 500 90 540' },
      { name: 'Big pumpkin stem', color: STEM, d: 'M84 462L96 462L98 440L86 444Z' },
      { name: 'Small pumpkin', color: '#ffa23a', d: E(510, 515, 45, 35) },
      { name: 'Small pumpkin lines', color: RIB, line: 4, d: 'M510 482Q494 515 510 548M510 482Q526 515 510 548' },
      { name: 'Small pumpkin stem', color: STEM, d: 'M505 484L515 484L517 465L507 468Z' },
      // around the picture
      { name: 'Grass tufts', color: '#5f9a3a', line: 5, d: 'M170 560L176 540L182 560M420 565L426 545L432 565M560 570L566 552L572 570' },
      { name: 'Acorns', color: '#a8744a', d: E(230, 560, 10, 12) + E(380, 575, 10, 12) },
      { name: 'Acorn caps', color: '#6b4226', d: 'M219 553Q230 540 241 553ZM369 568Q380 555 391 568Z' },
      { name: 'Sun rays', color: '#ffd84a', line: 5, d: 'M90 30L90 15M150 90L165 90M132 48L143 37M132 132L143 143M48 132L37 143M30 90L15 90M48 48L37 37' },
      { name: 'Orange leaves', color: ORANGE, d: E(60, 200, 14, 8, 30) + E(540, 220, 14, 8, -30) + E(520, 400, 12, 7, 20) },
      { name: 'Red leaves', color: '#c9413b', d: E(80, 340, 14, 8, -20) + E(555, 330, 13, 7, 40) + E(40, 420, 12, 7, 10) },
      { name: 'Golden leaves', color: '#e0932a', d: E(190, 60, 12, 7, 20) + E(380, 50, 12, 7, -30) + E(570, 150, 12, 7, 10) },
    ],
  });
})();
