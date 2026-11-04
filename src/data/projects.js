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
 * - aspect: CSS aspect ratio (e.g. '4 / 5', '3 / 4', '5 / 4', '16 / 9')
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
        src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
        label: 'Studio Light Study I',
        align: 'top',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1000&q=85',
        label: 'Portrait — Flingern',
        align: 'middle',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1000&q=85',
        label: 'Clara — Daylight',
        align: 'top',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=85',
        label: 'Rhine Late Summer',
        align: 'middle',
        wide: true,
        aspect: '5 / 4',
      },
      {
        type: 'video',
        src: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-driving-in-the-city-at-night-41574-large.mp4',
        poster:
          'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=1200&q=85',
        label: 'Media Harbor — Motion',
        align: 'top',
        wide: false,
        aspect: '4 / 5',
      },
    ],
  },
  {
    id: 'row-02',
    slides: [
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=85',
        label: 'Editorial Series II',
        align: 'top',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=85',
        label: 'Hofgarten Evening',
        align: 'middle',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85',
        label: 'Oberkassel — Portrait',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1000&q=85',
        label: 'Character Study',
        align: 'middle',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=85',
        label: 'West Coast — Archive',
        align: 'bottom',
        wide: true,
        aspect: '16 / 10',
      },
    ],
  },
  {
    id: 'row-03',
    slides: [
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1000&q=85',
        label: 'Morning Light — Eifel',
        align: 'top',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1000&q=85',
        label: 'Studio Session',
        align: 'middle',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'video',
        src: 'https://assets.mixkit.co/videos/preview/mixkit-POV-of-a-car-driving-fast-on-a-highway-41576-large.mp4',
        poster:
          'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1600&q=85',
        label: 'Mountain Pass — Film',
        align: 'top',
        wide: true,
        aspect: '16 / 9',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1000&q=85',
        label: 'Late Autumn Transit',
        align: 'middle',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1000&q=85',
        label: 'Classic Profile',
        align: 'bottom',
        wide: false,
        aspect: '4 / 5',
      },
    ],
  },
  {
    id: 'row-04',
    slides: [
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85',
        label: 'Architecture & Space',
        align: 'middle',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=85',
        label: 'Alpine Ridge — Dusk',
        align: 'top',
        wide: true,
        aspect: '5 / 4',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=85',
        label: 'Private Gathering',
        align: 'middle',
        wide: false,
        aspect: '4 / 5',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=1000&q=85',
        label: 'Summer Portrait',
        align: 'top',
        wide: false,
        aspect: '3 / 4',
      },
      {
        type: 'image',
        src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85',
        label: 'Highlands',
        align: 'bottom',
        wide: false,
        aspect: '4 / 5',
      },
    ],
  },
];
