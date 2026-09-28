// Pixel rendering with half-blocks: each terminal cell holds two vertical
// pixels, which makes pixels roughly square.

// 3x5 bitmap font. '#' = on.
const FONT = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'],
  O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
  Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#.#', '#.#', '###', '###', '#.#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
  0: ['###', '#.#', '#.#', '#.#', '###'], 1: ['.#.', '##.', '.#.', '.#.', '###'],
  2: ['##.', '..#', '.#.', '#..', '###'], 3: ['##.', '..#', '.#.', '..#', '##.'],
  4: ['#.#', '#.#', '###', '..#', '..#'], 5: ['###', '#..', '##.', '..#', '##.'],
  6: ['.##', '#..', '###', '#.#', '###'], 7: ['###', '..#', '.#.', '.#.', '.#.'],
  8: ['###', '#.#', '###', '#.#', '###'], 9: ['###', '#.#', '###', '..#', '##.'],
  ' ': ['...', '...', '...', '...', '...'], '.': ['...', '...', '...', '...', '.#.'],
  '-': ['...', '...', '###', '...', '...'], '!': ['.#.', '.#.', '.#.', '...', '.#.'],
};

/** Text -> bitmap (array of rows of booleans), scaled by `scale`. */
export function textBitmap(text, scale = 1) {
  const chars = [...text.toUpperCase()].map((c) => FONT[c] || FONT[' ']);
  const rows = [];
  for (let y = 0; y < 5; y++) {
    const row = [];
    chars.forEach((glyph, i) => {
      if (i > 0) row.push(false); // 1px letter gap
      for (const px of glyph[y]) row.push(px === '#');
    });
    rows.push(row);
  }
  return scaleBitmap(rows, scale);
}

function scaleBitmap(rows, s) {
  if (s === 1) return rows;
  const outRows = [];
  for (const row of rows) {
    const wide = row.flatMap((p) => Array(s).fill(p));
    for (let i = 0; i < s; i++) outRows.push(wide);
  }
  return outRows;
}

/** Bitmap -> array of strings using ▀ ▄ █ (one string per terminal row). */
export function toHalfBlocks(bitmap) {
  const lines = [];
  for (let y = 0; y < bitmap.length; y += 2) {
    const top = bitmap[y];
    const bottom = bitmap[y + 1] || [];
    let line = '';
    for (let x = 0; x < top.length; x++) {
      const t = top[x], b = bottom[x];
      line += t && b ? '█' : t ? '▀' : b ? '▄' : ' ';
    }
    lines.push(line);
  }
  return lines;
}

/** Width in columns of `text` rendered at `scale`. */
export const textWidth = (text, scale = 1) => (text.length * 4 - 1) * scale;
