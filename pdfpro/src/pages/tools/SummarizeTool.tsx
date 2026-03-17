import React, { useState } from 'react'
import { Sparkles, Copy, Check, FileSearch } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'

type State = 'idle' | 'extracting' | 'summarizing' | 'done' | 'error'

interface Summary {
  summary: string
  keyPoints: string[]
  tone: string
  wordCount: number
}

export default function SummarizeTool() {
  const [file, setFile] = useState<File | null>(null)
  const [state, setState] = useState<State>('idle')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const extractText = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`
    const ab = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: ab }).promise
    let text = ''
    for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      text += content.items.map((item: any) => item.str).join(' ') + '\n'
    }
    return text.trim()
  }

  const handleSummarize = async () => {
    if (!file) return
    setError('')
    setSummary(null)

    setState('extracting')
    let text = ''
    try {
      text = await extractText(file)
    } catch {
      setError('Could not extract text from this PDF. It may be a scanned image — try OCR first.')
      setState('error')
      return
    }

    if (text.length < 100) {
      setError('Not enough text found. This PDF may be scanned. Use the OCR PDF tool first.')
      setState('error')
      return
    }

    setState('summarizing')
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) throw new Error('Summarization API unavailable')
      const data = await res.json()
      setSummary(data)
      setState('done')
    } catch {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
      setSummary({
        summary: sentences.slice(0, 5).join('. ').trim() + '.',
        keyPoints: sentences.slice(5, 10).map(s => s.trim()).filter(Boolean),
        tone: 'unknown',
        wordCount: text.split(/\s+/).length,
      })
      setState('done')
    }
  }

  const copyToClipboard = async () => {
    if (!summary) return
    const text = `Summary:\n${summary.summary}\n\nKey Points:\n${summary.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const TONE_COLORS: Record<string, string> = {
    formal:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    informal:  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    technical: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    academic:  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-sm font-medium mb-4 border border-violet-200 dark:border-violet-800">
          <Sparkles size={14} /> AI-Powered
        </div>
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">AI PDF Summarizer</h1>
        <p className="text-ink-500 text-lg">Get instant AI summaries and key points from any PDF. Save hours of reading.</p>
      </div>

      {(state === 'idle' || state === 'error') && (
        <>
          <DropZone onFiles={f => { setFile(f[0]); setState('idle') }} files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle') }}
            label="Drop your PDF to summarize"
            sublabel="Reports, papers, contracts, books — any text-based PDF" />
          {state === 'error' && <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>}
          {file && (
            <button onClick={handleSummarize}
              className="mt-6 w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-violet-500 to-brand-500 text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all">
              <Sparkles size={20} /> Summarize with AI
            </button>
          )}
        </>
      )}

      {(state === 'extracting' || state === 'summarizing') && (
        <div className="flex flex-col items-center gap-5 py-16">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-brand-500 flex items-center justify-center animate-pulse-slow">
            <FileSearch size={28} className="text-white" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-ink-800 dark:text-ink-200 text-lg mb-1">
              {state === 'extracting' ? 'Extracting text...' : 'Generating summary...'}
            </p>
            <p className="text-ink-400 text-sm">
              {state === 'extracting' ? 'Parsing PDF content' : 'AI is reading your document'}
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {state === 'done' && summary && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-ink-500">{summary.wordCount.toLocaleString()} words in original</span>
            {summary.tone && summary.tone !== 'unknown' && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${TONE_COLORS[summary.tone] ?? 'bg-ink-100 text-ink-600'}`}>
                {summary.tone} tone
              </span>
            )}
          </div>

          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-ink-900 dark:text-ink-100 flex items-center gap-2">
                <Sparkles size={16} className="text-violet-500" /> Summary
              </h3>
              <button onClick={copyToClipboard} className="flex items-center gap-1 text-xs text-ink-400 hover:text-brand-500 transition-colors">
                {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy all</>}
              </button>
            </div>
            <p className="text-ink-700 dark:text-ink-300 leading-relaxed text-sm">{summary.summary}</p>
          </div>

          {summary.keyPoints.length > 0 && (
            <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <h3 className="font-display font-bold text-ink-900 dark:text-ink-100 mb-4">Key Points</h3>
              <ul className="space-y-2">
                {summary.keyPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-ink-700 dark:text-ink-300">
                    <span className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button onClick={() => { setFile(null); setState('idle'); setSummary(null) }}
            className="w-full text-center py-3 rounded-xl border border-[var(--border)] text-sm text-ink-500 hover:border-brand-400 hover:text-brand-500 transition-all">
            Summarize another document
          </button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="summarize-bottom" format="rectangle" />
      </div>

      <div className="mt-12 text-sm text-ink-500 dark:text-ink-400 space-y-3 leading-relaxed">
        <h2 className="font-display text-xl font-bold text-ink-800 dark:text-ink-200">About the AI PDF Summarizer</h2>
        <p>PDFPro's AI summarizer extracts text from your PDF and uses large language model technology to generate a concise summary and bullet-point key takeaways. It works best with text-based PDFs — reports, research papers, contracts, ebooks, and articles.</p>
        <p>For scanned documents, use the OCR PDF tool first to make the text selectable, then summarize.</p>
      </div>
    </div>
  )
}
