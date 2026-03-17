import React, { useState } from 'react'
import { Download, Scissors, CheckCircle2, FileText } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { splitPDF, downloadBlob, formatFileSize, getPDFInfo } from '../../utils/pdfProcessing'

type Mode = 'all' | 'range'
type State = 'idle' | 'processing' | 'done' | 'error'

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfInfo, setPdfInfo] = useState<{ pages: number } | null>(null)
  const [mode, setMode] = useState<Mode>('all')
  const [rangeInput, setRangeInput] = useState('1-3, 4-6')
  const [state, setState] = useState<State>('idle')
  const [results, setResults] = useState<{ blob: Blob; filename: string }[]>([])
  const [error, setError] = useState('')

  const handleFile = async (files: File[]) => {
    const f = files[0]
    setFile(f)
    setState('idle')
    setResults([])
    try {
      const info = await getPDFInfo(f)
      setPdfInfo(info)
    } catch {}
  }

  const parseRanges = (input: string) =>
    input.split(',').map(part => {
      const [from, to] = part.trim().split('-').map(n => parseInt(n.trim()))
      return { from: from || 1, to: to || from || 1 }
    }).filter(r => !isNaN(r.from) && !isNaN(r.to))

  const handleSplit = async () => {
    if (!file) return
    setState('processing')
    setError('')
    try {
      const ranges = mode === 'range' ? parseRanges(rangeInput) : undefined
      const res = await splitPDF(file, mode, ranges)
      setResults(res)
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Split failed.')
      setState('error')
    }
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          Split PDF Online Free
        </h1>
        <p className="text-ink-500 text-lg">
          Separate PDF pages into individual files or custom ranges. No login required.
        </p>
      </div>

      <DropZone onFiles={handleFile} files={file ? [file] : []} onRemove={() => { setFile(null); setPdfInfo(null) }} />

      {file && pdfInfo && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-sm text-brand-700 dark:text-brand-300 font-medium">
          <FileText size={14} />
          {file.name} — {pdfInfo.pages} pages, {formatFileSize(file.size)}
        </div>
      )}

      {file && (
        <div className="mt-6 space-y-4">
          <div className="flex gap-3">
            {(['all', 'range'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold border transition-all ${
                  mode === m
                    ? 'gradient-brand text-white border-transparent shadow-md'
                    : 'border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-brand-400'
                }`}>
                {m === 'all' ? 'Extract All Pages' : 'Custom Ranges'}
              </button>
            ))}
          </div>

          {mode === 'range' && (
            <div>
              <label className="text-sm font-medium text-ink-700 dark:text-ink-300 block mb-2">
                Page ranges (e.g. 1-3, 4-6, 7)
              </label>
              <input type="text" value={rangeInput} onChange={e => setRangeInput(e.target.value)}
                placeholder="1-3, 4-6, 7"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
              <p className="text-xs text-ink-400 mt-1">Separate ranges with commas. Each range becomes a separate PDF.</p>
            </div>
          )}

          {state !== 'done' && (
            <button onClick={handleSplit} disabled={state === 'processing'}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
              {state === 'processing'
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Splitting...</>
                : <><Scissors size={20} /> Split PDF</>
              }
            </button>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>
      )}

      {state === 'done' && results.length > 0 && (
        <div className="mt-8 animate-slide-up">
          <div className="flex items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 mb-4">
            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
            <span className="font-semibold text-green-800 dark:text-green-300">Split into {results.length} files</span>
          </div>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                <span className="text-sm font-medium text-ink-700 dark:text-ink-300 flex-1">{r.filename}</span>
                <button onClick={() => downloadBlob(r.blob, r.filename)}
                  className="flex items-center gap-1 px-3 py-1.5 gradient-brand text-white rounded-lg text-xs font-semibold">
                  <Download size={12} /> Download
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => { setFile(null); setPdfInfo(null); setState('idle'); setResults([]) }}
            className="block w-full mt-4 text-center text-sm text-ink-400 hover:text-ink-600 transition-colors">
            Start over
          </button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="split-bottom" format="rectangle" />
      </div>
    </div>
  )
}
