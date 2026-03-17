import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight, Tag } from 'lucide-react'
import AdBanner from '../components/AdBanner'

const POSTS = [
  {
    slug: 'how-to-compress-pdf-without-losing-quality',
    title: 'How to Compress a PDF Without Losing Quality in 2025',
    excerpt: 'Learn the best methods to reduce PDF file size while keeping your images and text sharp. We compare browser tools, desktop apps, and online solutions.',
    date: '2025-01-10',
    readTime: '5 min',
    category: 'Tutorial',
    tags: ['compress PDF', 'reduce PDF size', 'PDF optimization'],
    featured: true,
  },
  {
    slug: 'merge-pdf-files-free-online',
    title: 'How to Merge PDF Files Online for Free — No Software Needed',
    excerpt: 'Combining multiple PDF documents into one is easier than you think. Here is the fastest way to merge PDFs online without any software installation.',
    date: '2025-01-08',
    readTime: '4 min',
    category: 'How-To',
    tags: ['merge PDF', 'combine PDF', 'PDF merger'],
    featured: false,
  },
  {
    slug: 'pdf-to-word-converter-comparison',
    title: 'Best PDF to Word Converters in 2025: Free vs Paid',
    excerpt: 'Converting PDF to editable Word documents can be tricky. We tested 10 tools so you don\'t have to — here\'s which ones preserve formatting best.',
    date: '2025-01-05',
    readTime: '8 min',
    category: 'Comparison',
    tags: ['PDF to Word', 'PDF converter', 'DOCX'],
    featured: false,
  },
  {
    slug: 'how-to-sign-pdf-digitally',
    title: 'How to Sign a PDF Digitally (Free Methods for 2025)',
    excerpt: 'Electronic signatures are legally binding in most countries. Learn how to sign PDF documents for free using online tools, Adobe Reader, and your phone.',
    date: '2025-01-02',
    readTime: '6 min',
    category: 'Tutorial',
    tags: ['sign PDF', 'electronic signature', 'e-sign'],
    featured: false,
  },
  {
    slug: 'ocr-pdf-make-searchable',
    title: 'OCR PDF: How to Make Scanned Documents Searchable',
    excerpt: 'If you have scanned documents that you cannot search or copy text from, OCR technology can fix that. Here is how to use OCR on PDF files for free.',
    date: '2024-12-28',
    readTime: '5 min',
    category: 'How-To',
    tags: ['OCR PDF', 'searchable PDF', 'scan to PDF'],
    featured: false,
  },
  {
    slug: 'protect-pdf-with-password',
    title: 'How to Password-Protect a PDF File (Step-by-Step)',
    excerpt: 'Protecting sensitive documents with a password is simple. This guide shows you how to encrypt PDFs on Windows, Mac, and online — all for free.',
    date: '2024-12-22',
    readTime: '4 min',
    category: 'Security',
    tags: ['protect PDF', 'password PDF', 'encrypt PDF'],
    featured: false,
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Tutorial:   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'How-To':   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Comparison: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  Security:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

export default function BlogPage() {
  const featured = POSTS.find(p => p.featured)
  const rest = POSTS.filter(p => !p.featured)
  const allTags = Array.from(new Set(POSTS.flatMap(p => p.tags)))

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          PDF Tips and Tutorials
        </h1>
        <p className="text-ink-500 text-lg">
          Practical guides to get the most out of your PDF tools
        </p>
      </div>

      <AdBanner slot="blog-top" format="horizontal" className="mb-10" />

      {/* Featured post */}
      {featured && (
        <div className="mb-12 p-8 rounded-3xl border border-[var(--border)] bg-gradient-to-br from-brand-50 to-amber-50/50 dark:from-brand-900/20 dark:to-amber-900/10 card-hover">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400 mb-4 border border-brand-200 dark:border-brand-800">
            Featured
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-ink-900 dark:text-ink-100 mb-3">
            {featured.title}
          </h2>
          <p className="text-ink-600 dark:text-ink-400 mb-5 leading-relaxed">
            {featured.excerpt}
          </p>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 text-xs text-ink-400">
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {featured.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} /> {featured.readTime} read
              </span>
            </div>
            <Link
              to={`/blog/${featured.slug}`}
              className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold text-sm hover:gap-2 transition-all"
            >
              Read article <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}

      {/* Post grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {rest.map(post => (
          <article
            key={post.slug}
            className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] card-hover"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${CATEGORY_COLORS[post.category] ?? 'bg-ink-100 text-ink-600'}`}>
                {post.category}
              </span>
            </div>
            <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-100 mb-2 leading-snug">
              {post.title}
            </h2>
            <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <Calendar size={11} /> {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={11} /> {post.readTime}
                </span>
              </div>
              <Link
                to={`/blog/${post.slug}`}
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                Read <ArrowRight size={10} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Tag cloud */}
      <div className="mt-16 p-6 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)]">
        <h3 className="font-semibold text-ink-700 dark:text-ink-300 text-sm mb-4 flex items-center gap-2">
          <Tag size={14} /> Popular Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs bg-[var(--surface)] border border-[var(--border)] text-ink-500 dark:text-ink-400 cursor-pointer hover:border-brand-400 hover:text-brand-500 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
