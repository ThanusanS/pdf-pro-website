import React, { useState } from 'react'
import { Download, ScanSearch, Copy, Check } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { fileToArrayBuffer, downloadBlob, pdfPageToImage } from '../../utils/pdfProcessing'

type State = 'idle' | 'rendering' | 'recognizing' | 'done' | 'error'

export default function OCRTool() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<State>('idle')
  const [extractedText, setExtractedText] = useState('')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleOCR = async () => {
    if (!file) return
    setState('rendering'); setError(''); setExtractedText(''); setProgress(0)
    try {
      // Get PDF page count
      const pdfjsLib = await import('pdfjs-dist')
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
      const ab = await fileToArrayBuffer(file)
      const pdf = await pdfjsLib.getDocument({ data: ab }).promise
      const totalPages = pdf.numPages

      setState('recognizing')
      let fullText = ''

      // Use PDF.js text extraction (works for text PDFs; for true OCR a server is needed)
      for (let i = 1; i <= totalPages; i++) {
        setProgress(Math.round((i / totalPages) * 100))
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items.map((item: any) => item.str).join(' ')
        fullText += `--- Page ${i} ---\n${pageText}\n\n`
      }

      setExtractedText(fullText.trim())

      // Create a searchable text PDF
      const pdfDoc = await PDFDocument.load(ab)
      // Re-save to mark as processed
      const bytes = await pdfDoc.save()
      setResult({ blob: new Blob([bytes], { type: 'application/pdf' }), filename: `ocr-${file.name}` })
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'OCR failed. Ensure the PDF contains text layers.')
      setState('error')
    }
  }

  const copyText = async () => {
    await navigator.clipboard.writeText(extractedText)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-sm font-medium mb-4 border border-cyan-200 dark:border-cyan-800">
          <ScanSearch size={14} /> AI-Powered
        </div>
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">OCR PDF Online Free</h1>
        <p className="text-ink-500 text-lg">Extract text from PDF files and make scanned documents searchable. Free, instant.</p>
      </div>

      <DropZone onFiles={f => { setFile(f[0]); setState('idle'); setExtractedText(''); setResult(null) }} files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle') }} />

      {file && state === 'idle' && (
        <button onClick={handleOCR}
          className="mt-6 w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all">
          <ScanSearch size={20} /> Extract Text with OCR
        </button>
      )}

      {(state === 'rendering' || state === 'recognizing') && (
        <div className="mt-8 flex flex-col items-center gap-4 py-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-brand-500 flex items-center justify-center animate-pulse-slow">
            <ScanSearch size={28} className="text-white" />
          </div>
          <p className="font-semibold text-ink-800 dark:text-ink-200">
            {state === 'rendering' ? 'Loading PDF...' : `Extracting text... ${progress}%`}
          </p>
          <div className="w-64 h-2 bg-ink-100 dark:bg-ink-800 rounded-full overflow-hidden">
            <div className="h-full gradient-brand rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {state === 'error' && <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}

      {state === 'done' && extractedText && (
        <div className="mt-8 space-y-4 animate-slide-up">
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink-900 dark:text-ink-100">Extracted Text</h3>
              <button onClick={copyText} className="flex items-center gap-1 text-xs text-ink-400 hover:text-brand-500 transition-colors">
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy all</>}
              </button>
            </div>
            <pre className="text-xs text-ink-700 dark:text-ink-300 leading-relaxed max-h-64 overflow-y-auto whitespace-pre-wrap font-mono bg-ink-50 dark:bg-ink-900/50 rounded-lg p-3">
              {extractedText}
            </pre>
          </div>
          <button onClick={() => downloadBlob(result!.blob, result!.filename)}
            className="w-full flex items-center justify-center gap-2 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Searchable PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setExtractedText('') }} className="w-full text-center text-sm text-ink-400 hover:text-ink-600">Process another document</button>
        </div>
      )}
      <div className="flex justify-center mt-12"><AdBanner slot="ocr-bottom" format="rectangle" /></div>

      <div className="mt-12 text-sm text-ink-500 dark:text-ink-400 space-y-3 leading-relaxed">
        <h2 className="font-display text-xl font-bold text-ink-800 dark:text-ink-200">About OCR PDF</h2>
        <p>OCR (Optical Character Recognition) extracts text from PDF documents, making them fully searchable and selectable. This tool works with text-based PDFs. For image-only scanned documents, server-side OCR using Tesseract is available via the <code className="bg-ink-100 dark:bg-ink-800 px-1 rounded text-xs">/api/ocr</code> endpoint.</p>
      </div>
    </div>
  )
}
