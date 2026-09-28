// Low-level terminal helpers: raw input, ANSI output, colors, cleanup.
import process from 'node:process';

const CSI = '\x1b[';

export const out = (s) => process.stdout.write(s);
export const size = () => ({
  cols: process.stdout.columns || 80,
  rows: process.stdout.rows || 24,
});
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- colors ----------
const TRUECOLOR = /truecolor|24bit/i.test(process.env.COLORTERM || '');
const to256 = (r, g, b) => {
  const q = (v) => Math.round((v / 255) * 5);
  return 16 + 36 * q(r) + 6 * q(g) + q(b);
};
export const fg = ([r, g, b]) =>
  TRUECOLOR ? `${CSI}38;2;${r};${g};${b}m` : `${CSI}38;5;${to256(r, g, b)}m`;
export const bg = ([r, g, b]) =>
  TRUECOLOR ? `${CSI}48;2;${r};${g};${b}m` : `${CSI}48;5;${to256(r, g, b)}m`;

export const reset = `${CSI}0m`;
export const bold = `${CSI}1m`;
export const clearScreen = `${CSI}2J${CSI}H`;
export const moveTo = (row, col) => `${CSI}${row};${col}H`; // 1-based
export const hideCursor = `${CSI}?25l`;
export const showCursor = `${CSI}?25h`;
const altScreenOn = `${CSI}?1049h`;
const altScreenOff = `${CSI}?1049l`;

// ---------- input ----------
// Keys are objects: { name: 'char', ch } | { name: 'enter' | 'backspace' | 'escape' | 'up' | 'down' | 'left' | 'right' | 'tab' }
const queue = [];
let waiter = null;

function parse(data) {
  const keys = [];
  for (let i = 0; i < data.length; i++) {
    const c = data[i];
    if (c === '\x1b') {
      const next = data[i + 1];
      if (next === '[' || next === 'O') {
        let j = i + 2;
        while (j < data.length && !/[A-Za-z~]/.test(data[j])) j++;
        const final = data[j];
        keys.push({ name: { A: 'up', B: 'down', C: 'right', D: 'left' }[final] || 'other' });
        i = j;
      } else {
        keys.push({ name: 'escape' });
      }
    } else if (c === '\r' || c === '\n') keys.push({ name: 'enter' });
    else if (c === '\x7f' || c === '\b') keys.push({ name: 'backspace' });
    else if (c === '\t') keys.push({ name: 'tab' });
    else if (c === '\x03' || c === '\x04') keys.push({ name: 'quit' });
    else if (c >= ' ') keys.push({ name: 'char', ch: c });
  }
  return keys;
}

function push(key) {
  if (key.name === 'quit') return exitApp();
  if (waiter) {
    const w = waiter;
    waiter = null;
    w(key);
  } else queue.push(key);
}

/** Resolve with the next key, or null after timeoutMs (if given). */
export function nextKey(timeoutMs) {
  if (queue.length) return Promise.resolve(queue.shift());
  return new Promise((resolve) => {
    let timer;
    waiter = (key) => {
      clearTimeout(timer);
      resolve(key);
    };
    if (timeoutMs !== undefined) {
      timer = setTimeout(() => {
        waiter = null;
        resolve(null);
      }, timeoutMs);
    }
  });
}

export const drainKeys = () => void (queue.length = 0);

/** Put a key back so the next nextKey() returns it. */
export const unreadKey = (key) => void queue.unshift(key);

// ---------- lifecycle ----------
let restored = false;
function restore() {
  if (restored) return;
  restored = true;
  out(reset + showCursor + altScreenOff);
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
}

export function exitApp(code = 0) {
  restore();
  process.exit(code);
}

export function start() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error('This portfolio needs an interactive terminal window (like Terminal or iTerm).\nOpen one and run: npx royyale');
    process.exit(1);
  }
  process.stdin.setRawMode(true);
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => parse(d).forEach(push));
  process.stdin.resume();
  process.on('exit', restore);
  process.on('SIGTERM', () => exitApp(0));
  process.on('uncaughtException', (err) => {
    restore();
    console.error(err);
    process.exit(1);
  });
  out(altScreenOn + clearScreen);
}
