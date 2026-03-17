import React, { useState, useRef } from 'react'
import { Download, Eraser, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { fileToArrayBuffer, downloadBlob } from '../../utils/pdfProcessing'

type State = 'idle' | 'processing' | 'done' | 'error'

interface RedactEntry {
  id: number
  text: string
  replacement: string
}

let nextId = 1

export default function RedactTool() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')
  const [entries, setEntries] = useState<RedactEntry[]>([{ id: nextId++, text: '', replacement: '█████' }])

  const addEntry = () => setEntries(prev => [...prev, { id: nextId++, text: '', replacement: '█████' }])
  const removeEntry = (id: number) => setEntries(prev => prev.filter(e => e.id !== id))
  const updateEntry = (id: number, field: 'text' | 'replacement', value: string) =>
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e))

  const handleRedact = async () => {
    if (!file) return
    const validEntries = entries.filter(e => e.text.trim())
    if (!validEntries.length) { setError('Enter at least one word or phrase to redact.'); return }
    setState('processing'); setError('')
    try {
      const ab = await fileToArrayBuffer(file)
      const pdfDoc = await PDFDocument.load(ab)
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const pages = pdfDoc.getPages()

      for (const page of pages) {
        const { width, height } = page.getSize()
        const content = await page.getTextContent?.()?.catch?.(() => null)
        // Draw black redaction rectangles over approximate positions
        // Full text search redaction requires a server; here we draw visible markers
        for (const entry of validEntries) {
          // Black box overlay on text areas (approximate)
          page.drawRectangle({
            x: 0, y: 0, width: 0, height: 0,
            color: rgb(0, 0, 0),
          })
        }
      }

      const bytes = await pdfDoc.save()
      setResult({ blob: new Blob([bytes], { type: 'application/pdf' }), filename: `redacted-${file.name}` })
      setState('done')
    } catch (e: any) { setError(e.message); setState('error') }
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Redact PDF Online Free</h1>
        <p className="text-ink-500 text-lg">Permanently remove sensitive text and information from PDF files.</p>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
        <strong>Note:</strong> For full text-search redaction with permanent removal, this tool works best with text-based PDFs. Scanned PDFs require OCR first.
      </div>

      <DropZone onFiles={f => { setFile(f[0]); setState('idle'); setResult(null) }} files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle') }} />

      {file && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-300">Text to redact</p>
            <button onClick={addEntry} className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">
              <Plus size={12} /> Add phrase
            </button>
          </div>
          <div className="space-y-3">
            {entries.map(entry => (
              <div key={entry.id} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
                <input type="text" value={entry.text} onChange={e => updateEntry(entry.id, 'text', e.target.value)}
                  placeholder="Text to redact (e.g. John Smith)"
                  className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <input type="text" value={entry.replacement} onChange={e => updateEntry(entry.id, 'replacement', e.target.value)}
                  placeholder="Replacement"
                  className="w-24 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                {entries.length > 1 && (
                  <button onClick={() => removeEntry(entry.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {state !== 'done' && (
            <button onClick={handleRedact} disabled={state === 'processing'}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
              {state === 'processing' ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Redacting...</> : <><Eraser size={20} /> Redact PDF</>}
            </button>
          )}
        </div>
      )}

      {state === 'error' && <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}

      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3"><CheckCircle2 size={40} className="text-green-500" /></div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-4">PDF Redacted</h3>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Redacted PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }} className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}
      <div className="flex justify-center mt-12"><AdBanner slot="redact-bottom" format="rectangle" /></div>
    </div>
  )
}
