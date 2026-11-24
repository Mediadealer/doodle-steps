// pictures/lighthouse.js
(() => {
  const { E, C, SP, INK } = DS;
  LESSONS.push({
    id: 'lighthouse',
    name: 'Lighthouse',
    bg: '#d6ecff',
    steps: [
      // Layers back to front: sky, moon, far land, sea, the beam, the headland, the tower, the lantern, small life.
      { name: 'Dusk sky', color: '#2e3a6e', d: 'M0 0L600 0L600 330Q300 300 0 330Z' },
      { name: 'Purple sky', color: '#7a5aa6', d: 'M0 330Q300 300 600 330L600 400Q300 370 0 400Z' },
      { name: 'Horizon glow', color: '#f5a06a', d: 'M0 400Q300 370 600 400L600 440Q300 410 0 440Z' },
      { name: 'Moon', color: '#fff3c4', d: C(500, 110, 34) },
      { name: 'Moon shadow', color: '#2e3a6e', d: C(512, 100, 30) },
      { name: 'Moon craters', color: '#e8dcae', d: C(476, 104, 4) + C(478, 126, 5) },
      { name: 'Stars', color: '#ffffff', d: C(70, 70, 4.5) + C(200, 40, 5) + C(330, 90, 4) + C(120, 160, 4) + C(260, 150, 4.5) },
      { name: 'Far hills', color: '#4b4f8a', d: 'M0 420Q100 380 200 415Q260 425 300 430L300 445L0 445Z' },
      { name: 'Sea', color: '#2f6f9a', d: 'M0 440L600 440L600 600L0 600Z' },
      { name: 'Lantern glow', color: '#ffd66b', d: C(450, 245, 44) },
      { name: 'Light beam', color: '#fff3b0', d: 'M436 236L30 150L30 300L436 262Z' },
      { name: 'Waves', color: '#8fd0f0', line: 5, d: 'M20 500Q40 490 60 500Q80 510 100 500M120 540Q140 530 160 540M220 570Q240 560 260 570M30 580Q50 570 70 580' },
      { name: 'Rocky headland', color: '#6d5d62', d: 'M300 600L300 472Q340 445 400 448Q470 432 520 456Q560 470 600 462L600 600Z' },
      { name: 'Rock shadow', color: '#4f4048', d: 'M330 540Q380 520 440 540Q500 524 560 548L600 548L600 600L330 600Z' },
      { name: 'Rock cracks', color: INK, line: 4, d: 'M352 572L372 592M470 560L486 580M530 580L548 600' },
      { name: 'Rock highlights', color: '#8a7b80', d: E(380, 470, 14, 4) + E(500, 478, 20, 5) },
      { name: 'Foam', color: '#ffffff', d: E(318, 478, 20, 7) + E(352, 470, 14, 5) },
      { name: 'Tower', color: '#f4f1fa', d: 'M424 460L440 260L460 260L476 460Z' },
      { name: 'Tower shade', color: '#c9c2dc', d: 'M455 262L460 260L476 460L458 460Z' },
      { name: 'Red bands', color: '#e4572e', d: 'M435 318L465 318L467 348L433 348ZM429 390L471 390L472 420L428 420Z' },
      { name: 'Window', color: '#ffd66b', d: 'M446 294L454 294L454 312L446 312Z' },
      { name: 'Door', color: '#4a3b5c', d: 'M443 432Q450 422 457 432L457 460L443 460Z' },
      { name: 'Gallery', color: '#4a3b5c', d: 'M418 258L482 258L482 266L418 266Z' },
      { name: 'Lantern glass', color: '#fff3b0', d: 'M436 228L464 228L464 262L436 262Z' },
      { name: 'Lantern bars', color: INK, line: 4, d: 'M436 228L436 262M450 228L450 262M464 228L464 262M436 245L464 245' },
      { name: 'Lantern roof', color: '#8a3b3b', d: 'M430 230L470 230L450 206Z' },
      { name: 'Roof tip', color: '#ffd84a', d: C(450, 202, 5) },
      { name: 'Lantern rays', color: '#fff8d6', line: 4, d: 'M420 245L392 245M430 214L414 196M470 214L486 196M478 245L508 245' },
      { name: 'Seagulls', color: '#ffe9d6', line: 5, d: 'M150 180Q160 170 170 180Q180 170 190 180M240 220Q248 212 256 220Q264 212 272 220' },
      { name: 'Sea sparkles', color: '#ffe9a8', d: C(150, 470, 4) + C(230, 520, 4) + C(90, 545, 4) },
      { name: 'Twinkle', color: '#ffffff', d: SP(520, 50, 9) },
    ],
  });
})();
