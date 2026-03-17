import React, { useState, useCallback } from 'react'
import { Download, ArrowUp, ArrowDown, Trash2, Merge, CheckCircle2 } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { mergePDFs, downloadBlob, formatFileSize } from '../../utils/pdfProcessing'

type State = 'idle' | 'processing' | 'done' | 'error'

export default function MergeTool() {
  const [files, setFiles] = useState<File[]>([])
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string; pages: number } | null>(null)
  const [error, setError] = useState('')

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles])
    setState('idle')
    setResult(null)
  }, [])

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index))

  const moveFile = (index: number, dir: -1 | 1) => {
    setFiles(prev => {
      const arr = [...prev]
      const swapIdx = index + dir
      if (swapIdx < 0 || swapIdx >= arr.length) return arr
      ;[arr[index], arr[swapIdx]] = [arr[swapIdx], arr[index]]
      return arr
    })
  }

  const handleMerge = async () => {
    if (files.length < 2) return
    setState('processing')
    setError('')
    try {
      const res = await mergePDFs(files)
      setResult({ blob: res.blob, filename: res.filename, pages: res.pages! })
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Merge failed.')
      setState('error')
    }
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          Merge PDF Files Online Free
        </h1>
        <p className="text-ink-500 text-lg">
          Combine multiple PDFs into one in any order. No login, no watermark, instant download.
        </p>
      </div>

      <DropZone
        multiple
        onFiles={addFiles}
        label="Drop PDF files here or click to upload"
        sublabel="Add multiple PDFs — reorder below before merging"
      />

      {files.length > 0 && (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-semibold text-ink-600 dark:text-ink-400 mb-3">
            Merge order — use arrows to reorder
          </h3>
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-3 bg-[var(--surface-2)] rounded-xl px-4 py-3 group animate-fade-in">
              <span className="w-6 h-6 rounded-md bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-800 dark:text-ink-200 truncate">{f.name}</p>
                <p className="text-xs text-ink-400">{formatFileSize(f.size)}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => moveFile(i, -1)} disabled={i === 0}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 disabled:opacity-30 transition-colors">
                  <ArrowUp size={14} />
                </button>
                <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 disabled:opacity-30 transition-colors">
                  <ArrowDown size={14} />
                </button>
                <button onClick={() => removeFile(i)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length >= 2 && state !== 'done' && (
        <button onClick={handleMerge} disabled={state === 'processing'}
          className="mt-8 w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
          {state === 'processing' ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Merging PDFs...</>
          ) : (
            <><Merge size={20} /> Merge {files.length} PDFs</>
          )}
        </button>
      )}

      {state === 'error' && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>
      )}

      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-1">Merge Complete</h3>
          <p className="text-green-700 dark:text-green-400 text-sm mb-5">
            {files.length} files combined — {result.pages} pages total
          </p>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Merged PDF
          </button>
          <button onClick={() => { setFiles([]); setState('idle'); setResult(null) }}
            className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600 transition-colors">
            Start over
          </button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="tool-bottom" format="rectangle" />
      </div>

      <div className="mt-16 space-y-3">
        <h2 className="font-display text-2xl font-bold text-ink-900 dark:text-ink-100">How to Merge PDF Files Online</h2>
        <ol className="text-ink-600 dark:text-ink-400 space-y-2 mt-4 list-decimal list-inside text-sm leading-relaxed">
          <li>Upload two or more PDF files using the drop zone above</li>
          <li>Use the arrow buttons to set your desired page order</li>
          <li>Click "Merge PDFs" to combine them instantly</li>
          <li>Download your merged PDF — no watermarks, no email required</li>
        </ol>
      </div>
    </div>
  )
}
