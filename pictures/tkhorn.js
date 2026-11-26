// pictures/tkhorn.js — hand-drawn: a horn of plenty spilling fruit (Thanksgiving set)
(() => {
  const { E, C, H, SP } = DS;
  const LEAF = '#5fae4a', STEM = '#5a8a3a';
  LESSONS.push({
    id: 'tkhorn',
    name: 'Horn of plenty',
    bg: '#f7ecd0',
    steps: [
      { name: 'Backdrop', color: '#ffe2a8', d: C(300, 250, 220) },
      { name: 'Tablecloth', color: '#c9413b', d: 'M0 450L600 450L600 600L0 600Z' },
      { name: 'Cloth stripes', color: '#e8685f', line: 8, d: 'M0 500L600 500M0 560L600 560' },
      // the horn
      { name: 'Horn', color: '#b98558', d: 'M360 290C280 240 180 200 110 130C80 100 60 120 80 150C130 240 200 380 300 470Z' },
      { name: 'Horn bands', color: '#96673e', line: 6, d: 'M300 262Q250 330 250 430M240 225Q195 280 195 350M180 185Q148 225 150 270M130 150Q110 170 112 200' },
      { name: 'Horn curl', color: '#96673e', line: 6, d: 'M95 135Q70 110 60 135Q58 155 80 152' },
      { name: 'Inside the horn', color: '#6b4226', d: E(330, 380, 95, 36, 108) },
      { name: 'Horn rim', color: '#d9a877', line: 8, d: E(330, 380, 95, 36, 108) },
      { name: 'Wheat stalks', color: '#e0b040', line: 5, d: 'M330 300L420 180M345 310L470 220M320 295L370 150' },
      { name: 'Wheat tops', color: '#f2c230', d: E(428, 168, 22, 9, -55) + E(482, 212, 22, 9, -35) + E(374, 136, 22, 9, -70) },
      // pumpkin
      { name: 'Pumpkin', color: '#ff8a1f', d: E(400, 440, 75, 60) },
      { name: 'Pumpkin lines', color: '#d96a10', line: 4, d: 'M400 382Q370 440 400 498M400 382Q430 440 400 498M360 392Q335 440 360 488M440 392Q465 440 440 488' },
      { name: 'Pumpkin stem', color: STEM, d: 'M392 386L408 386L412 360L396 364Z' },
      { name: 'Berries', color: '#c42f49', d: C(340, 335, 12) + C(362, 350, 12) + C(332, 358, 12) },
      { name: 'Berry shine', color: '#ffffff', d: C(337, 331, 4) + C(359, 346, 4) + C(329, 354, 4) },
      // grapes
      { name: 'Grapes', color: '#7a4fb8', d: C(490, 400, 18) + C(522, 400, 18) + C(538, 428, 18) + C(506, 428, 18) + C(474, 428, 18) + C(490, 456, 18) + C(522, 456, 18) + C(506, 484, 18) },
      { name: 'Grape shine', color: '#b99ae6', d: C(484, 394, 5) + C(516, 394, 5) + C(500, 422, 5) + C(532, 422, 5) + C(484, 450, 5) + C(516, 450, 5) + C(500, 478, 5) },
      { name: 'Grape stem', color: STEM, line: 5, d: 'M506 384L512 360' },
      { name: 'Grape leaf', color: LEAF, d: E(535, 362, 24, 14, -20) },
      // corn
      { name: 'Corn husk', color: '#9ccf6a', d: 'M120 500Q60 470 50 510Q70 540 120 535ZM118 510Q70 540 80 572Q112 562 126 532Z' },
      { name: 'Corn', color: '#ffd84a', d: E(180, 520, 72, 26, 15) },
      { name: 'Corn kernels', color: '#f2b632', line: 4, d: 'M125 498L232 528M120 514L226 543M152 494L142 530M182 502L172 540M212 510L202 546' },
      // apple
      { name: 'Apple', color: '#e4405a', d: C(300, 500, 46) },
      { name: 'Apple shine', color: '#ffffff', line: 5, d: 'M275 480Q280 468 292 466' },
      { name: 'Apple stem', color: '#6b4226', line: 5, d: 'M300 458L306 440' },
      { name: 'Apple leaf', color: LEAF, d: E(322, 440, 16, 8, -25) },
      // orange and pear
      { name: 'Orange', color: '#ffa23a', d: C(430, 540, 34) },
      { name: 'Orange top', color: '#d9742a', d: C(430, 514, 4) },
      { name: 'Pear', color: '#c9d94a', d: E(545, 535, 32, 36) + C(545, 495, 20) },
      { name: 'Pear stem', color: '#6b4226', line: 5, d: 'M545 477L550 460' },
      // around the picture
      { name: 'Acorns', color: '#a8744a', d: E(60, 560, 11, 13) + E(250, 575, 11, 13) },
      { name: 'Acorn caps', color: '#6b4226', d: 'M48 553Q60 538 72 553ZM238 568Q250 553 262 568Z' },
      { name: 'Orange leaves', color: '#ff8a1f', d: E(120, 400, 22, 12, 30) + E(70, 330, 18, 10, -20) },
      { name: 'Red leaves', color: '#c9413b', d: E(500, 290, 20, 11, -30) + E(150, 440, 18, 10, 10) },
      { name: 'Golden leaves', color: '#e0932a', d: E(250, 150, 18, 10, 20) + E(160, 90, 16, 9, -30) },
      { name: 'Sparkles', color: '#ffc93c', d: SP(480, 110, 13) + SP(90, 240, 10) + SP(560, 320, 10) },
      { name: 'Hearts', color: '#ff8fb3', d: H(420, 80, 11) + H(60, 120, 9) },
      { name: 'Confetti dots', color: '#7a4fb8', d: C(230, 70, 6) + C(540, 150, 6) + C(40, 200, 6) + C(330, 55, 6) },
      { name: 'Cloth dots', color: '#ffffff', d: C(30, 530, 6) + C(350, 580, 6) + C(590, 588, 6) + C(480, 590, 6) },
      { name: 'Wheat lines', color: '#c9902a', line: 4, d: 'M416 186L440 152M468 222L496 202M368 156L380 118' },
    ],
  });
})();
