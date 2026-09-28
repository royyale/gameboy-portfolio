#!/usr/bin/env node
// Dev preview: draws a project page on a black "screen" in the middle of the terminal.
// Usage: npm run preview [slug]     ← → switch project · q / Esc quit
import { start, exitApp, out, clearScreen, size, moveTo, fg, bg, reset, nextKey, hideCursor } from '../src/term.js';
import { projectPage, paint, SCREEN } from '../src/page.js';
import { projects } from '../src/content.js';

const W = 56; // screen width in cells (SPEC: ≈56×16; height grows to fit for now)
start();
out(hideCursor);
let i = Math.max(0, projects.findIndex((p) => p.slug === process.argv[2]));

function draw() {
  const { cols, rows } = size();
  const w = Math.min(W, cols - 2);
  const lines = paint(projectPage(projects[i], w), w);
  const h = lines.length + 2;
  const left = Math.max(1, ((cols - w) / 2) | 0) + 1;
  const top = Math.max(1, ((rows - h) / 2) | 0) + 1;
  out(clearScreen);
  const edge = fg([60, 60, 60]) + bg(SCREEN.black);
  out(moveTo(top - 1, left - 1) + edge + '┌' + '─'.repeat(w) + '┐' + reset);
  lines.forEach((l, r) => out(moveTo(top + r, left - 1) + edge + '│' + reset + l + edge + '│' + reset));
  const footer = `${i + 1}/${projects.length}  ← →`;
  out(moveTo(top + lines.length, left - 1) + edge + '│' + bg(SCREEN.black) + fg(SCREEN.dim) + footer.padStart(w - 3).padEnd(w) + edge + '│' + reset);
  out(moveTo(top + lines.length + 1, left - 1) + edge + '└' + '─'.repeat(w) + '┘' + reset);
  out(moveTo(rows, 1) + fg([90, 90, 90]) + `screen ${w}×${lines.length + 1}   q quit` + reset);
}

draw();
for (;;) {
  const k = await nextKey();
  if (k.name === 'escape' || (k.name === 'char' && k.ch === 'q')) exitApp();
  if (k.name === 'right' || k.name === 'down') i = (i + 1) % projects.length;
  if (k.name === 'left' || k.name === 'up') i = (i - 1 + projects.length) % projects.length;
  draw();
}
