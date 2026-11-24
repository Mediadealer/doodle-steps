---
name: new-doodle-picture
description: Add one or more new step-by-step pictures to the Doodle Steps drawing app (this repo). Use when asked for new pictures, images, lessons or drawings for the app, in any quantity or level of detail.
---

# Adding pictures to Doodle Steps

Doodle Steps shows a child one dashed shape at a time to color in, back to front, until the whole picture is rebuilt. A picture is pure data: an ordered list of colored shapes on a 600 x 600 page. You are writing that data. You do not touch `app.js` or `style.css`.

The players are kids of about 12. Favourite subjects, in order: scenic views, portraits of girls, cute animals and stuffies, food and drinks with faces. Ask nothing unless the request is truly unclear: pick subjects yourself and vary them.

## Hard rules

- **Original subjects only.** No existing characters, mascots, logos, brands, celebrities or real people, and nothing drawn "in the style of" a named show, game or artist. A generic fox, a girl with braids, a lighthouse: fine.
- **Kid-appropriate.** Nothing scary, violent, romantic or body-focused. Portraits are friendly head-and-shoulders busts in everyday clothes.
- **One picture per file** in `pictures/<id>.js`. Never edit `lessons.js` (the first 18 pictures live there; read one of them as an example, not the whole file).
- **Every picture must pass both checks** below before you call it done.

## The file

```js
// pictures/lighthouse.js
(() => {
  const { E, C, H, SP, ST, INK } = DS;
  LESSONS.push({
    id: 'lighthouse',            // lowercase letters/digits, unique, same as the file name
    name: 'Lighthouse',          // shown on the card, 16 characters at most
    bg: '#bfe6ff',               // page color, shows wherever nothing is painted
    steps: [
      { name: 'Sea', color: '#3fa7d6', d: 'M0 430L600 430L600 600L0 600Z' },
      { name: 'Light beam', color: '#fff3b0', line: 8, d: 'M300 120L520 60' },
      // ...
    ],
  });
})();
```

A step is `{ name, color, d }` to color in, or `{ name, color, line, d }` to trace.

- `d` is an SVG path with **absolute, uppercase commands only** (`M L Q C T S A Z`). Coordinates run 0 to 600, x to the right, y **down**.
- `color` is `#rrggbb`. No alpha, no named colors, no gradients.
- `line` is the stroke thickness and must be 4, 5, 6, 8 or 16. Use 4 to 6 for fine detail (lashes, stitches, whiskers), 8 for normal lines, 16 for thick ones (stems, branches, bands).
- `name` is what the child reads: 1 to 3 plain words, 24 characters at most, unique within the picture ("Rosy cheeks", not "Ellipse 4").
- Several separate shapes can share one step by joining their paths: `C(240,290,18) + C(360,290,18)` is "Eyes".

The file is ordinary JavaScript, so a loop or small function that builds a repeated path (a zigzag treeline, a row of fence posts) is fine.

Helpers (all return a path string, so join with `+`):

| Helper | Shape |
|---|---|
| `C(cx, cy, r)` | circle |
| `E(cx, cy, rx, ry, rot)` | ellipse, `rot` in degrees (optional) |
| `H(cx, cy, s)` | heart about `2s` wide |
| `SP(cx, cy, s)` | four-point sparkle, `s` from centre to tip |
| `ST(cx, cy, R, r)` | five-point star, outer and inner radius |
| `INK` | the dark outline color `#2b2b3a` (use instead of pure black) |

## How to design one

1. **Decide the tier.** Unless told otherwise, match the request: about 30 steps (medium), 45 (long), 60+ (epic). Within 3 of the target is fine. More steps means more *things* and more *finishing detail*, not thinner slices of the same shape.
2. **List the layers back to front before writing any numbers.** Later steps paint over earlier ones, so order is: backdrop or sky, far things, middle things, the main subject's big body shapes, then features on top of those, then small details, then sparkles and floating extras last. Write this list as a comment first if it helps.
3. **Start big.** Step 1 is always a large filled shape (a backdrop circle, a sky, a body). Never start with a line or something tiny.
4. **Place everything on the 600 grid with real arithmetic.** When one thing sits on another (an eye on a face, a window on a wall, a tree on a hill), work out the bigger shape's edge at that spot and keep the smaller one inside it. Most mistakes are a feature placed where its parent is not.
5. **Give each step a visible job.** A step must differ in color from whatever is directly under it, and must not be completely covered later. If two neighbours need the same color (ears and head), that is fine as long as part of each shows against something else.
6. **Keep it balanced.** No single shape other than a sky, sea or backdrop should cover more than about a quarter of the page, and the focal object should sit near the middle third, not squeezed into a corner. Fill empty areas with supporting things (clouds, birds, plants, a second boat) so no large region is blank.
7. **Mirror with care.** For a centred subject, the mirror of x about centre 300 is `600 - x`. Symmetric pairs go in one step.

Sizes that work:

- Smallest fill: radius 4 (pupils' sparkles, freckles, stars in a sky). Anything smaller cannot be scored.
- Keep every point inside 0 to 600. Shapes meant to run off the edge (sky, sea, ground) should end exactly at 0 or 600.
- Leave at least 15 units between the main subject and the page edge.
- Text is not possible. A letter or number can be drawn as a `line` step.

Colors:

- Pick 4 to 6 main colors and reuse them; add a lighter and a darker shade of each for depth (a shadow under a chin, a shine on hair, a darker band on water).
- White and near-white details need something darker under them. Dark details need something lighter.
- The page color `bg` must be a different color from step 1 and from any other shape that touches bare page, or those steps will be invisible while they are being colored.
- Depth sells a scene: put at least three distance layers behind the subject (for example a sky glow, far mountains, a dark treeline), each a different shade.

### Template: portrait bust (centre x = 300)

These numbers are known to work. Change hair, colors, clothes, accessories and expression, keep the proportions.

| Part | Geometry |
|---|---|
| Backdrop | `C(300,290,235)` |
| Hair behind | a big shape from about y 130 down to 470, x 155 to 445 |
| Neck | `M265 390L265 460L335 460L335 390Z`, darker than the face |
| Neck shadow | `M265 400L335 400L335 412Q300 440 265 412Z` |
| Top / shoulders | `M130 600Q130 470 265 450Q300 480 335 450Q470 470 470 600Z` |
| Ears | `C(196,300,20) + C(404,300,20)` before the face |
| Face | `E(300,290,105,120)` (top y 170, chin y 410) |
| Fringe / hairline | must start above y 165 and cover the top of the face ellipse |
| Eyebrows | `line: 6`, around y 256, e.g. `M225 258Q247 246 270 256M330 256Q353 246 375 258` |
| Eye whites | `E(250,294,24,20) + E(350,294,24,20)` |
| Iris, pupil, sparkle | `C(252,295,15)`, `C(252,295,7)`, `C(258,289,4.5)` and mirrors |
| Lashes | `line: 5`, `M224 290Q250 268 276 288M224 290L214 282` and mirror |
| Nose | `line: 4`, `M296 322Q300 336 309 329` |
| Blush | `E(225,338,22,13) + E(375,338,22,13)` |
| Lips | `M272 362Q286 354 300 360Q314 354 328 362Q300 386 272 362Z` |

Then 8 to 20 more steps of personality: hair strands and shine (`line` 4 to 6), clips, earrings, glasses, freckles, a necklace, a pattern or logo-free motif on the top, something held, and floating hearts, sparkles or notes in the backdrop. Vary skin tone, hair color and hairstyle between portraits.

### Template: scenic view

Stack horizontal bands, each a closed shape that runs edge to edge, in this order: upper sky, lower sky, sun or moon, clouds, far mountains or skyline, their highlights, nearer hills, water or ground, then objects standing on the ground from far to near (each one: base shape, then its details), then foreground plants, then small life (birds as `line` steps, fireflies, flowers) and weather last.

- A horizon somewhere between y 280 and y 430 works well.
- Things further away are smaller, higher up and less saturated.
- Give the scene one clear focal object (a cabin, a boat, a lighthouse, a tent) plus two or three supporting ones.
- Reflections and light on water are short horizontal `line` steps.

### Template: cute animal or stuffy

Sitting, facing forward, centred: ears, body, head overlapping the top of the body, then muzzle, limbs in front, face (eyes, shine, nose, mouth, blush), then accessories (bow, scarf, patch, stitches as dashed `line` steps), then things around it on the floor, then floating extras. Big head, small body, eyes low on the head and wide apart read as cute.

## Checking (required)

1. Add the script tag to `index.html`, after the other picture files and **before** `app.js`, and raise every `?v=` number in `index.html` by one so tablets fetch the new files:

   ```html
   <script src="pictures/lighthouse.js?v=7"></script>
   ```

2. Run the static check and fix every error (the summary counts only the pictures you name; problems in other pictures are not yours to fix):

   ```
   node tools/check-lessons.js lighthouse
   ```

3. Look at it. Start the preview server (`doodle-steps` in `.claude/launch.json`, port 5173) and open `http://localhost:5173/tools/check.html?id=lighthouse`. Read the "CHECK RESULT" line and every ERROR and WARNING, then take a screenshot and actually look at the finished picture and the step-by-step strip:

   - Does it read instantly as the subject?
   - Is anything floating, detached, poking out of its parent, or the wrong way up?
   - Do warnings about "same color" or "covered by later steps" describe something intended? If not, fix the order, position or color.

   For long pictures the step strip runs below the screen: scroll, or take more than one screenshot, so you see the last steps too.

   Fix and reload until it looks right. If you have no browser tool, say so in your report instead of claiming it was looked at.

4. Play the first few steps in the app at `http://localhost:5173/` only if you changed something unusual; the checks above cover normal pictures.

## Finishing

Report, for each picture: id, name, step count, check result, and whether you looked at it. Commit and push only if the user asked for the pictures to go live; pushing to `main` publishes to the live site within a minute.

When asked for many pictures, do them one at a time, checking each before starting the next. Do not write several unchecked files and check at the end.
