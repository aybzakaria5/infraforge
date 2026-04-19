import { memo } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { AnimatedNodeWrapper } from '../AnimatedNode'
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

const statusGlow: Record<string, string> = {
  healthy: '0 0 4px rgba(34,197,94,0.5)',
  warning: '0 0 4px rgba(234,179,8,0.5)',
  error: '0 0 4px rgba(239,68,68,0.5)',
}

const typeAccent: Record<string, string> = {
  eks: '#6366f1',
  rds: '#3b82f6',
  s3: '#eab308',
  alb: '#14b8a6',
  ecr: '#f97316',
  route53: '#8b5cf6',
  nat: 'var(--color-accent-info)',
  subnet: 'var(--color-border-hover)',
  iam: '#a855f7',
  kms: '#ec4899',
}

const typeLabel: Record<string, string> = {
  eks: 'EKS CLUSTER',
  rds: 'RDS DATABASE',
  s3: 'S3 BUCKET',
  alb: 'LOAD BALANCER',
  ecr: 'CONTAINER REGISTRY',
  route53: 'DNS ZONE',
  nat: 'NAT GATEWAY',
  subnet: 'SUBNET',
  iam: 'IAM ROLE',
  kms: 'KMS KEY',
  vpc: 'VPC',
}

const handleClass = '!w-1.5 !h-1.5 !bg-border-hover !border-0'

// --- VPC group node (parent container) ---
export const VpcNode = memo(function VpcNode({ data }: NodeProps) {
  const d = data as InfraNodeData
  const idx = (d as Record<string, unknown>)._nodeIndex as number ?? 0
  return (
    <AnimatedNodeWrapper index={idx}>
      <div className="w-full h-full rounded-[12px] border border-dashed border-border-default bg-bg-primary/85
        hover:border-solid hover:border-border-hover transition-[border-style,border-color,background] duration-150 relative">
        <Handle type="target" position={Position.Top} className={handleClass} />
        <Handle type="source" position={Position.Bottom} className={handleClass} />

        <div className="absolute top-2 left-3 flex items-center gap-1.5">
          <span className="px-1 py-0.5 rounded bg-accent-info/10 text-accent-info text-[9px] font-medium uppercase tracking-wide">
            VPC
          </span>
          <span className="text-[10px] font-mono text-text-secondary">{d.label}</span>
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: statusColor[d.status], boxShadow: statusGlow[d.status] }}
          />
        </div>

        <div className="absolute bottom-1.5 left-3 flex items-center gap-3 text-[9px] text-text-tertiary font-mono">
          {d.detail && <span>{d.detail}</span>}
          {d.cost && <span className="text-accent-warning">{d.cost}</span>}
        </div>
      </div>
    </AnimatedNodeWrapper>
  )
})

// --- Service node (EKS, RDS, S3, ALB, ECR, Route53, subnets, NAT) ---
export const ServiceNode = memo(function ServiceNode({ data }: NodeProps) {
  const d = data as InfraNodeData
  const Icon = typeIcon[d.type] || Server
  const accent = typeAccent[d.type] || 'var(--color-border-default)'
  const idx = (d as Record<string, unknown>)._nodeIndex as number ?? 0

  return (
    <AnimatedNodeWrapper index={idx}>
    <div
      className="group rounded-[6px] border border-border-default bg-bg-tertiary
        transition-[border-color,box-shadow,transform] duration-150 cursor-pointer"
      style={{ borderLeftWidth: 2, borderLeftColor: accent, maxWidth: 200, padding: '6px 10px 6px 0' }}
    >
      <Handle type="target" position={Position.Top} className={handleClass} />
      <Handle type="source" position={Position.Bottom} className={handleClass} />
      <Handle type="target" position={Position.Left} id="left" className={handleClass} />
      <Handle type="source" position={Position.Right} id="right" className={handleClass} />

      <div className="flex items-start justify-between pl-2">
        <div className="flex-1 min-w-0">
          {/* Row 1: icon + type label */}
          <div className="flex items-center gap-1">
            <Icon size={12} className="text-text-tertiary shrink-0" />
            <span className="text-[10px] uppercase tracking-wide text-text-tertiary">
              {typeLabel[d.type] || d.type}
            </span>
          </div>
          {/* Row 2: resource name */}
          <div className="text-[12px] font-mono text-text-primary truncate leading-tight mt-0.5">{d.label}</div>
          {/* Row 3: metadata */}
          {d.detail && (
            <div className="text-[10px] font-mono text-text-tertiary truncate mt-0.5">{d.detail}</div>
          )}
        </div>
        {/* Status dot */}
        <span
          className="inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-1"
          style={{ backgroundColor: statusColor[d.status], boxShadow: statusGlow[d.status] }}
        />
      </div>
      {d.cost && (
        <div className="pl-2 mt-0.5 text-[10px] font-mono text-accent-warning">{d.cost}</div>
      )}
    </div>
    </AnimatedNodeWrapper>
  )
})

// --- Security node (IAM roles, KMS keys) ---
export const SecurityNode = memo(function SecurityNode({ data }: NodeProps) {
  const d = data as InfraNodeData
  const Icon = typeIcon[d.type] || Lock
  const accent = typeAccent[d.type] || 'var(--color-accent-neutral)'
  const idx = (d as Record<string, unknown>)._nodeIndex as number ?? 0

  return (
    <AnimatedNodeWrapper index={idx}>
    <div
      className="group rounded-[6px] border border-accent-neutral/30 bg-bg-tertiary
        transition-[border-color,box-shadow,transform] duration-150 cursor-pointer"
      style={{ borderLeftWidth: 2, borderLeftColor: accent, maxWidth: 200, padding: '6px 10px 6px 0' }}
    >
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />

      <div className="flex items-start justify-between pl-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Icon size={12} className="text-accent-neutral shrink-0" />
            <span className="text-[10px] uppercase tracking-wide text-text-tertiary">
              {typeLabel[d.type] || d.type}
            </span>
          </div>
          <div className="text-[12px] font-mono text-text-primary truncate leading-tight mt-0.5">{d.label}</div>
          {d.detail && (
            <div className="text-[10px] font-mono text-text-tertiary truncate mt-0.5 max-w-[180px]">{d.detail}</div>
          )}
        </div>
        <span
          className="inline-block w-1.5 h-1.5 rounded-full shrink-0 mt-1"
          style={{ backgroundColor: statusColor[d.status], boxShadow: statusGlow[d.status] }}
        />
      </div>
      {d.cost && (
        <div className="pl-2 mt-0.5 text-[10px] font-mono text-accent-warning">{d.cost}</div>
      )}
    </div>
    </AnimatedNodeWrapper>
  )
})
