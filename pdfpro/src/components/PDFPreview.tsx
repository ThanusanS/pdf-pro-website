import React, { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader } from 'lucide-react'
import clsx from 'clsx'

interface PDFPreviewProps {
  file: File
  className?: string
}

export default function PDFPreview({ file, className }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [scale, setScale] = useState(1.0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pdfRef = useRef<any>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

        const arrayBuffer = await file.arrayBuffer()
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

        if (!cancelled) {
          pdfRef.current = pdf
          setTotalPages(pdf.numPages)
          setCurrentPage(1)
        }
      } catch (err) {
        if (!cancelled) setError('Could not preview this PDF.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [file])

  useEffect(() => {
    if (!pdfRef.current || !canvasRef.current || loading) return

    async function renderPage() {
      const page = await pdfRef.current.getPage(currentPage)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!

      canvas.width = viewport.width
      canvas.height = viewport.height

      await page.render({ canvasContext: ctx, viewport }).promise
    }

    renderPage()
  }, [currentPage, scale, loading])

  const zoomIn = () => setScale(s => Math.min(s + 0.25, 3))
  const zoomOut = () => setScale(s => Math.max(s - 0.25, 0.5))
  const prevPage = () => setCurrentPage(p => Math.max(p - 1, 1))
  const nextPage = () => setCurrentPage(p => Math.min(p + 1, totalPages))

  return (
    <div className={clsx('flex flex-col rounded-2xl border border-[var(--border)] overflow-hidden bg-ink-100 dark:bg-ink-900', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--surface)] border-b border-[var(--border)]">
        {/* Pagination */}
        <div className="flex items-center gap-2">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs text-ink-600 dark:text-ink-400 font-mono min-w-[80px] text-center">
            {loading ? '—' : `${currentPage} / ${totalPages}`}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Zoom */}
        <div className="flex items-center gap-2">
          <button onClick={zoomOut} className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
            <ZoomOut size={14} />
          </button>
          <span className="text-xs font-mono text-ink-500 w-10 text-center">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors">
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center min-h-[400px]">
        {loading && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-400">
            <Loader size={24} className="animate-spin text-brand-500" />
            <span className="text-sm">Loading preview…</span>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center py-16 text-red-500 text-sm">
            {error}
          </div>
        )}
        {!loading && !error && (
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-xl max-w-full"
            style={{ display: loading ? 'none' : 'block' }}
          />
        )}
      </div>
    </div>
  )
}
