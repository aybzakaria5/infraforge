import { useMemo, useCallback, memo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
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
import { AnimatedFlowEdge } from './edges/AnimatedEdge'
import { FailedEdge } from './edges/FailedEdge'
import { useCascadeAnimation } from '../../hooks/useCascadeAnimation'
import { useNodeSpotlight } from '../../hooks/useNodeSpotlight'

const nodeTypes: NodeTypes = {
  gitNode: GitNode,
  buildNode: BuildNode,
  scanNode: ScanNode,
  pushNode: PushNode,
  deployNode: DeployNode,
  verifyNode: VerifyNode,
}

const edgeTypes = {
  animated: AnimatedFlowEdge,
  failed: FailedEdge,
}

const NODE_WIDTH = 180
const NODE_HEIGHT = 64
const SNAP_GRID: [number, number] = [16, 16]

function layoutPipeline(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: 'LR', nodesep: 30, ranksep: 50 })

  nodes.forEach(n => g.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT }))
  edges.forEach(e => g.setEdge(e.source, e.target))

  dagre.layout(g)

  return nodes.map((n, i) => {
    const pos = g.node(n.id)
    return {
      ...n,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 },
      data: { ...n.data, _nodeIndex: i },
    }
  })
}

interface PipelineFlowProps {
  nodes: Node[]
  edges: Edge[]
  onNodeClick?: (nodeId: string) => void
}

function PipelineFlowInner({ nodes, edges, onNodeClick }: PipelineFlowProps) {
  const layoutNodes = useMemo(() => layoutPipeline(nodes, edges), [nodes, edges])
  const { fitView } = useReactFlow()
  const { animatedEdges } = useCascadeAnimation(layoutNodes.length, edges)
  const {
    spotlightNodes,
    spotlightEdges,
    onNodeMouseEnter,
    onNodeMouseLeave,
  } = useNodeSpotlight(layoutNodes, animatedEdges)

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => onNodeClick?.(node.id),
    [onNodeClick],
  )

  const onInit = useCallback(() => {
    setTimeout(() => fitView({ duration: 800, padding: 0.2 }), 50)
  }, [fitView])

  return (
    <ReactFlow
      nodes={spotlightNodes}
      edges={spotlightEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={handleNodeClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      onInit={onInit}
      nodesDraggable
      nodesConnectable={false}
      panOnDrag
      panOnScroll={false}
      zoomOnScroll
      zoomOnPinch
      zoomOnDoubleClick={false}
      minZoom={0.1}
      maxZoom={4}
      snapToGrid
      snapGrid={SNAP_GRID}
      selectionOnDrag={false}
      onlyRenderVisibleElements
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: 'smoothstep', style: { strokeWidth: 1.5 } }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
    </ReactFlow>
  )
}

export const PipelineFlow = memo(function PipelineFlow(props: PipelineFlowProps) {
  return (
    <div className="h-[200px] w-full rounded-[6px] border border-border-default overflow-hidden">
      <ReactFlowProvider>
        <PipelineFlowInner {...props} />
      </ReactFlowProvider>
    </div>
  )
})
