import type { Reel } from '@/types/reel'
import Image from 'next/image'

interface ReelCardProps {
  reel: Reel
  index: number
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function fmtDate(isoDate: string): string {
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  const diff = Date.now() - new Date(isoDate).getTime()
  const days = Math.floor(diff / 86_400_000)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  if (months > 0) return rtf.format(-months, 'month')
  if (weeks > 0) return rtf.format(-weeks, 'week')
  if (days > 0) return rtf.format(-days, 'day')
  return 'today'
}

export default function ReelCard({ reel, index }: ReelCardProps) {
  return (
    <div
      className="card-enter flex flex-col rounded-lg overflow-hidden"
      style={{
        animationDelay: `${index * 50}ms`,
        background: '#111115',
        border: '1px solid #222229',
      }}
    >
      {/* ── Thumbnail ── */}
      <a
        href={reel.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block shrink-0 overflow-hidden"
        style={{ aspectRatio: '2/3' }}
      >
        <Image
          src={reel.thumbnail}
          alt={reel.caption || `Reel ${index + 1}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          unoptimized
        />

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ background: 'rgba(0,0,0,0.35)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(202,255,0,0.9)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#09090B" style={{ marginLeft: '3px' }}>
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Index */}
        <div
          className="absolute top-2 left-2 font-mono"
          style={{
            fontSize: '10px',
            color: 'rgba(255,255,255,0.35)',
            background: 'rgba(0,0,0,0.5)',
            padding: '3px 7px',
            borderRadius: '4px',
          }}
        >
          {String(index + 1).padStart(2, '0')}
        </div>

        {/* Facebook badge */}
        {reel.crossPostedToFacebook && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 font-mono font-bold"
            style={{
              background: '#1877F2',
              color: '#fff',
              fontSize: '9px',
              padding: '3px 7px',
              borderRadius: '4px',
              letterSpacing: '0.05em',
            }}
          >
            <svg width="8" height="8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
            </svg>
            FB
          </div>
        )}
      </a>

      {/* ── Info panel ── */}
      <div className="flex flex-col gap-3 p-4" style={{ borderTop: '1px solid #1a1a20' }}>

        {/* Views — primary metric */}
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="font-mono font-bold" style={{ fontSize: '28px', lineHeight: 1, color: '#CAFF00' }}>
              {fmt(reel.views)}
            </div>
            <div className="font-mono mt-0.5" style={{ fontSize: '10px', color: '#3A3A45', letterSpacing: '0.1em' }}>
              VIEWS
            </div>
          </div>
          <div className="text-right" style={{ color: '#3A3A45', fontSize: '11px', fontFamily: 'var(--font-space-mono)' }}>
            {fmtDate(reel.publishedAt)}
          </div>
        </div>

        {/* Likes + Comments */}
        <div className="flex items-center gap-4" style={{ borderTop: '1px solid #1a1a20', paddingTop: '12px' }}>
          <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: '#6B6B78' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ color: '#FF6B8A' }}>
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
            </svg>
            {fmt(reel.likes)}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-xs" style={{ color: '#6B6B78' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            {fmt(reel.comments)}
          </span>

          {/* Facebook link */}
          {reel.facebookUrl && (
            <a
              href={reel.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 font-mono text-xs hover:underline"
              style={{ color: '#1877F2', fontSize: '10px' }}
            >
              <svg width="9" height="9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
              </svg>
              Facebook
            </a>
          )}
        </div>

        {/* Caption — full text, no truncation */}
        {reel.caption && (
          <p
            className="leading-relaxed"
            style={{
              fontSize: '12px',
              color: '#6B6B78',
              borderTop: '1px solid #1a1a20',
              paddingTop: '12px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {reel.caption}
          </p>
        )}
      </div>
    </div>
  )
}
