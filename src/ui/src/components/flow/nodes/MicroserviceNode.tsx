import { Handle, Position, type NodeProps } from '@xyflow/react'

export interface MicroserviceNodeData {
  label: string
  health: 'healthy' | 'degraded' | 'down'
  reqRate: string
  [key: string]: unknown
}

const healthColor: Record<string, string> = {
  healthy: '#22c55e',
  degraded: '#eab308',
  down: '#ef4444',
}

export function MicroserviceNode({ data }: NodeProps) {
  const d = data as MicroserviceNodeData
  const dotColor = healthColor[d.health] || healthColor.healthy

  return (
    <div
      className="px-3 py-2 rounded-md border border-border-default bg-bg-tertiary
        hover:border-border-hover transition-colors duration-150"
      style={{ minWidth: 140 }}
    >
      <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />
      <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />

      <div className="flex items-center gap-2">
        <span
          className="inline-block w-[6px] h-[6px] rounded-full shrink-0"
          style={{ backgroundColor: dotColor }}
        />
        <span className="text-[12px] font-mono text-text-primary leading-tight">{d.label}</span>
      </div>
      <div className="mt-1 text-[10px] font-mono text-text-tertiary">{d.reqRate}</div>
    </div>
  )
}
