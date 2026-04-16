import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface MicroserviceNodeData {
  label: string
  health: 'healthy' | 'degraded' | 'down'
  reqRate: string
  [key: string]: unknown
}

const healthColor: Record<string, string> = {
  healthy: 'var(--color-accent-primary)',
  degraded: 'var(--color-accent-warning)',
  down: 'var(--color-accent-danger)',
}

const handleClass = '!w-1.5 !h-1.5 !bg-border-hover !border-0'

export const MicroserviceNode = memo(function MicroserviceNode({ data }: NodeProps) {
  const d = data as MicroserviceNodeData
  const dotColor = healthColor[d.health] || healthColor.healthy

  return (
    <div
      className="px-2.5 py-1.5 rounded-[6px] border border-border-default bg-bg-tertiary
        transition-all duration-150"
      style={{ width: 152 }}
    >
      <Handle type="target" position={Position.Left} className={handleClass} />
      <Handle type="source" position={Position.Right} className={handleClass} />

      <div className="flex items-center gap-1.5">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-[11px] font-mono text-text-primary leading-tight truncate">{d.label}</span>
      </div>
      <div className="mt-0.5 text-[9px] font-mono text-text-tertiary pl-3">{d.reqRate}</div>
    </div>
  )
})
