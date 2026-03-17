import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Zap, Shield, Globe, Star, ChevronRight,
  FileText, Merge, Scissors, Minimize2, Image, PenLine,
  Stamp, FileSignature, RotateCw, CheckCircle2
} from 'lucide-react'
import { TOOLS, TOOL_CATEGORIES, ToolCategory } from '../utils/tools'
import ToolCard from '../components/ToolCard'
import AdBanner from '../components/AdBanner'

const POPULAR_IDS = ['merge', 'split', 'compress', 'pdf-to-word', 'jpg-to-pdf', 'sign', 'watermark', 'rotate']

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant Processing',
    desc: 'All tools run directly in your browser — no uploads to servers for basic operations.',
  },
  {
    icon: Shield,
    title: 'Private and Secure',
    desc: 'Your files stay on your device. We never store or share your documents.',
  },
  {
    icon: Globe,
    title: 'No Login Required',
    desc: 'Just open, use, and download. Zero registration, zero friction, zero cost.',
  },
]

const STATS = [
  { value: '30+',   label: 'PDF Tools'          },
  { value: '100K+', label: 'Monthly Users'      },
  { value: '0',     label: 'Sign-up Required'   },
  { value: '100%',  label: 'Free'               },
]

const TESTIMONIALS = [
  {
    name: 'Sarah M.',
    role: 'Freelance Designer',
    text: 'The fastest PDF merger I\'ve used. No login, no nonsense — just works.',
    stars: 5,
  },
  {
    name: 'James K.',
    role: 'HR Manager',
    text: 'We use PDFPro daily for employee documents. The compress tool is exceptional.',
    stars: 5,
  },
  {
    name: 'Priya L.',
    role: 'Graduate Student',
    text: 'Converting PDFs to Word for my thesis was a lifesaver. Totally free.',
    stars: 5,
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Upload',
    desc: 'Drag and drop or click to select your PDF file from any device.',
  },
  {
    step: '02',
    title: 'Process',
    desc: 'Choose your tool and apply changes instantly in your browser.',
  },
  {
    step: '03',
    title: 'Download',
    desc: 'Your file is ready immediately. Download and you\'re done.',
  },
]

export default function HomePage() {
  const popularTools = TOOLS.filter(t => POPULAR_IDS.includes(t.id))

  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-400/20 dark:bg-brand-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-amber-400/15 dark:bg-amber-600/10 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 text-sm font-medium mb-8 border border-brand-200 dark:border-brand-800">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            100% Free — No Account Needed
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-ink-950 dark:text-ink-50 tracking-tight leading-[1.05] mb-6">
            Every PDF tool<br />
            <span className="gradient-text">you will ever need</span>
          </h1>

          <p className="text-xl text-ink-600 dark:text-ink-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Merge, split, compress, convert, edit, sign and more — all in your browser.
            No signup. No watermarks. No limits.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/tools"
              className="flex items-center gap-2 px-8 py-4 gradient-brand text-white rounded-2xl font-semibold text-lg shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all"
            >
              Browse All Tools
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/tools/merge"
              className="flex items-center gap-2 px-8 py-4 bg-[var(--surface-2)] border border-[var(--border)] text-ink-700 dark:text-ink-300 rounded-2xl font-semibold text-lg hover:border-brand-400 transition-all"
            >
              Merge PDF Free
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-ink-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Banner */}
      <div className="flex justify-center px-4 mb-12">
        <AdBanner slot="hero-bottom" format="horizontal" />
      </div>

      {/* Popular Tools */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">
              Popular Tools
            </h2>
            <p className="text-ink-500 mt-1">Most used PDF utilities</p>
          </div>
          <Link
            to="/tools"
            className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium text-sm hover:gap-2 transition-all"
          >
            View all <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularTools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* All Categories */}
      <section className="bg-ink-50/70 dark:bg-ink-900/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">
              30+ Tools, One Platform
            </h2>
            <p className="text-ink-500 text-lg">Everything you need to work with PDF files</p>
          </div>

          <div className="space-y-12">
            {(Object.keys(TOOL_CATEGORIES) as ToolCategory[]).map(cat => {
              const catTools = TOOLS.filter(t => t.category === cat)
              const { label } = TOOL_CATEGORIES[cat]
              return (
                <div key={cat}>
                  <h3 className="font-display text-xl font-bold text-ink-800 dark:text-ink-200 mb-4 flex items-center gap-3">
                    <span className="w-1 h-6 rounded-full gradient-brand inline-block" />
                    {label}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {catTools.map(tool => <ToolCard key={tool.id} tool={tool} compact />)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">
            Why PDFPro?
          </h2>
          <p className="text-ink-500 text-lg">Built for speed, privacy, and simplicity</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div
              key={f.title}
              className="p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] card-hover"
            >
              <div className="w-12 h-12 gradient-brand rounded-xl flex items-center justify-center mb-5 shadow-md shadow-brand-500/20">
                <f.icon size={22} className="text-white" />
              </div>
              <h3 className="font-display text-xl font-bold text-ink-900 dark:text-ink-100 mb-2">
                {f.title}
              </h3>
              <p className="text-ink-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-ink-950 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Simple as 1, 2, 3
          </h2>
          <p className="text-ink-400 text-lg mb-14">
            No setup. No registration. Instant results.
          </p>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-brand-600 via-brand-400 to-brand-600" />

            {HOW_IT_WORKS.map(item => (
              <div key={item.step} className="relative">
                <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center mx-auto mb-5 shadow-xl shadow-brand-600/30 font-display font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-ink-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100 mb-2">
            Trusted by millions
          </h2>
          <p className="text-ink-500">Real users, real productivity gains</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] card-hover"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <Star key={j} size={14} className="fill-brand-400 text-brand-400" />
                ))}
              </div>
              <p className="text-ink-700 dark:text-ink-300 mb-4 leading-relaxed">
                "{t.text}"
              </p>
              <div>
                <p className="font-semibold text-ink-900 dark:text-ink-100 text-sm">{t.name}</p>
                <p className="text-ink-400 text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-12 shadow-2xl shadow-brand-500/25">
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-2">
              {[CheckCircle2, CheckCircle2, CheckCircle2].map((Icon, i) => (
                <Icon key={i} size={20} className="text-brand-200" />
              ))}
            </div>
          </div>
          <h2 className="font-display text-4xl font-bold text-white mb-4">
            Start using PDFPro today
          </h2>
          <p className="text-brand-100 text-lg mb-8">
            Free forever. No credit card. No account required.
          </p>
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-700 rounded-2xl font-bold text-lg hover:bg-brand-50 hover:-translate-y-0.5 transition-all shadow-xl"
          >
            Get Started Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  )
}
