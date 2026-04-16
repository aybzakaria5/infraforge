import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <AlertTriangle size={20} className="text-accent-danger" />
      <span className="text-[13px] text-text-secondary">{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 mt-1 px-2.5 h-7 rounded-md border border-border-default
            text-[12px] text-text-secondary hover:bg-bg-tertiary transition-colors"
        >
          <RefreshCw size={12} />
          Retry
        </button>
      )}
    </div>
  )
}
