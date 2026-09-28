// Project page (Draft 1: spec sheet), rendered as rows of segments for the Game Boy screen.
// Black background. The pixel title is the only decoration; one accent colour; meta dim.
import { fg, bg, reset } from './term.js';
import { textBitmap, toHalfBlocks, textWidth } from './pixel.js';

export const PALETTES = {
  cyan: { black: [0, 0, 0], accent: [0, 229, 255], text: [215, 215, 215], dim: [105, 105, 105] },
  green: { black: [0, 0, 0], accent: [0, 255, 65], text: [200, 215, 200], dim: [70, 110, 80] },
};
export const PAD = 3; // left/right margin inside the screen
const LABEL_W = 10; // 'problem   ' column

/** Greedy word wrap. */
export function wrap(text, width) {
  const lines = [];
  let cur = '';
  for (const word of String(text).split(/\s+/).filter(Boolean)) {
    if (!cur) cur = word;
    else if (cur.length + 1 + word.length <= width) cur += ' ' + word;
    else { lines.push(cur); cur = word; }
  }
  if (cur) lines.push(cur);
  return lines;
}

/** Pixel-font title rows (falls back to plain text if it doesn't fit). */
export function titleRows(title, inner) {
  if (textWidth(title, 1) <= inner) return toHalfBlocks(textBitmap(title, 1)).map((l) => [{ color: 'accent', text: l }]);
  return [[{ color: 'accent', text: title }]];
}

/** Build the page as rows of segments: [{ color, text }, ...]. Pure; no ANSI. `cols` = screen width. */
export function projectPage(p, cols) {
  const inner = cols - PAD * 2;
  const rows = [];
  const row = (...segs) => rows.push(segs);
  const blank = () => row();

  blank();
  rows.push(...titleRows(p.title, inner));

  const pitchW = inner - p.year.length - 2;
  wrap(p.pitch, pitchW).forEach((l, i) =>
    i === 0
      ? row({ color: 'text', text: l.padEnd(pitchW + 2) }, { color: 'dim', text: p.year })
      : row({ color: 'text', text: l }),
  );
  blank();

  const section = (label, text, color = 'text') =>
    wrap(text, inner - LABEL_W).forEach((l, i) =>
      row({ color: 'accent', text: (i === 0 ? label : '').padEnd(LABEL_W) }, { color, text: l }),
    );
  section('problem', p.problem);
  section('built', p.built);
  section('', p.stack.join(' · '), 'dim');
  section('result', p.result);
  blank();
  row({ color: 'text', text: p.link });
  return rows;
}

/** Paint segment rows into ANSI strings of exactly `cols` cells on a black background. */
export function paint(rows, cols, pal = PALETTES.cyan) {
  return rows.map((segs) => {
    let s = bg(pal.black) + ' '.repeat(PAD);
    let used = PAD;
    for (const { color, text } of segs) {
      const t = [...text].slice(0, Math.max(0, cols - used)).join('');
      s += fg(pal[color] || pal.text) + t;
      used += [...t].length;
    }
    return s + ' '.repeat(Math.max(0, cols - used)) + reset;
  });
}
