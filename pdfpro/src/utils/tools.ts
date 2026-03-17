import type { LucideIcon } from 'lucide-react'
import {
  Merge, Scissors, RotateCw, Hash, Crop,
  FileText, Table2, Presentation, Image, Code2, Archive,
  FileUp, FileSpreadsheet, MonitorUp, Camera,
  Minimize2, Wrench,
  Lock, Unlock, Eraser,
  PenLine, Stamp, FileSignature,
  ScanSearch, GitCompare, Sparkles,
} from 'lucide-react'

export interface Tool {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  category: ToolCategory
  badge?: 'popular' | 'new' | 'ai'
  accept?: string[]
  outputFormat?: string
}

export type ToolCategory =
  | 'organize'
  | 'convert-from'
  | 'convert-to'
  | 'optimize'
  | 'security'
  | 'edit'
  | 'intelligence'

export const TOOL_CATEGORIES: Record<ToolCategory, { label: string; color: string }> = {
  organize:       { label: 'Organize PDF',      color: 'blue'   },
  'convert-from': { label: 'Convert from PDF',  color: 'violet' },
  'convert-to':   { label: 'Convert to PDF',    color: 'green'  },
  optimize:       { label: 'Optimize PDF',       color: 'amber'  },
  security:       { label: 'PDF Security',       color: 'red'    },
  edit:           { label: 'Edit PDF',           color: 'pink'   },
  intelligence:   { label: 'PDF Intelligence',  color: 'cyan'   },
}

export const TOOLS: Tool[] = [
  // Organize
  {
    id: 'merge',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one file in any order',
    icon: Merge,
    color: '#3b82f6',
    category: 'organize',
    badge: 'popular',
    accept: ['application/pdf'],
  },
  {
    id: 'split',
    name: 'Split PDF',
    description: 'Separate pages into individual PDF files',
    icon: Scissors,
    color: '#6366f1',
    category: 'organize',
    accept: ['application/pdf'],
  },
  {
    id: 'rotate',
    name: 'Rotate PDF',
    description: 'Rotate pages individually or in bulk',
    icon: RotateCw,
    color: '#8b5cf6',
    category: 'organize',
    accept: ['application/pdf'],
  },
  {
    id: 'page-numbers',
    name: 'Page Numbers',
    description: 'Add custom page numbers with fonts and positions',
    icon: Hash,
    color: '#a78bfa',
    category: 'organize',
    accept: ['application/pdf'],
  },
  {
    id: 'crop',
    name: 'Crop PDF',
    description: 'Crop margins or select specific areas',
    icon: Crop,
    color: '#7c3aed',
    category: 'organize',
    accept: ['application/pdf'],
  },
  // Convert from PDF
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDFs to editable DOC/DOCX files',
    icon: FileText,
    color: '#2563eb',
    category: 'convert-from',
    badge: 'popular',
    accept: ['application/pdf'],
    outputFormat: 'DOCX',
  },
  {
    id: 'pdf-to-excel',
    name: 'PDF to Excel',
    description: 'Extract tables and data to Excel spreadsheets',
    icon: Table2,
    color: '#16a34a',
    category: 'convert-from',
    accept: ['application/pdf'],
    outputFormat: 'XLSX',
  },
  {
    id: 'pdf-to-ppt',
    name: 'PDF to PowerPoint',
    description: 'Convert PDFs to editable PPT/PPTX slides',
    icon: Presentation,
    color: '#ea580c',
    category: 'convert-from',
    accept: ['application/pdf'],
    outputFormat: 'PPTX',
  },
  {
    id: 'pdf-to-jpg',
    name: 'PDF to JPG',
    description: 'Convert PDF pages to high-quality images',
    icon: Image,
    color: '#0891b2',
    category: 'convert-from',
    badge: 'popular',
    accept: ['application/pdf'],
    outputFormat: 'JPG',
  },
  {
    id: 'pdf-to-html',
    name: 'PDF to HTML',
    description: 'Convert PDFs to web-ready HTML pages',
    icon: Code2,
    color: '#0f766e',
    category: 'convert-from',
    accept: ['application/pdf'],
    outputFormat: 'HTML',
  },
  {
    id: 'pdf-to-pdfa',
    name: 'PDF to PDF/A',
    description: 'Convert to ISO-standardized PDF/A format',
    icon: Archive,
    color: '#475569',
    category: 'convert-from',
    accept: ['application/pdf'],
    outputFormat: 'PDF/A',
  },
  // Convert to PDF
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert DOC/DOCX files to PDF',
    icon: FileUp,
    color: '#2563eb',
    category: 'convert-to',
    badge: 'popular',
    accept: ['.doc', '.docx', 'application/msword'],
    outputFormat: 'PDF',
  },
  {
    id: 'excel-to-pdf',
    name: 'Excel to PDF',
    description: 'Convert spreadsheets to PDF',
    icon: FileSpreadsheet,
    color: '#16a34a',
    category: 'convert-to',
    accept: ['.xlsx', '.xls'],
    outputFormat: 'PDF',
  },
  {
    id: 'ppt-to-pdf',
    name: 'PowerPoint to PDF',
    description: 'Convert PPT/PPTX presentations to PDF',
    icon: MonitorUp,
    color: '#ea580c',
    category: 'convert-to',
    accept: ['.ppt', '.pptx'],
    outputFormat: 'PDF',
  },
  {
    id: 'jpg-to-pdf',
    name: 'JPG to PDF',
    description: 'Convert images to PDF with custom margins',
    icon: Image,
    color: '#0891b2',
    category: 'convert-to',
    accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    outputFormat: 'PDF',
  },
  {
    id: 'html-to-pdf',
    name: 'HTML to PDF',
    description: 'Convert webpages by URL or HTML file to PDF',
    icon: Code2,
    color: '#0f766e',
    category: 'convert-to',
    accept: ['.html'],
    outputFormat: 'PDF',
  },
  {
    id: 'scan-to-pdf',
    name: 'Scan to PDF',
    description: 'Capture documents via camera and convert to PDF',
    icon: Camera,
    color: '#7c3aed',
    category: 'convert-to',
    badge: 'new',
    accept: ['image/*'],
    outputFormat: 'PDF',
  },
  // Optimize
  {
    id: 'compress',
    name: 'Compress PDF',
    description: 'Reduce file size while preserving quality',
    icon: Minimize2,
    color: '#d97706',
    category: 'optimize',
    badge: 'popular',
    accept: ['application/pdf'],
  },
  {
    id: 'repair',
    name: 'Repair PDF',
    description: 'Fix damaged or corrupted PDF files',
    icon: Wrench,
    color: '#b45309',
    category: 'optimize',
    accept: ['application/pdf'],
  },
  // Security
  {
    id: 'protect',
    name: 'Protect PDF',
    description: 'Encrypt PDFs with passwords',
    icon: Lock,
    color: '#dc2626',
    category: 'security',
    accept: ['application/pdf'],
  },
  {
    id: 'unlock',
    name: 'Unlock PDF',
    description: 'Remove passwords and restrictions',
    icon: Unlock,
    color: '#ea580c',
    category: 'security',
    accept: ['application/pdf'],
  },
  {
    id: 'redact',
    name: 'Redact PDF',
    description: 'Permanently remove sensitive content',
    icon: Eraser,
    color: '#991b1b',
    category: 'security',
    accept: ['application/pdf'],
  },
  // Edit
  {
    id: 'edit',
    name: 'Edit PDF',
    description: 'Add text, images, shapes and annotations',
    icon: PenLine,
    color: '#db2777',
    category: 'edit',
    badge: 'popular',
    accept: ['application/pdf'],
  },
  {
    id: 'watermark',
    name: 'Watermark PDF',
    description: 'Add text or image watermarks with full control',
    icon: Stamp,
    color: '#be185d',
    category: 'edit',
    accept: ['application/pdf'],
  },
  {
    id: 'sign',
    name: 'Sign PDF',
    description: 'Sign documents or request e-signatures',
    icon: FileSignature,
    color: '#9d174d',
    category: 'edit',
    badge: 'popular',
    accept: ['application/pdf'],
  },
  // Intelligence
  {
    id: 'ocr',
    name: 'OCR PDF',
    description: 'Make scanned PDFs searchable with AI',
    icon: ScanSearch,
    color: '#0e7490',
    category: 'intelligence',
    badge: 'ai',
    accept: ['application/pdf'],
  },
  {
    id: 'compare',
    name: 'Compare PDF',
    description: 'Side-by-side diff to spot changes instantly',
    icon: GitCompare,
    color: '#155e75',
    category: 'intelligence',
    accept: ['application/pdf'],
  },
  {
    id: 'summarize',
    name: 'AI Summarizer',
    description: 'Get instant AI summaries and key insights',
    icon: Sparkles,
    color: '#164e63',
    category: 'intelligence',
    badge: 'ai',
    accept: ['application/pdf'],
  },
]
