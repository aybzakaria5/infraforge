import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import {
  Cloud,
  Server,
  Database,
  HardDrive,
  Globe,
  Container,
  Shield,
  Lock,
  Key,
  Network,
  ArrowUpDown,
} from 'lucide-react'
import type { InfraNodeData } from '../../../mocks/topology'

const typeIcon: Record<string, typeof Cloud> = {
  vpc: Cloud,
  subnet: Network,
  eks: Container,
  rds: Database,
  s3: HardDrive,
  alb: ArrowUpDown,
  ecr: Container,
  iam: Shield,
  kms: Key,
  route53: Globe,
  nat: Server,
}

const statusColor: Record<string, string> = {
  healthy: 'var(--color-accent-primary)',
  warning: 'var(--color-accent-warning)',
  error: 'var(--color-accent-danger)',
}

const typeAccent: Record<string, string> = {
  eks: 'var(--color-accent-neutral)',
  rds: 'var(--color-accent-info)',
  s3: 'var(--color-accent-warning)',
  alb: '#14b8a6',
  ecr: 'var(--color-accent-neutral)',
  route53: 'var(--color-accent-info)',
  nat: 'var(--color-accent-info)',
  subnet: 'var(--color-border-hover)',
}

const handleClass = '!w-1.5 !h-1.5 !bg-border-hover !border-0'

// --- VPC group node (parent container) ---
export const VpcNode = memo(function VpcNode({ data }: NodeProps) {
  const d = data as InfraNodeData
  return (
    <div className="w-full h-full rounded-[6px] border border-dashed border-border-default bg-bg-primary/80 relative">
      <Handle type="target" position={Position.Top} className={handleClass} />
      <Handle type="source" position={Position.Bottom} className={handleClass} />

      <div className="absolute top-1.5 left-2.5 flex items-center gap-1.5">
        <span className="px-1 py-0.5 rounded bg-accent-info/10 text-accent-info text-[9px] font-medium uppercase tracking-wide">
          VPC
        </span>
        <span className="text-[10px] font-mono text-text-secondary">{d.label}</span>
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: statusColor[d.status] }}
        />
      </div>

      <div className="absolute bottom-1.5 left-2.5 flex items-center gap-3 text-[9px] text-text-tertiary font-mono">
        {d.detail && <span>{d.detail}</span>}
        {d.cost && <span className="text-accent-warning">{d.cost}</span>}
      </div>
    </div>
  )
})

// --- Service node (EKS, RDS, S3, ALB, ECR, Route53, subnets, NAT) ---
export const ServiceNode = memo(function ServiceNode({ data }: NodeProps) {
  const d = data as InfraNodeData
  const Icon = typeIcon[d.type] || Server
  const accent = typeAccent[d.type] || 'var(--color-border-default)'

  return (
    <div
      className="py-1.5 pr-2.5 pl-0 rounded-[6px] border border-border-default bg-bg-tertiary
        transition-all duration-150 cursor-pointer max-w-[200px]"
      style={{ borderLeftWidth: 2, borderLeftColor: accent }}
    >
      <Handle type="target" position={Position.Top} className={handleClass} />
      <Handle type="source" position={Position.Bottom} className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />

      <div className="flex items-start gap-1.5 pl-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Icon size={10} className="text-text-tertiary shrink-0" />
            <span className="text-[9px] uppercase tracking-wide text-text-tertiary">{d.type}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] font-mono text-text-primary truncate leading-tight">{d.label}</span>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: statusColor[d.status] }}
            />
          </div>
          {d.detail && (
            <div className="text-[9px] font-mono text-text-tertiary truncate mt-0.5">{d.detail}</div>
          )}
        </div>
      </div>
      {d.cost && (
        <div className="pl-2 mt-0.5 text-[9px] font-mono text-accent-warning">{d.cost}</div>
      )}
    </div>
  )
})

// --- Security node (IAM roles, KMS keys) ---
export const SecurityNode = memo(function SecurityNode({ data }: NodeProps) {
  const d = data as InfraNodeData
  const Icon = typeIcon[d.type] || Lock

  return (
    <div
      className="py-1.5 pr-2.5 pl-0 rounded-[6px] border border-accent-neutral/30 bg-bg-tertiary
        transition-all duration-150 cursor-pointer max-w-[200px]"
      style={{ borderLeftWidth: 2, borderLeftColor: 'var(--color-accent-neutral)' }}
    >
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />

      <div className="flex items-start gap-1.5 pl-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Icon size={10} className="text-accent-neutral shrink-0" />
            <span className="text-[9px] uppercase tracking-wide text-text-tertiary">{d.type}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[11px] font-mono text-text-primary truncate leading-tight">{d.label}</span>
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: statusColor[d.status] }}
            />
          </div>
          {d.detail && (
            <div className="text-[9px] font-mono text-text-tertiary truncate mt-0.5 max-w-[180px]">{d.detail}</div>
          )}
        </div>
      </div>
      {d.cost && (
        <div className="pl-2 mt-0.5 text-[9px] font-mono text-accent-warning">{d.cost}</div>
      )}
    </div>
  )
})
