import { useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeMouseHandler,
} from '@xyflow/react'
import dagre from '@dagrejs/dagre'
import '@xyflow/react/dist/style.css'
import {
  GitNode,
  BuildNode,
  ScanNode,
  PushNode,
  DeployNode,
  VerifyNode,
} from './nodes/PipelineNodes'

const nodeTypes: NodeTypes = {
  gitNode: GitNode,
  buildNode: BuildNode,
  scanNode: ScanNode,
  pushNode: PushNode,
  deployNode: DeployNode,
  verifyNode: VerifyNode,
}

const NODE_WIDTH = 180
const NODE_HEIGHT = 100

function layoutPipeline(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 60 })

  nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  edges.forEach(e => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map(n => {
    const pos = g.node(n.id)
    return {
      ...n,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
    }
  })
}

interface PipelineFlowProps {
  nodes: Node[]
  edges: Edge[]
  onNodeClick?: (nodeId: string) => void
}

export function PipelineFlow({ nodes, edges, onNodeClick }: PipelineFlowProps) {
  const layoutNodes = useMemo(() => layoutPipeline(nodes, edges), [nodes, edges])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => onNodeClick?.(node.id),
    [onNodeClick],
  )

  return (
    <div className="h-[220px] w-full rounded-md border border-border-default overflow-hidden">
      <ReactFlow
        nodes={layoutNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep', style: { strokeWidth: 1 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-bg-primary" />
      </ReactFlow>
    </div>
  )
}
