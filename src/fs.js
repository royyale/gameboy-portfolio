// Virtual filesystem for the handheld, built from content.js.
// Directories: { type: 'dir', children }.  Files: { type: 'file', text }.
import { owner, projects, skills, volunteer } from './content.js';

const file = (text) => ({ type: 'file', text: text.trim() });
const dir = (children) => ({ type: 'dir', children });

const projectReadme = (p) => `
# ${p.name}  (${p.year})
${p.pitch}

## Problem
${p.problem}

## Built
${p.built}

Stack: ${p.stack.join(', ')}

## Result
${p.result}

${p.link}
`;

export const root = dir({
  'README.md': file(`
# ${owner.name}
Data and AI/ML engineer. This is a portfolio you can walk around in.

Start with: ls projects · run 1 · contact · help
`),
  projects: dir(
    Object.fromEntries(
      projects.map((p) => [
        p.slug,
        dir({
          'README.md': file(projectReadme(p)),
          'link.txt': file(p.link),
        }),
      ]),
    ),
  ),
  skills: dir({
    'skills.txt': file(`
Languages:          ${skills.languages.join(', ')}
Cloud & Databases:  ${skills.cloud.join(', ')}
Data & Analytics:   ${skills.data.join(', ')}
Tools:              ${skills.tools.join(', ')}
`),
  }),
  volunteer: dir({
    [volunteer.slug]: dir({
      'README.md': file(`
# ${volunteer.name}  (${volunteer.year})
${volunteer.pitch}

${volunteer.body}
`),
    }),
  }),
  'contact.txt': file(`
${owner.name}
email     ${owner.email}
linkedin  ${owner.linkedin}
github    ${owner.github}
`),
});

/** Normalise a path (array of segments) against cwd. '~' and '/' both mean home. */
export function resolve(cwd, input) {
  let parts = input === undefined || input === '' ? [...cwd] : /^[~/]/.test(input) ? [] : [...cwd];
  for (const seg of (input || '').replace(/^[~/]+/, '').split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts;
}

export function nodeAt(parts) {
  let n = root;
  for (const seg of parts) {
    if (n.type !== 'dir' || !n.children[seg]) return null;
    n = n.children[seg];
  }
  return n;
}

export const pathString = (parts) => '~' + (parts.length ? '/' + parts.join('/') : '');

/** Depth-first list of [parts, node] for every entry. */
export function walk(parts = [], node = root, acc = []) {
  if (node.type === 'dir') {
    for (const [name, child] of Object.entries(node.children)) {
      const p = [...parts, name];
      acc.push([p, child]);
      walk(p, child, acc);
    }
  }
  return acc;
}
