import { getAllProjects } from '../data/projects.js';
import { loadMedienProjects } from '../utils/loadMedien.js';

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET({ site }) {
  const baseOrigin = site || 'https://samirfeikert.com';
  const medienData = loadMedienProjects();
  const projects = medienData?.projects?.length ? medienData.projects : getAllProjects();

  const urls = [new URL('/', baseOrigin).href];
  const seenSlugs = new Set();

  for (const project of projects) {
    if (!project?.slug || seenSlugs.has(project.slug)) continue;
    seenSlugs.add(project.slug);
    urls.push(new URL(`/projects/${encodeURIComponent(project.slug)}`, baseOrigin).href);
  }

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n');

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}
