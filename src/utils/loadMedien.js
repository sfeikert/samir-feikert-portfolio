import fs from 'node:fs';
import path from 'node:path';

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

const ALIGN_PATTERN = ['top', 'middle', 'top', 'middle', 'bottom'];

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

  // Replace underscores with spaces if no spaces exist
  const normalized = trimmed.includes(' ')
    ? trimmed
    : trimmed.replace(/_/g, ' ');

  // Capitalize first letter of words if entirely lowercase
  if (normalized === normalized.toLowerCase()) {
    return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
  }

  return normalized;
}

/**
 * Extracts `{ categoryKey, label, order }` from a filename (without extension).
 * Examples:
 * - "Portrait Flingern 1" -> { label: "Portrait Flingern", order: 1 }
 * - "Editorial_02"        -> { label: "Editorial", order: 2 }
 * - "1_Studio"            -> { label: "Studio", order: 1 }
 */
function parseFilename(baseName, folderName = null) {
  const clean = baseName.trim();

  if (folderName) {
    // Inside a subfolder: folder is the category, number in filename is the order
    const numMatch = clean.match(/(\d+)/);
    const order = numMatch ? parseInt(numMatch[1], 10) : 999;
    const label = formatCategoryLabel(folderName);
    return {
      categoryKey: label.toLowerCase(),
      label,
      order,
    };
  }

  // Case 1: Name followed by number at the end, e.g. "Kategorie 1", "Kategorie-01", "Kategorie (1)"
  const trailingMatch = clean.match(/^(.+?)[-_.\s(]*(\d+)\)?$/);
  if (trailingMatch && trailingMatch[1].trim()) {
    const label = formatCategoryLabel(trailingMatch[1]);
    const order = parseInt(trailingMatch[2], 10);
    return {
      categoryKey: label.toLowerCase(),
      label,
      order,
    };
  }

  // Case 2: Number at the start followed by name, e.g. "1 Kategorie", "01_Kategorie"
  const leadingMatch = clean.match(/^(\d+)[-_.\s]+(.+)$/);
  if (leadingMatch && leadingMatch[2].trim()) {
    const label = formatCategoryLabel(leadingMatch[2]);
    const order = parseInt(leadingMatch[1], 10);
    return {
      categoryKey: label.toLowerCase(),
      label,
      order,
    };
  }

  // Case 3: No number in filename -> single-image category
  const label = formatCategoryLabel(clean);
  return {
    categoryKey: label.toLowerCase(),
    label,
    order: 1,
  };
}

/**
 * Syncs files from `/Medien` to `/public/medien` and returns grouped projects & rows.
 * Returns `null` if `/Medien` does not exist or contains no media files.
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

        collectedFiles.push({
          absPath: path.join(fullPath, sub.name),
          relPath: path.join(entry.name, sub.name),
          fileName: sub.name,
          baseName: path.basename(sub.name, path.extname(sub.name)),
          ext,
          folderName: entry.name,
        });
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (!MEDIA_EXTENSIONS.has(ext)) continue;

      collectedFiles.push({
        absPath: fullPath,
        relPath: entry.name,
        fileName: entry.name,
        baseName: path.basename(entry.name, path.extname(entry.name)),
        ext,
        folderName: null,
      });
    }
  }

  if (collectedFiles.length === 0) {
    return null;
  }

  // Ensure public/medien exists and sync files so Astro serves them at /medien/...
  fs.mkdirSync(publicMedienDir, { recursive: true });

  const categoriesMap = new Map();

  for (const file of collectedFiles) {
    const targetPath = path.join(publicMedienDir, file.relPath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    let shouldCopy = !fs.existsSync(targetPath);
    if (!shouldCopy) {
      const srcStat = fs.statSync(file.absPath);
      const destStat = fs.statSync(targetPath);
      if (srcStat.size !== destStat.size || srcStat.mtimeMs > destStat.mtimeMs) {
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

    const { categoryKey, label, order } = parseFilename(file.baseName, file.folderName);

    if (!categoriesMap.has(categoryKey)) {
      categoriesMap.set(categoryKey, {
        label,
        items: [],
      });
    }

    categoriesMap.get(categoryKey).items.push({
      src: publicUrl,
      type: VIDEO_EXTENSIONS.has(file.ext) ? 'video' : 'image',
      order,
      fileName: file.fileName,
    });
  }

  // Sort items within each category: 1 first (cover image), then 2, 3, 4...
  const projects = [];
  const seenSlugs = new Set();

  Array.from(categoriesMap.values()).forEach((cat, idx) => {
    cat.items.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.fileName.localeCompare(b.fileName, 'de', { numeric: true });
    });

    let slug = toSlug(cat.label, idx);
    if (seenSlugs.has(slug)) {
      slug = `${slug}-${idx + 1}`;
    }
    seenSlugs.add(slug);

    const cover = cat.items[0];
    const align = ALIGN_PATTERN[idx % ALIGN_PATTERN.length];

    projects.push({
      slug,
      type: cover.type,
      src: cover.src,
      label: cat.label,
      align,
      wide: false,
      aspect: 'auto',
      images: cat.items.map((item, imageIndex) => ({
        src: item.src,
        type: item.type,
        aspect: 'auto',
        caption: '',
        index: imageIndex,
      })),
    });
  });

  // Distribute projects across up to 4 horizontal rows (like the reference layout)
  const targetRowCount = Math.min(4, Math.max(1, Math.ceil(projects.length / 4)));
  const rows = Array.from({ length: targetRowCount }, (_, rIdx) => ({
    id: `row-0${rIdx + 1}`,
    slides: [],
  }));

  projects.forEach((proj, idx) => {
    const rowIdx = idx % targetRowCount;
    rows[rowIdx].slides.push({
      ...proj,
      rowId: rows[rowIdx].id,
    });
  });

  return { rows, projects };
}
