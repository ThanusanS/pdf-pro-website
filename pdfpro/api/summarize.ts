/**
 * Vercel Serverless Function: /api/summarize
 * 
 * Uses OpenAI GPT-4o to summarize PDF content.
 * Set OPENAI_API_KEY in your Vercel environment variables.
 * 
 * Client sends: { text: string (extracted PDF text, max 15k chars) }
 * Server returns: { summary, keyPoints, wordCount }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { text } = req.body as { text: string }

  if (!text || text.trim().length < 100) {
    return res.status(400).json({ error: 'Text too short to summarize' })
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'AI service not configured' })
  }

  // Truncate to ~15k chars (~4k tokens) to stay within limits
  const truncated = text.slice(0, 15000)

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a helpful document summarizer. Respond ONLY with a JSON object (no markdown) with these fields:
{
  "summary": "2-3 paragraph executive summary",
  "keyPoints": ["point 1", "point 2", "point 3", "point 4", "point 5"],
  "tone": "formal|informal|technical|academic",
  "wordCount": <approximate word count of original>
}`,
          },
          {
            role: 'user',
            content: `Please summarize this document:\n\n${truncated}`,
          },
        ],
        max_tokens: 800,
        temperature: 0.3,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content ?? '{}'

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      // Fallback: extract JSON from markdown code block
      const match = content.match(/```json\n([\s\S]+?)\n```/)
      parsed = match ? JSON.parse(match[1]) : { summary: content, keyPoints: [] }
    }

    return res.status(200).json(parsed)

  } catch (error: any) {
    return res.status(500).json({ error: 'Summarization failed', details: error.message })
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
}
