const MINUTE = 60_000
const HOUR = 3_600_000
const DAY = 86_400_000

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()

  if (diff < MINUTE) return 'just now'
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`
  if (diff < DAY * 2) return 'yesterday'
  return `${Math.floor(diff / DAY)}d ago`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}
