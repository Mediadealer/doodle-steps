// pictures/castle.js — hand-drawn: a cliff-top castle, a waterfall and a rainbow
(() => {
  const { E, C, INK } = DS;
  const ROCK = '#8d8494';
  const dots = (pts, r) => pts.map(([x, y]) => C(x, y, r)).join('');
  const FLOWERS = [[90, 580], [180, 566], [330, 582], [420, 588], [545, 568]];
  LESSONS.push({
    id: 'castle',
    name: 'Castle falls',
    bg: '#8fd3f4',
    steps: [
      // sky and far land
      { name: 'Warm sky', color: '#ffe2b8', d: 'M0 190Q300 150 600 190L600 340L0 340Z' },
      { name: 'Sun glow', color: '#fff0b8', d: C(470, 95, 58) },
      { name: 'Sun', color: '#ffd84a', d: C(470, 95, 38) },
      { name: 'Big cloud', color: '#ffffff', d: E(120, 85, 60, 20) + E(160, 66, 40, 20) + E(85, 70, 30, 16) },
      { name: 'Little cloud', color: '#ffffff', d: E(330, 120, 44, 14) + E(352, 108, 28, 14) },
      { name: 'Birds', color: INK, line: 4, d: 'M240 60Q250 50 260 60Q270 50 280 60M300 84Q308 76 316 84Q324 76 332 84' },
      { name: 'Far mountains', color: '#9aa7d6', d: 'M0 340L0 235L90 150L170 245L260 130L350 255L430 180L520 265L600 205L600 340Z' },
      { name: 'Mountain shadows', color: '#8290c4', d: 'M90 150L170 245L120 250ZM260 130L350 255L285 260ZM430 180L520 265L462 268Z' },
      { name: 'Snow caps', color: '#ffffff', d: 'M90 150L112 175L98 172L90 184L80 172L68 176ZM260 130L286 164L270 160L260 174L249 160L234 166ZM430 180L450 200L438 198L430 209L421 198L410 200Z' },
      { name: 'Green hills', color: '#7cc47f', d: 'M0 340Q100 285 220 320Q330 270 450 318Q530 290 600 308L600 470L0 470Z' },
      { name: 'Hill trees', color: '#4f9d5c', d: C(282, 296, 10) + C(300, 290, 12) + C(320, 297, 10) },
      { name: 'Lake', color: '#4aa3d9', d: 'M0 465Q300 440 600 465L600 565L0 565Z' },
      // the cliffs and the falls
      { name: 'Right cliff', color: ROCK, d: 'M335 482L345 332L372 294L600 282L600 482Z' },
      { name: 'Left cliff', color: ROCK, d: 'M0 482L0 316L212 308L242 345L252 482Z' },
      { name: 'Cliff shadows', color: '#756c7d', d: 'M212 308L242 345L252 482L225 482L220 350ZM335 482L345 332L372 294L378 340L362 482Z' },
      { name: 'Cliff cracks', color: '#5f5768', line: 4, d: 'M60 360L70 410L62 455M150 350L160 425M490 335L500 400L494 455M560 325L566 395' },
      { name: 'Grassy tops', color: '#5fb36a', d: 'M0 300L214 294L230 324L0 332ZM362 300L600 270L600 302L370 324Z' },
      { name: 'River on top', color: '#4aa3d9', d: 'M388 304L442 300L470 282L420 284Z' },
      { name: 'Waterfall', color: '#bfe8ff', d: 'M386 302L444 298L456 478L374 478Z' },
      { name: 'Falling water', color: '#ffffff', line: 5, d: 'M400 312L394 462M416 310L416 464M432 310L438 462' },
      { name: 'Red rainbow', color: '#ff6b6b', line: 8, d: 'M284 462Q410 318 536 462' },
      { name: 'Yellow rainbow', color: '#ffd84a', line: 8, d: 'M296 462Q410 336 524 462' },
      { name: 'Blue rainbow', color: '#58a6f3', line: 8, d: 'M308 462Q410 354 512 462' },
      { name: 'Mist', color: '#ffffff', d: C(378, 474, 18) + C(415, 482, 22) + C(452, 474, 18) },
      { name: 'Lake ripples', color: '#9fd4f5', line: 4, d: 'M40 500L100 500M250 492L310 492M250 520L300 520M480 505L550 505M420 530L470 530' },
      // the bridge
      { name: 'Stone bridge', color: '#b5aab8', d: 'M222 316L362 316L362 374Q292 306 222 374Z' },
      { name: 'Bridge rail', color: ROCK, line: 4, d: 'M222 306L362 306M245 306L245 316M275 306L275 316M305 306L305 316M335 306L335 316' },
      { name: 'Bridge stones', color: '#978c9c', line: 4, d: 'M236 330L252 330M284 326L302 326M336 332L352 332' },
      // the castle
      { name: 'Castle path', color: '#d9c9a8', d: 'M104 300L136 300L152 322L94 326Z' },
      { name: 'Castle wall', color: '#efe6d6', d: 'M62 302L62 216L180 216L180 302Z' },
      { name: 'Battlements', color: '#efe6d6', d: 'M92 217L92 203L106 203L106 217ZM113 217L113 203L127 203L127 217ZM134 217L134 203L148 203L148 217Z' },
      { name: 'Castle towers', color: '#e0d4be', d: 'M40 302L40 172L86 172L86 302ZM154 302L154 152L200 152L200 302Z' },
      { name: 'Tower roofs', color: '#d9485f', d: 'M32 174L63 108L94 174ZM146 154L177 84L208 154Z' },
      { name: 'Flag poles', color: '#5a4a5a', line: 4, d: 'M63 108L63 82M177 84L177 56' },
      { name: 'Flags', color: '#ffd84a', d: 'M63 82L86 90L63 98ZM177 56L202 65L177 74Z' },
      { name: 'Castle gate', color: '#7a4b2a', d: 'M104 302L104 264Q120 240 136 264L136 302Z' },
      { name: 'Gate bars', color: '#5a3a22', line: 4, d: 'M120 254L120 302M105 278L135 278' },
      { name: 'Castle windows', color: '#4a5a8a', d: E(63, 212, 7, 11) + E(177, 196, 7, 11) + E(177, 244, 7, 11) + E(63, 256, 7, 11) },
      { name: 'Castle bricks', color: '#cbbfa8', line: 4, d: 'M70 284L88 284M142 236L152 236M92 236L108 236M184 274L196 274M44 232L54 232' },
      { name: 'Bushes', color: '#3f9d5a', d: C(216, 292, 15) + C(18, 296, 16) },
      // pines by the falls
      { name: 'Pine trunks', color: '#6b4423', line: 6, d: 'M500 294L500 268M552 290L552 260' },
      { name: 'Pine bottoms', color: '#1f6b4f', d: 'M470 276L530 276L500 226ZM520 268L584 268L552 212Z' },
      { name: 'Pine tops', color: '#2fa878', d: 'M480 242L520 242L500 196ZM532 232L572 232L552 180Z' },
      // the front of the picture
      { name: 'Meadow', color: '#58b368', d: 'M0 565Q150 528 320 556Q470 580 600 540L600 600L0 600Z' },
      { name: 'Sailboat', color: '#b8405a', d: 'M150 506L232 506L220 527L162 527Z' },
      { name: 'Mast', color: '#6b4423', line: 4, d: 'M190 506L190 448' },
      { name: 'Sail', color: '#ffffff', d: 'M194 500L194 452L228 496Z' },
      { name: 'Boat flag', color: '#ffd84a', d: 'M190 448L172 455L190 462Z' },
      { name: 'Swan', color: '#ffffff', d: E(350, 520, 17, 9) },
      { name: 'Swan neck', color: '#ffffff', line: 6, d: 'M363 518Q372 505 364 495' },
      { name: 'Swan beak', color: '#ff8a1f', d: 'M364 490L378 495L364 500Z' },
      { name: 'Lake rocks', color: ROCK, d: E(520, 532, 26, 12) + E(556, 540, 16, 8) },
      { name: 'Lily pads', color: '#3f9d5a', d: E(60, 528, 16, 7) + E(96, 538, 13, 6) },
      { name: 'Lily flower', color: '#ff8fb3', d: C(60, 524, 6) },
      { name: 'Grass tufts', color: '#3f8f4f', line: 5, d: 'M40 592L44 576M52 592L52 574M250 594L254 578M262 594L262 576M470 596L474 580M482 596L482 578' },
      { name: 'Pink flowers', color: '#ff8fb3', d: dots(FLOWERS, 7) },
      { name: 'Flower middles', color: '#ffd84a', d: dots(FLOWERS, 4) },
      { name: 'White flowers', color: '#ffffff', d: C(135, 588, 6) + C(380, 576, 6) + C(505, 590, 6) },
      { name: 'Butterfly wings', color: '#c9a0ff', d: C(284, 572, 6) + C(297, 572, 6) },
      { name: 'Butterfly body', color: INK, line: 4, d: 'M290.5 564L290.5 580' },
    ],
  });
})();
