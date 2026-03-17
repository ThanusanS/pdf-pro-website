import React from 'react'
import clsx from 'clsx'

interface AdBannerProps {
  slot: string
  format?: 'horizontal' | 'rectangle' | 'vertical'
  className?: string
}

/**
 * Google AdSense banner — non-intrusive placement.
 * Replace YOUR_ADSENSE_ID and slot IDs after approval.
 * 
 * Strategy:
 * - horizontal: Below hero / between sections (728x90)
 * - rectangle: Sidebar or after tool usage (300x250)
 * - vertical: Right sidebar (160x600)
 */
export default function AdBanner({ slot, format = 'horizontal', className }: AdBannerProps) {
  const sizes = {
    horizontal: { w: 728, h: 90, label: '728×90 Leaderboard' },
    rectangle: { w: 300, h: 250, label: '300×250 Medium Rectangle' },
    vertical: { w: 160, h: 600, label: '160×600 Wide Skyscraper' },
  }

  const size = sizes[format]

  // In production, render the real AdSense code.
  // The placeholder below shows the ad zone during development.
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className="rounded-lg border border-dashed border-ink-200 dark:border-ink-700 bg-ink-50/50 dark:bg-ink-900/30 flex flex-col items-center justify-center text-ink-400 text-xs gap-1"
        style={{ width: size.w, maxWidth: '100%', height: size.h }}
      >
        <span className="font-mono">Ad</span>
        <span>{size.label}</span>
        {/* Real AdSense code (uncomment after approval):
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        */}
      </div>
    </div>
  )
}
