import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  GitCommit,
  Hammer,
  ShieldCheck,
  Upload,
  Rocket,
  HeartPulse,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import type {
  GitNodeData,
  BuildNodeData,
  ScanNodeData,
  PushNodeData,
  DeployNodeData,
  VerifyNodeData,
  PipelineNodeData,
} from '../../../mocks/pipeline'

function formatDur(sec: number): string {
  if (sec <= 0) return '—'
  if (sec < 60) return `${sec.toFixed(1)}s`
  return `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`
}

const leftBorderColor: Record<string, string> = {
  success: 'var(--color-accent-primary)',
  running: 'var(--color-accent-info)',
  failed: 'var(--color-accent-danger)',
  pending: 'var(--color-border-default)',
}

const statusIcon: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  running: Loader2,
  failed: AlertCircle,
  pending: Clock,
}

const statusIconColor: Record<string, string> = {
  success: 'text-accent-primary',
  running: 'text-accent-info animate-spin',
  failed: 'text-accent-danger',
  pending: 'text-text-tertiary',
}

const handleClass = '!w-1.5 !h-1.5 !bg-border-hover !border-0'

function NodeShell({
  data,
  icon: Icon,
  children,
}: {
  data: PipelineNodeData
  icon: typeof GitCommit
  children: React.ReactNode
}) {
  const StatusIcon = statusIcon[data.status] || Clock
  const borderLeft = leftBorderColor[data.status] || leftBorderColor.pending
  const failedShadow = data.status === 'failed' ? 'shadow-[0_0_8px_rgba(239,68,68,0.15)]' : ''

  return (
    <div
      className={`relative w-[170px] rounded-[6px] border border-border-default bg-bg-tertiary
        pl-0 pr-2.5 py-1.5 transition-all duration-150 cursor-pointer ${failedShadow}`}
      style={{ borderLeftWidth: 2, borderLeftColor: borderLeft }}
    >
      <Handle type="target" position={Position.Left} className={handleClass} />
      <Handle type="source" position={Position.Right} className={handleClass} />

      {/* Header */}
      <div className="flex items-center justify-between mb-1 pl-2">
        <div className="flex items-center gap-1">
          <Icon size={10} className="text-text-tertiary" />
          <span className="text-[9px] font-medium text-text-tertiary uppercase tracking-wide">{data.label}</span>
        </div>
        <StatusIcon size={10} className={statusIconColor[data.status]} />
      </div>

      {/* Content */}
      <div className="pl-2">{children}</div>

      {/* Duration footer */}
      <div className="mt-1 pt-1 pl-2 border-t border-border-default flex items-center gap-1 text-[9px] text-text-tertiary">
        <Clock size={8} />
        <span className="font-mono">{formatDur(data.duration_sec)}</span>
      </div>
    </div>
  )
}

export const GitNode = memo(function GitNode({ data }: NodeProps) {
  const d = data as unknown as GitNodeData
  return (
    <NodeShell data={d} icon={GitCommit}>
      <div className="font-mono text-[11px] text-accent-info leading-tight">{d.commit_sha}</div>
      <div className="text-[9px] text-text-tertiary truncate mt-0.5">{d.message}</div>
    </NodeShell>
  )
})

export const BuildNode = memo(function BuildNode({ data }: NodeProps) {
  const d = data as unknown as BuildNodeData
  return (
    <NodeShell data={d} icon={Hammer}>
      <div className="text-[10px] text-text-secondary leading-tight">Image built</div>
      <div className="font-mono text-[10px] text-text-tertiary mt-0.5">{d.image_size}</div>
    </NodeShell>
  )
})

export const ScanNode = memo(function ScanNode({ data }: NodeProps) {
  const d = data as unknown as ScanNodeData
  const total = d.critical + d.high + d.medium
  const badgeColor = d.critical > 0
    ? 'text-accent-danger bg-accent-danger/10'
    : d.high > 0
      ? 'text-accent-warning bg-accent-warning/10'
      : 'text-accent-primary bg-accent-primary/10'

  return (
    <NodeShell data={d} icon={ShieldCheck}>
      <span className={`inline-flex px-1 py-0.5 rounded text-[9px] font-medium ${badgeColor}`}>
        {total} issue{total !== 1 ? 's' : ''}
      </span>
      <div className="flex gap-1.5 mt-0.5 text-[9px] font-mono">
        {d.critical > 0 && <span className="text-accent-danger">C:{d.critical}</span>}
        {d.high > 0 && <span className="text-accent-warning">H:{d.high}</span>}
        {d.medium > 0 && <span className="text-text-tertiary">M:{d.medium}</span>}
        {total === 0 && <span className="text-accent-primary">Clean</span>}
      </div>
    </NodeShell>
  )
})

export const PushNode = memo(function PushNode({ data }: NodeProps) {
  const d = data as unknown as PushNodeData
  return (
    <NodeShell data={d} icon={Upload}>
      <div className="font-mono text-[10px] text-text-primary truncate leading-tight">{d.image_tag}</div>
      <div className="font-mono text-[9px] text-text-tertiary truncate mt-0.5">
        {d.registry.length > 28 ? d.registry.slice(0, 26) + '...' : d.registry}
      </div>
    </NodeShell>
  )
})

export const DeployNode = memo(function DeployNode({ data }: NodeProps) {
  const d = data as unknown as DeployNodeData
  return (
    <NodeShell data={d} icon={Rocket}>
      <div className="font-mono text-[10px] text-text-primary leading-tight">{d.environment}</div>
      <span className="text-[9px] text-text-tertiary">{d.strategy}</span>
    </NodeShell>
  )
})

export const VerifyNode = memo(function VerifyNode({ data }: NodeProps) {
  const d = data as unknown as VerifyNodeData
  const healthColor = d.health_status === 'pass'
    ? 'text-accent-primary'
    : d.health_status === 'fail'
      ? 'text-accent-danger'
      : 'text-text-tertiary'

  return (
    <NodeShell data={d} icon={HeartPulse}>
      <div className={`text-[10px] font-medium ${healthColor}`}>
        {d.health_status === 'pass' ? 'Healthy' : d.health_status === 'fail' ? 'Failed' : 'Pending'}
      </div>
      {d.response_time_ms > 0 && (
        <div className="font-mono text-[9px] text-text-tertiary mt-0.5">{d.response_time_ms}ms</div>
      )}
    </NodeShell>
  )
})
