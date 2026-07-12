import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const HERO_DIR = path.resolve('public/images/hero');
const SOURCE_DIR = path.resolve('scripts/hero-sources');
const SCENARIOS = ['birthday', 'party', 'wedding'];
const WIDTHS = [800, 1200];

async function generateHeroVariants() {
  await mkdir(HERO_DIR, { recursive: true });
  await mkdir(SOURCE_DIR, { recursive: true });

  for (const name of SCENARIOS) {
    const sourcePath = path.join(SOURCE_DIR, `${name}.jpg`);

    for (const width of WIDTHS) {
      const resized = sharp(sourcePath).resize(width, null, { withoutEnlargement: true });

      await resized
        .clone()
        .webp({ quality: 82 })
        .toFile(path.join(HERO_DIR, `${name}-${width}.webp`));

      await resized
        .clone()
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(path.join(HERO_DIR, `${name}-${width}.jpg`));
    }

    console.log(`Generated ${name} variants at ${WIDTHS.join(', ')}px`);
  }
}

void generateHeroVariants().catch((error) => {
  console.error(error);
  process.exit(1);
});
