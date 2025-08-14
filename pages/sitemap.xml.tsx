import { GetServerSideProps } from 'next';
import { prisma } from '../lib/prismaCustomClient';

const Sitemap = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const host = process.env.NEXTAUTH_URL || process.env.SITE_URL || 'http://localhost:3000';
  // Fetch all product IDs and last modified dates
  const products = await prisma.producto.findMany({ select: { id: true, creadoEn: true } });

  // Static pages
  const staticPaths = ['/', '/productos'];
  const staticUrls = staticPaths
    .map((path) => `<url><loc>${host}${path}</loc></url>`)
    .join('');

  // Dynamic product pages
  const productUrls = products
    .map(({ id, creadoEn }) => `
    <url>
      <loc>${host}/producto/${id}</loc>
      <lastmod>${creadoEn.toISOString()}</lastmod>
    </url>`)
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${staticUrls}
    ${productUrls}
  </urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();

  return { props: {} };
};

export default Sitemap;
