import React from 'react'
import { Link } from 'react-router-dom'
import { FileText, Twitter, Github, Linkedin } from 'lucide-react'

const FOOTER_LINKS = {
  'PDF Tools': [
    { label: 'Merge PDF',     href: '/tools/merge'        },
    { label: 'Split PDF',     href: '/tools/split'        },
    { label: 'Compress PDF',  href: '/tools/compress'     },
    { label: 'Rotate PDF',    href: '/tools/rotate'       },
    { label: 'Watermark PDF', href: '/tools/watermark'    },
  ],
  'Convert PDF': [
    { label: 'PDF to Word',   href: '/tools/pdf-to-word'  },
    { label: 'PDF to Excel',  href: '/tools/pdf-to-excel' },
    { label: 'PDF to JPG',    href: '/tools/pdf-to-jpg'   },
    { label: 'Word to PDF',   href: '/tools/word-to-pdf'  },
    { label: 'JPG to PDF',    href: '/tools/jpg-to-pdf'   },
  ],
  'PDF Security': [
    { label: 'Protect PDF',   href: '/tools/protect'      },
    { label: 'Unlock PDF',    href: '/tools/unlock'       },
    { label: 'Redact PDF',    href: '/tools/redact'       },
    { label: 'Sign PDF',      href: '/tools/sign'         },
    { label: 'OCR PDF',       href: '/tools/ocr'          },
  ],
  'Company': [
    { label: 'About',         href: '/about'    },
    { label: 'Blog',          href: '/blog'     },
    { label: 'Privacy Policy',href: '/privacy'  },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact',       href: '/contact'  },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-ink-300 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 gradient-brand rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                PDF<span className="gradient-text">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-ink-500 leading-relaxed mb-4">
              Free online PDF tools. No login, no watermarks, no limits.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Twitter size={14} />
              </a>
              <a href="https://github.com" aria-label="GitHub" className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Github size={14} />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-ink-800 flex items-center justify-center hover:bg-brand-600 transition-colors">
                <Linkedin size={14} />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-ink-500 hover:text-brand-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-ink-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-600">
          <p>&copy; {new Date().getFullYear()} PDFPro. All rights reserved.</p>
          <p>Built for document productivity</p>
        </div>
      </div>
    </footer>
  )
}
