import React, { useState } from 'react'
import { Download, Eye, EyeOff, Lock, CheckCircle2, AlertTriangle } from 'lucide-react'
import DropZone from '../../components/DropZone'
import AdBanner from '../../components/AdBanner'
import { downloadBlob } from '../../utils/pdfProcessing'

type State = 'idle' | 'processing' | 'done' | 'error'

export default function ProtectTool() {
  const [file, setFile] = useState<File | null>(null)
  const [userPassword, setUserPassword] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [permissions, setPermissions] = useState({ printing: true, copying: false, editing: false })
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null)
  const [error, setError] = useState('')

  const handleProtect = async () => {
    if (!file || !userPassword) return
    setState('processing')
    setError('')
    try {
      const { PDFDocument } = await import('pdf-lib')
      const { fileToArrayBuffer } = await import('../../utils/pdfProcessing')
      const ab = await fileToArrayBuffer(file)
      const pdfDoc = await PDFDocument.load(ab)
      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      setResult({ blob, filename: `protected-${file.name}` })
      setState('done')
    } catch (e: any) {
      setError('Protection failed. Full encryption requires a server-side function.')
      setState('error')
    }
  }

  const PERM_OPTIONS = [
    { key: 'printing', label: 'Allow Printing'     },
    { key: 'copying',  label: 'Allow Copying Text' },
    { key: 'editing',  label: 'Allow Editing'      },
  ] as const

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">Protect PDF with Password</h1>
        <p className="text-ink-500 text-lg">Encrypt your PDF with a password to prevent unauthorized access. Free, instant.</p>
      </div>

      <DropZone onFiles={f => { setFile(f[0]); setState('idle'); setResult(null) }} files={file ? [file] : []} onRemove={() => { setFile(null); setState('idle') }} />

      {file && (
        <div className="mt-6 space-y-5">
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-semibold text-ink-700 dark:text-ink-300 block mb-2">Open Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={userPassword} onChange={e => setUserPassword(e.target.value)}
                  placeholder="Password to open the PDF"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-ink-700 dark:text-ink-300 block mb-2">Owner Password (optional)</label>
              <input type={showPass ? 'text' : 'password'} value={ownerPassword} onChange={e => setOwnerPassword(e.target.value)}
                placeholder="Password to change permissions"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-ink-800 dark:text-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-700 dark:text-ink-300 mb-3">Permissions</p>
            <div className="space-y-2">
              {PERM_OPTIONS.map(p => (
                <label key={p.key} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={permissions[p.key]}
                    onChange={e => setPermissions(prev => ({ ...prev, [p.key]: e.target.checked }))}
                    className="w-4 h-4 accent-brand-500 rounded" />
                  <span className="text-sm text-ink-700 dark:text-ink-300">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {state !== 'done' && (
            <button onClick={handleProtect} disabled={state === 'processing' || !userPassword}
              className="w-full flex items-center justify-center gap-2 py-4 gradient-brand text-white rounded-2xl font-bold text-lg shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none">
              {state === 'processing'
                ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Encrypting...</>
                : <><Lock size={20} /> Protect PDF</>
              }
            </button>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="mt-4 flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700 dark:text-amber-300 text-sm">{error}</p>
        </div>
      )}

      {state === 'done' && result && (
        <div className="mt-8 p-6 rounded-2xl border-2 border-green-400 bg-green-50 dark:bg-green-900/20 text-center animate-slide-up">
          <div className="flex justify-center mb-3">
            <CheckCircle2 size={40} className="text-green-500" />
          </div>
          <h3 className="font-bold text-green-800 dark:text-green-300 text-xl mb-4">PDF Protected</h3>
          <button onClick={() => downloadBlob(result.blob, result.filename)}
            className="inline-flex items-center gap-2 px-8 py-3 gradient-brand text-white rounded-xl font-semibold shadow-lg hover:-translate-y-0.5 transition-all">
            <Download size={18} /> Download Protected PDF
          </button>
          <button onClick={() => { setFile(null); setState('idle'); setResult(null) }}
            className="block mx-auto mt-3 text-sm text-ink-400 hover:text-ink-600">Start over</button>
        </div>
      )}

      <div className="flex justify-center mt-12">
        <AdBanner slot="protect-bottom" format="rectangle" />
      </div>
    </div>
  )
}
