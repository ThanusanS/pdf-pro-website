import React, { useState } from 'react'
import { Search, SearchX } from 'lucide-react'
import { TOOLS, TOOL_CATEGORIES, ToolCategory } from '../utils/tools'
import ToolCard from '../components/ToolCard'
import AdBanner from '../components/AdBanner'

export default function ToolsPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<ToolCategory | 'all'>('all')

  const filtered = TOOLS.filter(t => {
    const matchesQuery =
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase())
    const matchesCat = activeCategory === 'all' || t.category === activeCategory
    return matchesQuery && matchesCat
  })

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          All PDF Tools
        </h1>
        <p className="text-ink-500 text-lg">30+ free tools. No login required.</p>
      </div>

      <div className="relative max-w-lg mx-auto mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          placeholder="Search tools..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-ink-800 dark:text-ink-200 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-10">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'gradient-brand text-white shadow-md'
              : 'bg-[var(--surface-2)] border border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-brand-400'
          }`}
        >
          All Tools ({TOOLS.length})
        </button>
        {(Object.entries(TOOL_CATEGORIES) as [ToolCategory, { label: string }][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeCategory === key
                ? 'gradient-brand text-white shadow-md'
                : 'bg-[var(--surface-2)] border border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-brand-400'
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      <div className="flex justify-center mb-10">
        <AdBanner slot="tools-top" format="horizontal" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-ink-400">
          <div className="flex justify-center mb-4">
            <SearchX size={48} className="text-ink-300" />
          </div>
          <p className="text-lg font-medium">No tools found for "{query}"</p>
          <button onClick={() => setQuery('')} className="mt-3 text-brand-500 hover:underline text-sm">
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  )
}
