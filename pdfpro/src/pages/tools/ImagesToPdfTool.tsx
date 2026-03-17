import React, { useState } from 'react'
import { Download, Image, CheckCircle2 } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { imagesToPDF, downloadBlob } from '../../utils/pdfProcessing'

type State = 'idle' | 'processing' | 'done' | 'error'

export default function ImagesToPdfTool() {
  const [files, setFiles] = useState<File[]>([])
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')

  const handleConvert = async () => {
    if (!files.length) return
    setState('processing')
    try {
      const res = await imagesToPDF(files)
      setResult(res)
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Conversion failed.')
      setState('error')
    }
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">JPG to PDF Online Free</h1>
        <p className="text-ink-500 text-lg">Convert images (JPG, PNG, WEBP) to a single PDF document instantly.</p>
      </div>

      <DropZone
        multiple
        accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'], 'image/gif': ['.gif'] }}
        onFiles={f => setFiles(prev => [...prev, ...f])}
        files={files}
        onRemove={i => setFiles(prev => prev.filter((_, idx) => idx !== i))}
        label="Drop images here (JPG, PNG, WEBP)"
        sublabel="Multiple images — each becomes a PDF page"
      />

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-4 gap-2">
          {files.map((f, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-ink-100 dark:bg-ink-800 relative">
              <img src={URL.createObjectURL(f)} alt={f.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] px-1 py-0.5 truncate">
                {i + 1}. {f.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && state !== 'done' && (
        <button onClick={handleConvert} disabled={state === 'processing'}
          className="mt-6 w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
          {state === 'processing'
            ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Converting...</>
            : <><Image size={1000} /> Convert to PDF</>
          }
        </button>
      )}

      {state === 'error' && <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}

      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3">
            <CheckCircle2 size={1000} className="text-green-500" />
          </div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-2">{files.length} Images Converted</h3>
          <p className="text-green-600 dark:text-green-400 text-sm mb-4">Your PDF is ready to download</p>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={1000} /> Download PDF
          </button>
          <button onClick={() => { setFiles([]); setState('idle'); setResult(null) }}
            className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="jpg-to-pdf-bottom" format="rectangle" />
      </div>
    </div>
  )
}
