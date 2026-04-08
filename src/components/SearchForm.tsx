'use client'

interface SearchFormProps {
  onSearch: (username: string) => void
  isLoading: boolean
  compact?: boolean
}

export default function SearchForm({ onSearch, isLoading, compact }: SearchFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const input = e.currentTarget.elements.namedItem('username') as HTMLInputElement
    const value = input.value.trim().replace(/^@/, '')
    if (value) onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${compact ? 'max-w-lg' : 'max-w-2xl'}`}>
      <div
        className="search-input flex items-center gap-0 rounded-lg border border-border bg-surface transition-all duration-300"
        style={{ borderColor: '#222229' }}
      >
        {/* @ prefix */}
        <span
          className="pl-5 pr-2 font-mono text-accent select-none shrink-0"
          style={{ fontSize: compact ? '14px' : '18px' }}
        >
          @
        </span>

        <input
          type="text"
          name="username"
          placeholder="username"
          autoComplete="off"
          spellCheck={false}
          disabled={isLoading}
          className="flex-1 bg-transparent text-textBase placeholder-dim outline-none font-body disabled:opacity-50"
          style={{
            fontSize:  compact ? '14px' : '18px',
            padding:   compact ? '12px 0' : '18px 0',
            color:     '#F4F4F0',
          }}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="shrink-0 m-1.5 font-display font-bold tracking-widest uppercase transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:   isLoading ? 'transparent' : '#CAFF00',
            color:        isLoading ? '#6B6B78'     : '#09090B',
            border:       isLoading ? '1px solid #33333D' : 'none',
            borderRadius: '6px',
            padding:      compact ? '8px 18px' : '12px 28px',
            fontSize:     compact ? '11px' : '12px',
            letterSpacing: '0.12em',
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span>Loading</span>
            </span>
          ) : (
            'Analyze'
          )}
        </button>
      </div>
    </form>
  )
}
