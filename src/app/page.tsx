'use client'

import { useState } from 'react'
import type { Reel } from '@/types/reel'
import SearchForm from '@/components/SearchForm'
import ReelsGrid from '@/components/ReelsGrid'
import ErrorMessage from '@/components/ErrorMessage'

export default function Home() {
  const [reels, setReels] = useState<Reel[]>([])
  const [currentUsername, setCurrentUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  async function handleSearch(username: string) {
    setLoading(true)
    setError(null)
    setReels([])
    setSearched(false)

    try {
      const res = await fetch(`/api/reels?username=${encodeURIComponent(username)}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Something went wrong.')
      } else {
        setReels(json.reels ?? [])
        setCurrentUsername(username)
        setSearched(true)
      }
    } catch {
      setError('Network error. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setReels([])
    setCurrentUsername('')
    setError(null)
    setSearched(false)
    setLoading(false)
  }

  const hasResults = searched && !loading

  return (
    <div className="min-h-screen flex flex-col" style={{ color: '#F4F4F0' }}>

      {/* ── Sticky header (only after first search) ── */}
      {(hasResults || loading) && (
        <header
          className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 gap-4"
          style={{
            background: 'rgba(9,9,11,0.90)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #222229',
          }}
        >
          {/* Logo → back to home */}
          <button
            onClick={handleReset}
            className="font-display font-bold text-base tracking-wider shrink-0 transition-opacity hover:opacity-70"
            style={{ color: '#CAFF00' }}
          >
            VIEW<span style={{ color: '#F4F4F0' }}>X</span>
          </button>

          <SearchForm onSearch={handleSearch} isLoading={loading} compact />
        </header>
      )}

      {/* ── Hero (before first search) ── */}
      {!hasResults && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
          <h1
            className="font-display font-black tracking-tighter leading-none select-none"
            style={{ fontSize: 'clamp(72px, 14vw, 160px)', color: '#F4F4F0', letterSpacing: '-0.04em' }}
          >
            VIEW<span style={{ color: '#CAFF00' }}>X</span>
          </h1>
          <p
            className="font-mono mb-12 tracking-widest uppercase"
            style={{ fontSize: '11px', color: '#3A3A45', letterSpacing: '0.25em' }}
          >
            Instagram Reels Intelligence
          </p>

          <SearchForm onSearch={handleSearch} isLoading={loading} />

          <p className="mt-4 font-mono" style={{ fontSize: '11px', color: '#3A3A45' }}>
            Enter any public Instagram username
          </p>

          {error && (
            <div className="mt-6">
              <ErrorMessage message={error} />
            </div>
          )}
        </div>
      )}

      {/* ── Results ── */}
      {(hasResults || loading) && (
        <main className="flex-1 px-4 sm:px-6 pb-16 pt-8">
          {error && !loading && (
            <div className="mb-6 flex justify-center">
              <ErrorMessage message={error} />
            </div>
          )}

          {loading && (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden" style={{ border: '1px solid #222229' }}>
                  <div className="skeleton w-full" style={{ aspectRatio: '9/16' }} />
                  <div className="p-4 flex flex-col gap-3" style={{ background: '#111115' }}>
                    <div className="skeleton h-5 w-24 rounded" />
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && searched && (
            <ReelsGrid reels={reels} username={currentUsername} />
          )}
        </main>
      )}

      {!hasResults && !loading && (
        <footer className="py-6 text-center font-mono" style={{ fontSize: '10px', color: '#3A3A45' }}>
          VIEWX · REELS ANALYTICS
        </footer>
      )}
    </div>
  )
}
