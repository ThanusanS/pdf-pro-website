import React, { useState } from 'react'
import { SplitSquareHorizontal, Loader, PlusCircle, MinusCircle, Columns2 } from 'lucide-react'
import AdBanner from '../../components/AdBanner'
import { fileToArrayBuffer } from '../../utils/pdfProcessing'

type State = 'idle' | 'loading' | 'done' | 'error'
interface PageText { page: number; text: string }

function extractTextPages(file: File): Promise<PageText[]> {
  return import('pdfjs-dist').then(async pdfjsLib => {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    const ab = await fileToArrayBuffer(file)
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise
    const pages: PageText[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      pages.push({ page: i, text: content.items.map((it: any) => it.str).join(' ') })
    }
    return pages
  })
}

function diffWords(a: string, b: string) {
  const wordsA = a.split(/\s+/)
  const wordsB = b.split(/\s+/)
  const setA = new Set(wordsA)
  const setB = new Set(wordsB)
  return {
    added:   wordsB.filter(w => !setA.has(w)).length,
    removed: wordsA.filter(w => !setB.has(w)).length,
    same:    wordsA.filter(w => setB.has(w)).length,
  }
}

export default function CompareTool() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [pagesA, setPagesA] = useState<PageText[]>([])
  const [pagesB, setPagesB] = useState<PageText[]>([])
  const [state, setState] = useState<State>('idle')
  const [error, setError] = useState('')
  const [activePage, setActivePage] = useState(1)

  const handleCompare = async () => {
    if (!fileA || !fileB) return
    setState('loading')
    try {
      const [a, b] = await Promise.all([extractTextPages(fileA), extractTextPages(fileB)])
      setPagesA(a)
      setPagesB(b)
      setState('done')
      setActivePage(1)
    } catch (e: any) {
      setError(e.message)
      setState('error')
    }
  }

  const maxPages = Math.max(pagesA.length, pagesB.length)
  const textA = pagesA.find(p => p.page === activePage)?.text ?? ''
  const textB = pagesB.find(p => p.page === activePage)?.text ?? ''
  const diff = state === 'done' ? diffWords(textA, textB) : null

  const FileSlot = ({
    file, label, onFile, onClear
  }: { file: File | null; label: string; onFile: (f: File) => void; onClear: () => void }) => (
    <div>
      <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">{label}</p>
      <label
        className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          file
            ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
            : 'border-[var(--border)] hover:border-brand-400 hover:bg-brand-50/30'
        }`}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={e => e.target.files && onFile(e.target.files[0])}
        />
        {file ? (
          <div>
            <p className="text-brand-600 dark:text-brand-400 font-semibold text-sm">{file.name}</p>
            <button
              className="text-xs text-ink-400 hover:text-red-500 mt-1 transition-colors"
              onClick={e => { e.preventDefault(); onClear() }}
            >
              Remove
            </button>
          </div>
        ) : (
          <p className="text-ink-400 text-sm">Click to upload PDF</p>
        )}
      </label>
    </div>
  )

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          Compare PDF Documents
        </h1>
        <p className="text-ink-500 text-lg">
          Side-by-side text comparison to identify changes between two PDF versions.
        </p>
      </div>

      {(state === 'idle' || state === 'error') && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <FileSlot
              file={fileA}
              label="Original Document"
              onFile={f => setFileA(f)}
              onClear={() => setFileA(null)}
            />
            <FileSlot
              file={fileB}
              label="Revised Document"
              onFile={f => setFileB(f)}
              onClear={() => setFileB(null)}
            />
          </div>

          {state === 'error' && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>
          )}

          <button
            onClick={handleCompare}
            disabled={!fileA || !fileB}
            className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
          >
            <SplitSquareHorizontal size={20} /> Compare Documents
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <Loader size={32} className="text-brand-500 animate-spin" />
          <p className="text-ink-500">Extracting and comparing text...</p>
        </div>
      )}

      {state === 'done' && diff && (
        <div className="animate-slide-up space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center gap-3">
              <PlusCircle size={20} className="text-green-500 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-green-700 dark:text-green-400">{diff.added}</p>
                <p className="text-xs text-green-600 dark:text-green-500">Words Added</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-3">
              <MinusCircle size={20} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-red-700 dark:text-red-400">{diff.removed}</p>
                <p className="text-xs text-red-600 dark:text-red-500">Words Removed</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800/50 border border-[var(--border)] flex items-center gap-3">
              <Columns2 size={20} className="text-ink-400 flex-shrink-0" />
              <div>
                <p className="text-xl font-bold text-ink-700 dark:text-ink-300">{maxPages}</p>
                <p className="text-xs text-ink-500">Total Pages</p>
              </div>
            </div>
          </div>

          {/* Page tabs */}
          {maxPages > 1 && (
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: maxPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setActivePage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                    activePage === p
                      ? 'gradient-brand text-white'
                      : 'border border-[var(--border)] text-ink-500 hover:border-brand-400'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Side-by-side */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="px-4 py-2 bg-[var(--surface-2)] border-b border-[var(--border)] text-xs font-semibold text-ink-600 dark:text-ink-400 truncate">
                {fileA?.name} — Page {activePage}
              </div>
              <div className="p-4 text-xs text-ink-700 dark:text-ink-300 leading-relaxed h-64 overflow-y-auto font-mono whitespace-pre-wrap">
                {textA || <span className="text-ink-400 italic">No content on this page</span>}
              </div>
            </div>
            <div className="rounded-xl border border-brand-300 dark:border-brand-700 overflow-hidden">
              <div className="px-4 py-2 bg-brand-50 dark:bg-brand-900/20 border-b border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-400 truncate">
                {fileB?.name} — Page {activePage}
              </div>
              <div className="p-4 text-xs text-ink-700 dark:text-ink-300 leading-relaxed h-64 overflow-y-auto font-mono whitespace-pre-wrap">
                {textB || <span className="text-ink-400 italic">No content on this page</span>}
              </div>
            </div>
          </div>

          <button
            onClick={() => { setFileA(null); setFileB(null); setState('idle'); setPagesA([]); setPagesB([]) }}
            className="w-full text-center py-3 rounded-xl border border-[var(--border)] text-sm text-ink-500 hover:border-brand-400 hover:text-brand-500 transition-all"
          >
            Compare different documents
          </button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="compare-bottom" format="rectangle" />
      </div>
    </div>
  )
}
