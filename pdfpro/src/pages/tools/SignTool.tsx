import React, { useState, useRef, useEffect } from 'react'
import { Download, Trash2, Pen, FileSignature, CheckCircle2, FileText } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { PDFDocument, rgb } from 'pdf-lib'
import { downloadBlob, fileToArrayBuffer } from '../../utils/pdfProcessing'

type State = 'idle' | 'signing' | 'processing' | 'done' | 'error'
type SignMode = 'draw' | 'type'

export default function SignTool() {
  const [file, setFile] = useState<File | null>(null)
  const [mode, setMode] = useState<SignMode>('draw')
  const [typedName, setTypedName] = useState('')
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (state !== 'signing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#1a1612'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [state])

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    if ('touches' in e) return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
    return { x: (e as React.MouseEvent).clientX - rect.left, y: (e as React.MouseEvent).clientY - rect.top }
  }

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => { drawing.current = true; lastPos.current = getPos(e) }
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing.current) return
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const pos = getPos(e)
    ctx.beginPath(); ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y); ctx.stroke()
    lastPos.current = pos
  }
  const stopDraw = () => { drawing.current = false }
  const clearCanvas = () => canvasRef.current?.getContext('2d')?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

  const getSignatureDataUrl = (): string | null => {
    if (mode === 'draw') return canvasRef.current?.toDataURL('image/png') ?? null
    if (!typedName.trim()) return null
    const offscreen = document.createElement('canvas')
    offscreen.width = 400; offscreen.height = 100
    const ctx = offscreen.getContext('2d')!
    ctx.font = 'italic 48px Georgia, serif'
    ctx.fillStyle = '#1a1612'
    ctx.fillText(typedName, 20, 70)
    return offscreen.toDataURL('image/png')
  }

  const handleApply = async () => {
    if (!file) return
    const sigDataUrl = getSignatureDataUrl()
    if (!sigDataUrl) { setError('Please draw or type your signature first.'); return }
    setState('processing')
    setError('')
    try {
      const arrayBuffer = await fileToArrayBuffer(file)
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pages = pdfDoc.getPages()
      const lastPage = pages[pages.length - 1]
      const sigBase64 = sigDataUrl.split(',')[1]
      const sigBytes = Uint8Array.from(atob(sigBase64), c => c.charCodeAt(0))
      const sigImage = await pdfDoc.embedPng(sigBytes)
      const { width, height } = lastPage.getSize()
      const sigDims = sigImage.scaleToFit(180, 60)
      lastPage.drawImage(sigImage, { x: width - sigDims.width - 40, y: 40, width: sigDims.width, height: sigDims.height })
      lastPage.drawLine({ start: { x: width - sigDims.width - 40, y: 38 }, end: { x: width - 40, y: 38 }, thickness: 0.75, color: rgb(0.4, 0.4, 0.4) })
      const pdfBytes = await pdfDoc.save()
      setResult({ blob: new Blob([pdfBytes], { type: 'application/pdf' }), filename: `signed-${file.name}` })
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Signing failed.')
      setState('error')
    }
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Sign PDF Online Free</h1>
        <p className="text-ink-500 text-lg">Draw or type your signature and apply it to any PDF. No login, no software needed.</p>
      </div>

      {state === 'idle' && (
        <DropZone onFiles={f => { setFile(f[0]); setState('signing') }} label="Drop your PDF here to sign" sublabel="Your file never leaves your browser" />
      )}

      {(state === 'signing' || state === 'error') && file && (
        <div className="space-y-5">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-sm text-brand-700 dark:text-brand-300 font-medium">
            <FileText size={14} />
            {file.name}
          </div>

          <div className="flex gap-3">
            {(['draw', 'type'] as SignMode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border transition-all ${
                  mode === m ? 'gradient-brand text-white border-transparent shadow-md' : 'border-[var(--border)] text-ink-600 dark:text-ink-400 hover:border-brand-400'
                }`}>
                <Pen size={14} />
                {m === 'draw' ? 'Draw Signature' : 'Type Signature'}
              </button>
            ))}
          </div>

          {mode === 'draw' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-ink-600 dark:text-ink-400">Draw your signature below</p>
                <button onClick={clearCanvas} className="flex items-center gap-1 text-xs text-ink-400 hover:text-red-500 transition-colors">
                  <Trash2 size={12} /> Clear
                </button>
              </div>
              <canvas ref={canvasRef} width={560} height={140}
                className="w-full rounded-xl border-2 border-dashed border-ink-300 dark:border-ink-600 bg-white dark:bg-ink-900 cursor-crosshair touch-none"
                onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
              <p className="text-xs text-ink-400 mt-2 text-center">Use mouse or touchscreen to sign</p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-ink-600 dark:text-ink-400 block mb-2">Type your name</label>
              <input type="text" value={typedName} onChange={e => setTypedName(e.target.value)} placeholder="Your Full Name"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: '1.5rem' }} />
            </div>
          )}

          {state === 'error' && <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}

          <button onClick={handleApply}
            className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all">
            <FileSignature size={20} /> Apply Signature to PDF
          </button>

          <button onClick={() => { setFile(null); setState('idle') }} className="w-full text-center text-sm text-ink-400 hover:text-ink-600 transition-colors">
            Choose a different file
          </button>
        </div>
      )}

      {state === 'processing' && (
        <div className="flex flex-col items-center gap-4 py-16">
          <div className="w-10 h-10 border-[3px] border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-ink-500">Applying signature...</p>
        </div>
      )}

      {state === 'done' && result && (
        <div className="p-8 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-4">
            <CheckCircle2 size={48} className="text-green-500" />
          </div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-2xl mb-2">Document Signed</h3>
          <p className="text-green-600 dark:text-green-400 text-sm mb-6">Your signature has been applied to the last page.</p>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Signed PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }}
            className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="sign-bottom" format="rectangle" />
      </div>

      <div className="mt-12 space-y-3 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
        <h2 className="font-display text-xl font-bold text-ink-800 dark:text-ink-200">How to Sign a PDF Online</h2>
        <p>PDFPro's signature tool lets you sign any PDF document directly in your browser. Draw your signature with a mouse or touchscreen, or type your name in a handwriting-style font. Your signature is embedded into the PDF page — no printing, scanning, or software required.</p>
        <p>For legally-binding e-signatures with audit trails, consider a dedicated service like DocuSign or HelloSign.</p>
      </div>
    </div>
  )
}
