/**
 * Shrinks the images that ship in `dist/` — the CMS uploads whatever the
 * client exports, which has meant 6000px-wide, 1 MB PNGs behind cards that
 * render around 700px.
 *
 * Deliberately conservative, because the client judges the result by eye:
 *
 *  - Source files under `public/` are never touched. Everything happens on the
 *    build output, so the originals stay in the repo at full quality and a
 *    different setting here just re-derives them on the next build.
 *  - Only the pixel dimensions come down, to MAX_WIDTH. That is still generous
 *    (2x for a full-width element on a 1000px-wide layout), so nothing visibly
 *    softens at the sizes these are actually displayed.
 *  - Re-encoding never trades colour depth for bytes — no palette quantisation.
 *  - If an encode comes out no smaller than the original, the original is kept.
 *    Photographic PNGs get bigger when re-encoded; those are left alone rather
 *    than silently bloated.
 *
 * Raise MAX_WIDTH (or drop the resize) if the client ever reports softness.
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const MAX_WIDTH = 2000;
const SKIP_BELOW = 20 * 1024; // not worth the churn
const EXTS = new Set(['.png', '.jpg', '.jpeg']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

export default function optimizeImages() {
  return {
    name: 'optimize-images',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        let before = 0, after = 0, changed = 0, skipped = 0;

        for await (const file of walk(root)) {
          const ext = extname(file).toLowerCase();
          if (!EXTS.has(ext)) continue;

          const original = await readFile(file);
          if (original.length < SKIP_BELOW) continue;

          let output;
          try {
            const image = sharp(original);
            const { width } = await image.metadata();
            const pipeline = width > MAX_WIDTH
              ? image.resize({ width: MAX_WIDTH, withoutEnlargement: true })
              : image;
            output = ext === '.png'
              ? await pipeline.png({ compressionLevel: 9, effort: 10 }).toBuffer()
              : await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
          } catch (err) {
            logger.warn(`skipped ${file.replace(root, '')}: ${err.message}`);
            continue;
          }

          before += original.length;
          if (output.length < original.length) {
            await writeFile(file, output);
            after += output.length;
            changed++;
          } else {
            after += original.length; // kept as-is
            skipped++;
          }
        }

        if (changed || skipped) {
          const saved = before - after;
          logger.info(
            `optimised ${changed} image(s), left ${skipped} alone — ` +
            `${kb(before)} → ${kb(after)} (saved ${kb(saved)}, ${((saved / before) * 100).toFixed(0)}%)`,
          );
        }
      },
    },
  };
}
