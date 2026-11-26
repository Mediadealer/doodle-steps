// pictures/tkpie.js — hand-drawn: a pumpkin pie on the table with cocoa and a candle (Thanksgiving set)
(() => {
  const { E, C, H, SP } = DS;
  const flag = (x, y) => `M${x - 15} ${y}L${x + 15} ${y}L${x} ${y + 38}Z`;
  const RIM = [[470, 380], [447, 407.5], [385, 427.6], [300, 435], [215, 427.6], [153, 407.5], [130, 380], [153, 352.5], [215, 332.4], [300, 325], [385, 332.4], [447, 352.5]];
  LESSONS.push({
    id: 'tkpie',
    name: 'Pumpkin pie',
    bg: '#fbe8c8',
    steps: [
      // the window
      { name: 'Window', color: '#bfe3f5', d: 'M60 40L260 40L260 220L60 220Z' },
      { name: 'Hill outside', color: '#9cc76a', d: 'M60 180Q160 150 260 180L260 220L60 220Z' },
      { name: 'Autumn tree', color: '#ff8a1f', d: C(205, 125, 38) },
      { name: 'Window frame', color: '#a8744a', line: 8, d: 'M60 40L260 40L260 220L60 220ZM160 40L160 220M60 130L260 130' },
      // bunting
      { name: 'Bunting string', color: '#8a6a4a', line: 4, d: 'M300 40Q450 90 600 40' },
      { name: 'Orange flags', color: '#ff8a1f', d: flag(340, 52) + flag(475, 64) },
      { name: 'Red flags', color: '#c9413b', d: flag(385, 59) + flag(520, 59) },
      { name: 'Golden flags', color: '#e0932a', d: flag(430, 63) + flag(565, 50) },
      // the table
      { name: 'Table', color: '#c98a52', d: 'M0 400L600 400L600 600L0 600Z' },
      { name: 'Table edge', color: '#a8693a', line: 8, d: 'M0 400L600 400' },
      { name: 'Wood grain', color: '#a8693a', line: 4, d: 'M150 560L290 560M330 585L470 585M20 572L110 572' },
      { name: 'Candle', color: '#fff1c2', d: 'M480 290L520 290L520 400L480 400Z' },
      { name: 'Candle holder', color: '#ffc93c', d: 'M465 392L535 392L528 410L472 410Z' },
      { name: 'Flame', color: '#ff8a1f', d: 'M500 290Q480 262 500 235Q520 262 500 290Z' },
      { name: 'Flame glow', color: '#ffd84a', d: E(500, 272, 7, 12) },
      // the pie
      { name: 'Plate', color: '#ffffff', d: E(300, 470, 200, 60) },
      { name: 'Plate rim', color: '#d5e0f0', line: 5, d: E(300, 470, 170, 48) },
      { name: 'Pie crust', color: '#d9a066', d: 'M130 380L160 455Q300 500 440 455L470 380Z' },
      { name: 'Pumpkin filling', color: '#d9742a', d: E(300, 380, 170, 55) },
      { name: 'Crust edge', color: '#ecc48a', d: RIM.map(([x, y]) => C(x, y, 16)).join('') },
      { name: 'Slice lines', color: '#b85a1a', line: 4, d: 'M300 380L425 348M300 380L432 408M300 380L175 350' },
      { name: 'Whipped cream', color: '#ffffff', d: E(300, 375, 42, 22) },
      { name: 'Cream tip', color: '#ffffff', d: 'M286 360L300 328L314 360Z' },
      { name: 'Cream swirls', color: '#d9c8a8', line: 4, d: 'M270 378Q300 392 330 378M284 362Q300 372 316 362' },
      { name: 'Cinnamon', color: '#8a4a1f', d: C(220, 385, 5) + C(380, 372, 5) + C(240, 358, 5) + C(360, 404, 5) + C(290, 414, 5) },
      { name: 'Steam', color: '#e6c9a0', line: 5, d: 'M230 300Q215 280 230 260Q245 240 230 220M370 300Q385 280 370 260Q355 240 370 220' },
      // cocoa
      { name: 'Mug handle', color: '#c42f49', line: 8, d: 'M128 455Q165 460 160 490Q155 515 124 512' },
      { name: 'Mug', color: '#e4405a', d: 'M40 430L130 430L122 540L48 540Z' },
      { name: 'Cocoa', color: '#6b4226', d: E(85, 430, 45, 12) },
      { name: 'Marshmallows', color: '#ffffff', d: C(72, 428, 8) + C(96, 431, 8) },
      { name: 'Mug heart', color: '#ffffff', d: H(85, 490, 14) },
      // fork and napkin
      { name: 'Napkin', color: '#f2b632', d: 'M508 432L590 432L590 590L508 590Z' },
      { name: 'Fork', color: '#b9bac8', line: 8, d: 'M549 490L549 575' },
      { name: 'Fork prongs', color: '#b9bac8', line: 5, d: 'M534 448L534 490M549 448L549 490M564 448L564 490M534 490L564 490' },
      // little pumpkin on the sill
      { name: 'Little pumpkin', color: '#ff8a1f', d: E(110, 195, 36, 27) },
      { name: 'Pumpkin lines', color: '#d96a10', line: 4, d: 'M110 170Q96 195 110 221M110 170Q124 195 110 221' },
      { name: 'Pumpkin stem', color: '#5a8a3a', d: 'M105 170L115 170L117 154L107 157Z' },
      { name: 'Orange leaves', color: '#ff8a1f', d: E(200, 540, 16, 9, 20) + E(420, 548, 16, 9, -25) },
      { name: 'Red leaves', color: '#c9413b', d: E(250, 580, 14, 8, -15) + E(380, 560, 14, 8, 30) },
      { name: 'Sparkles', color: '#ffc93c', d: SP(330, 160, 12) + SP(420, 210, 10) + SP(565, 190, 10) },
    ],
  });
})();
