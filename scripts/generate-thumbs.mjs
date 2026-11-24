import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { getThumbHash, getThumbWidths, loadMedienProjects } from '../src/utils/loadMedien.js';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const thumbsDir = path.join(publicDir, 'medien', '_thumbs');

function urlToPublicPath(publicUrl) {
  const decoded = publicUrl
    .replace(/^\/+/, '')
    .split('/')
    .map((seg) => decodeURIComponent(seg))
    .join(path.sep);
  return path.join(publicDir, decoded);
}

async function ensureWebpThumb(srcAbsPath, destAbsPath, width) {
  if (!fs.existsSync(srcAbsPath)) return false;

  const srcStat = fs.statSync(srcAbsPath);
  if (fs.existsSync(destAbsPath)) {
    const destStat = fs.statSync(destAbsPath);
    if (destStat.mtimeMs >= srcStat.mtimeMs && destStat.size > 0) {
      return false;
    }
  }

  await sharp(srcAbsPath)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(destAbsPath);

  return true;
}

async function main() {
  const medienData = loadMedienProjects();
  if (!medienData) {
    console.log('[thumbs] No Medien directory found, skipping.');
    return;
  }

  fs.mkdirSync(thumbsDir, { recursive: true });

  const tasks = [];
  const validFiles = new Set();

  const coverItems = [
    ...medienData.rows.flatMap((row) => row.slides),
    ...medienData.exhibitionItems,
  ];

  for (const item of coverItems) {
    if (item.type === 'image' && item.src?.startsWith('/medien/')) {
      const srcAbs = urlToPublicPath(item.src);
      const hash = getThumbHash(item.src);
      const widths = getThumbWidths(item.width);

      for (const w of widths) {
        const fileName = `${hash}-${w}.webp`;
        if (validFiles.has(fileName)) continue;
        validFiles.add(fileName);
        tasks.push({ srcAbs, destAbs: path.join(thumbsDir, fileName), width: w });
      }
    } else if (item.type === 'video' && item.poster) {
      const srcAbs = urlToPublicPath(item.poster);
      const hash = getThumbHash(item.poster);
      const fileName = `poster-${hash}-600.webp`;
      if (!validFiles.has(fileName)) {
        validFiles.add(fileName);
        tasks.push({ srcAbs, destAbs: path.join(thumbsDir, fileName), width: 600 });
      }
    }
  }

  let generated = 0;
  // Process in small batches to keep peak memory low on CI
  const CONCURRENCY = 6;
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((t) => ensureWebpThumb(t.srcAbs, t.destAbs, t.width))
    );
    generated += results.filter(Boolean).length;
  }

  // Prune stale thumbnails no longer referenced
  let removed = 0;
  for (const entry of fs.readdirSync(thumbsDir, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!validFiles.has(entry.name)) {
      fs.unlinkSync(path.join(thumbsDir, entry.name));
      removed++;
    }
  }

  console.log(
    `[thumbs] ${validFiles.size} WebP cover thumbnails ready (${generated} generated, ${removed} pruned).`
  );
}

main().catch((err) => {
  console.error('[thumbs] Failed to generate thumbnails:', err);
  process.exit(1);
});
