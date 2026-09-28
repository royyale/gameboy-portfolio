# Terminal Portfolio: Design Spec (v4)

Owner: Bryson Royale · brysonroyale@brandeis.edu · linkedin.com/in/bryson-royale-72479a2b4 · github.com/royyale

> Living document. `TBD` marks open decisions.

## 1. Audience & goal
- Audience: recruiters, clients, friends, and the owner (for fun).
- Goal: visitors explore real projects in a way that shows personality. The Game Boy is the aesthetic; the work is the point.
- Contact must be frictionless: one step to reach email.

## 2. Flow (Phase 1: BUILT)
1. **Fake macOS terminal.** Shows `Last login: …` and the prompt `guest@royyale ~ %` (placeholder, TBD). A few commands answer like real zsh.
2. **Hint.** After 2 s idle, or after any command that isn't `whoami`, a dim line says "Type: whoami". No Matrix dialogue before this (the wake-up / white-rabbit / identify scenes were cut on 2026-09-26 as unnecessary chatter).
3. **`whoami`.** Asks "Enter your name:". The name is kept for the rest of the session. Saving it across visits: `TBD`.
4. **Portfolio screen.** Straight into Matrix rain: a Tron-style neon box traces itself in, the title types out in pixel letters, a neon line draws under it, then the subtitle and "Welcome to the grid, <name>." appear.
5. **Enter** boots the handheld (Phase 2).
- **Skip:** Esc jumps to the name prompt. Any key fast-forwards the title card.
- All text is editable in `src/content.js`.

## 3. Layout (Phase 2: BUILT, first pass)
- Full handheld drawn: body, black screen, D-pad, A/B, SELECT/START, power LED in the top edge. Body colour: grey placeholder, `TBD`.
- The screen sizes itself to the terminal (max 56 wide); long pages scroll with a thin scrollbar. Minimum window about 44×20, else a "make the window bigger" notice.
- **Command input:** outside the handheld, below it, with a blinking block cursor. Prompt is `<visitor>@royyale ~/path %`.
- **Game Boy screen:** shows the result of the last command (each command replaces the screen; `clear` empties it). Opens on `~/README.md`.
- **Keys and buttons (changed 2026-09-26 from the earlier approved mapping):**

| Key | Button lit | Does |
|---|---|---|
| Enter | A | run the command |
| Backspace | B | delete |
| ↑ / ↓ | D-pad | scroll the screen when a page overflows |
| ← / → | D-pad | command history |
| Tab | SELECT | toggle accent colour (cyan ↔ Matrix green) |
| `help` | START | show the legend |
| `find` | power LED | LED blinks for a moment during a search |
| Esc | | clear the input line |

## 4. Filesystem
```
~/
├── README.md              short intro + "start with" hints
├── projects/
│   ├── dermacheck/        README.md, link.txt
│   └── moma-etl-pipeline/ README.md, link.txt
├── skills/skills.txt
├── volunteer/americorps/README.md
└── contact.txt
```
Built from `src/content.js` by `src/fs.js`. Class president excluded.

## 5. Commands
Every command appears in the `help` legend. Code: `src/shell.js`.

| Input | Result |
|---|---|
| `whoami` | In the fake terminal, asks the visitor's name. Inside the handheld, "<name>. Visiting Bryson Royale's portfolio." |
| `ls [dir]` | Lists a folder. In `~/projects` the entries are numbered with a one-line description. |
| `cd <dir>` | Changes folder and lists it. |
| `cat <file>` | Prints a file; `#` headings in the accent colour. |
| `tree` | Shows the folder structure. |
| `find <term>` | Searches names and file contents, shows path plus a snippet. |
| `run <project>` | Opens the project's page (`run 1`, `run dermacheck`). `open` is an alias. |
| `contact` | Pixel "CONTACT" title, then email and links printed as text. |
| `help` | Shows the command legend. |
| `clear` | Clears the screen. |
| `exit` | Quits. |

## 6. Project entry screen
- Each project has its own page on the Game Boy screen.
- **Black background**, terminal-style. Not the classic pale Game Boy screen.
- Only pixel element: the project title in the 3×5 pixel font, cyan. Everything else plain monospace; meta (year, path, footer) dim grey.
- Content: one-line pitch, then what was built and accomplished. No cards, stats tables, HP bars, button legends, or pulsing icon.
- **Links print the URL** (no shelling out to `open`).
- Layout: Draft 1 "spec sheet" (chosen 2026-09-26), see `drafts/projects-screen.md`. Renderer: `src/page.js`; preview with `npm run preview`.
- Screen needs ~56×26 cells to fit the longest page (DermaCheck); the handheld body will need a tall terminal or a wider screen. Content lives in `src/content.js` (`projects`, `skills`, `volunteer`).

## 7. Visual style
- Game Boy form factor with Tron neon effects.
- Palette: Matrix green for rain and dialogue, Tron cyan for UI and titles (placeholder, TBD). Body colour: `TBD`.

## 8. Distribution: how visitors run it
Dev: `npm start` runs the whole thing; `npm run preview` shows project pages alone.
`npx royyale` (Node, zero dependencies; the npm name was free on 2026-09-26). Publishing: not done yet.
