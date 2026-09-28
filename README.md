# royyale

Bryson Royale's portfolio, a Game Boy in your terminal.

You start in a fake macOS terminal. Type `whoami`, enter your name, and the handheld boots
after a Matrix-style title card. Then explore the projects with real shell commands.

## Run it

Requires Node 18 or newer.

```sh
git clone https://github.com/royyale/gameboy-portfolio.git
cd gameboy-portfolio
npm start
```

Use a terminal window of at least 100 x 40 cells so the whole handheld fits.

## Commands

| Command | What it does |
|---|---|
| `help` | show the legend |
| `ls projects` | list the projects |
| `run 1` or `run dermacheck` | open a project page |
| `cat <file>`, `cd <dir>`, `tree`, `find <term>` | move around like a real shell |
| `contact` | email and links |
| `exit` | quit |

Arrow keys up and down scroll a long page, left and right step through command history,
Tab toggles the accent colour, and Esc clears the input line.

## Project layout

- `bin/royyale.js` entry point
- `src/content.js` all text: intro, projects, skills, contact
- `src/handheld.js` draws the Game Boy and runs the command loop
- `src/shell.js` the commands
- `src/page.js` project pages (`npm run preview` to iterate on them)
- `SPEC.md` the living design spec

## Contact

brysonroyale@brandeis.edu · [linkedin.com/in/bryson-royale-72479a2b4](https://linkedin.com/in/bryson-royale-72479a2b4) · [github.com/royyale](https://github.com/royyale)
