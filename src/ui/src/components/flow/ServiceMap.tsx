import { memo } from 'react'
import { ReactFlow, Background, BackgroundVariant, type NodeTypes } from '@xyflow/react'
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

export const ServiceMap = memo(function ServiceMap({ envId }: ServiceMapProps) {
  const { nodes, edges } = getServiceMap(envId)

  return (
    <div className="h-[260px] w-full rounded-[6px] border border-border-default overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        zoomOnDoubleClick={false}
        minZoom={0.5}
        maxZoom={2}
        selectionOnDrag={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
      </ReactFlow>
    </div>
  )
})
