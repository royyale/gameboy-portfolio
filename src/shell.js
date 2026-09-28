// Commands for the handheld. Each command returns a screen: rows of segments (see page.js),
// plus optional effects: { cd, exit, theme, led, button }.
import { owner, projects } from './content.js';
import { resolve, nodeAt, pathString, walk, root } from './fs.js';
import { projectPage, wrap, PAD, titleRows } from './page.js';

export const COMMANDS = [
  ['help', 'this legend'],
  ['ls [dir]', 'list a folder'],
  ['cd <dir>', 'change folder'],
  ['cat <file>', 'print a file'],
  ['tree', 'the whole folder structure'],
  ['find <term>', 'search names and file contents'],
  ['run <project>', 'open a project page (name or number)'],
  ['contact', 'email and links'],
  ['whoami', 'who you told me you are'],
  ['clear', 'clear the screen'],
  ['exit', 'quit'],
];

const T = (text, color = 'text') => ({ color, text });
const line = (...segs) => segs;
const para = (text, width, color = 'text') => wrap(text, width).map((l) => line(T(l, color)));
const err = (msg, width) => para(msg, width, 'dim');

/** Find a project by slug, name, or 1-based index. */
export function findProject(arg) {
  if (!arg) return null;
  const n = Number(arg);
  if (Number.isInteger(n) && projects[n - 1]) return projects[n - 1];
  const a = arg.toLowerCase().replace(/\/$/, '');
  return projects.find((p) => p.slug === a || p.name.toLowerCase() === a || p.title.toLowerCase() === a) || null;
}

function lsRows(parts, node, width) {
  const rows = [];
  const names = Object.keys(node.children);
  const inProjects = parts.length === 1 && parts[0] === 'projects';
  names.forEach((name, i) => {
    const child = node.children[name];
    if (child.type === 'dir') {
      const p = inProjects ? findProject(name) : null;
      if (p) {
        rows.push(line(T(`${i + 1}  ${name}/`.padEnd(24), 'accent'), T(p.short, 'dim')));
      } else rows.push(line(T(name + '/', 'accent')));
    } else rows.push(line(T(name)));
  });
  return rows;
}

function treeRows() {
  const rows = [line(T('~/', 'accent'))];
  const rec = (node, prefix) => {
    const entries = Object.entries(node.children);
    entries.forEach(([name, child], i) => {
      const last = i === entries.length - 1;
      const isDir = child.type === 'dir';
      rows.push(line(T(prefix + (last ? '└── ' : '├── '), 'dim'), T(name + (isDir ? '/' : ''), isDir ? 'accent' : 'text')));
      if (isDir) rec(child, prefix + (last ? '    ' : '│   '));
    });
  };
  rec(root, '');
  return rows;
}

/** Render a file's text: markdown '#' headings in accent, blank lines kept, else wrapped. */
function fileRows(text, width) {
  const rows = [];
  for (const raw of text.split('\n')) {
    if (raw.trim() === '') rows.push(line());
    else if (/^#+\s/.test(raw)) rows.push(line(T(raw.replace(/^#+\s/, ''), 'accent')));
    else rows.push(...para(raw, width - PAD * 2));
  }
  return rows;
}

function helpRows(width) {
  const rows = [line(T('commands', 'accent')), line()];
  for (const [cmd, what] of COMMANDS) rows.push(line(T(cmd.padEnd(16), 'accent'), T(what)));
  rows.push(line(), ...para('↑↓ scroll · ←→ command history · tab colour · esc clear line', width - PAD * 2, 'dim'));
  return rows;
}

function contactRows(width) {
  const inner = width - PAD * 2;
  return [
    ...titleRows('CONTACT', inner),
    line(),
    line(T(owner.name)),
    line(),
    line(T('email     ', 'accent'), T(owner.email)),
    line(T('linkedin  ', 'accent'), T(owner.linkedin.replace(/^https?:\/\/(www\.)?/, ''))),
    line(T('github    ', 'accent'), T(owner.github.replace(/^https?:\/\/(www\.)?/, ''))),
  ];
}

function findRows(term, width) {
  const q = term.toLowerCase();
  const hits = walk().filter(([parts, node]) => parts.at(-1).toLowerCase().includes(q) || (node.type === 'file' && node.text.toLowerCase().includes(q)));
  if (!hits.length) return err(`nothing matches "${term}"`, width - PAD * 2);
  const rows = [line(T(`${hits.length} match${hits.length === 1 ? '' : 'es'} for "${term}"`, 'dim')), line()];
  for (const [parts, node] of hits) {
    rows.push(line(T(pathString(parts) + (node.type === 'dir' ? '/' : ''), node.type === 'dir' ? 'accent' : 'text')));
    if (node.type === 'file') {
      const i = node.text.toLowerCase().indexOf(q);
      if (i >= 0) {
        const ctx = node.text.slice(Math.max(0, i - 25), i + 35).replace(/\s+/g, ' ').trim();
        rows.push(...wrap('…' + ctx + '…', width - PAD * 2 - 2).map((l) => line(T('  ' + l, 'dim'))));
      }
    }
  }
  return rows;
}

/**
 * Execute a command line. state = { cwd: string[], name }.
 * Returns { rows, cd?, exit?, theme?, led?, button? }.
 */
export function execute(raw, state, width) {
  const w = width - PAD * 2;
  const [cmd, ...args] = raw.trim().split(/\s+/);
  const arg = args.join(' ');
  const echo = line(T(`${pathString(state.cwd)} % ${raw.trim()}`, 'dim'));
  const withEcho = (rows, extra = {}) => ({ rows: [echo, line(), ...rows], ...extra });

  switch ((cmd || '').toLowerCase()) {
    case '':
      return { rows: null };
    case 'help':
    case '?':
      return withEcho(helpRows(width), { button: 'start' });
    case 'clear':
      return { rows: [] };
    case 'exit':
    case 'quit':
      return { rows: [], exit: true };
    case 'pwd':
      return withEcho([line(T(pathString(state.cwd)))]);
    case 'whoami':
      return withEcho(para(`${state.name}. Visiting ${owner.name}'s portfolio.`, w));
    case 'contact':
    case 'email':
      return withEcho(contactRows(width));
    case 'tree':
      return withEcho(treeRows());
    case 'ls':
    case 'dir': {
      const parts = resolve(state.cwd, arg);
      const node = nodeAt(parts);
      if (!node) return withEcho(err(`ls: no such file or directory: ${arg}`, w));
      if (node.type === 'file') return withEcho([line(T(parts.at(-1)))]);
      return withEcho(lsRows(parts, node, width));
    }
    case 'cd': {
      const parts = resolve(state.cwd, arg);
      const node = nodeAt(parts);
      if (!node) return withEcho(err(`cd: no such directory: ${arg}`, w));
      if (node.type !== 'dir') return withEcho(err(`cd: not a directory: ${arg}`, w));
      return { rows: [line(T(`${pathString(parts)} %`, 'dim')), line(), ...lsRows(parts, node, width)], cd: parts };
    }
    case 'cat':
    case 'less':
    case 'more': {
      if (!arg) return withEcho(err('cat: which file?', w));
      const parts = resolve(state.cwd, arg);
      const node = nodeAt(parts);
      if (!node) return withEcho(err(`cat: no such file: ${arg}`, w));
      if (node.type === 'dir') return withEcho(err(`cat: ${arg} is a directory. Try ls ${arg}`, w));
      return withEcho(fileRows(node.text, width));
    }
    case 'find':
    case 'grep':
    case 'search':
      if (!arg) return withEcho(err('find: what should I look for?', w));
      return withEcho(findRows(arg, width), { led: true });
    case 'run':
    case 'open':
    case 'start': {
      const p = findProject(arg) || (state.cwd[0] === 'projects' && state.cwd[1] && !arg ? findProject(state.cwd[1]) : null);
      if (!p) return withEcho(err(arg ? `run: no project called "${arg}". Try ls projects` : 'run: which project? Try ls projects', w));
      return { rows: projectPage(p, width), button: 'a' };
    }
    default:
      return withEcho(err(`command not found: ${cmd}. Type help`, w));
  }
}
