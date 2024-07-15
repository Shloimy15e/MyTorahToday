const fs = require('fs');
const path = require('path');


const siteUrl = 'https://www.mytorahtoday.com';

const topics = [
  'parshah',
  'neviim',
  'chassidus',
  'lifes-ways'
]

const urls = [
  { loc: siteUrl, lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 1.0 },
  ...topics.map(topic => ({
    loc: `${siteUrl}/topics/${topic}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly',
    priority: 0.8,
  })),
  // Add more URLs for subtopics and video pages
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(__dirname, '../../public/sitemap.xml'), sitemap);
console.log('Sitemap generated successfully!');
