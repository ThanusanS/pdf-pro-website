import React, { useState } from 'react'
import { Download, Wrench, CheckCircle2, AlertTriangle } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { PDFDocument } from 'pdf-lib'
import { fileToArrayBuffer, downloadBlob, formatFileSize } from '../../utils/pdfProcessing'

type State = 'idle' | 'processing' | 'done' | 'error'

export default function RepairTool() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string; pages: number } | null>(null)
  const [error, setError] = useState('')

  const handleRepair = async () => {
    if (!file) return
    setState('processing'); setError('')
    try {
      const ab = await fileToArrayBuffer(file)
      // pdf-lib attempts to parse and re-save, fixing many structural issues
      const pdfDoc = await PDFDocument.load(ab, {
        ignoreEncryption: true,
        throwOnInvalidObject: false,
      } as any)
      const pages = pdfDoc.getPageCount()
      const bytes = await pdfDoc.save()
      setResult({ blob: new Blob([bytes], { type: 'application/pdf' }), filename: `repaired-${file.name}`, pages })
      setState('done')
    } catch (e: any) {
      setError('Could not repair this PDF. The file may be severely corrupted or not a valid PDF.')
      setState('error')
    }
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Repair PDF Online Free</h1>
        <p className="text-ink-500 text-lg">Fix damaged or corrupted PDF files and recover content. No login required.</p>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
        This tool repairs structural errors, fixes broken object references, and attempts to recover pages from damaged PDFs.
      </div>

      <DropZone onFiles={f => { setFile(f[0]); setState('idle'); setResult(null) }} files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle') }} />

      {file && (
        <div className="mt-6">
          {state !== 'done' && (
            <button onClick={handleRepair} disabled={state === 'processing'}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
              {state === 'processing' ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Repairing PDF...</> : <><Wrench size={20} /> Repair PDF</>}
            </button>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3"><CheckCircle2 size={40} className="text-green-500" /></div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-2">PDF Repaired</h3>
          <p className="text-green-600 dark:text-green-400 text-sm mb-5">{result.pages} pages recovered — {formatFileSize(result.blob.size)}</p>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Repaired PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }} className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}
      <div className="flex justify-center mt-12"><AdBanner slot="repair-bottom" format="rectangle" /></div>
    </div>
  )
}
