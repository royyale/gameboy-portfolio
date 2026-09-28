// ============================================================
//  ALL EDITABLE TEXT LIVES HERE.
// ============================================================

export const owner = {
  name: 'Bryson Royale',
  email: 'brysonroyale@brandeis.edu',
  linkedin: 'https://www.linkedin.com/in/bryson-royale-72479a2b4/',
  github: 'https://github.com/royyale',
};

// The fake macOS terminal the visitor lands in.
export const fakeTerminal = {
  user: 'guest', // TBD — placeholder
  host: 'royyale', // TBD — placeholder
  tty: 'ttys000',
  idleBeforeHintMs: 2000, // how long the plain terminal sits before the `whoami` hint appears
};

// 1) Shown (dim) after the visitor idles, or after any command that isn't `whoami`.
export const whoamiHint = 'Type: whoami';

// 2) `whoami` asks the visitor for their name.
export const namePrompt = 'Enter your name: ';
export const emptyNameRetry = 'Everyone has a name. Try again.';

// 3) Matrix rain + title card.
export const titleCard = {
  title: 'BRYSON ROYALE',
  subtitle: 'PORTFOLIO v1.0',
  tagline: (name) => `Welcome to the grid, ${name}.`,
  continuePrompt: '▶ PRESS ENTER TO BOOT',
};

// ============================================================
//  PROJECT PAGES (Draft 1: spec sheet). Text condensed from the resume, 2026-09-26.
//  Each project is one page: pixel title, pitch, problem / built / result, stack, link.
//  Sentences wrap automatically; keep each field to a few sentences.
// ============================================================
export const projects = [
  {
    slug: 'dermacheck',
    title: 'DERMACHECK',
    name: 'DermaCheck',
    year: '2026',
    short: 'offline melanoma triage',
    pitch: 'Offline melanoma triage on any phone.',
    problem: 'Melanoma is caught late. Triage tools need a clinic, a cloud backend, or an app store.',
    built:
      'Zero-shot prompt pipeline for MedGemma-4B: clinical role, ABCDE diagnostic framework, safety-constrained output. No fine-tuning. Offline-first PWA with on-device inference via ONNX Runtime WebAssembly; model quantized from 8 GB to under 3 GB (INT8). Camera-capture UI, zero backend.',
    result:
      '100% sensitivity on HAM10000 (baseline 30%). A result in under 60 seconds on any smartphone, private by architecture. Reproducible Kaggle notebook, fixed seeds.',
    stack: ['MedGemma-4B', 'ONNX Runtime Web', 'WebAssembly', 'PWA', 'Python'],
    link: 'royyale.github.io/skin-lesion-pwa',
  },
  {
    slug: 'moma-etl-pipeline',
    title: 'MOMA ETL',
    name: 'MoMA Collection ETL Pipeline',
    year: '2025',
    short: 'museum data pipeline',
    pitch: "MoMA's collection, cleaned and queryable.",
    problem: "MoMA publishes 260 years of art history as raw CSV files you can't query.",
    built:
      'End-to-end ETL: extraction from AWS S3 into an indexed PostgreSQL schema on AWS RDS with bulk inserts. Analysis in SQL with CTEs and window functions. Automated analytics in pandas, matplotlib, and seaborn.',
    result:
      '150,000+ artworks and 15,000+ artists loaded. Five visualizations and CSV reports on artist productivity, acquisitions, and collection composition.',
    stack: ['Python', 'pandas', 'PostgreSQL', 'AWS S3', 'AWS RDS'],
    link: 'github.com/royyale/moma-etl-pipeline',
  },
];

// ~/skills
export const skills = {
  languages: ['Python', 'SQL'],
  cloud: ['AWS S3', 'AWS RDS', 'PostgreSQL'],
  data: ['pandas', 'matplotlib', 'seaborn'],
  tools: ['Git', 'GitHub'],
};

// ~/volunteer/americorps
export const volunteer = {
  slug: 'americorps',
  title: 'AMERICORPS',
  name: 'AmeriCorps Member, Chicago Hopes for Kids',
  year: '2025 - 2026',
  pitch: 'Educational support for children experiencing homelessness in Chicago.',
  body:
    "Chicago's only organization providing specialized educational support to children experiencing homelessness: individualized academic assistance and literacy support to 325+ students a year across shelter sites. Formal reading assessments to track progress and shape personalized learning. Curriculum development, field trips, and community outreach. Social-Emotional Learning and trauma-informed practice.",
};
