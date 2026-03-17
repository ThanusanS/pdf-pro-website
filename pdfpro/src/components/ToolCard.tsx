import React from 'react'
import { Link } from 'react-router-dom'
import { Tool } from '../utils/tools'
import clsx from 'clsx'

interface ToolCardProps {
  tool: Tool
  compact?: boolean
}

const BADGE_STYLES = {
  popular: 'bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-400',
  new:     'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  ai:      'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
}

export default function ToolCard({ tool, compact = false }: ToolCardProps) {
  const Icon = tool.icon

  return (
    <Link
      to={`/tools/${tool.id}`}
      className={clsx(
        'group block bg-[var(--surface)] dark:bg-ink-900/50 rounded-2xl border border-[var(--border)] transition-all duration-200',
        'hover:-translate-y-1 hover:shadow-lg hover:border-transparent',
        compact ? 'p-4' : 'p-5'
      )}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${tool.color}25`
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = ''
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className={clsx(
            'flex-shrink-0 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110',
            compact ? 'w-9 h-9' : 'w-11 h-11'
          )}
          style={{ backgroundColor: tool.color }}
        >
          <Icon size={compact ? 16 : 20} className="text-white" strokeWidth={1.75} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className={clsx(
              'font-semibold text-ink-800 dark:text-ink-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors',
              compact ? 'text-sm' : 'text-base'
            )}>
              {tool.name}
            </h3>
            {tool.badge && (
              <span className={clsx(
                'px-1.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide flex-shrink-0',
                BADGE_STYLES[tool.badge]
              )}>
                {tool.badge}
              </span>
            )}
          </div>
          {!compact && (
            <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed line-clamp-2">
              {tool.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
