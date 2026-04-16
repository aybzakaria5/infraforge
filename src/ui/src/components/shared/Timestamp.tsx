import { useState } from 'react'
import { relativeTime } from '../../lib/time'

/** Renders relative time with a hover tooltip showing the full ISO datetime. */
export function Timestamp({ iso, className = '' }: { iso: string; className?: string }) {
  const [show, setShow] = useState(false)
  const full = new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <span
      className={`relative inline-flex cursor-default ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {relativeTime(iso)}
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded
          bg-bg-tertiary border border-border-default text-[10px] font-mono text-text-secondary
          whitespace-nowrap z-50 shadow-md pointer-events-none">
          {full}
        </span>
      )}
    </span>
  )
}
