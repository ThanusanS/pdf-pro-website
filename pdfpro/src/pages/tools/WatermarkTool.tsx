import React, { useState } from 'react'
import { Download, CheckCircle2, Stamp } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { watermarkPDF, downloadBlob } from '../../utils/pdfProcessing'

type State = 'idle' | 'processing' | 'done' | 'error'

export default function WatermarkTool() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(30)
  const [fontSize, setFontSize] = useState(48)
  const [rotation, setRotation] = useState(-45)
  const [color, setColor] = useState('#808080')
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')

  const hexToRgb = (hex: string) => ({
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  })

  const handleApply = async () => {
    if (!file || !text.trim()) return
    setState('processing')
    try {
      const res = await watermarkPDF(file, text, { opacity: opacity / 100, fontSize, color: hexToRgb(color), rotation })
      setResult(res)
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Watermark failed.')
      setState('error')
    }
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Watermark PDF Online</h1>
        <p className="text-ink-500 text-lg">Add custom text watermarks to PDF pages with full control over style and placement.</p>
      </div>

      <DropZone onFiles={f => { setFile(f[0]); setState('idle'); setResult(null) }} files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle') }} />

      {file && (
        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-semibold text-ink-700 dark:text-ink-300 block mb-2">Watermark Text</label>
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="CONFIDENTIAL"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>

          {text && (
            <div className="h-28 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] flex items-center justify-center overflow-hidden relative">
              <span className="font-bold select-none pointer-events-none" style={{
                fontSize: Math.min(fontSize, 36), color, opacity: opacity / 100,
                transform: `rotate(${rotation}deg)`, whiteSpace: 'nowrap',
              }}>
                {text}
              </span>
              <span className="absolute bottom-2 right-3 text-xs text-ink-400 font-medium">Preview</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-ink-600 dark:text-ink-400 block mb-2">Opacity: {opacity}%</label>
              <input type="range" min={5} max={80} value={opacity} onChange={e => setOpacity(+e.target.value)} className="w-full accent-brand-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-600 dark:text-ink-400 block mb-2">Font Size: {fontSize}px</label>
              <input type="range" min={16} max={96} value={fontSize} onChange={e => setFontSize(+e.target.value)} className="w-full accent-brand-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-600 dark:text-ink-400 block mb-2">Rotation: {rotation}&deg;</label>
              <input type="range" min={-90} max={90} value={rotation} onChange={e => setRotation(+e.target.value)} className="w-full accent-brand-500" />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-600 dark:text-ink-400 block mb-2">Color</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-10 rounded-lg border border-[var(--border)] cursor-pointer" />
            </div>
          </div>

          {state !== 'done' && (
            <button onClick={handleApply} disabled={state === 'processing' || !text.trim()}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
              {state === 'processing'
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</>
                : <><Stamp size={20} /> Apply Watermark</>
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
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-4">Watermark Added</h3>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }}
            className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="watermark-bottom" format="rectangle" />
      </div>
    </div>
  )
}
