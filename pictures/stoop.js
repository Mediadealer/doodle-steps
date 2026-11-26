// pictures/stoop.js — hand-drawn: a cool pup hanging out on the front steps with two doll friends (original characters)
(() => {
  const { E, C, SP, ST, INK } = DS;
  const PURPLE = '#7b3fc4', PURPLE_DARK = '#6230a3', GOLD = '#ffc93c', SKIN = '#fbd9c2', SKIN2 = '#b9764a';
  const BRICKS = 'M0 55L150 55M0 110L150 110M0 165L150 165M0 220L150 220M0 275L150 275' +
    'M450 55L600 55M450 110L600 110M450 165L600 165M450 220L600 220M450 275L600 275' +
    'M75 0L75 55M40 55L40 110M110 55L110 110M75 110L75 165M40 165L40 220M110 165L110 220M75 220L75 275M40 275L40 330M110 275L110 330' +
    'M525 0L525 55M490 55L490 110M560 55L560 110M525 110L525 165M490 165L490 220M560 165L560 220M525 220L525 275M490 275L490 330M560 275L560 330';
  LESSONS.push({
    id: 'stoop',
    name: 'Stoop party',
    bg: '#a8553f',
    base: [{ color: '#8a4232', line: 4, d: BRICKS }],
    steps: [
      // the doorway
      { name: 'Door frame', color: '#3a2466', d: 'M150 0L450 0L450 330L150 330Z' },
      { name: 'Door', color: '#5b3a9e', d: 'M170 0L430 0L430 330L170 330Z' },
      { name: 'Door window', color: '#ffd98a', d: 'M200 20L400 20L400 100L200 100Z' },
      { name: 'Window bars', color: '#3a2466', line: 5, d: 'M300 20L300 100M200 60L400 60' },
      { name: 'Doorknob', color: GOLD, d: C(196, 250, 11) },
      { name: 'Lantern light', color: '#ffd84a', d: 'M495 50L545 50L538 115L502 115Z' },
      { name: 'Lantern cap', color: INK, d: 'M486 50L554 50L520 20ZM500 115L540 115L540 124L500 124Z' },
      // the steps
      { name: 'Top step', color: '#b9bac8', d: 'M0 330L600 330L600 420L0 420Z' },
      { name: 'Middle step', color: '#a3a4b5', d: 'M0 420L600 420L600 510L0 510Z' },
      { name: 'Bottom step', color: '#8d8ea1', d: 'M0 510L600 510L600 600L0 600Z' },
      { name: 'Step edges', color: '#d6d7e2', line: 6, d: 'M0 330L600 330M0 420L600 420M0 510L600 510' },
      { name: 'Railing', color: INK, line: 8, d: 'M24 160L24 420M56 195L56 420M0 135L70 210' },
      // plant, music and pizza
      { name: 'Plant pot', color: '#c9703f', d: 'M502 250L578 250L566 330L514 330Z' },
      { name: 'Leaves', color: '#3fa866', d: E(540, 195, 50, 13, 90) + E(512, 208, 44, 12, 60) + E(568, 208, 44, 12, 120) + E(498, 232, 38, 11, 25) + E(572, 232, 30, 11, 155) },
      { name: 'Fairy lights', color: '#ffe27a', d: C(520, 200, 5) + C(556, 188, 5) + C(540, 160, 5) + C(500, 236, 5) + C(574, 228, 5) },
      { name: 'Music notes', color: '#ffd84a', d: E(96, 236, 9, 7, -20) + E(124, 228, 9, 7, -20) },
      { name: 'Note stems', color: '#ffd84a', line: 4, d: 'M104 234L104 196L132 188L132 226' },
      { name: 'Boombox', color: '#8a8fa3', d: 'M12 440L112 440L112 512L12 512Z' },
      { name: 'Boombox handle', color: INK, line: 5, d: 'M28 440L28 424L96 424L96 440' },
      { name: 'Speakers', color: '#b98cf0', d: C(38, 482, 18) + C(86, 482, 18) },
      { name: 'Pizza box', color: '#f3ead8', d: 'M510 430L598 430L598 500L510 500Z' },
      { name: 'Pizza', color: GOLD, d: E(554, 465, 36, 24) },
      { name: 'Pepperoni', color: '#e4405a', d: C(540, 460, 5) + C(562, 472, 5) + C(570, 456, 5) },
      // the cool pup
      { name: 'Fuzzy sleeves', color: PURPLE, d: 'M252 282Q160 285 78 345L96 392Q180 345 262 338ZM348 282Q440 285 530 345L512 392Q420 345 338 338Z' },
      { name: 'Fluffy cuffs', color: '#ffffff', d: C(84, 374, 20) + C(526, 374, 20) },
      { name: 'Paws', color: '#d9a066', d: E(74, 396, 15, 12) + E(536, 396, 15, 12) },
      { name: 'Yellow jersey', color: GOLD, d: 'M240 285Q300 268 360 285L372 420L228 420Z' },
      { name: 'Jersey star', color: PURPLE, d: ST(330, 378, 16, 7) },
      { name: 'Gold chain', color: '#e0932a', line: 5, d: 'M268 290Q300 372 332 290' },
      { name: 'Star pendant', color: '#e0932a', d: ST(300, 340, 14, 6) },
      { name: 'Far leg', color: PURPLE_DARK, d: 'M300 405Q360 398 390 430Q425 475 452 520L392 552Q365 500 330 475Q298 455 300 405Z' },
      { name: 'Near leg', color: PURPLE, d: 'M235 405Q230 480 262 540L335 528Q318 470 325 405Z' },
      { name: 'Pant cuffs', color: '#ffffff', d: E(298, 534, 40, 13, -9) + E(422, 536, 36, 13, -28) },
      { name: 'Sneakers', color: '#ffffff', d: 'M335 540L340 585L225 590Q222 565 262 552ZM398 556L456 524Q500 540 540 572L540 590L408 594Z' },
      { name: 'Sneaker toes', color: PURPLE, d: 'M225 590Q222 565 250 556L262 589ZM505 552Q525 560 540 572L540 590L500 591Z' },
      { name: 'Laces', color: GOLD, line: 4, d: 'M278 552L288 566M295 548L305 562M312 545L322 559M428 548L440 564M446 540L458 556M464 536L476 552' },
      { name: 'Pup head', color: '#ecd0a8', d: C(300, 205, 58) },
      { name: 'Muzzle', color: '#fbf0dc', d: E(300, 238, 34, 24) },
      { name: 'Floppy ears', color: '#8a5a36', d: E(236, 240, 18, 60) + E(364, 240, 18, 60) },
      { name: 'Nose', color: INK, d: E(300, 228, 11, 8) },
      { name: 'Mouth', color: '#8a5a4a', line: 4, d: 'M300 236L300 246M300 246Q290 255 281 248M300 246Q310 255 319 248' },
      { name: 'Lollipop stick', color: '#ffffff', line: 5, d: 'M316 250L350 266' },
      { name: 'Lollipop', color: '#ff5a8a', d: C(358, 270, 11) },
      { name: 'Gold shades', color: '#f2a900', d: 'M246 184L296 184L292 212Q270 220 250 210ZM354 184L304 184L308 212Q330 220 350 210ZM294 188L306 188L306 194L294 194Z' },
      { name: 'Shades shine', color: '#ffffff', line: 4, d: 'M256 192L268 204M316 192L328 204' },
      { name: 'Elf hat', color: PURPLE, d: 'M244 168C250 90 300 40 370 48C400 52 418 75 425 105C400 85 375 95 365 120C358 140 358 155 356 168Z' },
      { name: 'Hat brim', color: '#ffffff', d: 'M236 150Q300 122 364 150L366 180Q300 152 234 180Z' },
      { name: 'Hat pom-pom', color: '#ffffff', d: C(428, 108, 15) },
      { name: 'Pineapple cup', color: '#f2b632', d: E(258, 394, 26, 32) },
      { name: 'Pineapple pattern', color: '#c98a1a', line: 4, d: 'M242 376L276 412M242 412L276 376M234 394L282 394' },
      { name: 'Paper umbrella', color: '#ff5a8a', d: 'M232 364Q260 318 290 364Z' },
      // the blonde doll
      { name: 'Hair buns', color: '#f2c230', d: C(112, 296, 20) + C(188, 296, 20) },
      { name: 'Doll face', color: SKIN, d: C(150, 345, 52) },
      { name: 'Black dress', color: INK, d: 'M122 393L178 393L190 448L110 448Z' },
      { name: 'Stockings', color: '#ffffff', d: 'M122 448L142 448L140 500L120 500ZM158 448L178 448L180 500L160 500Z' },
      { name: 'Stocking stripes', color: INK, line: 4, d: 'M121 462L141 462M121 476L141 476M120 490L140 490M159 462L179 462M159 476L180 476M160 490L180 490' },
      { name: 'Doll shoes', color: INK, d: E(128, 506, 17, 10) + E(172, 506, 17, 10) },
      { name: 'Red cup', color: '#e4405a', d: 'M186 402L212 402L208 434L190 434Z' },
      { name: 'Blue eyes', color: '#3f86d9', d: C(132, 353, 11) + C(168, 353, 11) },
      { name: 'Eye sparkles', color: '#ffffff', d: C(136, 349, 4) + C(172, 349, 4) },
      { name: 'Little mouth', color: '#e4405a', d: E(150, 378, 6, 5) },
      { name: 'Blonde bangs', color: '#ffd84a', d: 'M98 345C95 275 205 275 202 345Q185 308 150 314Q115 308 98 345Z' },
      // the pizza doll
      { name: 'Second doll face', color: SKIN2, d: C(470, 345, 52) },
      { name: 'Pink dress', color: '#d94f9e', d: 'M442 393L498 393L510 448L430 448Z' },
      { name: 'Doll legs', color: SKIN2, d: 'M444 448L462 448L462 492L444 492ZM478 448L496 448L496 492L478 492Z' },
      { name: 'Boots', color: INK, d: E(451, 498, 16, 10) + E(489, 498, 16, 10) },
      { name: 'Dark eyes', color: '#3a2a4a', d: C(452, 353, 11) + C(488, 353, 11) },
      { name: 'Dark eye sparkles', color: '#ffffff', d: C(456, 349, 4) + C(492, 349, 4) },
      { name: 'Smile', color: '#8a2f3f', line: 4, d: 'M466 376Q474 383 482 376' },
      { name: 'Dark hair', color: '#3a2a4a', d: 'M418 345C415 275 525 275 522 345Q510 305 470 312Q440 300 418 345Z' },
      { name: 'Hoop earrings', color: GOLD, line: 4, d: C(420, 376, 9) + C(520, 376, 9) },
      { name: 'Pizza slice', color: GOLD, d: 'M456 388L420 398L440 424Z' },
      // the sign
      { name: 'Cardboard sign', color: '#c99a6b', d: 'M18 532L205 520L214 590L28 598Z' },
      { name: 'Sign letters', color: INK, line: 5, d: 'M70 545Q48 545 48 560Q48 575 70 575M82 543L82 575M82 559L104 559M104 543L104 575M118 543L118 575M132 543L132 575L152 575M164 543L164 575L184 575' },
      { name: 'Sparkles', color: '#ffd84a', d: SP(100, 80, 13) + SP(125, 150, 9) + SP(468, 170, 10) },
    ],
  });
})();
