import fs from 'node:fs';
import path from 'node:path';
import { galleryRows, getAllProjects } from '../data/projects.js';

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

// Preferred order for Row 1 folders
const ROW_1_ORDER = [
  'samuel-brillenfotos-beyeler',
  'timon-editorial',
  'mercedes-avia',
];
const ROW_1_FOLDERS = new Set(ROW_1_ORDER);

function toSlug(text, fallbackIndex = 0) {
  const slug = String(text || '')
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `project-${fallbackIndex + 1}`;
}

function formatCategoryLabel(rawName) {
  const trimmed = rawName.trim().replace(/^[-_.\s]+|[-_.\s]+$/g, '');
  if (!trimmed) return 'Untitled Series';

  // Replace hyphens and underscores with spaces if no spaces exist
  const normalized = trimmed.includes(' ')
    ? trimmed
    : trimmed.replace(/[-_]+/g, ' ');

  // Capitalize first letter of words if entirely lowercase
  if (normalized === normalized.toLowerCase()) {
    return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return normalized;
}

/**
 * Extracts `{ categoryKey, label, seriesPrefix, priority, order }` from a filename.
 */
function parseFilename(baseName, folderName = null) {
  const clean = baseName.trim();
  const isExplicitCover = /^(startseite|cover|titel)/i.test(clean);
  const priority = isExplicitCover ? 0 : 1;

  // Extract trailing number & prefix (e.g. "Dbb Post 1" -> prefix "dbb post", order 1)
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

  if (folderName) {
    const label = formatCategoryLabel(folderName);
    return {
      categoryKey: toSlug(folderName),
      label,
      seriesPrefix,
      priority,
      order,
    };
  }

  const rawLabel = trailingMatch?.[1] || leadingMatch?.[2] || clean;
  const label = formatCategoryLabel(rawLabel);
  return {
    categoryKey: toSlug(label),
    label,
    seriesPrefix,
    priority,
    order: order === 999 ? 1 : order,
  };
}

/**
 * Sorts items inside a category cleanly:
 * 1. Explicit cover files (`startseite1.MP4`) come first.
 * 2. Sub-series are grouped by their filename prefix (`Dbb Post 1..12`, then video, then `Unbenannt-2..10`)
 *    so different series inside the same folder never get interleaved.
 * 3. Within each sub-series, items are sorted by number ascending (`1, 2, 3...`).
 */
function sortCategoryItems(items) {
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

  return [...items].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;

    if (a._groupKey !== b._groupKey) {
      const metaA = prefixMeta.get(a._groupKey);
      const metaB = prefixMeta.get(b._groupKey);

      // Group that starts with #1 comes first (e.g. "Dbb Post 1")
      const aHasOne = metaA.minOrder === 1 ? 0 : 1;
      const bHasOne = metaB.minOrder === 1 ? 0 : 1;
      if (aHasOne !== bHasOne) return aHasOne - bHasOne;

      // Place standalone videos right between the first and second photo sub-series
      if (metaA.isVideo !== metaB.isVideo) return metaA.isVideo ? -1 : 1;

      if (metaA.minOrder !== metaB.minOrder) return metaA.minOrder - metaB.minOrder;
      return a._groupKey.localeCompare(b._groupKey, 'de', { numeric: true });
    }

    if (a.order !== b.order) return a.order - b.order;
    return a.fileName.localeCompare(b.fileName, 'de', { numeric: true });
  });
}

/**
 * Syncs files from `/Medien` to `/public/medien` and returns grouped projects & rows.
 * - Each folder in `/Medien` is represented by ONE single title photo/video on the start page.
 * - Remaining slots in Row 2 (and Rows 3 & 4) are filled with black placeholder boxes.
 */
export function loadMedienProjects() {
  const rootDir = process.cwd();
  const medienDir = path.join(rootDir, 'Medien');
  const publicMedienDir = path.join(rootDir, 'public', 'medien');

  if (!fs.existsSync(medienDir)) {
    return null;
  }

  const entries = fs.readdirSync(medienDir, { withFileTypes: true });
  const collectedFiles = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue;

    const fullPath = path.join(medienDir, entry.name);

    if (entry.isDirectory()) {
      const subEntries = fs.readdirSync(fullPath, { withFileTypes: true });
      for (const sub of subEntries) {
        if (sub.name.startsWith('.') || !sub.isFile()) continue;
        const ext = path.extname(sub.name).toLowerCase();
        if (!MEDIA_EXTENSIONS.has(ext)) continue;

        const absPath = path.join(fullPath, sub.name);
        const stat = fs.statSync(absPath);
        if (stat.size > MAX_CLOUDFLARE_BYTES) {
          console.warn(
            `[Medien] Skipping ${entry.name}/${sub.name} (${(stat.size / 1024 / 1024).toFixed(1)} MiB exceeds Cloudflare Pages 25 MiB limit)`
          );
          continue;
        }

        collectedFiles.push({
          absPath,
          relPath: path.join(entry.name, sub.name),
          fileName: sub.name,
          baseName: path.basename(sub.name, path.extname(sub.name)),
          ext,
          folderName: entry.name,
          stat,
        });
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!MEDIA_EXTENSIONS.has(ext)) continue;

      const stat = fs.statSync(fullPath);
      if (stat.size > MAX_CLOUDFLARE_BYTES) {
        console.warn(
          `[Medien] Skipping ${entry.name} (${(stat.size / 1024 / 1024).toFixed(1)} MiB exceeds Cloudflare Pages 25 MiB limit)`
        );
        continue;
      }

      collectedFiles.push({
        absPath: fullPath,
        relPath: entry.name,
        fileName: entry.name,
        baseName: path.basename(entry.name, path.extname(entry.name)),
        ext,
        folderName: null,
        stat,
      });
    }
  }

  if (collectedFiles.length === 0) {
    return null;
  }

  // Cleanly sync Medien -> public/medien (remove stale files that were deleted from Medien)
  fs.mkdirSync(publicMedienDir, { recursive: true });
  const validRelPaths = new Set(collectedFiles.map((f) => f.relPath));

  const cleanStaleFiles = (dir, relPrefix = '') => {
    if (!fs.existsSync(dir)) return;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
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

    const { categoryKey, label, seriesPrefix, priority, order } = parseFilename(
      file.baseName,
      file.folderName
    );

    if (!categoriesMap.has(categoryKey)) {
      categoriesMap.set(categoryKey, {
        key: categoryKey,
        label,
        items: [],
      });
    }

    categoriesMap.get(categoryKey).items.push({
      src: publicUrl,
      type: VIDEO_EXTENSIONS.has(file.ext) ? 'video' : 'image',
      seriesPrefix,
      priority,
      order,
      fileName: file.fileName,
    });
  }

  const medienProjects = [];
  const seenSlugs = new Set();

  Array.from(categoriesMap.values()).forEach((cat, idx) => {
    const sortedItems = sortCategoryItems(cat.items);

    let slug = toSlug(cat.label, idx);
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${idx + 1}`;
    }
    seenSlugs.add(slug);

    const cover = sortedItems[0];

    medienProjects.push({
      slug,
      type: cover.type,
      src: cover.src,
      label: cat.label,
      align: 'middle',
      wide: false,
      aspect: 'auto',
      startIndex: 0,
      images: sortedItems.map((item, imageIndex) => ({
        src: item.src,
        type: item.type,
        aspect: 'auto',
        caption: '',
        index: imageIndex,
      })),
    });
  });

  // Sort Row 1 projects in their fixed order (Samuel, Timon, Mercedes)
  const row1Projects = medienProjects
    .filter((p) => ROW_1_FOLDERS.has(p.slug))
    .sort((a, b) => ROW_1_ORDER.indexOf(a.slug) - ROW_1_ORDER.indexOf(b.slug));

  // Remaining Medien projects (e.g. DBB Double Header and future folders) go into Row 2+
  const extraProjects = medienProjects.filter((p) => !ROW_1_FOLDERS.has(p.slug));

  // Build the 4 rows:
  // - Row 1: row1Projects (if any placeholders are needed when < 3, fill from galleryRows[0])
  // - Row 2..4: fill first with extraProjects (1 title photo per project, e.g. DBB Double Header),
  //   and fill all remaining slots with the black placeholders from galleryRows!
  const rows = [];

  // Row 1
  const row1FallbackPlaceholders = (galleryRows[0]?.slides || []).slice(row1Projects.length);
  rows.push({
    id: 'row-01',
    slides:
      row1Projects.length >= 3
        ? row1Projects.map((p) => ({ ...p, rowId: 'row-01' }))
        : [...row1Projects, ...row1FallbackPlaceholders].map((p) => ({
            ...p,
            rowId: 'row-01',
          })),
  });

  // Rows 2, 3, 4: Place extraProjects (like DBB Double Header in Row 2) and fill the rest with black placeholders
  let extraCursor = 0;
  for (let rIdx = 1; rIdx < galleryRows.length; rIdx++) {
    const templateRow = galleryRows[rIdx];
    const rowId = templateRow.id || `row-0${rIdx + 1}`;
    const templateSlides = templateRow.slides || [];
    const slides = [];

    for (let sIdx = 0; sIdx < templateSlides.length; sIdx++) {
      if (extraCursor < extraProjects.length) {
        slides.push({
          ...extraProjects[extraCursor],
          rowId,
        });
        extraCursor++;
      } else {
        slides.push({
          ...templateSlides[sIdx],
          align: 'middle',
          rowId,
        });
      }
    }

    rows.push({
      id: rowId,
      slides,
    });
  }

  // Combine real Medien projects + placeholder projects so every clickable card has a valid static page
  const placeholderProjects = getAllProjects().filter((p) => !seenSlugs.has(p.slug));
  const projects = [...medienProjects, ...placeholderProjects];

  return { rows, projects };
}
