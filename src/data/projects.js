/**
 * PORTFOLIO IDENTITY & GALLERY DATA
 * ---------------------------------------------------------------------------
 * Replace placeholder URLs in `galleryRows` with your own photography/video
 * files (e.g. placed in `public/media/...` and referenced as `/media/...`).
 *
 * Slide options:
 * - type:   'image' | 'video'
 * - src:    Image or MP4 path
 * - poster: Poster frame URL (for videos)
 * - label:  Project / frame title shown bottom-right on hover
 * - align:  'top' | 'middle' | 'bottom' (vertical stagger within the row)
 * - wide:   true (50vw on desktop) | false (25vw on desktop)
 * - aspect: 'auto' (or omit) → frame follows the file's own proportions (no cropping)
 *           CSS aspect ratio (e.g. '3 / 4', '4 / 3', '16 / 9') → fixed frame, media is cropped to fit
 */

export const siteIdentity = {
  name: 'Samir Feikert',
  monogram: 'SAMIR FEIKERT',
  subtitle: 'Ausgebildeter Fotograf aus Düsseldorf',
  email: 'kontakt@samirfeikert.de',
};

export const galleryRows = [
  {
    id: 'row-01',
    slides: [
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Studio Light Study I',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Portrait — Flingern',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Clara — Daylight',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Rhine Late Summer',
        align: 'middle',
        wide: true,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Media Harbor — Motion',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
      },
    ],
  },
  {
    id: 'row-02',
    slides: [
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Editorial Series II',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Hofgarten Evening',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Oberkassel — Portrait',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Character Study',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'West Coast — Archive',
        align: 'bottom',
        wide: true,
        aspect: '3 / 4',
      },
    ],
  },
  {
    id: 'row-03',
    slides: [
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Morning Light — Eifel',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Studio Session',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Mountain Pass — Film',
        align: 'top',
        wide: true,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Late Autumn Transit',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Classic Profile',
        align: 'bottom',
        wide: false,
        aspect: '3 / 4',
      },
    ],
  },
  {
    id: 'row-04',
    slides: [
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Architecture & Space',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Alpine Ridge — Dusk',
        align: 'top',
        wide: true,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Private Gathering',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Summer Portrait',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: '/media/placeholder-black.svg',
        label: 'Highlands',
        align: 'bottom',
        wide: false,
        aspect: '3 / 4',
      },
    ],
  },
];
