import React, { useState } from 'react'
import { Download, FileUp, CheckCircle2, ArrowRight } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { downloadBlob, formatFileSize } from '../../utils/pdfProcessing'

/**
 * Universal conversion tool for:
 * PDF→Word, PDF→Excel, PDF→PPT, Word→PDF, Excel→PDF, PPT→PDF, HTML→PDF, PDF→HTML, PDF→PDF/A
 *
 * These conversions require server-side processing (LibreOffice / Ghostscript).
 * The UI uploads to /api/<toolId> and handles the response.
 * Falls back gracefully with a clear message when the API is not configured.
 */

interface ConversionConfig {
  title: string
  description: string
  accept: Record<string, string[]>
  outputLabel: string
  outputExt: string
  apiEndpoint: string
  inputLabel: string
}

const CONFIGS: Record<string, ConversionConfig> = {
  'pdf-to-word': {
    title: 'PDF to Word Converter',
    description: 'Convert PDF files to editable DOC/DOCX documents while preserving formatting.',
    accept: { 'application/pdf': ['.pdf'] },
    outputLabel: 'Word Document',
    outputExt: '.docx',
    apiEndpoint: '/api/pdf-to-word',
    inputLabel: 'PDF',
  },
  'pdf-to-excel': {
    title: 'PDF to Excel Converter',
    description: 'Extract tables and data from PDF files into editable Excel spreadsheets.',
    accept: { 'application/pdf': ['.pdf'] },
    outputLabel: 'Excel Spreadsheet',
    outputExt: '.xlsx',
    apiEndpoint: '/api/pdf-to-excel',
    inputLabel: 'PDF',
  },
  'pdf-to-ppt': {
    title: 'PDF to PowerPoint Converter',
    description: 'Convert PDF presentations to fully editable PowerPoint files.',
    accept: { 'application/pdf': ['.pdf'] },
    outputLabel: 'PowerPoint Presentation',
    outputExt: '.pptx',
    apiEndpoint: '/api/pdf-to-ppt',
    inputLabel: 'PDF',
  },
  'pdf-to-html': {
    title: 'PDF to HTML Converter',
    description: 'Convert PDF documents to responsive HTML web pages.',
    accept: { 'application/pdf': ['.pdf'] },
    outputLabel: 'HTML File',
    outputExt: '.html',
    apiEndpoint: '/api/pdf-to-html',
    inputLabel: 'PDF',
  },
  'pdf-to-pdfa': {
    title: 'PDF to PDF/A Converter',
    description: 'Convert PDF documents to ISO-standardized PDF/A format for long-term archiving.',
    accept: { 'application/pdf': ['.pdf'] },
    outputLabel: 'PDF/A File',
    outputExt: '.pdf',
    apiEndpoint: '/api/pdf-to-pdfa',
    inputLabel: 'PDF',
  },
  'word-to-pdf': {
    title: 'Word to PDF Converter',
    description: 'Convert DOC and DOCX files to PDF while preserving layout and formatting.',
    accept: { 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    outputLabel: 'PDF Document',
    outputExt: '.pdf',
    apiEndpoint: '/api/word-to-pdf',
    inputLabel: 'Word Document',
  },
  'excel-to-pdf': {
    title: 'Excel to PDF Converter',
    description: 'Convert Excel spreadsheets to PDF with all formatting intact.',
    accept: { 'application/vnd.ms-excel': ['.xls'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    outputLabel: 'PDF Document',
    outputExt: '.pdf',
    apiEndpoint: '/api/excel-to-pdf',
    inputLabel: 'Excel Spreadsheet',
  },
  'ppt-to-pdf': {
    title: 'PowerPoint to PDF Converter',
    description: 'Convert PowerPoint presentations to PDF format for easy sharing.',
    accept: { 'application/vnd.ms-powerpoint': ['.ppt'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] },
    outputLabel: 'PDF Document',
    outputExt: '.pdf',
    apiEndpoint: '/api/ppt-to-pdf',
    inputLabel: 'PowerPoint File',
  },
  'html-to-pdf': {
    title: 'HTML to PDF Converter',
    description: 'Convert HTML files or web page URLs to PDF documents.',
    accept: { 'text/html': ['.html', '.htm'] },
    outputLabel: 'PDF Document',
    outputExt: '.pdf',
    apiEndpoint: '/api/html-to-pdf',
    inputLabel: 'HTML File',
  },
}

type State = 'idle' | 'uploading' | 'done' | 'error' | 'api-unavailable'

export default function ConversionTool({ toolId }: { toolId: string }) {
  const config = CONFIGS[toolId]
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<State>('idle')
  const [resultBlob, setResultBlob] = useState<Blob | null>(null)
  const [error, setError] = useState('')

  if (!config) return null

  const handleConvert = async () => {
    if (!file) return
    setState('uploading'); setError('')

    try {
      // Read file as base64
      const arrayBuffer = await file.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      const res = await fetch(config.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64: base64, filename: file.name }),
      })

      if (res.status === 404 || res.status === 502 || res.status === 503) {
        setState('api-unavailable'); return
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Conversion failed' }))
        throw new Error(err.error ?? 'Conversion failed')
      }

      const blob = await res.blob()
      setResultBlob(blob)
      setState('done')
    } catch (e: any) {
      if (e.message?.includes('fetch') || e.message?.includes('network')) {
        setState('api-unavailable')
      } else {
        setError(e.message)
        setState('error')
      }
    }
  }

  const outFilename = file ? file.name.replace(/\.[^.]+$/, '') + config.outputExt : `converted${config.outputExt}`

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">{config.title}</h1>
        <p className="text-ink-500 text-lg">{config.description} No login required.</p>
      </div>

      <DropZone accept={config.accept} onFiles={f => { setFile(f[0]); setState('idle'); setResultBlob(null) }}
        files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle') }}
        label={`Drop your ${config.inputLabel} here`} sublabel="100% free — No account needed" />

      {file && state === 'idle' && (
        <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-sm text-brand-700 dark:text-brand-300">
          <FileUp size={14} />
          <span className="font-medium truncate">{file.name}</span>
          <ArrowRight size={14} className="flex-shrink-0" />
          <span className="font-semibold flex-shrink-0">{config.outputLabel}</span>
        </div>
      )}

      {file && state !== 'done' && state !== 'api-unavailable' && (
        <button onClick={handleConvert} disabled={state === 'uploading'}
          className="mt-6 w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
          {state === 'uploading'
            ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Converting...</>
            : <>Convert to {config.outputLabel}</>}
        </button>
      )}

      {state === 'error' && <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}

      {state === 'api-unavailable' && (
        <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] overflow-hidden">
          <div className="p-6">
            <h3 className="font-display font-bold text-ink-900 dark:text-ink-100 text-lg mb-2">
              Backend service required
            </h3>
            <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed mb-4">
              <strong>{config.title}</strong> requires a serverless function running LibreOffice or Ghostscript on the server. The <code className="bg-ink-100 dark:bg-ink-800 px-1 rounded text-xs font-mono">{config.apiEndpoint}</code> endpoint is not yet configured.
            </p>
            <div className="space-y-2 text-sm text-ink-600 dark:text-ink-400">
              <p className="font-semibold text-ink-700 dark:text-ink-300">To activate this tool:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Deploy the <code className="bg-ink-100 dark:bg-ink-800 px-1 rounded text-xs font-mono">api/</code> functions to Vercel or Netlify</li>
                <li>Install LibreOffice on your server environment</li>
                <li>Set the <code className="bg-ink-100 dark:bg-ink-800 px-1 rounded text-xs font-mono">LIBREOFFICE_PATH</code> environment variable</li>
                <li>Redeploy — the tool will activate automatically</li>
              </ol>
            </div>
          </div>
          <div className="px-6 py-4 bg-ink-50 dark:bg-ink-800/50 border-t border-[var(--border)] text-xs text-ink-400">
            Alternatively, integrate a third-party API such as ConvertAPI or CloudConvert and update the endpoint handler.
          </div>
        </div>
      )}

      {state === 'done' && resultBlob && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3"><CheckCircle2 size={40} className="text-green-500" /></div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-2">Conversion Complete</h3>
          <p className="text-green-600 dark:text-green-400 text-sm mb-5">{formatFileSize(resultBlob.size)} — ready to download</p>
          <button onClick={() => downloadBlob(resultBlob, outFilename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download {config.outputLabel}
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResultBlob(null) }} className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Convert another file</button>
        </div>
      )}
      <div className="flex justify-center mt-12"><AdBanner slot={`${toolId}-bottom`} format="rectangle" /></div>
    </div>
  )
}
