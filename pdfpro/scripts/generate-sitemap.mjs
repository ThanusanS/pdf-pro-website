// scripts/generate-sitemap.mjs
// Run: node scripts/generate-sitemap.mjs
// Output: public/sitemap.xml

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const BASE_URL = 'https://pdfpro.app'

const TOOL_IDS = [
  'merge', 'split', 'rotate', 'page-numbers', 'crop',
  'pdf-to-word', 'pdf-to-excel', 'pdf-to-ppt', 'pdf-to-jpg',
  'pdf-to-html', 'pdf-to-pdfa',
  'word-to-pdf', 'excel-to-pdf', 'ppt-to-pdf', 'jpg-to-pdf',
  'html-to-pdf', 'scan-to-pdf',
  'compress', 'repair',
  'protect', 'unlock', 'redact',
  'edit', 'watermark', 'sign',
  'ocr', 'compare', 'summarize',
]

const BLOG_SLUGS = [
  'how-to-compress-pdf-without-losing-quality',
  'merge-pdf-files-free-online',
  'pdf-to-word-converter-comparison',
  'how-to-sign-pdf-digitally',
  'ocr-pdf-make-searchable',
  'protect-pdf-with-password',
]

const today = new Date().toISOString().split('T')[0]

const urls = [
  { loc: '/', priority: '1.0', changefreq: 'weekly' },
  { loc: '/tools', priority: '0.9', changefreq: 'monthly' },
  { loc: '/blog', priority: '0.8', changefreq: 'weekly' },
  ...TOOL_IDS.map(id => ({
    loc: `/tools/${id}`,
    priority: '0.8',
    changefreq: 'monthly',
  })),
  ...BLOG_SLUGS.map(slug => ({
    loc: `/blog/${slug}`,
    priority: '0.7',
    changefreq: 'yearly',
  })),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${BASE_URL}${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

const outPath = join(__dirname, '../public/sitemap.xml')
writeFileSync(outPath, sitemap)
console.log(`✅ Sitemap written to ${outPath}`)
console.log(`   ${urls.length} URLs indexed`)
