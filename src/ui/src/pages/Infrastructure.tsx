import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  type Node,
  type NodeTypes,
  type NodeMouseHandler,
} from '@xyflow/react'
import { X, ExternalLink, DollarSign, FolderGit2 } from 'lucide-react'
import '@xyflow/react/dist/style.css'
import { VpcNode, ServiceNode, SecurityNode } from '../components/flow/nodes/InfraNodes'
import { StatusDot } from '../components/shared/StatusDot'
import { topologyNodes, topologyEdges, type InfraNodeData } from '../mocks/topology'

const nodeTypes: NodeTypes = {
  vpc: VpcNode,
  service: ServiceNode,
  security: SecurityNode,
}

const typeLabel: Record<string, string> = {
  vpc: 'Virtual Private Cloud',
  subnet: 'Subnet',
  eks: 'Elastic Kubernetes Service',
  rds: 'Relational Database Service',
  s3: 'Simple Storage Service',
  alb: 'Application Load Balancer',
  ecr: 'Elastic Container Registry',
  iam: 'IAM Role',
  kms: 'Key Management Service',
  route53: 'Route 53 Hosted Zone',
  nat: 'NAT Gateway',
}

function DetailPanel({
  node,
  onClose,
}: {
  node: Node<InfraNodeData>
  onClose: () => void
}) {
  const d = node.data as InfraNodeData

  return (
    <div className="fixed top-0 right-0 z-50 h-full w-[380px] bg-bg-secondary border-l border-border-default
      flex flex-col shadow-[-4px_0_12px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border-default">
        <div className="flex items-center gap-2">
          <StatusDot status={d.status === 'healthy' ? 'success' : d.status === 'warning' ? 'warning' : 'failed'} size={6} />
          <span className="text-[13px] font-medium text-text-primary truncate">{d.label}</span>
        </div>
        <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Resource type */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Resource Type</span>
          <span className="text-[13px] text-text-primary">{typeLabel[d.type] || d.type}</span>
          <span className="font-mono text-[11px] text-text-tertiary">{d.type}</span>
        </div>

        {/* ARN */}
        {d.arn && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wide">ARN</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-text-secondary break-all">{d.arn}</span>
              <ExternalLink size={11} className="text-text-tertiary shrink-0" />
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Status</span>
          <div className="flex items-center gap-1.5">
            <StatusDot status={d.status === 'healthy' ? 'success' : d.status === 'warning' ? 'warning' : 'failed'} size={5} />
            <span className="text-[13px] text-text-secondary capitalize">{d.status}</span>
          </div>
        </div>

        {/* Detail */}
        {d.detail && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Details</span>
            <span className="text-[12px] text-text-secondary">{d.detail}</span>
          </div>
        )}

        {/* Cost */}
        {d.cost && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Estimated Cost</span>
            <div className="flex items-center gap-1.5">
              <DollarSign size={12} className="text-accent-warning" />
              <span className="font-mono text-[13px] text-accent-warning">{d.cost}</span>
            </div>
          </div>
        )}

        {/* Terraform module */}
        {d.module && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Terraform Module</span>
            <div className="flex items-center gap-1.5">
              <FolderGit2 size={12} className="text-text-tertiary" />
              <span className="font-mono text-[12px] text-accent-info">{d.module}</span>
            </div>
          </div>
        )}

        {/* Node ID */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Resource ID</span>
          <span className="font-mono text-[11px] text-text-tertiary">{node.id}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-border-default">
        <span className="text-[10px] text-text-tertiary">Last modified: 2h ago</span>
      </div>
    </div>
  )
}

function CostSummary() {
  const costs = useMemo(() => {
    const items: { label: string; cost: string }[] = []
    topologyNodes.forEach(n => {
      const d = n.data as InfraNodeData
      if (d.cost) items.push({ label: d.label, cost: d.cost })
    })
    return items
  }, [])

  const total = useMemo(() => {
    return costs.reduce((sum, c) => {
      const val = parseFloat(c.cost.replace(/[^0-9.]/g, ''))
      return sum + (isNaN(val) ? 0 : val)
    }, 0)
  }, [costs])

  return (
    <div className="absolute bottom-3 left-14 z-10 bg-bg-secondary/95 border border-border-default rounded-md px-3 py-2
      backdrop-blur-sm max-w-[240px]">
      <span className="text-[10px] text-text-tertiary uppercase tracking-wide">Monthly Estimate</span>
      <div className="mt-1 font-mono text-[14px] text-accent-warning">${total.toFixed(2)}/mo</div>
      <div className="mt-1.5 flex flex-col gap-0.5">
        {costs.map(c => (
          <div key={c.label} className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-text-tertiary truncate">{c.label}</span>
            <span className="font-mono text-text-secondary shrink-0">{c.cost}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Infrastructure() {
  const [selectedNode, setSelectedNode] = useState<Node<InfraNodeData> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  const handleNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node as Node<InfraNodeData>)
  }, [])

  const miniMapNodeColor = useCallback((node: Node) => {
    const d = node.data as InfraNodeData
    if (d.type === 'vpc') return '#27272a'
    if (d.status === 'error') return '#ef4444'
    if (d.status === 'warning') return '#eab308'
    if (node.type === 'security') return '#6366f1'
    return '#22c55e'
  }, [])

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-text-tertiary">
          {topologyNodes.length} resources · {topologyEdges.length} connections
        </span>
        <span className="text-[11px] text-text-tertiary">Click a resource to inspect</span>
      </div>

      <div className="flex-1 min-h-[400px] lg:min-h-0 rounded-md border border-border-default overflow-hidden relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center bg-bg-primary">
            <span className="text-[12px] text-text-tertiary animate-pulse">Loading topology...</span>
          </div>
        ) : <ReactFlow
          nodes={topologyNodes}
          edges={topologyEdges}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          nodesConnectable={false}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'smoothstep',
            style: { strokeWidth: 1, stroke: '#3f3f46' },
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-bg-primary" />
          <MiniMap
            nodeColor={miniMapNodeColor}
            maskColor="rgba(0,0,0,0.6)"
            className="!bg-bg-secondary !border-border-default"
            pannable
            zoomable
          />
          <Controls
            showInteractive={false}
            className="!bg-bg-tertiary !border-border-default !shadow-none
              [&>button]:!bg-bg-tertiary [&>button]:!border-border-default [&>button]:!text-text-tertiary
              [&>button:hover]:!bg-bg-input [&>button:hover]:!text-text-secondary"
          />
        </ReactFlow>}

        {!loading && <CostSummary />}
      </div>

      {selectedNode && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setSelectedNode(null)} />
          <DetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
        </>
      )}
    </div>
  )
}
