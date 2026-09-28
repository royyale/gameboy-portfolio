// Phase 1b: Matrix rain, then a Tron-style neon title card traces itself in.
import { out, nextKey, size, fg, reset, moveTo, hideCursor, clearScreen } from './term.js';
import { textBitmap, toHalfBlocks, textWidth } from './pixel.js';
import { titleCard } from './content.js';

const GLYPHS = 'ｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ0123456789:.=*+-<>';
const randGlyph = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

const HEAD = [210, 255, 220];
const TRAIL = Array.from({ length: 8 }, (_, i) => {
  const t = (i + 1) / 8;
  return [0, Math.round(35 + 220 * t), Math.round(10 + 55 * t)];
});
const CYAN = [0, 229, 255];
const WHITE = [235, 255, 255];
const GREEN = [0, 255, 65];

const FRAME_MS = 45;
const T_BOX = 1800; // rain alone before the box starts tracing
const BOX_TRACE_MS = 600;
const LETTER_MS = 90;
const LINE_COL_MS = 10;
const TYPE_MS = 35;

// ---------- rain ----------
function newDrop(rows, initial) {
  return {
    y: -Math.random() * rows * (initial ? 1.5 : 0.8),
    speed: 0.35 + Math.random() * 0.75,
  };
}

function makeRain(cols, rows) {
  const n = cols * rows;
  return {
    cols, rows,
    inten: new Float32Array(n),
    chars: new Array(n).fill(' '),
    head: new Uint8Array(n),
    drops: Array.from({ length: cols }, () => newDrop(rows, true)),
  };
}

function stepRain(R) {
  const { cols, rows, inten, chars, head } = R;
  head.fill(0);
  for (let i = 0; i < inten.length; i++) {
    if (inten[i] > 0) {
      inten[i] -= 0.055;
      if (Math.random() < 0.02) chars[i] = randGlyph();
    }
  }
  R.drops.forEach((d, c) => {
    const prev = Math.floor(d.y);
    d.y += d.speed;
    const cur = Math.floor(d.y);
    for (let y = Math.max(prev + 1, 0); y <= cur && y < rows; y++) {
      chars[y * cols + c] = randGlyph();
      inten[y * cols + c] = 1;
    }
    if (cur >= 0 && cur < rows) head[cur * cols + c] = 1;
    if (cur - 20 > rows) R.drops[c] = newDrop(rows, false);
  });
}

// ---------- title card layout ----------
function buildLayout(cols, rows, name) {
  const { title, subtitle, continuePrompt } = titleCard;
  const tagline = titleCard.tagline(name);

  const scale = textWidth(title, 2) + 8 <= cols ? 2 : 1;
  const pixelFits = textWidth(title, 1) + 6 <= cols;
  const titleLines = pixelFits ? toHalfBlocks(textBitmap(title, scale)) : [title];
  const titleW = titleLines[0].length;
  const letterW = pixelFits ? 4 * scale : 1;

  // Rows inside the box, top to bottom.
  const inner = [
    ...titleLines.map((_, i) => ({ kind: 'title', i })),
    { kind: 'blank' },
    { kind: 'line' },
    { kind: 'blank' },
    { kind: 'text', key: 'subtitle', text: subtitle, color: CYAN },
    { kind: 'blank' },
    { kind: 'text', key: 'tagline', text: tagline, color: GREEN },
    { kind: 'blank' },
    { kind: 'text', key: 'prompt', text: continuePrompt, color: WHITE },
  ];
  const innerW = Math.max(titleW, tagline.length, subtitle.length, continuePrompt.length);
  const boxW = Math.min(cols, innerW + 6);
  const boxH = Math.min(rows, inner.length + 4);
  const left = Math.max(0, ((cols - boxW) / 2) | 0);
  const top = Math.max(0, ((rows - boxH) / 2) | 0);

  const tTitle = T_BOX + BOX_TRACE_MS;
  const tLine = tTitle + title.length * LETTER_MS;
  const tSub = tLine + titleW * LINE_COL_MS + 200;
  const tTag = tSub + subtitle.length * TYPE_MS + 300;
  const doneAt = tTag + tagline.length * TYPE_MS + 400;

  return { cols, rows, left, top, boxW, boxH, inner, titleLines, titleW, letterW, texts: { subtitle, tagline, prompt: continuePrompt }, tTitle, tLine, tSub, tTag, doneAt };
}

function perimeter(L) {
  const pts = [];
  const r0 = L.top, r1 = L.top + L.boxH - 1, c0 = L.left, c1 = L.left + L.boxW - 1;
  for (let c = c0; c <= c1; c++) pts.push([r0, c]);
  for (let r = r0 + 1; r <= r1; r++) pts.push([r, c1]);
  for (let c = c1 - 1; c >= c0; c--) pts.push([r1, c]);
  for (let r = r1 - 1; r > r0; r--) pts.push([r, c0]);
  return pts;
}

function borderChar(L, r, c) {
  const top = r === L.top, bot = r === L.top + L.boxH - 1;
  const lft = c === L.left, rgt = c === L.left + L.boxW - 1;
  if (top && lft) return '┏';
  if (top && rgt) return '┓';
  if (bot && lft) return '┗';
  if (bot && rgt) return '┛';
  return top || bot ? '━' : '┃';
}

/** Overlay cells for time t (ms). Pure function of time so skipping = t:Infinity. */
function overlayAt(L, t, now) {
  const cells = new Map();
  const put = (r, c, ch, color) => {
    if (r >= 0 && r < L.rows && c >= 0 && c < L.cols) cells.set(r * L.cols + c, { ch, color });
  };
  if (t < T_BOX) return cells;

  // Box border traces clockwise with a bright head.
  const per = perimeter(L);
  const shown = Math.min(per.length, Math.floor(((t - T_BOX) / BOX_TRACE_MS) * per.length));
  per.slice(0, shown).forEach(([r, c], i) => put(r, c, borderChar(L, r, c), i === shown - 1 && shown < per.length ? WHITE : CYAN));

  // Inner content.
  const center = (w) => L.left + (((L.boxW - w) / 2) | 0);
  L.inner.forEach((row, i) => {
    const r = L.top + 2 + i;
    if (row.kind === 'title') {
      const letters = Math.floor((t - L.tTitle) / LETTER_MS) + 1;
      if (letters <= 0) return;
      const line = L.titleLines[row.i];
      const visibleCols = Math.min(line.length, letters * L.letterW);
      const c0 = center(L.titleW);
      for (let x = 0; x < visibleCols; x++) {
        if (line[x] === ' ') continue;
        const fresh = x >= visibleCols - L.letterW && t < L.tLine;
        put(r, c0 + x, line[x], fresh ? WHITE : CYAN);
      }
    } else if (row.kind === 'line') {
      if (t < L.tLine) return;
      const n = Math.min(L.titleW, Math.floor((t - L.tLine) / LINE_COL_MS));
      const c0 = center(L.titleW);
      for (let x = 0; x < n; x++) put(r, c0 + x, '━', x === n - 1 && n < L.titleW ? WHITE : CYAN);
    } else if (row.kind === 'text') {
      let text = '';
      if (row.key === 'subtitle' && t >= L.tSub) text = row.text.slice(0, Math.floor((t - L.tSub) / TYPE_MS));
      if (row.key === 'tagline' && t >= L.tTag) text = row.text.slice(0, Math.floor((t - L.tTag) / TYPE_MS));
      if (row.key === 'prompt' && t >= L.doneAt && Math.floor(now / 500) % 2 === 0) text = row.text;
      const c0 = center(row.text.length);
      [...text].forEach((ch, x) => put(r, c0 + x, ch, row.color));
    }
  });
  return cells;
}

function render(R, L, cells, masked) {
  let s = '';
  let last = '';
  const color = (rgb) => {
    const code = fg(rgb);
    if (code !== last) { s += code; last = code; }
  };
  for (let r = 0; r < R.rows; r++) {
    s += moveTo(r + 1, 1);
    for (let c = 0; c < R.cols; c++) {
      const i = r * R.cols + c;
      const cell = cells.get(i);
      if (cell) {
        color(cell.color);
        s += cell.ch;
        continue;
      }
      const inBox = masked && r >= L.top && r < L.top + L.boxH && c >= L.left && c < L.left + L.boxW;
      const v = R.inten[i];
      if (inBox || v <= 0.04) {
        s += ' ';
      } else {
        color(R.head[i] ? HEAD : TRAIL[Math.min(7, (v * 8) | 0)]);
        s += R.chars[i];
      }
    }
  }
  out(s + reset);
}

export async function matrixIntro(name) {
  out(hideCursor + clearScreen);
  let { cols, rows } = size();
  let rain = makeRain(cols, rows);
  let layout = buildLayout(cols, rows, name);
  const t0 = Date.now();
  let skipped = false;

  for (;;) {
    const key = await nextKey(FRAME_MS);
    const s = size();
    if (s.cols !== cols || s.rows !== rows) {
      ({ cols, rows } = s);
      rain = makeRain(cols, rows);
      layout = buildLayout(cols, rows, name);
      out(clearScreen);
    }
    const now = Date.now();
    const t = skipped ? Infinity : now - t0;
    if (key) {
      if (t >= layout.doneAt && key.name === 'enter') break;
      skipped = true; // any key during the animation jumps to the finished card
    }
    stepRain(rain);
    render(rain, layout, overlayAt(layout, t, now), t >= T_BOX);
  }
  out(clearScreen);
}
