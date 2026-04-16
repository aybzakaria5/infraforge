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

const borderColor: Record<string, string> = {
  success: 'border-accent-primary/40',
  running: 'border-accent-info',
  failed: 'border-accent-danger',
  pending: 'border-border-default',
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
  const border = borderColor[data.status] || borderColor.pending
  const pulseRing = data.status === 'running' ? 'shadow-[0_0_0_2px_rgba(59,130,246,0.25)]' : ''

  return (
    <div
      className={`relative w-[180px] rounded-md border bg-bg-tertiary px-3 py-2
        hover:border-border-hover transition-colors duration-150 cursor-pointer ${border} ${pulseRing}`}
    >
      <Handle type="target" position={Position.Left} className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />
      <Handle type="source" position={Position.Right} className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />

      {/* Header */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Icon size={12} className="text-text-tertiary" />
          <span className="text-[11px] font-medium text-text-secondary uppercase tracking-wide">{data.label}</span>
        </div>
        <StatusIcon size={12} className={statusIconColor[data.status]} />
      </div>

      {/* Content */}
      {children}

      {/* Duration footer */}
      <div className="mt-1.5 pt-1 border-t border-border-default flex items-center gap-1 text-[10px] text-text-tertiary">
        <Clock size={9} />
        <span className="font-mono">{formatDur(data.duration_sec)}</span>
      </div>
    </div>
  )
}

export function GitNode({ data }: NodeProps) {
  const d = data as unknown as GitNodeData
  return (
    <NodeShell data={d} icon={GitCommit}>
      <div className="font-mono text-[12px] text-accent-info">{d.commit_sha}</div>
      <div className="text-[10px] text-text-tertiary truncate mt-0.5">{d.message}</div>
      <div className="text-[10px] text-text-tertiary mt-0.5">{d.author}</div>
    </NodeShell>
  )
}

export function BuildNode({ data }: NodeProps) {
  const d = data as unknown as BuildNodeData
  return (
    <NodeShell data={d} icon={Hammer}>
      <div className="text-[11px] text-text-secondary">Image built</div>
      <div className="font-mono text-[11px] text-text-tertiary mt-0.5">{d.image_size}</div>
    </NodeShell>
  )
}

export function ScanNode({ data }: NodeProps) {
  const d = data as unknown as ScanNodeData
  const total = d.critical + d.high + d.medium
  const badgeColor = d.critical > 0
    ? 'text-accent-danger bg-accent-danger/10'
    : d.high > 0
      ? 'text-accent-warning bg-accent-warning/10'
      : 'text-accent-primary bg-accent-primary/10'

  return (
    <NodeShell data={d} icon={ShieldCheck}>
      <div className="flex items-center gap-1.5">
        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${badgeColor}`}>
          {total} issue{total !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex gap-2 mt-1 text-[10px] font-mono">
        {d.critical > 0 && <span className="text-accent-danger">C:{d.critical}</span>}
        {d.high > 0 && <span className="text-accent-warning">H:{d.high}</span>}
        {d.medium > 0 && <span className="text-text-tertiary">M:{d.medium}</span>}
        {total === 0 && <span className="text-accent-primary">Clean</span>}
      </div>
    </NodeShell>
  )
}

export function PushNode({ data }: NodeProps) {
  const d = data as unknown as PushNodeData
  return (
    <NodeShell data={d} icon={Upload}>
      <div className="font-mono text-[11px] text-text-primary truncate">{d.image_tag}</div>
      <div className="font-mono text-[10px] text-text-tertiary truncate mt-0.5">
        {d.registry.length > 30 ? d.registry.slice(0, 28) + '...' : d.registry}
      </div>
    </NodeShell>
  )
}

export function DeployNode({ data }: NodeProps) {
  const d = data as unknown as DeployNodeData
  return (
    <NodeShell data={d} icon={Rocket}>
      <div className="font-mono text-[11px] text-text-primary">{d.environment}</div>
      <div className="flex items-center gap-1 mt-0.5">
        <span className="text-[10px] text-text-tertiary">{d.strategy}</span>
      </div>
    </NodeShell>
  )
}

export function VerifyNode({ data }: NodeProps) {
  const d = data as unknown as VerifyNodeData
  const healthColor = d.health_status === 'pass'
    ? 'text-accent-primary'
    : d.health_status === 'fail'
      ? 'text-accent-danger'
      : 'text-text-tertiary'

  return (
    <NodeShell data={d} icon={HeartPulse}>
      <div className={`text-[11px] font-medium ${healthColor}`}>
        {d.health_status === 'pass' ? 'Healthy' : d.health_status === 'fail' ? 'Failed' : 'Pending'}
      </div>
      {d.response_time_ms > 0 && (
        <div className="font-mono text-[10px] text-text-tertiary mt-0.5">{d.response_time_ms}ms</div>
      )}
      <div className="font-mono text-[10px] text-text-tertiary truncate mt-0.5">{d.endpoint}</div>
    </NodeShell>
  )
}
