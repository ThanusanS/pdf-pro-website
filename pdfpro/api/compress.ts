/**
 * Vercel Serverless Function: /api/compress
 * 
 * Uses Ghostscript for high-quality PDF compression.
 * Ghostscript must be installed: apt-get install ghostscript
 * 
 * Quality presets map to Ghostscript's /screen, /ebook, /printer settings.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { exec } from 'child_process'
import { writeFileSync, readFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { promisify } from 'util'

const execAsync = promisify(exec)

const GS_PRESETS: Record<string, string> = {
  low: '/screen',      // 72 DPI — smallest size
  medium: '/ebook',    // 150 DPI — balanced
  high: '/printer',    // 300 DPI — high quality
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { fileBase64, filename, quality = 'medium' } = req.body as {
      fileBase64: string
      filename: string
      quality: 'low' | 'medium' | 'high'
    }

    const buffer = Buffer.from(fileBase64, 'base64')
    const preset = GS_PRESETS[quality] ?? '/ebook'

    const tmpIn = join(tmpdir(), `in-${Date.now()}.pdf`)
    const tmpOut = join(tmpdir(), `out-${Date.now()}.pdf`)
    writeFileSync(tmpIn, buffer)

    const gsCmd = [
      'gs',
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${preset}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      `-sOutputFile="${tmpOut}"`,
      `"${tmpIn}"`,
    ].join(' ')

    await execAsync(gsCmd)

    const compressed = readFileSync(tmpOut)
    unlinkSync(tmpIn)
    unlinkSync(tmpOut)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="compressed-${filename ?? 'file.pdf'}"`)
    res.setHeader('X-Original-Size', buffer.length.toString())
    res.setHeader('X-Compressed-Size', compressed.length.toString())
    return res.send(compressed)

  } catch (error: any) {
    return res.status(500).json({ error: 'Compression failed', details: error.message })
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '30mb' } },
}
