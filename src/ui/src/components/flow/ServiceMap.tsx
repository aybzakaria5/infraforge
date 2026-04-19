import { memo, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { MicroserviceNode } from './nodes/MicroserviceNode'
import { AnimatedFlowEdge } from './edges/AnimatedEdge'
import { getServiceMap } from '../../mocks/servicemap'
import { useCascadeAnimation } from '../../hooks/useCascadeAnimation'
import { useNodeSpotlight } from '../../hooks/useNodeSpotlight'
import { useDragEffects } from '../../hooks/useDragEffects'

const nodeTypes: NodeTypes = {
  microservice: MicroserviceNode,
}

const edgeTypes = {
  animated: AnimatedFlowEdge,
}

const defaultEdgeOptions = {
  type: 'smoothstep' as const,
  style: { strokeWidth: 1 },
}

interface ServiceMapProps {
  envId: string
}

function ServiceMapInner({ envId }: ServiceMapProps) {
  const { nodes: rawNodes, edges } = getServiceMap(envId)
  const { fitView } = useReactFlow()

  const nodes = useMemo(
    () => rawNodes.map((n, i) => ({ ...n, data: { ...n.data, _nodeIndex: i } })),
    [rawNodes],
  )
  const { animatedEdges } = useCascadeAnimation(nodes.length, edges)
  const {
    spotlightNodes,
    spotlightEdges,
    onNodeMouseEnter,
    onNodeMouseLeave,
  } = useNodeSpotlight(nodes, animatedEdges)
  const {
    dragNodes,
    onNodeDragStart,
    onNodeDragStop,
    isDragging,
  } = useDragEffects(spotlightNodes, spotlightEdges)

  const onInit = useCallback(() => {
    setTimeout(() => fitView({ duration: 800, padding: 0.25 }), 50)
  }, [fitView])

  const finalNodes = isDragging ? dragNodes : spotlightNodes

  return (
    <ReactFlow
      nodes={finalNodes}
      edges={spotlightEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      onNodeDragStart={onNodeDragStart}
      onNodeDragStop={onNodeDragStop}
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
      snapGrid={[16, 16]}
      selectionOnDrag={false}
      preventScrolling={false}
      proOptions={{ hideAttribution: true }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
    </ReactFlow>
  )
}

export const ServiceMap = memo(function ServiceMap(props: ServiceMapProps) {
  return (
    <div className="h-[260px] w-full rounded-[6px] border border-border-default overflow-hidden
      animate-[fadeIn_400ms_ease-out]">
      <ReactFlowProvider>
        <ServiceMapInner {...props} />
      </ReactFlowProvider>
    </div>
  )
})
