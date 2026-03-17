import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ServerCog } from 'lucide-react'
import { TOOLS } from '../../utils/tools'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'

export default function GenericToolPage() {
  const { toolId } = useParams<{ toolId: string }>()
  const tool = TOOLS.find(t => t.id === toolId)

  if (!tool) {
    return (
      <div className="pt-32 text-center px-4">
        <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100 mb-4">
          Tool Not Found
        </h1>
        <Link to="/tools" className="text-brand-500 hover:underline">
          Back to all tools
        </Link>
      </div>
    )
  }

  const acceptMap: Record<string, string[]> = {
    'application/pdf':   ['.pdf'],
    'image/jpeg':        ['.jpg', '.jpeg'],
    'image/png':         ['.png'],
    '.doc':              ['.doc'],
    '.docx':             ['.docx'],
    'application/msword':['.doc', '.docx'],
  }

  const accept = tool.accept
    ? Object.fromEntries(tool.accept.map(a => [a, acceptMap[a] ?? []]))
    : { 'application/pdf': ['.pdf'] }

  const Icon = tool.icon

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <Link
        to="/tools"
        className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-brand-500 transition-colors mb-8"
      >
        <ArrowLeft size={14} /> All Tools
      </Link>

      <div className="text-center mb-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
          style={{ backgroundColor: tool.color }}
        >
          <Icon size={28} className="text-white" strokeWidth={1.75} />
        </div>
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          {tool.name}
        </h1>
        <p className="text-ink-500 text-lg">{tool.description}</p>
      </div>

      <DropZone
        accept={accept}
        onFiles={() => {}}
        label={`Drop your file here to ${tool.name.toLowerCase()}`}
        sublabel="100% free — No login required"
      />

      <div className="mt-8 p-6 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <ServerCog size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
              Server-side processing required
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-400 leading-relaxed">
              <strong>{tool.name}</strong> requires a backend service for full processing.
              Connect a serverless function (Node.js + LibreOffice / Ghostscript) to activate
              this tool. See the{' '}
              <code className="bg-amber-100 dark:bg-amber-900/40 px-1 rounded font-mono text-xs">
                /api
              </code>{' '}
              directory in the project for ready-to-deploy Vercel and Netlify functions.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-12">
        <AdBanner slot={`${toolId}-bottom`} format="rectangle" />
      </div>

      <div className="mt-12 space-y-4 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
        <h2 className="font-display text-xl font-bold text-ink-800 dark:text-ink-200">
          About {tool.name}
        </h2>
        <p>
          {tool.description}. PDFPro makes it simple — no installation, no account needed, completely free.
        </p>
        <h3 className="font-semibold text-ink-700 dark:text-ink-300">How it works</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Upload your file using the drop zone above</li>
          <li>Configure any available options</li>
          <li>Click the action button to process your file</li>
          <li>Download your result instantly</li>
        </ol>
      </div>
    </div>
  )
}
