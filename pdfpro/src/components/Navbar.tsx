import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Sun, Moon, Menu, X, FileText } from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import clsx from 'clsx'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/tools', label: 'All Tools' },
  { href: '/blog', label: 'Blog' },
]

export default function Navbar() {
  const { theme, toggle } = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [location])

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'glass shadow-sm'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center shadow-md group-hover:shadow-orange-300/40 transition-shadow">
            <FileText size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight">
            PDF<span className="gradient-text">Pro</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === link.href
                  ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100 dark:text-ink-400 dark:hover:text-ink-100 dark:hover:bg-ink-800/50'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link
            to="/tools"
            className="hidden sm:flex items-center gap-1 px-4 py-2 gradient-brand text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-orange-400/30 hover:-translate-y-0.5 transition-all"
          >
            Start Free
          </Link>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass border-t border-[var(--border)] px-4 py-4 space-y-1 animate-slide-up">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              to={link.href}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/tools"
            className="block w-full mt-2 px-4 py-3 gradient-brand text-white rounded-lg text-sm font-semibold text-center"
          >
            Start Free — No Login
          </Link>
        </div>
      )}
    </header>
  )
}
