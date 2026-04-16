const colors: Record<string, string> = {
  running: 'bg-accent-primary',
  success: 'bg-accent-primary',
  healthy: 'bg-accent-primary',
  deploying: 'bg-accent-info',
  pending: 'bg-accent-info',
  provisioning: 'bg-accent-info',
  warning: 'bg-accent-warning',
  failed: 'bg-accent-danger',
  error: 'bg-accent-danger',
  destroying: 'bg-accent-warning',
  destroyed: 'bg-text-tertiary',
  rollback: 'bg-accent-danger',
}

interface StatusDotProps {
  status: string
  size?: number
  pulse?: boolean
}

export function StatusDot({ status, size = 6, pulse = false }: StatusDotProps) {
  const color = colors[status] || 'bg-text-tertiary'
  const shouldPulse = pulse || status === 'deploying' || status === 'running' || status === 'provisioning'

  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {shouldPulse && (
        <span
          className={`absolute inset-0 rounded-full ${color} opacity-40 animate-ping`}
          style={{ animationDuration: '2s' }}
        />
      )}
      <span className={`relative inline-block w-full h-full rounded-full ${color}`} />
    </span>
  )
}
