import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { galleryRows, getAllProjects, toProjectSlug } from '../data/projects.js';

export const THUMB_TARGET_WIDTHS = [600, 1000];

export function getThumbHash(publicUrl) {
  return crypto.createHash('sha1').update(publicUrl).digest('hex').slice(0, 10);
}

export function getThumbWidths(naturalWidth) {
  const w = Number(naturalWidth) || 1000;
  const set = new Set(THUMB_TARGET_WIDTHS.map((target) => Math.min(target, w)));
  return Array.from(set).sort((a, b) => a - b);
}

function resolveCoverThumbMeta(publicUrl, naturalWidth, publicMedienDir) {
  const hash = getThumbHash(publicUrl);
  const widths = getThumbWidths(naturalWidth);
  const thumbsDir = path.join(publicMedienDir, '_thumbs');
  const entries = [];

  for (const w of widths) {
    const fileName = `${hash}-${w}.webp`;
    if (fs.existsSync(path.join(thumbsDir, fileName))) {
      entries.push({ w, url: `/medien/_thumbs/${fileName}` });
    }
  }

  if (entries.length === 0) {
    return { thumbSrc: undefined, thumbSrcSet: undefined };
  }

  return {
    thumbSrc: entries[entries.length - 1].url,
    thumbSrcSet: entries.map((e) => `${e.url} ${e.w}w`).join(', '),
  };
}

function resolvePosterWebp(posterUrl, publicMedienDir) {
  if (!posterUrl) return undefined;
  const hash = getThumbHash(posterUrl);
  const fileName = `poster-${hash}-600.webp`;
  if (fs.existsSync(path.join(publicMedienDir, '_thumbs', fileName))) {
    return `/medien/_thumbs/${fileName}`;
  }
  return undefined;
}

const MEDIA_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.gif',
  '.svg',
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
]);

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v']);

// Cloudflare Pages has a strict 25 MiB per-file limit
const MAX_CLOUDFLARE_BYTES = 24.8 * 1024 * 1024;
const MAX_SLIDES_PER_ROW = 4;

// Curated order, clean labels, and cover selections for Medien/startseite/
const STARTSEITE_ORDER = [
  'samuel-brillenfotos-beyeler',
  'timon-editorial',
  'mercedes-avia',
  'vitra-architektur',
  'dbb-double-header',
  'hannah',
  'jamelia-shooting',
  'shooting-hannes',
  'passione-engadina-22',
  'allinabasement',
  'samuel-ausfahrt-stetten',
  'hannes-vitra-nacht',
  'basketball-portraits',
  'heizr-alles',
  'samuel-wenkenpark',
  'landrover-tuellinger',
  'porsche-rooling-shots',
  'michael',
  'muriel',
];

const STARTSEITE_META = {
  'samuel-brillenfotos-beyeler': {
    label: 'Samuel — Beyeler',
    cover: 'samuel-Brille-Beyeler00001.jpg',
  },
  'timon-editorial': {
    label: 'Timon — Editorial',
    cover: 'startseite1.MP4',
  },
  'mercedes-avia': {
    label: 'Mercedes — Avia',
    cover: 'Unbenannt-1.jpg',
  },
  'vitra-architektur': {
    label: 'Vitra — Architecture',
    cover: '_DSF3025.jpg',
  },
  'dbb-double-header': {
    label: 'DBB — Double Header',
    cover: 'Dbb Post 1.jpg',
  },
  hannah: {
    label: 'Hannah',
    cover: 'Banner.jpg',
  },
  'jamelia-shooting': {
    label: 'Jamelia',
    cover: '_DSF5287.jpg',
  },
  'shooting-hannes': {
    label: 'Hannes — Night',
    cover: '_MG_0348.jpg',
  },
  'passione-engadina-22': {
    label: 'Passione Engadina',
    cover: '_DSF7117-3.jpg',
  },
  allinabasement: {
    label: 'All in a Basement',
    cover: '_DSF4714.jpg',
  },
  'samuel-ausfahrt-stetten': {
    label: 'Samuel — Stetten',
    cover: '_DSF7458.jpg',
  },
  'hannes-vitra-nacht': {
    label: 'Hannes — Vitra',
    cover: '_DSF2218.jpg',
  },
  'basketball-portraits': {
    label: 'Basketball — Portraits',
    cover: 'IMG_2192.jpg',
  },
  'heizr-alles': {
    label: 'Heizr',
    cover: '_DSF6976.jpg',
  },
  'samuel-wenkenpark': {
    label: 'Samuel — Wenkenpark',
    cover: '_DSF6872.jpg',
  },
  'landrover-tuellinger': {
    label: 'Defender — Tüllinger',
    cover: '_DSF5730-Bearbeitet.jpg',
  },
  'porsche-rooling-shots': {
    label: 'Porsche — Rolling',
    cover: '3V8A5576.jpg',
  },
  michael: {
    label: 'Michael',
    cover: '_DSF1506.jpg',
  },
  muriel: {
    label: 'Muriel',
    cover: '_MG_1809-Bearbeitet.jpg',
  },
};

// Curated order, clean labels, covers, and continuous irregular collage layout for Medien/Exhibition/
const EXHIBITION_ORDER = [
  'island',
  'tokyo-japan',
  'soerenberg',
  'avia-tankstelle',
  'indien-street-photography',
  'alpen',
  'marokko',
  'vietnam',
  'nepal',
  'cinque-terre',
  'istanbul',
  'landrover-roadtrip-frankreich',
  'kambodscha',
  'jordanien',
  'indien-railway',
  'tokyo-shinjuku',
  'ente-trabi-sonnenuntergang',
];

const EXHIBITION_META = {
  island: {
    label: 'Iceland',
    cover: '_MG_0609.jpg',
    collage: { left: 3.5, top: 2, width: 27.5, zIndex: 2 },
    mobileCollage: { left: 3, top: 0.8, width: 56, zIndex: 2 },
  },
  'tokyo-japan': {
    label: 'Tokyo — Japan',
    cover: 'AE2E947B-066A-427F-B037-FD9B7F0F38B9.mp4',
    collage: { left: 28, top: 0.5, width: 19, zIndex: 4 },
    mobileCollage: { left: 52.5, top: 0.4, width: 44, zIndex: 4 },
  },
  soerenberg: {
    label: 'Sörenberg',
    cover: '_DSF2111.jpg',
    collage: { left: 52, top: 3.5, width: 28.5, zIndex: 3 },
    mobileCollage: { left: 12, top: 7.4, width: 62, zIndex: 5 },
  },
  'avia-tankstelle': {
    label: 'Avia — Night',
    cover: '_MG_1904.jpg',
    collage: { left: 77.5, top: 1.2, width: 18.5, zIndex: 5 },
    mobileCollage: { left: 55.5, top: 14.5, width: 41.5, zIndex: 6 },
  },
  'indien-street-photography': {
    label: 'India — Street',
    cover: 'IMG_2407.mp4',
    collage: { left: 9, top: 16.5, width: 26.5, zIndex: 6 },
    mobileCollage: { left: 3.5, top: 19.2, width: 55, zIndex: 7 },
  },
  alpen: {
    label: 'Alps',
    cover: 'R0009867.jpeg',
    collage: { left: 42, top: 14.5, width: 20.5, zIndex: 5 },
    mobileCollage: { left: 44, top: 25.6, width: 46.5, zIndex: 5 },
  },
  'cinque-terre': {
    label: 'Cinque Terre',
    cover: '_DSF2618.jpg',
    collage: { left: 68, top: 21.5, width: 19.5, zIndex: 4 },
    mobileCollage: { left: 4, top: 52, width: 43.5, zIndex: 6 },
  },
  marokko: {
    label: 'Morocco',
    cover: '_DSF6448.jpg',
    collage: { left: 2.5, top: 33.5, width: 28.5, zIndex: 3 },
    mobileCollage: { left: 1.5, top: 33.8, width: 57.5, zIndex: 6 },
  },
  vietnam: {
    label: 'Vietnam',
    cover: 'copy_3B1ACCDE-A781-4F23-B82E-C15A9559FAAC.mp4',
    collage: { left: 28.5, top: 31, width: 18, zIndex: 6 },
    mobileCollage: { left: 54, top: 38.6, width: 43, zIndex: 7 },
  },
  nepal: {
    label: 'Nepal',
    cover: 'copy_288C6509-9ED1-40B1-AB73-52A07E24EAEF.mp4',
    collage: { left: 53, top: 39.5, width: 33, zIndex: 7 },
    mobileCollage: { left: 16, top: 46.2, width: 68, zIndex: 8 },
  },
  istanbul: {
    label: 'Istanbul',
    cover: 'DSCF9147.JPG',
    collage: { left: 14, top: 49, width: 32.5, zIndex: 5 },
    mobileCollage: { left: 36, top: 56.8, width: 61, zIndex: 7 },
  },
  'landrover-roadtrip-frankreich': {
    label: 'France — Roadtrip',
    cover: '_DSF8081.jpg',
    collage: { left: 44, top: 51.5, width: 20.5, zIndex: 6 },
    mobileCollage: { left: 49, top: 65.4, width: 44.5, zIndex: 5 },
  },
  kambodscha: {
    label: 'Cambodia',
    cover: 'IMG_8004.jpeg',
    collage: { left: 4, top: 67, width: 30, zIndex: 4 },
    mobileCollage: { left: 2.5, top: 68.5, width: 56.5, zIndex: 6 },
  },
  jordanien: {
    label: 'Jordan',
    cover: '6CC5F030-651C-4CD4-9473-7C6399B4878E.mp4',
    collage: { left: 71.5, top: 53.5, width: 21, zIndex: 4 },
    mobileCollage: { left: 50, top: 75.8, width: 45, zIndex: 7 },
  },
  'indien-railway': {
    label: 'India — Railway',
    cover: 'IMG_3783.jpg',
    collage: { left: 29.5, top: 73.5, width: 21.5, zIndex: 7 },
    mobileCollage: { left: 5.5, top: 78.2, width: 46.5, zIndex: 5 },
  },
  'tokyo-shinjuku': {
    label: 'Tokyo — Shinjuku',
    cover: 'copy_A21D3ACA-0E38-4DCF-BC7D-0381CE3B8EA5.mp4',
    collage: { left: 56.5, top: 69, width: 18, zIndex: 5 },
    mobileCollage: { left: 56, top: 86.2, width: 40.5, zIndex: 4 },
  },
  'ente-trabi-sonnenuntergang': {
    label: '2CV & Trabant — Sunset',
    cover: '_DSF5941-Bearbeitet.jpg',
    collage: { left: 71, top: 76.5, width: 22, zIndex: 6 },
    mobileCollage: { left: 11, top: 87.6, width: 47, zIndex: 6 },
  },
};

const FALLBACK_COLLAGE_SLOTS = [
  { left: 3.5, top: 2, width: 27.5, zIndex: 2 },
  { left: 28, top: 0.5, width: 19, zIndex: 4 },
  { left: 52, top: 3.5, width: 28.5, zIndex: 3 },
  { left: 77.5, top: 1.2, width: 18.5, zIndex: 5 },
  { left: 9, top: 16.5, width: 26.5, zIndex: 6 },
  { left: 42, top: 14.5, width: 20.5, zIndex: 5 },
];

const FALLBACK_MOBILE_COLLAGE_SLOTS = [
  { left: 3, top: 0.8, width: 56, zIndex: 2 },
  { left: 52.5, top: 0.4, width: 44, zIndex: 4 },
  { left: 12, top: 7.4, width: 62, zIndex: 5 },
  { left: 55.5, top: 14.5, width: 41.5, zIndex: 6 },
  { left: 3.5, top: 19.2, width: 55, zIndex: 7 },
  { left: 44, top: 25.6, width: 46.5, zIndex: 5 },
];

// Pre-generated poster frames for instant display on iOS Safari (even in Low Power Mode)
const VIDEO_POSTERS = {
  'timon-editorial': '/media/poster-timon-editorial.jpg',
  'dbb-double-header': '/media/poster-dbb-double-header.jpg',
  '1AE51C11-EAB2-4444-9140-345096CB874D.mp4': '/media/poster-jordanien-1.jpg',
  '6CC5F030-651C-4CD4-9473-7C6399B4878E.mp4': '/media/poster-jordanien-2.jpg',
  'copy_288C6509-9ED1-40B1-AB73-52A07E24EAEF.mp4': '/media/poster-nepal-1.jpg',
  'copy_F7480DD1-F7DD-49F1-A43F-1E87C96428B0.mp4': '/media/poster-nepal-2.jpg',
  'AE2E947B-066A-427F-B037-FD9B7F0F38B9.mp4': '/media/poster-tokyo-japan-1.jpg',
  'copy_CF70AD6E-A641-4D01-B4C2-FC14D704049F.mp4': '/media/poster-tokyo-japan-2.jpg',
  'copy_A21D3ACA-0E38-4DCF-BC7D-0381CE3B8EA5.mp4': '/media/poster-tokyo-shinjuku.jpg',
  'copy_3B1ACCDE-A781-4F23-B82E-C15A9559FAAC.mp4': '/media/poster-vietnam.jpg',
  'IMG_2407.mp4': '/media/poster-indien-street.jpg',
};

function toSlug(text, fallbackIndex = 0) {
  return toProjectSlug({ label: text }, fallbackIndex);
}

function formatCategoryLabel(rawName) {
  const trimmed = rawName.normalize('NFC').trim().replace(/^[-_.\s]+|[-_.\s]+$/g, '');
  if (!trimmed) return 'Untitled Series';

  const normalized = trimmed.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ');
  return normalized.replace(/\b([a-zäöü])([a-zäöüß]*)/g, (_, first, rest) =>
    first.toUpperCase() + rest
  );
}

/**
 * Pure Node.js dimension reader for JPEG, PNG, and MP4/MOV files (zero external dependencies,
 * works identically on macOS and Cloudflare Pages Linux builds).
 */
function getMediaDimensions(filePath, ext) {
  try {
    if (VIDEO_EXTENSIONS.has(ext)) {
      const findTkhdDims = (data) => {
        let idx = 0;
        while (idx < data.length - 100) {
          const pos = data.indexOf('tkhd', idx, 'ascii');
          if (pos === -1) break;
          const version = data[pos + 4];
          const off = version === 1 ? pos + 92 : pos + 80;
          if (off + 8 <= data.length) {
            const width = data.readUInt32BE(off) >>> 16;
            const height = data.readUInt32BE(off + 4) >>> 16;
            if (width > 0 && height > 0 && width <= 8192 && height <= 8192) {
              return { width, height };
            }
          }
          idx = pos + 4;
        }
        return null;
      };
      const fd = fs.openSync(filePath, 'r');
      const head = Buffer.alloc(256 * 1024);
      const bytesRead = fs.readSync(fd, head, 0, head.length, 0);
      fs.closeSync(fd);
      const dims = findTkhdDims(head.subarray(0, bytesRead)) || findTkhdDims(fs.readFileSync(filePath));
      return dims || { width: 1080, height: 1350 };
    }

    const fd = fs.openSync(filePath, 'r');
    const maxRead = 256 * 1024;
    const buf = Buffer.alloc(maxRead);
    const bytesRead = fs.readSync(fd, buf, 0, maxRead, 0);
    fs.closeSync(fd);

    if (ext === '.png' && bytesRead >= 24) {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      if (width > 0 && height > 0) return { width, height };
    }

    if ((ext === '.jpg' || ext === '.jpeg') && bytesRead > 4 && buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < bytesRead - 9) {
        if (buf[i] !== 0xff) {
          i++;
          continue;
        }
        const marker = buf[i + 1];
        if (marker === 0xff) {
          i++;
          continue;
        }
        if (
          marker === 0xc0 ||
          marker === 0xc1 ||
          marker === 0xc2 ||
          marker === 0xc3
        ) {
          const height = buf.readUInt16BE(i + 5);
          const width = buf.readUInt16BE(i + 7);
          if (width > 0 && height > 0) return { width, height };
          break;
        }
        if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
          i += 2;
          continue;
        }
        const len = buf.readUInt16BE(i + 2);
        if (len < 2) break;
        i += 2 + len;
      }
    }
  } catch {}

  return { width: 1080, height: 1350 };
}

/**
 * Extracts `{ seriesPrefix, priority, order }` from a filename for clean intra-folder sorting.
 */
function parseFilenameOrder(baseName) {
  const clean = baseName.trim();
  const isExplicitCover = /^(startseite|cover|titel)/i.test(clean);
  const priority = isExplicitCover ? 0 : 1;

  const trailingMatch = clean.match(/^(.+?)[-_.\s(]*(\d+)\)?$/);
  const leadingMatch = !trailingMatch ? clean.match(/^(\d+)[-_.\s]+(.+)$/) : null;

  let seriesPrefix = clean.toLowerCase().replace(/[^a-z0-9]+/g, '');
  let order = 999;

  if (trailingMatch && trailingMatch[1].trim()) {
    seriesPrefix = trailingMatch[1]
      .trim()
      .toLowerCase()
      .replace(/^[-_.\s]+|[-_.\s]+$/g, '');
    order = parseInt(trailingMatch[2], 10);
  } else if (leadingMatch && leadingMatch[2].trim()) {
    seriesPrefix = leadingMatch[2]
      .trim()
      .toLowerCase()
      .replace(/^[-_.\s]+|[-_.\s]+$/g, '');
    order = parseInt(leadingMatch[1], 10);
  } else {
    const anyNum = clean.match(/(\d+)/);
    if (anyNum) {
      order = parseInt(anyNum[1], 10);
    }
  }

  return { seriesPrefix, priority, order };
}

/**
 * Sorts items inside a series folder cleanly and promotes `preferredCoverFile` to index 0.
 */
function sortCategoryItems(items, preferredCoverFile = null) {
  const prefixMeta = new Map();

  for (const item of items) {
    const key =
      item.type === 'video' && item.priority > 0
        ? `__video_${item.fileName}`
        : item.seriesPrefix;
    item._groupKey = key;

    if (!prefixMeta.has(key)) {
      prefixMeta.set(key, {
        minPriority: item.priority,
        minOrder: item.order,
        isVideo: item.type === 'video',
      });
    } else {
      const meta = prefixMeta.get(key);
      meta.minPriority = Math.min(meta.minPriority, item.priority);
      meta.minOrder = Math.min(meta.minOrder, item.order);
    }
  }

  const sorted = [...items].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;

    if (a._groupKey !== b._groupKey) {
      const metaA = prefixMeta.get(a._groupKey);
      const metaB = prefixMeta.get(b._groupKey);

      const aHasOne = metaA.minOrder === 1 ? 0 : 1;
      const bHasOne = metaB.minOrder === 1 ? 0 : 1;
      if (aHasOne !== bHasOne) return aHasOne - bHasOne;

      if (metaA.isVideo !== metaB.isVideo) return metaA.isVideo ? -1 : 1;

      if (metaA.minOrder !== metaB.minOrder) return metaA.minOrder - metaB.minOrder;
      return a._groupKey.localeCompare(b._groupKey, 'de', { numeric: true });
    }

    if (a.order !== b.order) return a.order - b.order;
    return a.fileName.localeCompare(b.fileName, 'de', { numeric: true });
  });

  if (preferredCoverFile) {
    const target = preferredCoverFile.normalize('NFC').toLowerCase();
    const coverIdx = sorted.findIndex(
      (item) => item.fileName.normalize('NFC').toLowerCase() === target
    );
    if (coverIdx > 0) {
      const [coverItem] = sorted.splice(coverIdx, 1);
      sorted.unshift(coverItem);
    }
  }

  return sorted;
}

function collectFolderFiles(folderPath, folderName, section, relPrefix = '') {
  const files = [];
  for (const sub of fs.readdirSync(folderPath, { withFileTypes: true })) {
    if (sub.name.startsWith('.') || !sub.isFile()) continue;
    const ext = path.extname(sub.name).toLowerCase();
    if (!MEDIA_EXTENSIONS.has(ext)) continue;

    const absPath = path.join(folderPath, sub.name);
    const stat = fs.statSync(absPath);
    if (stat.size > MAX_CLOUDFLARE_BYTES) {
      console.warn(
        `[Medien] Skipping ${relPrefix}/${folderName}/${sub.name} (${(stat.size / 1024 / 1024).toFixed(1)} MiB exceeds Cloudflare Pages 25 MiB limit)`
      );
      continue;
    }

    files.push({
      absPath,
      relPath: relPrefix
        ? path.join(relPrefix, folderName, sub.name)
        : path.join(folderName, sub.name),
      fileName: sub.name,
      baseName: path.basename(sub.name, path.extname(sub.name)),
      ext,
      folderName: folderName.normalize('NFC'),
      section,
      stat,
    });
  }
  return files;
}

function collectSeriesFromDir(baseDir, section, relPrefix = '') {
  const files = [];
  if (!fs.existsSync(baseDir)) return files;

  for (const folder of fs.readdirSync(baseDir, { withFileTypes: true })) {
    if (folder.name.startsWith('.') || !folder.isDirectory()) continue;
    files.push(
      ...collectFolderFiles(
        path.join(baseDir, folder.name),
        folder.name,
        section,
        relPrefix
      )
    );
  }

  return files;
}

function sortByPreferredOrder(projects, orderList) {
  return [...projects].sort((a, b) => {
    const idxA = orderList.indexOf(a.folderKey);
    const idxB = orderList.indexOf(b.folderKey);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.label.localeCompare(b.label, 'de');
  });
}

/**
 * Splits start-page projects into balanced horizontal rows (max 4–5 items per row)
 * so the site scrolls smoothly across multiple curated rows.
 */
function chunkIntoRows(projects, maxPerRow = MAX_SLIDES_PER_ROW) {
  const total = projects.length;
  if (total === 0) return [];

  const rowCount = total <= 5 ? 1 : Math.ceil(total / maxPerRow);
  const baseSize = Math.floor(total / rowCount);
  const remainder = total % rowCount;

  const rows = [];
  let cursor = 0;
  for (let r = 0; r < rowCount; r++) {
    const count = baseSize + (r < remainder ? 1 : 0);
    const rowId = `row-${String(r + 1).padStart(2, '0')}`;
    const slides = projects.slice(cursor, cursor + count).map((p) => ({ ...p, rowId }));
    // Keep 3-slide rows at 100vw (50vw + 25vw + 25vw) by expanding one landscape slide
    if (slides.length === 3 && !slides.some((s) => s.wide)) {
      const landscape = slides.find((s) => s.width > s.height);
      if (landscape) landscape.wide = true;
    }
    rows.push({ id: rowId, slides });
    cursor += count;
  }

  return rows;
}

/**
 * Syncs files from `/Medien/startseite` and `/Medien/Exhibition` to `/public/medien`
 * and returns grouped projects, balanced start-page rows, and exhibition series.
 */
export function loadMedienProjects() {
  const rootDir = process.cwd();
  const medienDir = path.join(rootDir, 'Medien');
  const publicMedienDir = path.join(rootDir, 'public', 'medien');

  if (!fs.existsSync(medienDir)) {
    return null;
  }

  const collectedFiles = [];
  const topEntries = fs.readdirSync(medienDir, { withFileTypes: true });

  for (const entry of topEntries) {
    if (entry.name.startsWith('.') || !entry.isDirectory()) continue;

    const lower = entry.name.toLowerCase();
    const entryPath = path.join(medienDir, entry.name);

    if (lower === 'startseite') {
      collectedFiles.push(...collectSeriesFromDir(entryPath, 'startseite', entry.name));
    } else if (lower === 'exhibition') {
      collectedFiles.push(...collectSeriesFromDir(entryPath, 'exhibition', entry.name));
    } else {
      // Fallback: treat any top-level project folder outside startseite/Exhibition as startseite
      collectedFiles.push(...collectFolderFiles(entryPath, entry.name, 'startseite'));
    }
  }

  if (collectedFiles.length === 0) {
    return null;
  }

  // Cleanly sync Medien -> public/medien (remove stale files that were deleted or moved)
  fs.mkdirSync(publicMedienDir, { recursive: true });
  const validRelPaths = new Set(collectedFiles.map((f) => f.relPath));

  const cleanStaleFiles = (dir, relPrefix = '') => {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!relPrefix && item.name === '_thumbs') continue;
      const itemRel = relPrefix ? path.join(relPrefix, item.name) : item.name;
      const itemAbs = path.join(dir, item.name);
      if (item.isDirectory()) {
        cleanStaleFiles(itemAbs, itemRel);
        if (fs.readdirSync(itemAbs).length === 0) {
          fs.rmdirSync(itemAbs);
        }
      } else if (!validRelPaths.has(itemRel)) {
        fs.unlinkSync(itemAbs);
      }
    }
  };
  cleanStaleFiles(publicMedienDir);

  const categoriesMap = new Map();

  for (const file of collectedFiles) {
    const targetPath = path.join(publicMedienDir, file.relPath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    let shouldCopy = !fs.existsSync(targetPath);
    if (!shouldCopy) {
      const destStat = fs.statSync(targetPath);
      if (file.stat.size !== destStat.size || file.stat.mtimeMs > destStat.mtimeMs) {
        shouldCopy = true;
      }
    }
    if (shouldCopy) {
      fs.copyFileSync(file.absPath, targetPath);
    }

    const urlSegments = file.relPath
      .split(path.sep)
      .map((seg) => encodeURIComponent(seg));
    const publicUrl = `/medien/${urlSegments.join('/')}`;

    const folderKey = toSlug(file.folderName);
    const metaMap = file.section === 'exhibition' ? EXHIBITION_META : STARTSEITE_META;
    const meta = metaMap[folderKey];
    const label = meta?.label || formatCategoryLabel(file.folderName);

    const { seriesPrefix, priority, order } = parseFilenameOrder(file.baseName);
    const { width, height } = getMediaDimensions(file.absPath, file.ext);
    const isVideo = VIDEO_EXTENSIONS.has(file.ext);

    const mapKey = `${file.section}:${folderKey}`;
    if (!categoriesMap.has(mapKey)) {
      categoriesMap.set(mapKey, {
        section: file.section,
        folderKey,
        label,
        coverFile: meta?.cover || null,
        meta,
        items: [],
      });
    }

    categoriesMap.get(mapKey).items.push({
      src: publicUrl,
      type: isVideo ? 'video' : 'image',
      poster: isVideo ? (VIDEO_POSTERS[file.fileName] || VIDEO_POSTERS[folderKey]) : undefined,
      width,
      height,
      intrinsicAspect: `${width} / ${height}`,
      seriesPrefix,
      priority,
      order,
      fileName: file.fileName,
    });
  }

  const startseiteProjects = [];
  const exhibitionProjects = [];
  const seenSlugs = new Set();

  Array.from(categoriesMap.values()).forEach((cat, idx) => {
    const sortedItems = sortCategoryItems(cat.items, cat.coverFile);

    let slug = toSlug(cat.label, idx);
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${idx + 1}`;
    }
    seenSlugs.add(slug);

    const cover = sortedItems[0];
    const thumbMeta =
      cover.type === 'image'
        ? resolveCoverThumbMeta(cover.src, cover.width, publicMedienDir)
        : { thumbSrc: undefined, thumbSrcSet: undefined };
    const posterWebp =
      cover.type === 'video' ? resolvePosterWebp(cover.poster, publicMedienDir) : undefined;

    const project = {
      slug,
      folderKey: cat.folderKey,
      type: cover.type,
      src: cover.src,
      thumbSrc: thumbMeta.thumbSrc,
      thumbSrcSet: thumbMeta.thumbSrcSet,
      poster: cover.poster,
      posterWebp,
      width: cover.width,
      height: cover.height,
      intrinsicAspect: cover.intrinsicAspect,
      label: cat.label,
      align: 'middle',
      wide: false,
      aspect: 'auto',
      startIndex: 0,
      meta: cat.meta,
      images: sortedItems.map((item, imageIndex) => ({
        src: item.src,
        type: item.type,
        poster: item.poster,
        width: item.width,
        height: item.height,
        intrinsicAspect: item.intrinsicAspect,
        aspect: 'auto',
        caption: '',
        index: imageIndex,
      })),
    };

    if (cat.section === 'exhibition') {
      exhibitionProjects.push(project);
    } else {
      startseiteProjects.push(project);
    }
  });

  const orderedStartseite = sortByPreferredOrder(startseiteProjects, STARTSEITE_ORDER);
  const orderedExhibition = sortByPreferredOrder(exhibitionProjects, EXHIBITION_ORDER);

  const rows =
    orderedStartseite.length > 0 ? chunkIntoRows(orderedStartseite) : galleryRows;
  const projects =
    orderedStartseite.length > 0 || orderedExhibition.length > 0
      ? [...orderedStartseite, ...orderedExhibition]
      : getAllProjects();

  const exhibitionItems = orderedExhibition.map((project, idx) => {
    const slot =
      project.meta?.collage ||
      FALLBACK_COLLAGE_SLOTS[idx % FALLBACK_COLLAGE_SLOTS.length];
    const mobileSlot =
      project.meta?.mobileCollage ||
      FALLBACK_MOBILE_COLLAGE_SLOTS[idx % FALLBACK_MOBILE_COLLAGE_SLOTS.length];
    return {
      id: `ex-${String(idx + 1).padStart(2, '0')}`,
      slug: project.slug,
      title: project.label,
      type: project.type,
      src: project.src,
      thumbSrc: project.thumbSrc,
      thumbSrcSet: project.thumbSrcSet,
      poster: project.poster,
      posterWebp: project.posterWebp,
      width: project.width,
      height: project.height,
      aspect: project.intrinsicAspect || '3 / 4',
      collage: slot,
      mobileCollage: mobileSlot,
    };
  });

  return { rows, projects, exhibitionItems };
}
