/**
 * PORTFOLIO IDENTITY & GALLERY DATA
 * ---------------------------------------------------------------------------
 * Replace placeholder URLs in `galleryRows` with your own photography/video
 * files (e.g. placed in `public/media/...` and referenced as `/media/...`).
 *
 * Slide / Project options:
 * - slug:   URL path for the project detail page (e.g. 'studio-light-study-i' → /projects/studio-light-study-i)
 * - type:   'image' | 'video'
 * - src:    Cover image or MP4 path shown on the start page
 * - poster: Poster frame URL (for videos)
 * - label:  Project / series title shown on hover and on the project page
 * - align:  'top' | 'middle' | 'bottom' (vertical stagger within the row)
 * - wide:   true (50vw on desktop) | false (25vw on desktop)
 * - aspect: 'auto' (or omit) → frame follows the file's own proportions (no cropping)
 *           CSS aspect ratio (e.g. '3 / 4', '4 / 3', '16 / 9') → fixed frame, media is cropped to fit
 * - images: Array of images for the click-through project page.
 *           Can be simple paths: ['/media/serie-1/01.jpg', '/media/serie-1/02.jpg']
 *           or objects: [{ src: '/media/serie-1/01.jpg', aspect: 'auto', caption: 'Optional' }]
 */

export const siteIdentity = {
  name: 'Samir Feikert',
  monogram: 'SAMIR FEIKERT',
  subtitle: 'Ausgebildeter Fotograf aus Düsseldorf',
  email: 'contact.samirfeikert@gmail.com',
  phone: '+49 176 31501119',
  address: {
    street: 'Ruhrtalstraße 16',
    city: '40233 Düsseldorf',
    country: 'Deutschland',
  },
};

export const aboutContent = {
  headline: 'Ich bin Samir, Fotograf mit Ausbildung in Freiburg und Sitz in Düsseldorf.',
  lead:
    'Mit einer Leidenschaft für authentische Bilder, bei denen Momente gezeigt werden so wie sie sind – ehrlich und ohne Inszenierung.',
  body:
    'Mit einem klaren Blick für richtige Momente, Licht und Ausdruck arbeite ich analog inspiriert, aber modern umgesetzt – reduziert auf das Wesentliche.\n\nMeine Fotografie soll nicht nur festhalten, sondern eine Geschichte erzählen. In einer Zeit, in der so vieles inszeniert wirkt, liegt mein Fokus auf Authentizität.',
};

export const exhibitionItems = [
  {
    id: 'ex-01',
    title: 'FLINGERN STUDIEN',
    year: '2025',
    location: 'Düsseldorf',
    count: '01 / 06',
    src: '/media/placeholder-black.svg',
    aspect: '3 / 4',
    colSpan: 'col-span-12 sm:col-span-7 lg:col-span-5',
    offsetClass: 'lg:mt-6',
  },
  {
    id: 'ex-02',
    title: 'FREIBURG ARCHIV',
    year: '2024',
    location: 'Freiburg im Breisgau',
    count: '01 / 04',
    src: '/media/placeholder-black.svg',
    aspect: '4 / 3',
    colSpan: 'col-span-12 sm:col-span-5 lg:col-span-7',
    offsetClass: 'lg:mt-24',
  },
  {
    id: 'ex-03',
    title: 'LICHT & RAUM II',
    year: '2024',
    location: 'Werkschau',
    count: '01 / 08',
    src: '/media/placeholder-black.svg',
    aspect: '16 / 10',
    colSpan: 'col-span-12 sm:col-span-6 lg:col-span-6',
    offsetClass: 'lg:-mt-12',
  },
  {
    id: 'ex-04',
    title: 'ANALOG OBSERVATIONS',
    year: '2024',
    location: 'Freiburg / Düsseldorf',
    count: '01 / 05',
    src: '/media/placeholder-black.svg',
    aspect: '3 / 4',
    colSpan: 'col-span-12 sm:col-span-6 lg:col-span-4',
    offsetClass: 'lg:mt-16',
  },
  {
    id: 'ex-05',
    title: 'PORTRAITSERIE I',
    year: '2025',
    location: 'Düsseldorf',
    count: '01 / 07',
    src: '/media/placeholder-black.svg',
    aspect: '4 / 5',
    colSpan: 'col-span-12 sm:col-span-7 lg:col-span-4',
    offsetClass: 'lg:mt-0',
  },
  {
    id: 'ex-06',
    title: 'DAILY OPERATIONS',
    year: '2025',
    location: 'Selected Archive',
    count: '01 / 12',
    src: '/media/placeholder-black.svg',
    aspect: '16 / 9',
    colSpan: 'col-span-12 sm:col-span-5 lg:col-span-8',
    offsetClass: 'lg:mt-20',
  },
];

export const galleryRows = [
  {
    id: 'row-01',
    slides: [
      {
        slug: 'studio-light-study-i',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Studio Light Study I',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'portrait-flingern',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Portrait — Flingern',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'clara-daylight',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Clara — Daylight',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'rhine-late-summer',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Rhine Late Summer',
        align: 'middle',
        wide: true,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'media-harbor-motion',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Media Harbor — Motion',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
    ],
  },
  {
    id: 'row-02',
    slides: [
      {
        slug: 'editorial-series-ii',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Editorial Series II',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'hofgarten-evening',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Hofgarten Evening',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'oberkassel-portrait',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Oberkassel — Portrait',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'character-study',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Character Study',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'west-coast-archive',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'West Coast — Archive',
        align: 'bottom',
        wide: true,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
    ],
  },
  {
    id: 'row-03',
    slides: [
      {
        slug: 'morning-light-eifel',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Morning Light — Eifel',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'studio-session',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Studio Session',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'mountain-pass-film',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Mountain Pass — Film',
        align: 'top',
        wide: true,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'late-autumn-transit',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Late Autumn Transit',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'classic-profile',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Classic Profile',
        align: 'bottom',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
    ],
  },
  {
    id: 'row-04',
    slides: [
      {
        slug: 'architecture-and-space',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Architecture & Space',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'alpine-ridge-dusk',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Alpine Ridge — Dusk',
        align: 'top',
        wide: true,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'private-gathering',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Private Gathering',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'summer-portrait',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Summer Portrait',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
      {
        slug: 'highlands',
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Highlands',
        align: 'bottom',
        wide: false,
        aspect: '3 / 4',
        images: [
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
          '/media/placeholder-black.svg',
        ],
      },
    ],
  },
];

/**
 * Helper to create a URL-safe slug from a project label if `slug` is omitted.
 */
export function toProjectSlug(slide, fallbackIndex = 0) {
  if (slide?.slug) return slide.slug;
  if (slide?.label) {
    return slide.label
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  return `project-${fallbackIndex + 1}`;
}

export function isVideoPath(src = '') {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(src);
}

/**
 * Flattens all slides from `galleryRows` into normalized project objects
 * for static route generation (`/projects/[slug]`).
 */
export function getAllProjects() {
  const projects = [];
  const seenSlugs = new Set();

  galleryRows.forEach((row) => {
    (row.slides || []).forEach((slide, idx) => {
      let slug = toProjectSlug(slide, projects.length + idx);
      if (seenSlugs.has(slug)) {
        slug = `${slug}-${projects.length + 1}`;
      }
      seenSlugs.add(slug);

      const rawImages =
        Array.isArray(slide.images) && slide.images.length > 0
          ? slide.images
          : [slide.src];

      const normalizedImages = rawImages.map((entry, imageIndex) => {
        if (typeof entry === 'string') {
          return {
            src: entry,
            type: isVideoPath(entry) ? 'video' : 'image',
            aspect: slide.aspect || 'auto',
            caption: '',
            index: imageIndex,
          };
        }
        const resolvedSrc = entry.src || slide.src;
        return {
          src: resolvedSrc,
          type: entry.type || (isVideoPath(resolvedSrc) ? 'video' : 'image'),
          poster: entry.poster || slide.poster,
          aspect: entry.aspect || slide.aspect || 'auto',
          caption: entry.caption || '',
          index: imageIndex,
        };
      });

      projects.push({
        ...slide,
        type: slide.type || (isVideoPath(slide.src) ? 'video' : 'image'),
        slug,
        rowId: row.id,
        images: normalizedImages,
      });
    });
  });

  return projects;
}
