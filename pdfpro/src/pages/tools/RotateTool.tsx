import React, { useState } from 'react'
import { Download, RotateCw, CheckCircle2 } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { rotatePDF, downloadBlob, getPDFInfo } from '../../utils/pdfProcessing'

type State = 'idle' | 'processing' | 'done' | 'error'

export default function RotateTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfInfo, setPdfInfo] = useState<{ pages: number } | null>(null)
  const [rotation, setRotation] = useState<90 | 180 | 270>(90)
  const [target, setTarget] = useState<'all' | 'even' | 'odd'>('all')
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')

  const handleFile = async (files: File[]) => {
    const f = files[0]
    setFile(f)
    setState('idle')
    setResult(null)
    try { setPdfInfo(await getPDFInfo(f)) } catch {}
  }

  const handleRotate = async () => {
    if (!file || !pdfInfo) return
    setState('processing')
    try {
      let indices: number[] | 'all' = 'all'
      if (target === 'even') indices = Array.from({ length: pdfInfo.pages }, (_, i) => i).filter(i => i % 2 === 1)
      if (target === 'odd')  indices = Array.from({ length: pdfInfo.pages }, (_, i) => i).filter(i => i % 2 === 0)
      const res = await rotatePDF(file, rotation, indices)
      setResult(res)
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Rotation failed.')
      setState('error')
    }
  }

  const ROTATION_STYLES: Record<number, React.CSSProperties> = {
    90:  { transform: 'rotate(0deg)'   },
    180: { transform: 'rotate(90deg)'  },
    270: { transform: 'rotate(180deg)' },
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Rotate PDF Online Free</h1>
        <p className="text-ink-500 text-lg">Rotate PDF pages 90, 180, or 270 degrees. Apply to all or selected pages.</p>
      </div>

      <DropZone onFiles={handleFile} files={file ? [file] : []} onRemove={() => { setFile(null); setPdfInfo(null); setState('idle') }} />

      {file && (
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">Rotation Angle</p>
            <div className="flex gap-3">
              {([90, 180, 270] as const).map(deg => (
                <button key={deg} onClick={() => setRotation(deg)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    rotation === deg ? 'gradient-brand text-white border-transparent' : 'border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-brand-400'
                  }`}>
                  <RotateCw size={14} style={ROTATION_STYLES[deg]} />
                  {deg}&deg;
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">Apply To</p>
            <div className="flex gap-3">
              {(['all', 'odd', 'even'] as const).map(t => (
                <button key={t} onClick={() => setTarget(t)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    target === t ? 'gradient-brand text-white border-transparent' : 'border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-brand-400'
                  }`}>
                  {t === 'all' ? 'All Pages' : t === 'odd' ? 'Odd Pages' : 'Even Pages'}
                </button>
              ))}
            </div>
          </div>

          {state !== 'done' && (
            <button onClick={handleRotate} disabled={state === 'processing'}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
              {state === 'processing'
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Rotating...</>
                : <><RotateCw size={20} /> Rotate PDF</>
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
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-4">Pages Rotated</h3>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Rotated PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }}
            className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="rotate-bottom" format="rectangle" />
      </div>
    </div>
  )
}
