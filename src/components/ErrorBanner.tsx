interface Props {
  message: string
  onDismiss: () => void
  onRetry?: () => void
}

export function ErrorBanner({ message, onDismiss, onRetry }: Props) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-lg border border-red-900/60 bg-red-950/50 px-4 py-3 text-sm text-red-200"
    >
      <span>{message}</span>
      <span className="flex shrink-0 gap-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-md border border-red-800 px-2.5 py-1 text-xs font-medium text-red-100 transition-colors hover:bg-red-900/60"
          >
            Retry
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="rounded-md border border-red-800 px-2.5 py-1 text-xs font-medium text-red-100 transition-colors hover:bg-red-900/60"
        >
          Dismiss
        </button>
      </span>
    </div>
  )
}
