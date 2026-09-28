// Phase 2: the handheld. Body, black screen, D-pad, A/B, START/SELECT, and the command
// line below it. Full-frame redraws, like matrix.js.
import { out, nextKey, size, fg, bg, reset, moveTo, hideCursor, clearScreen, exitApp } from './term.js';
import { paint, PALETTES } from './page.js';
import { execute, findProject } from './shell.js';
import { nodeAt, pathString } from './fs.js';
import { fakeTerminal } from './content.js';

const BODY = [70, 70, 78];
const BODY_DIM = [45, 45, 52];
const LED_ON = [255, 60, 60];
const LED_OFF = [80, 30, 30];
const SCREEN_MAX_W = 56;
const FRAME_MS = 120;
const LIT_MS = 160;

const CONTROLS_H = 5;
const CHROME_H = 1 + 1 + 1 + 1 + CONTROLS_H + 1 + 1; // body top, screen top, screen bottom, gap, controls, start/select, body bottom
const INPUT_H = 3; // gap, prompt, legend

function layout(cols, rows) {
  const w = Math.min(SCREEN_MAX_W, cols - 8);
  const h = rows - CHROME_H - INPUT_H;
  if (w < 34 || h < 6) return null;
  const bodyW = w + 8; // │ + 2 pad + ┌ + screen + ┐ + 2 pad + │
  const left = ((cols - bodyW) / 2) | 0;
  return { cols, rows, w, h, bodyW, left, top: 0 };
}

/** ─ D-pad / buttons art. `lit` = set of 'up'|'down'|'left'|'right'|'a'|'b'|'start'|'select'. */
function controls(L, lit, pal) {
  const on = fg(pal.accent), off = fg(BODY), dim = fg(BODY_DIM);
  const arrow = (k, ch) => (lit.has(k) ? on : dim) + ch + off;
  const pad = [
    '   ┏━┓   ',
    '┏━━┛' + arrow('up', '▲') + '┗━━┓',
    '┃' + arrow('left', '◀') + '     ' + arrow('right', '▶') + '┃',
    '┗━━┓' + arrow('down', '▼') + '┏━━┛',
    '   ┗━┛   ',
  ];
  const btn = (k, ch) => (lit.has(k) ? on : off);
  const ab = [
    '        ╭───╮',
    ' ╭───╮  │ ' + btn('a') + 'A' + off + ' │',
    ' │ ' + btn('b') + 'B' + off + ' │  ╰───╯',
    ' ╰───╯       ',
    '             ',
  ];
  const abW = 13, padW = 9;
  const lines = [];
  for (let i = 0; i < CONTROLS_H; i++) {
    const gap = L.bodyW - 2 - 2 - padW - abW - 2;
    lines.push('  ' + off + pad[i] + ' '.repeat(Math.max(0, gap)) + ab[i] + '  ');
  }
  const ss = (k, label) => (lit.has(k) ? on : dim) + '▬ ' + label + off;
  const ssText = `▬ SELECT   ▬ START`;
  const ssLeft = ((L.bodyW - 2 - ssText.length) / 2) | 0;
  lines.push(' '.repeat(ssLeft) + ss('select', 'SELECT') + '   ' + ss('start', 'START') + ' '.repeat(Math.max(0, L.bodyW - 2 - ssLeft - ssText.length)));
  return lines;
}

function draw(S, full) {
  const { L, pal } = S;
  const body = fg(BODY);
  let s = full ? clearScreen : '';
  const put = (r, text) => (s += moveTo(r + 1, L.left + 1) + text + reset);
  let r = L.top;

  // Body top with LED.
  const led = (S.ledOn ? fg(LED_ON) : fg(LED_OFF)) + '●' + body;
  put(r++, body + '╭─ ' + led + ' ' + '─'.repeat(L.bodyW - 6) + '╮');
  // Screen.
  put(r++, body + '│  ┌' + '─'.repeat(L.w) + '┐  │');
  const overflow = Math.max(0, S.rows.length - L.h);
  S.scroll = Math.max(0, Math.min(S.scroll, overflow));
  const visible = S.rows.slice(S.scroll, S.scroll + L.h);
  while (visible.length < L.h) visible.push([]);
  const painted = paint(visible, L.w, pal);
  for (let i = 0; i < L.h; i++) {
    let line = painted[i];
    if (overflow) {
      // scrollbar in the last column of the screen
      const thumbLen = Math.max(1, Math.round((L.h / S.rows.length) * L.h));
      const thumbTop = Math.round((S.scroll / overflow) * (L.h - thumbLen));
      const ch = i >= thumbTop && i < thumbTop + thumbLen ? '▐' : ' ';
      line = paint([visible[i]], L.w - 1, pal)[0] + bg(pal.black) + fg(pal.dim) + ch + reset;
    }
    put(r++, body + '│  │' + reset + line + body + '│  │');
  }
  put(r++, body + '│  └' + '─'.repeat(L.w) + '┘  │');
  put(r++, body + '│' + ' '.repeat(L.bodyW - 2) + '│');
  for (const c of controls(L, S.lit, pal)) put(r++, body + '│' + c + body + '│');
  put(r++, body + '╰' + '─'.repeat(L.bodyW - 2) + '╯');

  // Command line, outside the handheld.
  r++;
  const lineW = L.cols - L.left - 1; // pad so shorter lines erase older, longer ones
  const promptPlain = `${S.user}@${fakeTerminal.host} ${pathString(S.cwd)} % `;
  const prompt = `${S.user}@${fakeTerminal.host} ` + fg(pal.accent) + pathString(S.cwd) + reset + ' % ';
  const cursor = S.blink ? fg(pal.accent) + '▌' + reset : ' ';
  put(r++, reset + prompt + S.input + cursor + ' '.repeat(Math.max(0, lineW - promptPlain.length - S.input.length - 1)));
  const legend = overflow ? '↑↓ scroll · ←→ history · tab colour · help' : '←→ history · tab colour · help';
  put(r++, fg(pal.dim) + legend.padEnd(lineW) + reset);
  out(s + reset);
}

function tooSmall(cols, rows) {
  out(clearScreen + moveTo(2, 2) + fg([0, 229, 255]) + 'Make the window a little bigger (at least 44 × 20).' + reset);
}

export async function runHandheld(name) {
  out(hideCursor + clearScreen);
  const S = {
    name,
    user: name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'guest',
    cwd: [],
    rows: [],
    scroll: 0,
    input: '',
    history: [],
    hIndex: -1,
    lit: new Set(),
    litAt: 0,
    ledOn: false,
    ledUntil: 0,
    pal: PALETTES.cyan,
    L: null,
    blink: true,
  };
  let lastSig = '';
  let dirty = true;
  // Opening screen: the home README.
  S.rows = execute('cat README.md', S, Math.min(SCREEN_MAX_W, size().cols - 8)).rows.slice(2);

  const light = (k) => { S.lit.add(k); S.litAt = Date.now(); };

  for (;;) {
    const { cols, rows } = size();
    const L = layout(cols, rows);
    if (!L) { tooSmall(cols, rows); lastSig = ''; await nextKey(FRAME_MS); continue; }
    S.L = L;
    const now = Date.now();
    if (S.lit.size && now - S.litAt > LIT_MS) S.lit.clear();
    S.ledOn = now < S.ledUntil && Math.floor(now / 120) % 2 === 0;
    S.blink = Math.floor(now / 500) % 2 === 0;
    // Redraw only when something visible changed; clear the terminal only on resize.
    const sig = `${cols}x${rows}|${S.blink}|${S.ledOn}|${[...S.lit].join()}`;
    const resized = !lastSig.startsWith(`${cols}x${rows}|`);
    if (dirty || sig !== lastSig) draw(S, resized);
    lastSig = sig;
    dirty = false;

    const key = await nextKey(FRAME_MS);
    if (!key) continue;
    dirty = true;
    switch (key.name) {
      case 'char':
        if (S.input.length < L.bodyW) S.input += key.ch;
        break;
      case 'backspace':
        light('b');
        S.input = S.input.slice(0, -1);
        break;
      case 'up': light('up'); S.scroll--; break;
      case 'down': light('down'); S.scroll++; break;
      case 'left':
      case 'right': {
        light(key.name);
        if (!S.history.length) break;
        S.hIndex = key.name === 'left' ? Math.max(0, S.hIndex < 0 ? S.history.length - 1 : S.hIndex - 1) : Math.min(S.history.length, S.hIndex + 1);
        S.input = S.history[S.hIndex] ?? '';
        if (S.hIndex >= S.history.length) S.hIndex = -1;
        break;
      }
      case 'tab':
        light('select');
        S.pal = S.pal === PALETTES.cyan ? PALETTES.green : PALETTES.cyan;
        break;
      case 'escape':
        S.input = '';
        S.hIndex = -1;
        break;
      case 'enter': {
        light('a');
        const raw = S.input;
        S.input = '';
        S.hIndex = -1;
        if (raw.trim()) S.history.push(raw);
        const res = execute(raw, S, L.w);
        if (res.exit) { out(clearScreen); exitApp(); }
        if (res.cd) S.cwd = res.cd;
        if (res.button) light(res.button);
        if (res.led) S.ledUntil = Date.now() + 900;
        if (res.rows !== null) { S.rows = res.rows; S.scroll = 0; }
        break;
      }
    }
  }
}
