# Drafts: project pages (Phase 2) — v2, restrained

Direction (2026-09-26): each project gets its own page. Pixel world, but no game
mechanics, no cards, no stats tables, no "No.01". Simple, quiet, engineering taste.
The only pixel element is the title in the 3×5 font (rendered by `src/pixel.js`);
everything else is plain monospace, one accent colour (cyan), dim grey for meta.

Screen 56 cells wide; the chosen pages need 23–26 rows, **black background**. Command input stays outside the handheld.
Decided 2026-09-26: links print the URL; screen is black, not the pale Game Boy green.

## Index — `ls projects`
A plain listing. Numbers are there so `run 1` works as well as `run dermacheck`.

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   █▀▄ █▀▄ ▄▀▄   █ █▀▀ ▄▀▀ ▀█▀ ▄▀▀                      │
│   █▀  █▀▄ █ █ ▄ █ █▀  █    █   ▀▄                      │
│   ▀   ▀ ▀  ▀   ▀  ▀▀▀  ▀▀  ▀  ▀▀                       │
│                                                        │
│   1  dermacheck         skin-lesion classifier   2025  │
│   2  moma-etl-pipeline  museum data pipeline     2024  │
│                                                        │
│                                                        │
│                                                        │
│                                                        │
│                                                        │
│                                                        │
│   run <name>                                           │
└────────────────────────────────────────────────────────┘
```

## Page draft 1 — Spec sheet  ← CHOSEN 2026-09-26
One screen, no paging. Rendered below from the real content and renderer (`npm run preview`).

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   █▀▄ █▀▀ █▀▄ █▄█ ▄▀▄ ▄▀▀ █ █ █▀▀ ▄▀▀ █ █              │
│   █ █ █▀  █▀▄ █▀█ █▀█ █   █▀█ █▀  █   █▀▄              │
│   ▀▀  ▀▀▀ ▀ ▀ ▀ ▀ ▀ ▀  ▀▀ ▀ ▀ ▀▀▀  ▀▀ ▀ ▀              │
│   Offline melanoma triage on any phone.         2026   │
│                                                        │
│   problem   Melanoma is caught late. Triage tools      │
│             need a clinic, a cloud backend, or an      │
│             app store.                                 │
│   built     Zero-shot prompt pipeline for              │
│             MedGemma-4B: clinical role, ABCDE          │
│             diagnostic framework, safety-constrained   │
│             output. No fine-tuning. Offline-first      │
│             PWA with on-device inference via ONNX      │
│             Runtime WebAssembly; model quantized       │
│             from 8 GB to under 3 GB (INT8).            │
│             Camera-capture UI, zero backend.           │
│             MedGemma-4B · ONNX Runtime Web ·           │
│             WebAssembly · PWA · Python                 │
│   result    100% sensitivity on HAM10000 (baseline     │
│             30%). A result in under 60 seconds on      │
│             any smartphone, private by architecture.   │
│             Reproducible Kaggle notebook, fixed        │
│             seeds.                                     │
│                                                        │
│   royyale.github.io/skin-lesion-pwa                    │
└────────────────────────────────────────────────────────┘
```

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   █▄█ ▄▀▄ █▄█ ▄▀▄     █▀▀ ▀█▀ █                        │
│   █▀█ █ █ █▀█ █▀█     █▀   █  █                        │
│   ▀ ▀  ▀  ▀ ▀ ▀ ▀     ▀▀▀  ▀  ▀▀▀                      │
│   MoMA's collection, cleaned and queryable.     2025   │
│                                                        │
│   problem   MoMA publishes 260 years of art history    │
│             as raw CSV files you can't query.          │
│   built     End-to-end ETL: extraction from AWS S3     │
│             into an indexed PostgreSQL schema on AWS   │
│             RDS with bulk inserts. Analysis in SQL     │
│             with CTEs and window functions.            │
│             Automated analytics in pandas,             │
│             matplotlib, and seaborn.                   │
│             Python · pandas · PostgreSQL · AWS S3 ·    │
│             AWS RDS                                    │
│   result    150,000+ artworks and 15,000+ artists      │
│             loaded. Five visualizations and CSV        │
│             reports on artist productivity,            │
│             acquisitions, and collection               │
│             composition.                               │
│                                                        │
│   github.com/royyale/moma-etl-pipeline                 │
└────────────────────────────────────────────────────────┘
```

## Page draft 2 — Pages with a diagram
Same title block, body pages with ↑↓ or ← →. Page 2 is a tiny ASCII architecture
diagram: that is the "captivating" part, and it's real engineering, not decoration.

```
┌────────────────────────────────────────────────────────┐
│                                                        │
│   █▄█ ▄▀▄ █▄█ ▄▀▄     █▀▀ ▀█▀ █                        │
│   █▀█ █ █ █▀█ █▀█     █▀   █  █                        │
│   ▀ ▀  ▀  ▀ ▀ ▀ ▀     ▀▀▀  ▀  ▀▀▀                      │
│   MoMA's public collection, cleaned and queryable.     │
│                                                        │
│   csv ──▶ clean ──▶ dedupe ──▶ postgres ──▶ dashboard  │
│   140k    pandas    fuzzy      schema +     metabase   │
│   rows              artist     indexes                 │
│                     match                              │
│                                                        │
│   Python · pandas · PostgreSQL · Metabase              │
│                                                        │
│   ← back      overview · [architecture] · result       │
└────────────────────────────────────────────────────────┘
```

## Page draft 3 — Bare README
The least chrome possible. `run dermacheck` just prints the project's README,
markdown headings in the accent colour, everything else in the default colour.
Scrolls with ↑↓. Feels like a real terminal; the pixel title is the only reminder
of the world you're in.

```
┌────────────────────────────────────────────────────────┐
│   █▀▄ █▀▀ █▀▄ █▄█ ▄▀▄ ▄▀▀ █ █ █▀▀ ▄▀▀ █ █              │
│   █ █ █▀  █▀▄ █▀█ █▀█ █   █▀█ █▀  █   █▀▄              │
│   ▀▀  ▀▀▀ ▀ ▀ ▀ ▀ ▀ ▀  ▀▀ ▀ ▀ ▀▀▀  ▀▀ ▀ ▀              │
│                                                        │
│   # Dermacheck                                         │
│   Melanoma screening from a phone photo.               │
│                                                        │
│   ## Why                                               │
│   Early melanoma is missed because people don't        │
│   know what to look for. A phone camera is enough      │
│   signal for a first screen.                           │
│                                                        │
│   ## How                                               │
│   Fine-tuned ResNet-18 on HAM10000 (10k dermoscopy   ▒ │
│   ~/projects/dermacheck/README.md            1-11/38   │
└────────────────────────────────────────────────────────┘
```

## What all three share
- Title in the pixel font, then a one-line pitch. Nothing else is decorated.
- One accent colour (cyan) for the title and section labels; meta (year, path, footer) dim.
- No button legend spam. One quiet footer line.
- Content per project lives in `src/content.js` (or one file per project).
- The pulsing pixel icon from SPEC §6 is dropped unless it earns its place.

## Open decisions
- Draft 1 (one screen) vs 2 (pages + diagram) vs 3 (README). 1 and 2 can be the same
  code path: a project with one page is draft 1, with several is draft 2.
- Fields per project: name, year, pitch, problem / built / result (or free pages), stack, links.
