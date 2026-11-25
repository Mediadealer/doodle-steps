// pictures/stocking.js — hand-drawn: a puppy asleep in a Christmas stocking
(() => {
  const { E, C, H, SP, INK } = DS;
  const RED = '#e4405a', GREEN = '#2fa878', GOLD = '#ffc93c', TAN = '#e9c9a0', BROWN = '#b98558';
  const GX = [40, 115, 190, 265, 340, 415, 490, 565];
  LESSONS.push({
    id: 'stocking',
    name: 'Stocking pup',
    bg: '#d9f0e6',
    steps: [
      // the mantel
      { name: 'Mantel shelf', color: BROWN, d: 'M0 0L600 0L600 40L0 40Z' },
      { name: 'Shelf edge', color: '#96673e', line: 8, d: 'M0 40L600 40' },
      { name: 'Garland', color: '#2f8f55', d: GX.map((x, i) => C(x, i % 2 ? 60 : 52, 24)).join('') },
      { name: 'Red lights', color: '#ff5a5f', d: C(40, 58, 6) + C(265, 66, 6) + C(490, 58, 6) },
      { name: 'Yellow lights', color: '#ffd84a', d: C(115, 66, 6) + C(340, 58, 6) + C(565, 66, 6) },
      { name: 'Blue lights', color: '#58a6f3', d: C(190, 58, 6) + C(415, 66, 6) },
      { name: 'Hanging strings', color: '#8a6a4a', line: 4, d: 'M70 76L70 250M545 76L545 262M455 84L455 128' },
      // ornaments
      { name: 'Purple ornament', color: '#7a5cff', d: C(70, 278, 26) },
      { name: 'Orange ornament', color: '#ff8a1f', d: C(545, 288, 24) },
      { name: 'Ornament caps', color: GOLD, d: 'M62 246L78 246L78 256L62 256ZM537 258L553 258L553 268L537 268Z' },
      { name: 'Ornament bands', color: '#ffffff', line: 5, d: 'M46 286Q70 298 94 286M523 296Q545 306 567 296' },
      { name: 'Ornament shine', color: '#ffffff', line: 4, d: 'M54 270Q58 260 68 258M530 281Q534 272 543 270' },
      // floor and present
      { name: 'Floor', color: '#c99a6b', d: 'M0 572L600 572L600 600L0 600Z' },
      { name: 'Floor boards', color: '#a87a4c', line: 4, d: 'M120 574L120 600M300 574L300 600M470 574L470 600' },
      { name: 'Present', color: '#58a6f3', d: 'M430 492L560 492L560 572L430 572Z' },
      { name: 'Present lid', color: '#3f86d9', d: 'M420 470L570 470L570 496L420 496Z' },
      { name: 'Present dots', color: '#ffffff', d: C(452, 522, 5) + C(468, 550, 5) + C(530, 522, 5) + C(542, 550, 5) },
      { name: 'Ribbon', color: GOLD, line: 16, d: 'M495 470L495 572' },
      { name: 'Present bow', color: GOLD, d: E(477, 458, 20, 11, -20) + E(513, 458, 20, 11, 20) },
      { name: 'Present bow knot', color: '#e0932a', d: C(495, 463, 8) },
      { name: 'Gift tag', color: '#ffffff', d: 'M540 500L566 506L562 524L536 518Z' },
      // candy cane and puppy
      { name: 'Candy cane', color: '#ffffff', line: 16, d: 'M212 230L172 135Q158 98 128 108Q104 120 114 150' },
      { name: 'Candy stripes', color: RED, line: 6, d: 'M192 204L208 196M181 176L197 168M170 148L186 140M147 104L153 120M117 122L131 130' },
      { name: 'Puppy head', color: TAN, d: C(290, 150, 62) },
      { name: 'Floppy ears', color: BROWN, d: E(226, 152, 18, 36, 20) + E(354, 152, 18, 36, -20) },
      { name: 'Santa hat', color: RED, d: 'M342 112C330 50 260 30 220 70C202 88 196 100 192 112C210 96 230 92 240 104Z' },
      { name: 'Hat brim', color: '#ffffff', line: 16, d: 'M340 110Q290 88 240 104' },
      { name: 'Hat pom-pom', color: '#ffffff', d: C(192, 114, 13) },
      { name: 'Brow spots', color: BROWN, d: C(266, 132, 6) + C(314, 132, 6) },
      { name: 'Muzzle', color: '#fbf0dc', d: E(290, 176, 30, 22) },
      { name: 'Nose', color: INK, d: E(290, 166, 10, 7) },
      { name: 'Sleepy eyes', color: INK, line: 4, d: 'M256 148Q266 157 276 148M304 148Q314 157 324 148' },
      { name: 'Mouth', color: '#8a5a4a', line: 4, d: 'M290 173L290 182M290 182Q282 190 275 184M290 182Q298 190 305 184' },
      { name: 'Blush', color: '#ffb3c6', d: E(247, 172, 12, 8) + E(333, 172, 12, 8) },
      // the stocking
      { name: 'Stocking', color: RED, d: 'M190 265L380 265C385 340 400 400 395 450C392 500 350 520 300 530C250 545 200 575 150 570C95 565 85 500 130 470C170 445 195 420 195 380Z' },
      { name: 'Stocking shadow', color: '#c42f49', d: 'M380 265C385 340 400 400 395 450L372 430C375 380 365 330 360 265Z' },
      { name: 'Toe patch', color: GREEN, d: 'M150 570C95 565 85 500 130 470Q150 458 166 446Q216 480 232 553Q190 573 150 570Z' },
      { name: 'Heel patch', color: GREEN, d: 'M395 450C392 482 372 502 348 514Q326 480 334 440Q362 424 396 418Z' },
      { name: 'Toe stitches', color: '#ffffff', line: 4, d: 'M178 471L192 459M196 496L211 485M209 523L225 514M219 549L235 542' },
      { name: 'Heel stitches', color: '#ffffff', line: 4, d: 'M335 500L349 494M328 474L344 472M330 448L345 452M352 426L356 440M374 420L378 434' },
      { name: 'Paw print', color: '#ffffff', d: E(290, 372, 14, 11) },
      { name: 'Paw print toes', color: '#ffffff', d: C(272, 355, 6) + C(290, 349, 6) + C(308, 355, 6) },
      { name: 'Snow dots', color: '#ffffff', d: C(240, 318, 7) + C(342, 335, 7) + C(240, 425, 7) + C(300, 478, 7) + C(258, 515, 7) },
      { name: 'Fluffy cuff', color: '#ffffff', d: 'M165 220Q165 200 185 200L390 200Q410 200 410 220L410 262Q410 282 390 282L185 282Q165 282 165 262Z' },
      { name: 'Cuff fluff', color: '#d5e0f0', line: 5, d: 'M185 270Q200 260 215 270M240 272Q255 262 270 272M300 272Q315 262 330 272M355 270Q370 260 385 270' },
      { name: 'Holly leaves', color: GREEN, d: E(366, 226, 14, 7, 30) + E(390, 226, 14, 7, -30) },
      { name: 'Holly berries', color: RED, d: C(378, 236, 5) + C(378, 224, 5) },
      { name: 'Paws', color: '#f6e6cc', d: E(232, 210, 22, 17) + E(286, 214, 22, 17) },
      { name: 'Paw toes', color: '#c9a57a', line: 4, d: 'M225 212L225 224M239 212L239 224M279 216L279 228M293 216L293 228' },
      // the big bow
      { name: 'Hanging loop', color: GOLD, line: 6, d: 'M402 208Q436 196 452 152' },
      { name: 'Bow tails', color: GOLD, d: 'M448 148L424 216L448 202L462 152ZM462 148L492 216L468 204L452 152Z' },
      { name: 'Bow loops', color: GOLD, d: 'M455 140C425 100 385 100 388 135C390 168 430 160 455 140ZM455 140C485 100 525 100 522 135C520 168 480 160 455 140Z' },
      { name: 'Bow creases', color: '#e0932a', line: 4, d: 'M440 136L405 126M470 136L505 126' },
      { name: 'Bow knot', color: '#e0932a', d: C(455, 140, 12) },
      // sparkle
      { name: 'Sparkles', color: '#ffd84a', d: SP(130, 360, 14) + SP(490, 340, 12) + SP(60, 450, 12) + SP(560, 400, 10) },
      { name: 'Hearts', color: '#ff8fb3', d: H(135, 215, 11) + H(500, 262, 10) },
      { name: 'Snowflake dots', color: '#ffffff', d: C(40, 150, 5) + C(150, 300, 5) + C(445, 300, 5) + C(580, 180, 5) + C(60, 530, 5) + C(400, 555, 5) },
    ],
  });
})();
