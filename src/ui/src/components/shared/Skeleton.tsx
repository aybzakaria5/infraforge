/** Shimmer skeleton for loading states. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-bg-tertiary ${className}`}
    />
  )
}

/** Table row skeleton — renders n placeholder rows with c cells each. */
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} className="border-b border-border-default last:border-0">
          {Array.from({ length: cols }, (_, c) => (
            <td key={c} className="px-3 py-2">
              <Skeleton className="h-3 w-full max-w-[120px]" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

/** Metric tile skeleton. */
export function MetricSkeleton() {
  return (
    <div className="flex flex-col gap-2 px-3 py-2 rounded-md border border-border-default bg-bg-secondary">
      <Skeleton className="h-2.5 w-16" />
      <Skeleton className="h-5 w-12" />
    </div>
  )
}

/** Chart area skeleton. */
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="rounded-md border border-border-default bg-bg-secondary flex items-center justify-center"
      style={{ height }}
    >
      <span className="text-[11px] text-text-tertiary animate-pulse">Loading chart...</span>
    </div>
  )
}
