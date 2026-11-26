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

async function ensureWebpThumb(srcAbsPath, destAbsPath, width, quality = 80) {
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
    .webp({ quality, effort: 4 })
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

  const queueThumb = (srcAbs, fileName, width, quality = 80) => {
    if (validFiles.has(fileName)) return;
    validFiles.add(fileName);
    tasks.push({
      srcAbs,
      destAbs: path.join(thumbsDir, fileName),
      width,
      quality,
    });
  };

  const coverItems = [
    ...medienData.rows.flatMap((row) => row.slides),
    ...medienData.exhibitionItems,
  ];

  for (const item of coverItems) {
    if (item.type === 'image' && item.src?.startsWith('/medien/')) {
      const srcAbs = urlToPublicPath(item.src);
      const hash = getThumbHash(item.src);
      const widths = getThumbWidths(item.width, item.height);

      for (const w of widths) {
        queueThumb(srcAbs, `${hash}-${w}.webp`, w, 80);
      }
    } else if (item.type === 'video' && item.poster) {
      const srcAbs = urlToPublicPath(item.poster);
      const hash = getThumbHash(item.poster);
      queueThumb(srcAbs, `poster-${hash}-600.webp`, 600, 80);
    }
  }

  for (const project of medienData.projects || []) {
    for (const item of project.images || []) {
      if (item.type === 'image' && item.src?.startsWith('/medien/')) {
        const srcAbs = urlToPublicPath(item.src);
        const hash = getThumbHash(item.src);
        const naturalWidth = Number(item.width) || 1800;

        queueThumb(srcAbs, `${hash}-800.webp`, Math.min(800, naturalWidth), 80);
        queueThumb(srcAbs, `${hash}-1800.webp`, Math.min(1800, naturalWidth), 84);
      } else if (item.type === 'video' && item.poster) {
        const srcAbs = urlToPublicPath(item.poster);
        const hash = getThumbHash(item.poster);
        queueThumb(srcAbs, `poster-${hash}-600.webp`, 600, 80);
      }
    }
  }

  let generated = 0;
  // Process in small batches to keep peak memory low on CI
  const CONCURRENCY = 6;
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map((t) => ensureWebpThumb(t.srcAbs, t.destAbs, t.width, t.quality))
    );
    generated += results.filter(Boolean).length;
  }

  // Prune macOS dotfiles (.DS_Store, ._*) and stale thumbnails no longer referenced
  let removed = 0;
  for (const entry of fs.readdirSync(thumbsDir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) {
      fs.rmSync(path.join(thumbsDir, entry.name), { recursive: true, force: true });
      removed++;
      continue;
    }
    if (!entry.isFile()) continue;
    if (!validFiles.has(entry.name)) {
      fs.unlinkSync(path.join(thumbsDir, entry.name));
      removed++;
    }
  }

  console.log(
    `[thumbs] ${validFiles.size} WebP derivatives ready (${generated} generated, ${removed} pruned).`
  );
}

main().catch((err) => {
  console.error('[thumbs] Failed to generate thumbnails:', err);
  process.exit(1);
});
