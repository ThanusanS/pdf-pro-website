# PDFPro – Production-Grade PDF Platform

A modern, SEO-optimized, no-login PDF platform built with React + TypeScript + Tailwind CSS.
Handles 100k+ monthly users, integrates Google AdSense, and runs key tools entirely in the browser.

---

##  Quick Start

```bash
npm install
npm run dev       # development server
npm run build     # production build
npm run preview   # preview production build
```

---

##  Project Structure

```
pdfpro/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── DropZone.tsx      # Drag & drop upload
│   │   ├── PDFPreview.tsx    # PDF.js canvas renderer
│   │   ├── ToolCard.tsx      # Tool grid card
│   │   └── AdBanner.tsx      # Google AdSense zones
│   ├── pages/
│   │   ├── HomePage.tsx      # Landing page (SEO hero)
│   │   ├── ToolsPage.tsx     # All tools directory
│   │   ├── BlogPage.tsx      # SEO blog/tutorials
│   │   └── tools/
│   │       ├── MergeTool.tsx
│   │       ├── SplitTool.tsx
│   │       ├── CompressTool.tsx
│   │       ├── RotateTool.tsx
│   │       ├── WatermarkTool.tsx
│   │       ├── ImagesToPdfTool.tsx
│   │       ├── PageNumbersTool.tsx
│   │       └── GenericToolPage.tsx  # Fallback for server-side tools
│   ├── hooks/
│   │   └── useTheme.ts       # Dark/light mode
│   ├── utils/
│   │   ├── tools.ts          # Tool definitions (30+ tools)
│   │   └── pdfProcessing.ts  # pdf-lib / PDF.js wrappers
│   └── styles/
│       └── globals.css
├── api/                     # Vercel/Netlify serverless functions
│   ├── pdf-to-word.ts       # LibreOffice conversion
│   ├── compress.ts          # Ghostscript compression
│   └── summarize.ts         # OpenAI GPT-4o summarizer
├── public/
│   └── manifest.json        # PWA manifest
├── vercel.json
├── netlify.toml
└── index.html               # SEO meta tags + Schema.org
```

---

##  Browser-Side Tools (No Backend)

These tools run entirely in the browser using **pdf-lib** and **PDF.js**:

| Tool | Library |
|------|---------|
| Merge PDF | pdf-lib |
| Split PDF | pdf-lib |
| Rotate PDF | pdf-lib |
| Watermark PDF | pdf-lib |
| Add Page Numbers | pdf-lib |
| JPG → PDF | pdf-lib |
| Compress PDF (basic) | pdf-lib |
| PDF Preview | PDF.js |

---

##  Server-Side Tools (Serverless Functions)

These require a backend and are handled by `/api/` functions:

| Tool | Tech |
|------|------|
| PDF → Word | LibreOffice |
| PDF → Excel | LibreOffice |
| PDF → PowerPoint | LibreOffice |
| Compress PDF (advanced) | Ghostscript |
| AI Summarizer | OpenAI GPT-4o-mini |
| OCR PDF | Tesseract.js or Google Vision API |
| Protect/Unlock PDF | node-pdftk or pdf-lib (partial) |

### Environment Variables

```env
OPENAI_API_KEY=sk-...          # For AI summarizer
# Optional: 3rd-party conversion APIs
CONVERTAPI_SECRET=...
CLOUDCONVERT_API_KEY=...
```

---

##  Google AdSense Placement Strategy

Edit `src/components/AdBanner.tsx` and uncomment the `<ins>` tag.
Replace `ca-pub-XXXXXXXXXXXXXXXX` with your Publisher ID.

**Recommended placements (UX-friendly):**

1. **Below hero** (`/`) — 728×90 Leaderboard → slot: `hero-bottom`
2. **Tools directory page** — 728×90 Leaderboard → slot: `tools-top`
3. **After each tool result** — 300×250 Rectangle → slot: `tool-bottom`
4. **Blog sidebar** — 300×600 Half Page → slot: `blog-sidebar`
5. **Between blog sections** — 728×90 Leaderboard → slot: `blog-inline`

**What to avoid:**
- Ads that pop in front of the upload zone
- Auto-ads on tool-active pages (breaks UX)
- More than 3 ads per page

---

##  SEO Strategy

### On-Page SEO
- `index.html` contains full meta tags, OG, Twitter Cards, Schema.org WebApplication
- Every tool page has its own `<h1>` with primary keyword
- SEO content blocks at bottom of each tool page
- Blog section drives long-tail keyword traffic

### Target Keywords
| Page | Primary Keyword |
|------|----------------|
| Home | "free online PDF tools" |
| /tools/merge | "merge PDF online free" |
| /tools/split | "split PDF online free" |
| /tools/compress | "compress PDF without losing quality" |
| /tools/pdf-to-word | "PDF to Word converter free" |
| /tools/sign | "sign PDF online free" |
| /blog | "PDF tips and tutorials" |

### Technical SEO
- All routes are crawlable (no hash routing)
- Static meta in `index.html` + dynamic per-page titles (add react-helmet for SSG)
- Sitemap: generate with `vite-plugin-sitemap` or manually at `/public/sitemap.xml`
- Core Web Vitals: lazy load PDF.js, code-split per tool

---

##  Scaling to 100K+ Monthly Users

### Frontend (Vercel/Netlify CDN)
- Static assets cached globally via CDN
- JS bundles split per tool (lazy loaded)
- Service Worker for PWA offline caching

### Backend (Serverless)
- Each API function scales independently
- Stateless — no database
- Cold start mitigation: keep functions <10MB
- File processing: stream, don't buffer large files in memory

### Rate Limiting
Add to each API function:
```typescript
import rateLimit from 'express-rate-limit'
// 20 requests per minute per IP
```

### File Size Limits
- Browser tools: up to 100MB (client RAM dependent)
- Server tools: 25MB default (increase Vercel memory to 3GB for heavy PDFs)

---

##  Design System

| Token | Value |
|-------|-------|
| Brand | `#f97316` (Orange 500) |
| Background | `#f8f7f4` (warm white) / `#1a1612` (dark) |
| Font | Clash Display (headings) + DM Sans (body) |
| Border radius | `xl` (12px) / `2xl` (16px) / `3xl` (24px) |
| Shadows | Brand-tinted: `shadow-brand-500/25` |

---

##  PWA Support

The `public/manifest.json` enables installability.
Add a service worker with Workbox for offline support:

```bash
npm install workbox-window vite-plugin-pwa
```

Then configure in `vite.config.ts`:
```typescript
import { VitePWA } from 'vite-plugin-pwa'
plugins: [react(), VitePWA({ ... })]
```

---

##  Analytics

Add Plausible (privacy-friendly) or Google Analytics 4:

```html
<!-- In index.html -->
<script defer data-domain="pdfpro.app" src="https://plausible.io/js/script.js"></script>
```

---

##  Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

##  License

MIT License — free to use, modify, and deploy.
