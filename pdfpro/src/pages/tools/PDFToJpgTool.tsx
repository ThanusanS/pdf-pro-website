import React, { useState } from 'react'
import { Download, Image as ImageIcon, Loader, CheckCircle2, FileText } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { pdfPageToImage, getPDFInfo, downloadBlob } from '../../utils/pdfProcessing'

type State = 'idle' | 'loading' | 'converting' | 'done' | 'error'

interface PageImage {
  dataUrl: string
  page: number
  width: number
  height: number
}

export default function PDFToJpgTool() {
  const [file, setFile] = useState<File | null>(null)
  const [pdfInfo, setPdfInfo] = useState<{ pages: number } | null>(null)
  const [quality, setQuality] = useState<1 | 1.5 | 2 | 3>(2)
  const [convertAll, setConvertAll] = useState(true)
  const [pageNum, setPageNum] = useState(1)
  const [state, setState] = useState<State>('idle')
  const [images, setImages] = useState<PageImage[]>([])
  const [error, setError] = useState('')

  const handleFile = async (files: File[]) => {
    const f = files[0]
    setFile(f)
    setState('loading')
    try {
      const info = await getPDFInfo(f)
      setPdfInfo(info)
      setState('idle')
    } catch {
      setState('idle')
    }
  }

  const handleConvert = async () => {
    if (!file || !pdfInfo) return
    setState('converting')
    setImages([])
    setError('')
    try {
      const indices = convertAll
        ? Array.from({ length: pdfInfo.pages }, (_, i) => i)
        : [pageNum - 1]

      const results: PageImage[] = []
      for (const idx of indices) {
        const img = await pdfPageToImage(file, idx, quality)
        results.push({ ...img, page: idx + 1 })
        setImages([...results])
      }
      setState('done')
    } catch (e: any) {
      setError(e.message ?? 'Conversion failed.')
      setState('error')
    }
  }

  const downloadImage = (img: PageImage) => {
    const a = document.createElement('a')
    a.href = img.dataUrl
    a.download = `page-${img.page}.jpg`
    a.click()
  }

  const downloadAll = () => {
    images.forEach((img, i) => setTimeout(() => downloadImage(img), i * 200))
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">
          PDF to JPG Online Free
        </h1>
        <p className="text-ink-500 text-lg">
          Convert PDF pages to high-quality JPG images instantly. No login required.
        </p>
      </div>

      <DropZone
        onFiles={handleFile}
        files={file ? [file] : []}
        onRemove={() => { setFile(null); setPdfInfo(null); setState('idle'); setImages([]) }}
      />

      {state === 'loading' && (
        <div className="flex items-center gap-2 mt-4 text-sm text-ink-500">
          <Loader size={14} className="animate-spin" />
          Loading PDF info...
        </div>
      )}

      {file && pdfInfo && state !== 'loading' && (
        <div className="mt-6 space-y-5">
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-900/20 text-sm text-brand-700 dark:text-brand-300 font-medium">
            <FileText size={14} />
            {file.name} — {pdfInfo.pages} page{pdfInfo.pages !== 1 ? 's' : ''}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">Image Quality</p>
              <div className="space-y-2">
                {([
                  { val: 1, label: 'Standard (72 DPI)' },
                  { val: 2, label: 'High (144 DPI)'    },
                  { val: 3, label: 'Ultra (216 DPI)'   },
                ] as { val: 1 | 1.5 | 2 | 3; label: string }[]).map(opt => (
                  <label key={opt.val} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="quality" value={opt.val}
                      checked={quality === opt.val}
                      onChange={() => setQuality(opt.val)}
                      className="accent-brand-500" />
                    <span className="text-sm text-ink-700 dark:text-ink-300">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">Pages to Convert</p>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pages" checked={convertAll}
                    onChange={() => setConvertAll(true)} className="accent-brand-500" />
                  <span className="text-sm text-ink-700 dark:text-ink-300">All pages</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pages" checked={!convertAll}
                    onChange={() => setConvertAll(false)} className="accent-brand-500" />
                  <span className="text-sm text-ink-700 dark:text-ink-300">Specific page</span>
                </label>
                {!convertAll && (
                  <input
                    type="number" min={1} max={pdfInfo.pages} value={pageNum}
                    onChange={e => setPageNum(Math.min(pdfInfo.pages, Math.max(1, +e.target.value)))}
                    className="w-24 px-3 py-2 rounded-lg border border-[var(--border)] text-sm bg-[var(--surface)] text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                )}
              </div>
            </div>
          </div>

          {state !== 'done' && (
            <button
              onClick={handleConvert}
              disabled={state === 'converting'}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none"
            >
              {state === 'converting'
                ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Converting{images.length > 0 ? ` (${images.length}/${convertAll ? pdfInfo.pages : 1})` : '...'}
                  </>
                ) : (
                  <><ImageIcon size={20} /> Convert to JPG</>
                )
              }
            </button>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 text-sm">{error}</div>
      )}

      {images.length > 0 && (
        <div className="mt-8 animate-slide-up">
          {state === 'done' && (
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <h3 className="font-bold text-ink-900 dark:text-ink-100">
                  {images.length} image{images.length !== 1 ? 's' : ''} ready
                </h3>
              </div>
              {images.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="flex items-center gap-1 px-4 py-2 gradient-brand text-white rounded-xl text-sm font-semibold shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <Download size={14} /> Download All
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.map(img => (
              <div key={img.page} className="group relative rounded-xl overflow-hidden border border-[var(--border)] bg-ink-50 dark:bg-ink-900">
                <img src={img.dataUrl} alt={`Page ${img.page}`} className="w-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => downloadImage(img)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-ink-800 shadow-lg"
                  >
                    <Download size={12} /> Page {img.page}
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1">
                  Page {img.page} — {img.width}&times;{img.height}
                </div>
              </div>
            ))}
          </div>

          {state === 'done' && (
            <button
              onClick={() => { setFile(null); setPdfInfo(null); setState('idle'); setImages([]) }}
              className="block w-full mt-4 text-center text-sm text-ink-400 hover:text-ink-600 transition-colors"
            >
              Convert another PDF
            </button>
          )}
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="pdf-to-jpg-bottom" format="rectangle" />
      </div>

      <div className="mt-12 space-y-3 text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
        <h2 className="font-display text-xl font-bold text-ink-800 dark:text-ink-200">How to Convert PDF to JPG</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Upload your PDF using the drop zone above</li>
          <li>Select image quality and which pages to convert</li>
          <li>Click Convert — images render progressively in your browser</li>
          <li>Download individual pages or all images at once</li>
        </ol>
      </div>
    </div>
  )
}
