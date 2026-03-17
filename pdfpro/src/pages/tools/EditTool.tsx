import React, { useState, useRef, useEffect } from 'react'
import { Download, PenLine, CheckCircle2, Type, Square, Minus } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { fileToArrayBuffer, downloadBlob, pdfPageToImage } from '../../utils/pdfProcessing'

type State = 'idle' | 'editing' | 'processing' | 'done' | 'error'
type Tool = 'text' | 'rectangle' | 'line'

interface Annotation {
  type: Tool
  x: number; y: number
  text?: string
  width?: number; height?: number
  color: string
  fontSize?: number
}

export default function EditTool() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [activeTool, setActiveTool] = useState<Tool>('text')
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [textInput, setTextInput] = useState('')
  const [color, setColor] = useState('#e63946')
  const [fontSize, setFontSize] = useState(14)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasDims, setCanvasDims] = useState({ w: 0, h: 0 })
  const [pdfDims, setPdfDims] = useState({ w: 0, h: 0 })

  const handleFile = async (files: File[]) => {
    const f = files[0]; setFile(f); setState('editing')
    setAnnotations([]); setResult(null)
    try {
      const img = await pdfPageToImage(f, 0, 1.5)
      setPreview(img.dataUrl)
      setCanvasDims({ w: img.width, h: img.height })
      // Get actual PDF dims
      const { PDFDocument: PDF } = await import('pdf-lib')
      const ab = await fileToArrayBuffer(f)
      const doc = await PDF.load(ab)
      const page = doc.getPages()[0]
      const { width, height } = page.getSize()
      setPdfDims({ w: width, h: height })
    } catch {}
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvasDims.w / rect.width
    const scaleY = canvasDims.h / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    if (activeTool === 'text' && textInput.trim()) {
      setAnnotations(prev => [...prev, { type: 'text', x, y, text: textInput, color, fontSize }])
    } else if (activeTool === 'rectangle') {
      setAnnotations(prev => [...prev, { type: 'rectangle', x, y, width: 100, height: 50, color }])
    } else if (activeTool === 'line') {
      setAnnotations(prev => [...prev, { type: 'line', x, y, width: 80, height: 0, color }])
    }
  }

  const handleApply = async () => {
    if (!file || !annotations.length) return
    setState('processing'); setError('')
    try {
      const ab = await fileToArrayBuffer(file)
      const pdfDoc = await PDFDocument.load(ab)
      const page = pdfDoc.getPages()[0]
      const { width, height } = page.getSize()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const scaleX = width / canvasDims.w
      const scaleY = height / canvasDims.h

      for (const ann of annotations) {
        const px = ann.x * scaleX
        const py = height - (ann.y * scaleY)
        const [r, g, b] = hexToRgb(ann.color)
        if (ann.type === 'text' && ann.text) {
          page.drawText(ann.text, { x: px, y: py, size: ann.fontSize ?? 14, font, color: rgb(r, g, b) })
        } else if (ann.type === 'rectangle') {
          page.drawRectangle({ x: px, y: py - (ann.height ?? 50) * scaleY, width: (ann.width ?? 100) * scaleX, height: (ann.height ?? 50) * scaleY, borderColor: rgb(r, g, b), borderWidth: 1.5 })
        } else if (ann.type === 'line') {
          page.drawLine({ start: { x: px, y: py }, end: { x: px + (ann.width ?? 80) * scaleX, y: py }, thickness: 1.5, color: rgb(r, g, b) })
        }
      }
      const bytes = await pdfDoc.save()
      setResult({ blob: new Blob([bytes], { type: 'application/pdf' }), filename: `edited-${file.name}` })
      setState('done')
    } catch (e: any) { setError(e.message); setState('error') }
  }

  const hexToRgb = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255,
  ]

  const TOOLS = [
    { id: 'text' as Tool, icon: Type, label: 'Text' },
    { id: 'rectangle' as Tool, icon: Square, label: 'Rectangle' },
    { id: 'line' as Tool, icon: Minus, label: 'Line' },
  ]

  return (
    <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Edit PDF Online Free</h1>
        <p className="text-ink-500 text-lg">Add text, shapes and annotations to your PDF documents. No software needed.</p>
      </div>

      {state === 'idle' && <DropZone onFiles={handleFile} label="Drop your PDF to start editing" sublabel="Upload a PDF to add text, shapes and annotations" />}

      {(state === 'editing' || state === 'error') && file && preview && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
            <div className="flex gap-2">
              {TOOLS.map(t => (
                <button key={t.id} onClick={() => setActiveTool(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTool === t.id ? 'gradient-brand text-white' : 'border border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-brand-400'}`}>
                  <t.icon size={14} />{t.label}
                </button>
              ))}
            </div>
            {activeTool === 'text' && (
              <input type="text" value={textInput} onChange={e => setTextInput(e.target.value)} placeholder="Enter text..."
                className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            )}
            {activeTool === 'text' && (
              <input type="number" min={8} max={72} value={fontSize} onChange={e => setFontSize(+e.target.value)}
                className="w-16 px-2 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            )}
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-9 rounded-lg border border-[var(--border)] cursor-pointer" />
            {annotations.length > 0 && (
              <button onClick={() => setAnnotations([])} className="text-xs text-red-500 hover:underline ml-auto">Clear all</button>
            )}
          </div>

          <p className="text-xs text-ink-400 text-center">
            {activeTool === 'text' ? 'Click on the PDF to place text' : `Click on the PDF to place a ${activeTool}`}
          </p>

          <div className="relative rounded-xl overflow-hidden border border-[var(--border)] bg-ink-100 dark:bg-ink-900">
            <img src={preview} alt="PDF preview" className="w-full pointer-events-none select-none" />
            <canvas ref={canvasRef} width={canvasDims.w} height={canvasDims.h}
              className="absolute inset-0 w-full h-full cursor-crosshair"
              style={{ background: 'transparent' }}
              onClick={handleCanvasClick} />
            {annotations.map((ann, i) => {
              const canvas = canvasRef.current
              if (!canvas) return null
              const rect = canvas.getBoundingClientRect()
              const px = (ann.x / canvasDims.w) * 100
              const py = (ann.y / canvasDims.h) * 100
              return (
                <div key={i} className="absolute pointer-events-none" style={{ left: `${px}%`, top: `${py}%` }}>
                  {ann.type === 'text' && (
                    <span style={{ color: ann.color, fontSize: ann.fontSize, fontFamily: 'Helvetica, sans-serif', whiteSpace: 'nowrap' }}>{ann.text}</span>
                  )}
                  {ann.type === 'rectangle' && (
                    <div style={{ width: 80, height: 40, border: `2px solid ${ann.color}` }} />
                  )}
                  {ann.type === 'line' && (
                    <div style={{ width: 80, height: 2, background: ann.color }} />
                  )}
                </div>
              )
            })}
          </div>

          {annotations.length > 0 && state !== 'done' && (
            <button onClick={handleApply} disabled={state === 'processing'}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60">
              {state === 'processing' ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Applying...</> : <><PenLine size={20} /> Apply Edits to PDF</>}
            </button>
          )}
          <button onClick={() => { setFile(null); setState('idle'); setAnnotations([]) }} className="w-full text-center text-sm text-ink-400 hover:text-ink-600">Choose a different file</button>
        </div>
      )}

      {state === 'error' && <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}

      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3"><CheckCircle2 size={40} className="text-green-500" /></div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-4">PDF Edited</h3>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Edited PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }} className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}
      <div className="flex justify-center mt-12"><AdBanner slot="edit-bottom" format="rectangle" /></div>
    </div>
  )
}
