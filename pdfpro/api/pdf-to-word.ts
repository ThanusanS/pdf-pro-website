/**
 * Vercel Serverless Function: /api/pdf-to-word
 * 
 * Uses LibreOffice (installed on the server) to convert PDF → DOCX.
 * Deploy on Vercel with the @vercel/node runtime.
 * 
 * Requirements:
 *   - LibreOffice installed on the server (available on Vercel via custom Docker or Netlify)
 *   - OR use an external conversion API like ConvertAPI, CloudConvert, or ILovePDF API
 * 
 * For simpler cloud setup, swap the exec() block with a fetch() call to ConvertAPI:
 *   https://v2.convertapi.com/convert/pdf/to/docx
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { exec } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // File size limit: 25MB
  const MAX_SIZE = 25 * 1024 * 1024

  try {
    // Expect multipart/form-data with a 'file' field (base64 encoded for simplicity)
    const { fileBase64, filename } = req.body as { fileBase64: string; filename: string }

    if (!fileBase64) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const buffer = Buffer.from(fileBase64, 'base64')

    if (buffer.length > MAX_SIZE) {
      return res.status(413).json({ error: 'File too large. Max 25MB.' })
    }

    // Write PDF to temp dir
    const tmpPdf = join(tmpdir(), `input-${Date.now()}.pdf`)
    const tmpOutDir = tmpdir()
    writeFileSync(tmpPdf, buffer)

    // Convert using LibreOffice
    await execAsync(`libreoffice --headless --convert-to docx "${tmpPdf}" --outdir "${tmpOutDir}"`)

    const outputFile = tmpPdf.replace('.pdf', '.docx')

    if (!existsSync(outputFile)) {
      throw new Error('Conversion failed — output file not found')
    }

    const docxBuffer = readFileSync(outputFile)

    // Cleanup
    unlinkSync(tmpPdf)
    unlinkSync(outputFile)

    // Return the DOCX file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    res.setHeader('Content-Disposition', `attachment; filename="${filename?.replace('.pdf', '.docx') ?? 'converted.docx'}"`)
    res.setHeader('Content-Length', docxBuffer.length)
    return res.send(docxBuffer)

  } catch (error: any) {
    console.error('PDF to Word conversion error:', error)
    return res.status(500).json({ error: 'Conversion failed', details: error.message })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '30mb',
    },
  },
}
