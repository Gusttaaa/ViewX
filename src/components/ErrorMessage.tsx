interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg px-4 py-3 font-mono text-sm max-w-xl w-full"
      style={{
        background: 'rgba(255, 71, 87, 0.08)',
        border: '1px solid rgba(255, 71, 87, 0.2)',
        color: '#FF6B6B',
      }}
    >
      <span className="shrink-0 mt-0.5">⚠</span>
      <span>{message}</span>
    </div>
  )
}
