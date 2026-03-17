import React, { useState } from 'react'
import { Download, Hash, CheckCircle2 } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { addPageNumbers, downloadBlob } from '../../utils/pdfProcessing'

type Position = 'bottom-center' | 'bottom-right' | 'bottom-left' | 'top-center'
type State = 'idle' | 'processing' | 'done' | 'error'

export default function PageNumbersTool() {
  const [file, setFile] = useState<File | null>(null)
  const [position, setPosition] = useState<Position>('bottom-center')
  const [startFrom, setStartFrom] = useState(1)
  const [prefix, setPrefix] = useState('')
  const [fontSize, setFontSize] = useState(11)
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')

  const handleApply = async () => {
    if (!file) return
    setState('processing')
    try {
      const res = await addPageNumbers(file, { position, startFrom, prefix, fontSize })
      setResult(res)
      setState('done')
    } catch (e: any) {
      setError(e.message)
      setState('error')
    }
  }

  const POSITIONS: { value: Position; label: string }[] = [
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-left',   label: 'Bottom Left'   },
    { value: 'bottom-right',  label: 'Bottom Right'  },
    { value: 'top-center',    label: 'Top Center'    },
  ]

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Add Page Numbers to PDF</h1>
        <p className="text-ink-500 text-lg">Insert page numbers with custom position, font size and prefix. Free, instant.</p>
      </div>

      <DropZone onFiles={f => { setFile(f[0]); setState('idle'); setResult(null) }} files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle') }} />

      {file && (
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">Position</p>
            <div className="grid grid-cols-2 gap-2">
              {POSITIONS.map(p => (
                <button key={p.value} onClick={() => setPosition(p.value)}
                  className={`py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    position === p.value ? 'gradient-brand text-white border-transparent' : 'border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-brand-400'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-600 dark:text-ink-400 block mb-2">Start From</label>
              <input type="number" min={1} value={startFrom} onChange={e => setStartFrom(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-ink-800 dark:text-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-600 dark:text-ink-400 block mb-2">Prefix (optional)</label>
              <input type="text" value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="e.g. Page "
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-ink-800 dark:text-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-600 dark:text-ink-400 block mb-2">Font Size</label>
              <input type="number" min={8} max={24} value={fontSize} onChange={e => setFontSize(+e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-ink-800 dark:text-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-ink-50 dark:bg-ink-800 text-xs text-ink-500">
            Preview:&nbsp;
            <span className="font-mono font-semibold text-ink-700 dark:text-ink-300">{prefix}{startFrom}</span>,&nbsp;
            <span className="font-mono font-semibold text-ink-700 dark:text-ink-300">{prefix}{startFrom + 1}</span>,&nbsp;
            <span className="font-mono font-semibold text-ink-700 dark:text-ink-300">{prefix}{startFrom + 2}</span>...
          </div>

          {state !== 'done' && (
            <button onClick={handleApply} disabled={state === 'processing'}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
              {state === 'processing'
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</>
                : <><Hash size={20} /> Add Page Numbers</>
              }
            </button>
          )}
        </div>
      )}

      {state === 'error' && <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}

      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-4">Page Numbers Added</h3>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }}
            className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="page-numbers-bottom" format="rectangle" />
      </div>
    </div>
  )
}
