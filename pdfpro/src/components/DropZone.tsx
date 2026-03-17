import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { formatFileSize } from '../utils/pdfProcessing'

interface DropZoneProps {
  accept?: Record<string, string[]>
  multiple?: boolean
  maxFiles?: number
  maxSize?: number
  onFiles: (files: File[]) => void
  files?: File[]
  onRemove?: (index: number) => void
  label?: string
  sublabel?: string
}

const DEFAULT_ACCEPT = {
  'application/pdf': ['.pdf'],
}

export default function DropZone({
  accept = DEFAULT_ACCEPT,
  multiple = false,
  maxFiles = 10,
  maxSize = 100 * 1024 * 1024, // 100MB
  onFiles,
  files = [],
  onRemove,
  label = 'Drop PDF here or click to upload',
  sublabel = 'Supports PDF up to 100MB',
}: DropZoneProps) {
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setError(null)
      if (rejected.length > 0) {
        const err = rejected[0].errors[0]
        if (err.code === 'file-too-large') setError('File is too large. Max 100MB.')
        else if (err.code === 'file-invalid-type') setError('Invalid file type.')
        else setError(err.message)
        return
      }
      onFiles(accepted)
    },
    [onFiles]
  )

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    maxSize,
  })

  return (
    <div className="w-full space-y-3">
      {/* Drop area */}
      <div
        {...getRootProps()}
        className={clsx(
          'relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 group',
          isDragActive && !isDragReject
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 scale-[1.01]'
            : isDragReject
            ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
            : 'border-ink-200 dark:border-ink-700 bg-ink-50/50 dark:bg-ink-900/20 hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/10'
        )}
      >
        <input {...getInputProps()} />

        {/* Animated upload icon */}
        <div className={clsx(
          'mx-auto mb-4 w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300',
          isDragActive
            ? 'gradient-brand shadow-lg shadow-brand-500/30 scale-110'
            : 'bg-ink-100 dark:bg-ink-800 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30'
        )}>
          <Upload
            size={28}
            className={clsx(
              'transition-colors duration-200',
              isDragActive ? 'text-white' : 'text-ink-400 group-hover:text-brand-500'
            )}
          />
        </div>

        <p className="font-semibold text-ink-700 dark:text-ink-200 text-lg mb-1">
          {isDragActive ? 'Release to upload' : label}
        </p>
        <p className="text-sm text-ink-500 dark:text-ink-400">{sublabel}</p>

        {/* Drag indicator ring */}
        {isDragActive && (
          <div className="absolute inset-0 rounded-2xl border-2 border-brand-400 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-[var(--surface-2)] rounded-xl px-4 py-3 group animate-slide-up"
            >
              <div className="w-9 h-9 gradient-brand rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-800 dark:text-ink-200 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-ink-400">{formatFileSize(file.size)}</p>
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(i)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
