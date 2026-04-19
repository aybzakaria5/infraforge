import { useMemo, useCallback, memo } from 'react'
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
const NODE_HEIGHT = 64

function layoutPipeline(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 30, ranksep: 50 })

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

export const PipelineFlow = memo(function PipelineFlow({ nodes, edges, onNodeClick }: PipelineFlowProps) {
  const layoutNodes = useMemo(() => layoutPipeline(nodes, edges), [nodes, edges])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => onNodeClick?.(node.id),
    [onNodeClick],
  )

  return (
    <div className="h-[200px] w-full rounded-[6px] border border-border-default overflow-hidden">
      <ReactFlow
        nodes={layoutNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable
        nodesConnectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        minZoom={0.3}
        maxZoom={2}
        selectionOnDrag={false}
        onlyRenderVisibleElements
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'smoothstep', style: { strokeWidth: 1.5 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
    </div>
  )
})
