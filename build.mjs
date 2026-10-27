// Builds the widget from src/. core.js is the widget itself; it is inlined into
//   widget.js   the embed script (embed.js): plain ES5, finds .random-bible-verse containers
//   index.js    the npm module (index.js): mount(), destroy() and <random-bible-verse>
// react.js, the type definitions and the Window style's photo are copied as they are.
//
// Usage: node build.mjs [--embed <dir>]...   writes dist/ next to this file; every --embed dir
// also gets the embed script and the photo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(here, f), 'utf8');

const core = read('src/core.js');
const inline = (file, indent) => {
  const src = read(file);
  const marker = indent + '/* @core */\n';
  if (!src.includes(marker)) throw new Error(`${file}: no ${marker.trim()} marker`);
  const body = core
    .split('\n')
    .map((line) => (line ? indent + line : line))
    .join('\n');
  // A replacer function: a string replacement would expand $&, $' and $$ found in the core.
  return src.replace(marker, () => body);
};

const files = {
  'widget.js': inline('src/embed.js', '  '),
  'index.js': inline('src/index.js', ''),
  'react.js': read('src/react.js'),
  'index.d.ts': read('src/index.d.ts'),
  'react.d.ts': read('src/react.d.ts'),
  'widget-photo.webp': fs.readFileSync(path.join(here, 'assets/widget-photo.webp')),
};
const EMBED = ['widget.js', 'widget-photo.webp'];

const write = (out, names) => {
  fs.mkdirSync(out, { recursive: true });
  for (const name of names) fs.writeFileSync(path.join(out, name), files[name]);
  console.log('built', path.relative(process.cwd(), out) || '.');
};

// dist/ is what npm publishes, so it starts empty: a file dropped from src/ must not linger there.
const dist = path.join(here, 'dist');
fs.rmSync(dist, { recursive: true, force: true });
write(dist, Object.keys(files));
const args = process.argv.slice(2);
args.forEach((a, i) => {
  if (a !== '--embed') return;
  if (!args[i + 1]) throw new Error('--embed needs a directory');
  write(path.resolve(args[i + 1]), EMBED);
});
