// pictures/campsite.js
(() => {
  const { E, C, H, SP, ST, INK } = DS;
  // zigzag row of distant pines along the horizon
  let tl = 'M0 372L0 352';
  for (let i = 0; i < 25; i++) {
    const x = i * 24;
    tl += `L${x + 12} ${330 + (i % 3) * 7}L${x + 24} 352`;
  }
  tl += 'L600 372Z';
  LESSONS.push({
    id: 'campsite',
    name: 'Campsite',
    bg: '#0b1230',
    steps: [
      { name: 'Night sky', color: '#14204a', d: 'M0 0L600 0L600 380L0 380Z' },
      { name: 'Horizon glow', color: '#2e4585', d: 'M0 215Q300 150 600 215L600 380L0 380Z' },
      { name: 'Moon glow', color: '#2b3f7d', d: C(470, 110, 62) },
      { name: 'Moon', color: '#fff1b8', d: C(470, 110, 40) },
      { name: 'Bright stars', color: '#fff7c2', d: SP(80, 70, 10) + SP(180, 120, 8) + SP(260, 50, 12) + SP(350, 150, 8) + SP(130, 190, 7) + SP(565, 200, 9) + SP(390, 60, 9) },
      { name: 'Tiny stars', color: '#cfe0ff', d: C(40, 140, 4) + C(110, 100, 4) + C(220, 170, 4) + C(305, 100, 4) + C(335, 30, 4) + C(410, 190, 4) + C(545, 55, 4) + C(580, 140, 4) + C(45, 35, 4) + C(175, 40, 4) },
      { name: 'Far mountains', color: '#1b2759', d: 'M0 380L0 300L90 230L150 280L240 190L340 290L400 250L500 300L560 260L600 290L600 380Z' },
      { name: 'Snowy peaks', color: '#dfe8ff', d: 'M240 190L212 222L228 216L240 230L254 214L268 222Z' + 'M90 230L70 250L82 246L92 256L104 244L112 252Z' + 'M400 250L384 268L394 264L402 274L412 262L420 270Z' },
      { name: 'Pine treeline', color: '#0f2a3a', d: tl },
      { name: 'Lake', color: '#1f4f86', d: 'M0 372L600 372L600 470L0 470Z' },
      { name: 'Moon shimmer', color: '#f1e6a8', line: 8, d: 'M455 392L485 392M445 410L495 410M452 428L488 428' },
      { name: 'Shore', color: '#264d33', d: 'M0 470Q150 445 300 458Q450 472 600 445L600 600L0 600Z' },
      { name: 'Pine trunks', color: '#5a3a26', d: 'M62 500L78 500L78 575L62 575Z' + 'M533 520L547 520L547 575L533 575Z' },
      { name: 'Big pine bottom', color: '#174a38', d: 'M70 390L8 512L132 512Z' },
      { name: 'Big pine middle', color: '#1d5a45', d: 'M70 335L20 435L120 435Z' },
      { name: 'Big pine top', color: '#247052', d: 'M70 290L34 370L106 370Z' },
      { name: 'Small pine', color: '#1d5a45', d: 'M540 400L490 520L590 520Z' + 'M540 350L500 440L580 440Z' },
      { name: 'Firelight', color: '#5d7a3c', d: E(410, 530, 95, 28) },
      { name: 'Tent shadow', color: '#1a3a27', d: E(215, 548, 100, 14) },
      { name: 'Tent', color: '#e8734a', d: 'M120 545L215 395L310 545Z' },
      { name: 'Tent shade', color: '#c85a35', d: 'M215 395L310 545L244 545Z' },
      { name: 'Tent door', color: '#3b2038', d: 'M215 440L186 545L244 545Z' },
      { name: 'Flag pole', color: '#cfd6e8', line: 5, d: 'M215 395L215 362' },
      { name: 'Flag', color: '#ffd23f', d: 'M215 362L244 371L215 380Z' },
      { name: 'Fire stones', color: '#8d93a6', d: C(350, 538, 9) + C(372, 556, 9) + C(448, 556, 9) + C(470, 538, 9) },
      { name: 'Flames', color: '#ff7a2f', d: 'M410 440Q452 485 446 535L374 535Q368 485 410 440Z' },
      { name: 'Inner flames', color: '#ffc933', d: 'M410 482Q432 505 430 535L390 535Q388 505 410 482Z' },
      { name: 'Logs', color: '#6b4226', line: 16, d: 'M365 552L455 526M365 526L455 552' },
      { name: 'Sparks', color: '#ffb347', d: C(385, 420, 4) + C(438, 430, 4) + C(420, 400, 4) },
      { name: 'Log seat', color: '#7a4a2a', d: E(300, 585, 40, 13) },
      { name: 'Grass tufts', color: '#3f7a4a', line: 5, d: 'M30 590L26 574M38 590L40 572M560 592L556 576M570 592L574 574M130 590L126 576' },
      { name: 'Fireflies', color: '#d8ff6a', d: C(150, 420, 4) + C(330, 415, 4) + C(510, 420, 4) + C(335, 480, 4) },
    ],
  });
})();
