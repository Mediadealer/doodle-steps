// pictures/tkfarm.js — hand-drawn: a harvest farm at sunset with a scarecrow (Thanksgiving set)
(() => {
  const { E, C, SP, INK } = DS;
  const ORANGE = '#ff8a1f', RIB = '#d96a10', STEM = '#5a8a3a', WOOD = '#8a5a36';
  LESSONS.push({
    id: 'tkfarm',
    name: 'Harvest farm',
    bg: '#ffd9a0',
    steps: [
      // sky and land
      { name: 'Setting sun', color: '#fff1c2', d: C(430, 200, 70) },
      { name: 'Clouds', color: '#ffeccc', d: E(140, 90, 70, 20) + E(190, 75, 40, 16) + E(520, 70, 50, 16) },
      { name: 'Far hills', color: '#d98a4a', d: 'M0 300Q150 220 300 290Q450 230 600 280L600 400L0 400Z' },
      { name: 'Golden field', color: '#c9a23a', d: 'M0 360Q200 300 400 350Q500 370 600 340L600 600L0 600Z' },
      { name: 'Field rows', color: '#a8842a', line: 4, d: 'M320 345L300 440M390 352L400 445M460 362L500 455M560 356L590 440' },
      { name: 'Front meadow', color: '#8fae4a', d: 'M0 470Q300 420 600 480L600 600L0 600Z' },
      // barn and silo
      { name: 'Silo', color: '#b9bac8', d: 'M245 260L290 260L290 400L245 400ZM245 262Q267 222 290 262Z' },
      { name: 'Silo bands', color: '#8d8ea1', line: 4, d: 'M245 300L290 300M245 340L290 340M245 380L290 380' },
      { name: 'Barn', color: '#c9413b', d: 'M70 250L70 400L230 400L230 250L150 190Z' },
      { name: 'Barn roof', color: '#7a2a26', d: 'M55 255L150 180L245 255L230 268L150 205L70 268Z' },
      { name: 'Barn door', color: '#fff6e6', d: 'M120 320L180 320L180 400L120 400Z' },
      { name: 'Door cross', color: '#c9413b', line: 5, d: 'M120 320L180 400M180 320L120 400' },
      { name: 'Loft window', color: '#3a2a2a', d: 'M135 240L165 240L165 275L135 275Z' },
      { name: 'Weather vane', color: INK, line: 4, d: 'M150 182L150 150M135 158L165 158' },
      // the tree
      { name: 'Tree trunk', color: '#6b4226', d: 'M490 330L510 330L514 420L486 420Z' },
      { name: 'Orange treetop', color: ORANGE, d: C(500, 290, 55) },
      { name: 'Red tree leaves', color: '#e4553a', d: C(475, 300, 26) + C(525, 275, 24) },
      { name: 'Yellow tree leaves', color: '#ffc93c', d: C(505, 255, 20) + C(530, 310, 16) },
      // fence
      { name: 'Fence posts', color: WOOD, line: 8, d: 'M50 438L50 498M150 430L150 490M250 426L250 486M430 432L430 492M530 444L530 504' },
      { name: 'Fence rails', color: WOOD, line: 5, d: 'M0 462Q300 430 600 468M0 482Q300 450 600 488' },
      // the scarecrow
      { name: 'Scarecrow pole', color: WOOD, line: 8, d: 'M340 380L340 520M300 420L380 420' },
      { name: 'Scarecrow shirt', color: '#3f86d9', d: 'M315 410L365 410L370 470L310 470Z' },
      { name: 'Scarecrow head', color: '#f3d9a8', d: C(340, 385, 22) },
      { name: 'Scarecrow hat', color: WOOD, d: 'M312 368L368 368L368 377L312 377ZM324 368L330 342L350 342L356 368Z' },
      { name: 'Scarecrow eyes', color: INK, d: C(333, 386, 4) + C(347, 386, 4) },
      { name: 'Scarecrow smile', color: '#c9413b', line: 4, d: 'M332 394Q340 401 348 394' },
      { name: 'Straw hands', color: '#e8c45a', line: 5, d: 'M300 420L288 412M300 420L288 428M380 420L392 412M380 420L392 428' },
      // pumpkins and hay
      { name: 'Big pumpkin', color: ORANGE, d: E(130, 540, 60, 44) },
      { name: 'Big pumpkin lines', color: RIB, line: 4, d: 'M130 498Q108 540 130 582M130 498Q152 540 130 582' },
      { name: 'Big pumpkin stem', color: STEM, d: 'M124 500L136 500L139 478L127 482Z' },
      { name: 'Small pumpkin', color: '#ffa23a', d: E(240, 560, 40, 30) },
      { name: 'Small pumpkin lines', color: RIB, line: 4, d: 'M240 532Q226 560 240 588M240 532Q254 560 240 588' },
      { name: 'Small pumpkin stem', color: STEM, d: 'M235 533L245 533L247 516L237 519Z' },
      { name: 'Hay bale', color: '#e8c45a', d: 'M400 510L520 510L520 585L400 585Z' },
      { name: 'Hay straps', color: '#a8842a', line: 4, d: 'M435 510L435 585M485 510L485 585' },
      // finishing touches
      { name: 'Little pumpkins', color: ORANGE, d: C(40, 415, 14) + C(275, 420, 12) },
      { name: 'Birds', color: INK, line: 4, d: 'M300 120Q310 110 320 120Q330 110 340 120M360 90Q368 82 376 90Q384 82 392 90' },
      { name: 'Grass tufts', color: '#5f8a2a', line: 5, d: 'M310 570L316 550L322 570M560 560L566 540L572 560M30 590L36 572L42 590' },
      { name: 'Falling leaves', color: '#c9413b', d: E(570, 360, 12, 7, 30) + E(440, 330, 11, 6, -20) + E(560, 420, 11, 6, 10) },
      { name: 'Sparkles', color: '#ffffff', d: SP(60, 160, 10) + SP(330, 60, 10) + SP(570, 170, 9) },
    ],
  });
})();
