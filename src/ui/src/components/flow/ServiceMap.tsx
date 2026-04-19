import { memo, useCallback } from 'react'
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
import { getServiceMap } from '../../mocks/servicemap'

const nodeTypes: NodeTypes = {
  microservice: MicroserviceNode,
}

const defaultEdgeOptions = {
  type: 'smoothstep' as const,
  style: { strokeWidth: 1 },
}

interface ServiceMapProps {
  envId: string
}

function ServiceMapInner({ envId }: ServiceMapProps) {
  const { nodes, edges } = getServiceMap(envId)
  const { fitView } = useReactFlow()

  const onInit = useCallback(() => {
    setTimeout(() => fitView({ duration: 800, padding: 0.25 }), 50)
  }, [fitView])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
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
    <div className="h-[260px] w-full rounded-[6px] border border-border-default overflow-hidden">
      <ReactFlowProvider>
        <ServiceMapInner {...props} />
      </ReactFlowProvider>
    </div>
  )
})
