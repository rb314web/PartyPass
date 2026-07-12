import sharp from 'sharp';
import { rename, stat } from 'node:fs/promises';
import path from 'node:path';

const OG_IMAGE_PATH = path.resolve('public/og-image.jpg');
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

async function compressOgImage() {
  const tempPath = `${OG_IMAGE_PATH}.tmp`;

  await sharp(OG_IMAGE_PATH)
    .resize(OG_WIDTH, OG_HEIGHT, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(tempPath);

  await rename(tempPath, OG_IMAGE_PATH);

  const { size } = await stat(OG_IMAGE_PATH);
  console.log(`Compressed og-image.jpg (${Math.round(size / 1024)} KB)`);
}

void compressOgImage().catch((error) => {
  console.error(error);
  process.exit(1);
});
