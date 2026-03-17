import React, { useState, useRef } from 'react'
import { Download, Camera, CheckCircle2, RotateCw } from 'lucide-react'
import AdBanner from '../../components/AdBanner'
import { imagesToPDF, downloadBlob } from '../../utils/pdfProcessing'

type State = 'idle' | 'captured' | 'processing' | 'done' | 'error'

export default function ScanToPdfTool() {
  const [state, setState] = useState<State>('idle')
  const [captures, setCaptures] = useState<string[]>([])
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      setError('Camera access denied. Please allow camera permissions or upload images instead.')
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')!.drawImage(videoRef.current, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setCaptures(prev => [...prev, dataUrl])
    setState('captured')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        if (ev.target?.result) {
          setCaptures(prev => [...prev, ev.target!.result as string])
          setState('captured')
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleConvert = async () => {
    if (!captures.length) return
    setState('processing'); setError('')
    try {
      const files = await Promise.all(captures.map(async (dataUrl, i) => {
        const res = await fetch(dataUrl)
        const blob = await res.blob()
        return new File([blob], `scan-${i + 1}.jpg`, { type: 'image/jpeg' })
      }))
      const res = await imagesToPDF(files)
      setResult(res)
      setState('done')
      stopCamera()
    } catch (e: any) { setError(e.message); setState('error') }
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Scan to PDF</h1>
        <p className="text-ink-500 text-lg">Use your camera to scan documents and convert them to PDF instantly.</p>
      </div>

      {state === 'idle' || state === 'captured' ? (
        <div className="space-y-4">
          {!cameraActive ? (
            <div className="grid grid-cols-2 gap-4">
              <button onClick={startCamera}
                className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all cursor-pointer">
                <Camera size={32} className="text-brand-500" />
                <div className="text-center">
                  <p className="font-semibold text-ink-800 dark:text-ink-200 text-sm">Use Camera</p>
                  <p className="text-xs text-ink-400 mt-1">Scan with device camera</p>
                </div>
              </button>
              <label className="flex flex-col items-center gap-3 p-8 rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-brand-400 hover:bg-brand-50/30 dark:hover:bg-brand-900/10 transition-all cursor-pointer">
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                <Download size={32} className="text-brand-500 rotate-180" />
                <div className="text-center">
                  <p className="font-semibold text-ink-800 dark:text-ink-200 text-sm">Upload Images</p>
                  <p className="text-xs text-ink-400 mt-1">JPG, PNG, WEBP supported</p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-brand-400 pointer-events-none rounded-xl" />
              </div>
              <div className="flex gap-3">
                <button onClick={capturePhoto}
                  className="flex-1 flex items-center justify-center gap-2 py-3 gradient-brand text-white rounded-xl font-semibold">
                  <Camera size={18} /> Capture
                </button>
                <button onClick={stopCamera}
                  className="px-4 py-3 rounded-xl border border-[var(--border)] text-sm text-ink-600 dark:text-ink-400 hover:border-red-400 hover:text-red-500 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {captures.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-ink-700 dark:text-ink-300">{captures.length} scan{captures.length !== 1 ? 's' : ''} captured</p>
                <button onClick={() => setCaptures([])} className="text-xs text-red-500 hover:underline">Clear all</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                {captures.map((cap, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-[var(--border)]">
                    <img src={cap} alt={`Scan ${i + 1}`} className="w-full h-full object-cover" />
                    <button onClick={() => setCaptures(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center leading-none">
                      x
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={handleConvert} disabled={state === 'processing'}
                className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all">
                {state === 'processing'
                  ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Converting...</>
                  : <>Convert {captures.length} Scan{captures.length !== 1 ? 's' : ''} to PDF</>
                }
              </button>
            </div>
          )}
        </div>
      ) : null}

      {state === 'error' && <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}

      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3"><CheckCircle2 size={40} className="text-green-500" /></div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-4">Scan Converted to PDF</h3>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download PDF
          </button>
          <button onClick={() => { setCaptures([]); setState('idle'); setResult(null) }} className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Scan more documents</button>
        </div>
      )}
      <div className="flex justify-center mt-12"><AdBanner slot="scan-to-pdf-bottom" format="rectangle" /></div>
    </div>
  )
}
