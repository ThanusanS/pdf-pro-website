import React, { useState, useRef, useEffect } from 'react'
import { Download, Crop, CheckCircle2, FileText } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { PDFDocument } from 'pdf-lib'
import { fileToArrayBuffer, downloadBlob, getPDFInfo } from '../../utils/pdfProcessing'

type State = 'idle' | 'processing' | 'done' | 'error'

export default function CropTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfInfo, setPdfInfo] = useState<{ pages: number } | null>(null)
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')
  const [applyTo, setApplyTo] = useState<'all' | 'current'>('all')
  const [margins, setMargins] = useState({ top: 0, right: 0, bottom: 0, left: 0 })

  const handleFile = async (files: File[]) => {
    const f = files[0]; setFile(f); setState('idle'); setResult(null)
    try { setPdfInfo(await getPDFInfo(f)) } catch {}
  }

  const handleCrop = async () => {
    if (!file) return
    setState('processing'); setError('')
    try {
      const ab = await fileToArrayBuffer(file)
      const pdfDoc = await PDFDocument.load(ab)
      const pages = pdfDoc.getPages()
      pages.forEach(page => {
        const { width, height } = page.getSize()
        const t = (margins.top / 100) * height
        const b = (margins.bottom / 100) * height
        const l = (margins.left / 100) * width
        const r = (margins.right / 100) * width
        page.setCropBox(l, b, width - l - r, height - t - b)
      })
      const bytes = await pdfDoc.save()
      setResult({ blob: new Blob([bytes], { type: 'application/pdf' }), filename: `cropped-${file.name}` })
      setState('done')
    } catch (e: any) { setError(e.message); setState('error') }
  }

  const SIDES = ['top', 'right', 'bottom', 'left'] as const

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Crop PDF Online Free</h1>
        <p className="text-ink-500 text-lg">Trim margins and crop PDF pages to your exact specifications. Instant, no login.</p>
      </div>
      <DropZone onFiles={handleFile} files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle') }} />
      {file && pdfInfo && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-sm text-brand-700 dark:text-brand-300 font-medium">
          <FileText size={14} />{file.name} — {pdfInfo.pages} pages
        </div>
      )}
      {file && (
        <div className="mt-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-4">Crop Margins (% of page size)</p>
            <div className="grid grid-cols-2 gap-4">
              {SIDES.map(side => (
                <div key={side}>
                  <label className="text-xs font-semibold text-ink-600 dark:text-ink-400 block mb-2 capitalize">{side}: {margins[side]}%</label>
                  <input type="range" min={0} max={40} value={margins[side]}
                    onChange={e => setMargins(prev => ({ ...prev, [side]: +e.target.value }))}
                    className="w-full accent-brand-500" />
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-ink-50 dark:bg-ink-800 text-xs text-ink-500">
            Preview: Removing {margins.top}% top, {margins.right}% right, {margins.bottom}% bottom, {margins.left}% left margins from each page.
          </div>
          {state !== 'done' && (
            <button onClick={handleCrop} disabled={state === 'processing'}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
              {state === 'processing' ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Cropping...</> : <><Crop size={20} /> Crop PDF</>}
            </button>
          )}
        </div>
      )}
      {state === 'error' && <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}
      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3"><CheckCircle2 size={40} className="text-green-500" /></div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-4">PDF Cropped</h3>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Cropped PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }} className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}
      <div className="flex justify-center mt-12"><AdBanner slot="crop-bottom" format="rectangle" /></div>
    </div>
  )
}
