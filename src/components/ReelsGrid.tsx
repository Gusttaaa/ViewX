import type { Reel } from '@/types/reel'
import ReelCard from './ReelCard'

interface ReelsGridProps {
  reels: Reel[]
  username: string
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

export default function ReelsGrid({ reels, username }: ReelsGridProps) {
  if (reels.length === 0) {
    return (
      <div className="text-center py-20 font-mono" style={{ color: '#3A3A45' }}>
        @{username} has no Reels.
      </div>
    )
  }

  const totalViews = reels.reduce((acc, r) => acc + r.views, 0)
  const avgViews   = Math.round(totalViews / reels.length)
  const fbCount    = reels.filter((r) => r.crossPostedToFacebook).length
  const topReel    = [...reels].sort((a, b) => b.views - a.views)[0]

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* ── Summary bar ── */}
      <div
        className="flex flex-wrap items-start gap-x-8 gap-y-4 mb-8 pb-6"
        style={{ borderBottom: '1px solid #222229' }}
      >
        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#3A3A45', letterSpacing: '0.12em' }}>ACCOUNT</div>
          <div className="font-display font-bold text-xl" style={{ color: '#F4F4F0' }}>@{username}</div>
        </div>

        <div className="w-px hidden sm:block self-stretch" style={{ background: '#222229' }} />

        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#3A3A45', letterSpacing: '0.12em' }}>REELS ANALYZED</div>
          <div className="font-mono font-bold text-xl" style={{ color: '#CAFF00' }}>{reels.length}</div>
        </div>

        <div className="w-px hidden sm:block self-stretch" style={{ background: '#222229' }} />

        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#3A3A45', letterSpacing: '0.12em' }}>AVG VIEWS</div>
          <div className="font-mono font-bold text-xl" style={{ color: '#CAFF00' }}>{fmt(avgViews)}</div>
        </div>

        <div className="w-px hidden sm:block self-stretch" style={{ background: '#222229' }} />

        <div>
          <div className="font-mono text-xs mb-1" style={{ color: '#3A3A45', letterSpacing: '0.12em' }}>TOP REEL</div>
          <a
            href={topReel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono font-bold text-xl hover:underline"
            style={{ color: '#CAFF00' }}
          >
            {fmt(topReel.views)} views
          </a>
        </div>

        {fbCount > 0 && (
          <>
            <div className="w-px hidden sm:block self-stretch" style={{ background: '#222229' }} />
            <div>
              <div className="font-mono text-xs mb-1" style={{ color: '#3A3A45', letterSpacing: '0.12em' }}>ON FACEBOOK</div>
              <div className="font-mono font-bold text-xl" style={{ color: '#1877F2' }}>{fbCount} reels</div>
            </div>
          </>
        )}
      </div>

      {/* ── Grid: 3 columns on desktop, 2 on tablet, 1 on mobile ── */}
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'start' }}
      >
        {reels.map((reel, i) => (
          <ReelCard key={reel.id} reel={reel} index={i} />
        ))}
      </div>
    </div>
  )
}
