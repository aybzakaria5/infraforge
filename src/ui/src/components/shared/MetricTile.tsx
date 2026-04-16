interface MetricTileProps {
  label: string
  value: string | number
  suffix?: string
  accent?: string
}

export function MetricTile({ label, value, suffix, accent = 'var(--color-accent-primary)' }: MetricTileProps) {
  return (
    <div
      className="flex flex-col gap-1 px-3 py-2 rounded-md border border-border-default bg-bg-secondary
        hover:border-border-hover transition-colors duration-150 relative overflow-hidden"
    >
      {/* Accent top line */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: accent }}
      />
      <span className="text-[11px] text-text-tertiary uppercase tracking-wide">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-medium font-mono text-text-primary">{value}</span>
        {suffix && <span className="text-[11px] text-text-tertiary">{suffix}</span>}
      </div>
    </div>
  )
}
