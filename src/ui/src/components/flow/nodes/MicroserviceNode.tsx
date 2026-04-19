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
      className="flex items-center gap-1.5 rounded-[6px] border border-border-default bg-bg-tertiary
        transition-[border-color,box-shadow] duration-150 cursor-default"
      style={{ width: 160, height: 40, padding: '0 10px' }}
    >
      <Handle type="target" position={Position.Left} className={handleClass} />
      <Handle type="source" position={Position.Right} className={handleClass} />

      <span
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      <span className="text-[11px] font-mono text-text-primary leading-tight truncate">{d.label}</span>
      <span className="text-[10px] font-mono text-text-tertiary ml-auto shrink-0">{d.reqRate}</span>
    </div>
  )
})
