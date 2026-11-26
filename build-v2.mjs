// Build the preview from the homepage so every section after the opening stays in sync.
import { readFileSync, writeFileSync } from 'node:fs';

const homepage = readFileSync('index.html', 'utf8');
const opening = readFileSync('test/v2/opening.html', 'utf8');
const handoff = '<section class="act" id="hero">';
if (!homepage.includes(handoff)) throw new Error('Cannot locate the homepage cast scene');

const preview = homepage
  .replace('</head>', '<meta name="robots" content="noindex">\n<link rel="stylesheet" href="/test/v2/opening.css">\n</head>')
  .replace(handoff, () => opening + '\n<script src="/test/v2/opening.js" defer></script>\n' + handoff);
writeFileSync('test/v2/index.html', preview);
