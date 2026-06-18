const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../images');
const MAX_WIDTH = 1920;
const QUALITY = 82;

const EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

async function optimizeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!EXTS.includes(ext)) return;

  const stat = fs.statSync(filePath);
  const originalSize = stat.size;

  try {
    const img = sharp(filePath);
    const meta = await img.metadata();

    if (meta.width <= MAX_WIDTH && originalSize < 100 * 1024) return;

    const pipeline = img.resize({ width: MAX_WIDTH, withoutEnlargement: true });

    if (ext === '.png') {
      await pipeline.png({ quality: QUALITY, compressionLevel: 9 }).toFile(filePath + '.tmp');
    } else {
      await pipeline.jpeg({ quality: QUALITY, progressive: true }).toFile(filePath + '.tmp');
    }

    const newSize = fs.statSync(filePath + '.tmp').size;
    if (newSize < originalSize) {
      fs.renameSync(filePath + '.tmp', filePath);
      const saved = ((1 - newSize / originalSize) * 100).toFixed(1);
      console.log(`✓ ${path.basename(filePath)} — ahorrado ${saved}% (${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB)`);
    } else {
      fs.unlinkSync(filePath + '.tmp');
    }
  } catch (e) {
    if (fs.existsSync(filePath + '.tmp')) fs.unlinkSync(filePath + '.tmp');
    console.error(`✗ ${path.basename(filePath)}: ${e.message}`);
  }
}

async function main() {
  const files = fs.readdirSync(IMAGES_DIR).map((f) => path.join(IMAGES_DIR, f));
  console.log(`Optimizando ${files.length} archivos en /images...`);
  for (const f of files) await optimizeImage(f);
  console.log('Listo.');
}

main();
