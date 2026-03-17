import React from 'react'
import { Routes, Route, useParams } from 'react-router-dom'
import { ThemeContext, useThemeState } from './hooks/useTheme'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import ToolsPage from './pages/ToolsPage'
import BlogPage from './pages/BlogPage'

// Fully-implemented browser tools
import MergeTool        from './pages/tools/MergeTool'
import SplitTool        from './pages/tools/SplitTool'
import CompressTool     from './pages/tools/CompressTool'
import RotateTool       from './pages/tools/RotateTool'
import WatermarkTool    from './pages/tools/WatermarkTool'
import PageNumbersTool  from './pages/tools/PageNumbersTool'
import CropTool         from './pages/tools/CropTool'
import SignTool         from './pages/tools/SignTool'
import ProtectTool      from './pages/tools/ProtectTool'
import UnlockTool       from './pages/tools/UnlockTool'
import RedactTool       from './pages/tools/RedactTool'
import EditTool         from './pages/tools/EditTool'
import OCRTool          from './pages/tools/OCRTool'
import CompareTool      from './pages/tools/CompareTool'
import SummarizeTool    from './pages/tools/SummarizeTool'
import RepairTool       from './pages/tools/RepairTool'
import ScanToPdfTool    from './pages/tools/ScanToPdfTool'
import ImagesToPdfTool  from './pages/tools/ImagesToPdfTool'
import PDFToJpgTool     from './pages/tools/PDFToJpgTool'

// Server-assisted conversion tool (graceful fallback built in)
import ConversionTool   from './pages/tools/ConversionTool'

// Direct component map — no more GenericToolPage fallback
const TOOL_MAP: Record<string, React.FC> = {
  // Organize
  merge:           MergeTool,
  split:           SplitTool,
  rotate:          RotateTool,
  'page-numbers':  PageNumbersTool,
  crop:            CropTool,
  // Convert from PDF (server-assisted)
  'pdf-to-word':   () => <ConversionTool toolId="pdf-to-word" />,
  'pdf-to-excel':  () => <ConversionTool toolId="pdf-to-excel" />,
  'pdf-to-ppt':    () => <ConversionTool toolId="pdf-to-ppt" />,
  'pdf-to-jpg':    PDFToJpgTool,
  'pdf-to-html':   () => <ConversionTool toolId="pdf-to-html" />,
  'pdf-to-pdfa':   () => <ConversionTool toolId="pdf-to-pdfa" />,
  // Convert to PDF
  'word-to-pdf':   () => <ConversionTool toolId="word-to-pdf" />,
  'excel-to-pdf':  () => <ConversionTool toolId="excel-to-pdf" />,
  'ppt-to-pdf':    () => <ConversionTool toolId="ppt-to-pdf" />,
  'jpg-to-pdf':    ImagesToPdfTool,
  'html-to-pdf':   () => <ConversionTool toolId="html-to-pdf" />,
  'scan-to-pdf':   ScanToPdfTool,
  // Optimize
  compress:        CompressTool,
  repair:          RepairTool,
  // Security
  protect:         ProtectTool,
  unlock:          UnlockTool,
  redact:          RedactTool,
  // Edit
  edit:            EditTool,
  watermark:       WatermarkTool,
  sign:            SignTool,
  // Intelligence
  ocr:             OCRTool,
  compare:         CompareTool,
  summarize:       SummarizeTool,
}

function ToolRouter() {
  const { toolId } = useParams<{ toolId: string }>()
  const Component = toolId ? TOOL_MAP[toolId] : null

  if (!Component) {
    return (
      <div className="pt-32 text-center px-4">
        <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100 mb-4">
          Tool not found
        </h1>
        <a href="/tools" className="text-brand-500 hover:underline">Browse all tools</a>
      </div>
    )
  }

  return <Component />
}

export default function App() {
  const themeState = useThemeState()

  return (
    <ThemeContext.Provider value={themeState}>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"               element={<HomePage />} />
            <Route path="/tools"          element={<ToolsPage />} />
            <Route path="/tools/:toolId"  element={<ToolRouter />} />
            <Route path="/blog"           element={<BlogPage />} />
            <Route path="/blog/:slug"     element={<BlogPage />} />
            <Route path="*" element={
              <div className="pt-32 text-center px-4">
                <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-4">
                  Page Not Found
                </h1>
                <a href="/" className="text-brand-500 hover:underline">Go Home</a>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </ThemeContext.Provider>
  )
}
