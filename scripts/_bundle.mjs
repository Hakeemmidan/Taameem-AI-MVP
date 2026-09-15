/** Bundles the TypeScript data layer into plain ESM so Node scripts can read it. */
import { build } from 'esbuild';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const out = join(here, '_data.generated.mjs');

export async function loadData() {
  await build({
    entryPoints: [join(root, 'src', 'data', 'index.ts')],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    outfile: out,
    logLevel: 'error',
    alias: { '@': join(root, 'src') },
  });
  return import(pathToFileURL(out).href);
}
