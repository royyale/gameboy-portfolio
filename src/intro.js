// Phase 1a: the fake macOS terminal. The visitor types `whoami`, gives a name, and we move on.
// Returns the visitor's name.
import { out, nextKey, clearScreen, fg, reset, exitApp } from './term.js';
import * as C from './content.js';

const GREEN = [0, 255, 65];
const DIM_GREEN = [0, 130, 45];

class Skip extends Error {}

const { user, host, tty } = C.fakeTerminal;
const shellPrompt = () => `${user}@${host} ~ % `;
const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');

function lastLogin() {
  const d = new Date();
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
  const p = (n) => String(n).padStart(2, '0');
  return `${day} ${mon} ${String(d.getDate()).padStart(2, ' ')} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Minimal line editor. Returns { line } or { idle: true } if nothing was typed within idleMs. */
async function readLine({ idleMs, allowSkip = false } = {}) {
  let buf = '';
  let typed = false;
  const t0 = Date.now();
  for (;;) {
    const remaining = idleMs !== undefined && !typed ? Math.max(0, idleMs - (Date.now() - t0)) : undefined;
    const key = await nextKey(remaining);
    if (!key) return { idle: true };
    if (key.name === 'enter') {
      out('\r\n');
      return { line: buf };
    }
    if (key.name === 'escape' && allowSkip) throw new Skip();
    if (key.name === 'backspace' && buf) {
      buf = buf.slice(0, -1);
      out('\b \b');
    } else if (key.name === 'char' && buf.length < 60) {
      typed = true;
      buf += key.ch;
      out(key.ch);
    }
  }
}

/** A few commands answer like a real zsh so the disguise holds. `whoami` is handled by the caller. */
function fakeShell(raw) {
  const [cmd, ...args] = raw.trim().split(/\s+/);
  const say = (s) => out(s + '\r\n');
  switch (cmd) {
    case undefined:
    case '':
    case 'cd':
      return;
    case 'pwd': return say(`/Users/${user}`);
    case 'ls': return say('Desktop\tDocuments\tDownloads\tportfolio');
    case 'echo': return say(args.join(' '));
    case 'clear': return out(clearScreen);
    case 'exit': return exitApp();
    case 'open': return say(`The file /Users/${user}/${args.join(' ')} does not exist.`);
    default: return say(`zsh: command not found: ${cmd}`);
  }
}

const showHint = () => out(fg(DIM_GREEN) + C.whoamiHint + reset + '\r\n');

/** Shell prompt loop until the visitor types `whoami`. Idling once, or any other command, earns the hint. */
async function promptForWhoami() {
  let idleMs = C.fakeTerminal.idleBeforeHintMs;
  for (;;) {
    out(shellPrompt());
    const { line, idle } = await readLine({ idleMs, allowSkip: true });
    idleMs = undefined; // the idle hint shows once; after that only commands trigger it
    if (idle) {
      out('\r\n');
      showHint();
      continue;
    }
    if (norm(line) === 'whoami') return;
    if (line.trim()) {
      fakeShell(line);
      showHint();
    }
  }
}

async function askName() {
  for (;;) {
    out(fg(GREEN) + C.namePrompt);
    const { line } = await readLine();
    out(reset);
    const name = line.replace(/\s+/g, ' ').trim().slice(0, 20);
    if (name) return name;
    out(fg(DIM_GREEN) + C.emptyNameRetry + reset + '\r\n');
  }
}

export async function runIntro() {
  out(clearScreen + `Last login: ${lastLogin()} on ${tty}\r\n`);
  try {
    await promptForWhoami();
  } catch (e) {
    if (!(e instanceof Skip)) throw e;
    out('\r\n'); // Esc skips straight to the name prompt
  }
  return askName();
}
