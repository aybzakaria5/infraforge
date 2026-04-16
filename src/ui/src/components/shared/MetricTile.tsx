interface MetricTileProps {
  label: string
  value: string | number
  suffix?: string
  trend?: 'up' | 'down' | 'flat'
}

export function MetricTile({ label, value, suffix }: MetricTileProps) {
  return (
    <div className="flex flex-col gap-1 px-3 py-2 rounded-md border border-border-default bg-bg-secondary">
      <span className="text-[11px] text-text-tertiary uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-medium font-mono text-text-primary">{value}</span>
        {suffix && <span className="text-[11px] text-text-tertiary">{suffix}</span>}
      </div>
    </div>
  )
}
