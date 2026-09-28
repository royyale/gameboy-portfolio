#!/usr/bin/env node
import { start } from '../src/term.js';
import { runIntro } from '../src/intro.js';
import { matrixIntro } from '../src/matrix.js';
import { runHandheld } from '../src/handheld.js';

start();
const name = await runIntro();
await matrixIntro(name);
await runHandheld(name);
