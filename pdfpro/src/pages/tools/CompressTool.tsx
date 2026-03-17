import React, { useState } from 'react'
import { Download, Minimize2, CheckCircle2, TrendingDown } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { compressPDF, downloadBlob, formatFileSize } from '../../utils/pdfProcessing'

type Quality = 'low' | 'medium' | 'high'
type State = 'idle' | 'processing' | 'done' | 'error'

const QUALITY_OPTIONS: { value: Quality; label: string; desc: string }[] = [
  { value: 'high',   label: 'High Quality',          desc: 'Minimal compression, best visual quality' },
  { value: 'medium', label: 'Balanced',               desc: 'Good balance of size and quality (recommended)' },
  { value: 'low',    label: 'Maximum Compression',    desc: 'Smallest file size, slightly reduced quality' },
]

export default function CompressTool() {
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState<Quality>('medium')
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string; sizeBefore: number; sizeAfter: number } | null>(null)
  const [error, setError] = useState('')

  const handleFile = (files: File[]) => { setFile(files[0]); setState('idle'); setResult(null) }

  const handleCompress = async () => {
    if (!file) return
    setState('processing')
    try {
      const res = await compressPDF(file, quality)
      setResult({ blob: res.blob, filename: res.filename, sizeBefore: res.sizeBefore!, sizeAfter: res.sizeAfter! })
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Compression failed.')
      setState('error')
    }
  }

  const savings = result ? Math.round((1 - result.sizeAfter / result.sizeBefore) * 100) : 0

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          Compress PDF Online Free
        </h1>
        <p className="text-ink-500 text-lg">
          Reduce PDF file size without losing quality. Fast, free, no watermark.
        </p>
      </div>

      <DropZone onFiles={handleFile} files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle'); setResult(null) }} />

      {file && (
        <div className="mt-6 space-y-4">
          <div>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">Compression Level</p>
            <div className="space-y-2">
              {QUALITY_OPTIONS.map(opt => (
                <label key={opt.value}
                  className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                    quality === opt.value
                      ? 'border-brand-400 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-[var(--border)] hover:border-brand-300'
                  }`}>
                  <input type="radio" name="quality" value={opt.value} checked={quality === opt.value}
                    onChange={() => setQuality(opt.value)} className="accent-brand-500" />
                  <div>
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-200">{opt.label}</p>
                    <p className="text-xs text-ink-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {state !== 'done' && (
            <button onClick={handleCompress} disabled={state === 'processing'}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
              {state === 'processing'
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Compressing...</>
                : <><Minimize2 size={20} /> Compress PDF</>
              }
            </button>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>
      )}

      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 animate-slide-up">
          <div className="flex items-center gap-3 mb-5">
            <TrendingDown size={28} className="text-green-500" />
            <div>
              <h3 className="font-bold text-green-800 dark:text-green-300 text-xl">Compression Complete</h3>
              <p className="text-green-600 dark:text-green-400 text-sm">File size reduced successfully</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="text-center p-3 rounded-xl bg-white dark:bg-ink-800">
              <p className="text-xs text-ink-500 mb-1">Before</p>
              <p className="font-bold text-ink-800 dark:text-ink-200">{formatFileSize(result.sizeBefore)}</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-brand-100 dark:bg-brand-900/40">
              <p className="text-xs text-brand-600 dark:text-brand-400 mb-1">Saved</p>
              <p className="font-bold text-brand-700 dark:text-brand-300 text-lg">{savings}%</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-white dark:bg-ink-800">
              <p className="text-xs text-ink-500 mb-1">After</p>
              <p className="font-bold text-ink-800 dark:text-ink-200">{formatFileSize(result.sizeAfter)}</p>
            </div>
          </div>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="w-full flex items-center justify-center gap-2 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Compressed PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }}
            className="block w-full mt-3 text-center text-sm text-ink-400 hover:text-ink-600">
            Compress another
          </button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="compress-bottom" format="rectangle" />
      </div>
    </div>
  )
}
