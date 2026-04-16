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
  healthy: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
}

// --- VPC group node (parent container) ---
export function VpcNode({ data }: NodeProps) {
  const d = data as InfraNodeData
  const Icon = typeIcon[d.type] || Cloud

  return (
    <div className="w-full h-full rounded-md border border-dashed border-border-hover bg-bg-input/50 relative">
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />

      {/* Label pinned to top-left */}
      <div className="absolute top-2 left-3 flex items-center gap-1.5">
        <Icon size={13} className="text-accent-info" />
        <span className="text-[11px] font-mono text-text-secondary">{d.label}</span>
        <span
          className="inline-block w-[5px] h-[5px] rounded-full ml-1"
          style={{ backgroundColor: statusColor[d.status] }}
        />
      </div>

      {/* Detail in bottom-left */}
      <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] text-text-tertiary font-mono">
        {d.detail && <span>{d.detail}</span>}
        {d.cost && <span className="text-accent-warning">{d.cost}</span>}
      </div>
    </div>
  )
}

// --- Service node (EKS, RDS, S3, ALB, ECR, Route53, subnets, NAT) ---
export function ServiceNode({ data }: NodeProps) {
  const d = data as InfraNodeData
  const Icon = typeIcon[d.type] || Server

  return (
    <div
      className="px-3 py-2 rounded-md border border-border-default bg-bg-tertiary
        hover:border-border-hover transition-colors duration-150 cursor-pointer"
      style={{ minWidth: 160 }}
    >
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-1.5 !h-1.5 !bg-border-hover !border-0" />

      <div className="flex items-center gap-2">
        <Icon size={14} className="text-text-tertiary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-text-primary truncate">{d.label}</span>
            <span
              className="inline-block w-[5px] h-[5px] rounded-full shrink-0"
              style={{ backgroundColor: statusColor[d.status] }}
            />
          </div>
          {d.detail && (
            <div className="text-[9px] font-mono text-text-tertiary truncate mt-0.5">{d.detail}</div>
          )}
        </div>
      </div>
      {d.cost && (
        <div className="mt-1 text-[9px] font-mono text-accent-warning">{d.cost}</div>
      )}
    </div>
  )
}

// --- Security node (IAM roles, KMS keys) ---
export function SecurityNode({ data }: NodeProps) {
  const d = data as InfraNodeData
  const Icon = typeIcon[d.type] || Lock

  return (
    <div
      className="px-3 py-2 rounded-md border border-accent-neutral/30 bg-bg-tertiary
        hover:border-accent-neutral/50 transition-colors duration-150 cursor-pointer"
      style={{ minWidth: 160 }}
    >
      <Handle type="target" position={Position.Top} className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />
      <Handle type="source" position={Position.Bottom} className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />
      <Handle type="target" position={Position.Left} id="left" className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-1.5 !h-1.5 !bg-accent-neutral/50 !border-0" />

      <div className="flex items-center gap-2">
        <Icon size={14} className="text-accent-neutral shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono text-text-primary truncate">{d.label}</span>
            <span
              className="inline-block w-[5px] h-[5px] rounded-full shrink-0"
              style={{ backgroundColor: statusColor[d.status] }}
            />
          </div>
          {d.detail && (
            <div className="text-[9px] font-mono text-text-tertiary truncate mt-0.5 max-w-[200px]">{d.detail}</div>
          )}
        </div>
      </div>
      {d.cost && (
        <div className="mt-1 text-[9px] font-mono text-accent-warning">{d.cost}</div>
      )}
    </div>
  )
}
