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

export function ServiceMap({ envId }: ServiceMapProps) {
  const { nodes, edges } = getServiceMap(envId)

  return (
    <div className="h-[280px] w-full rounded-md border border-border-default overflow-hidden bg-rf-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} className="!bg-bg-primary" />
      </ReactFlow>
    </div>
  )
}
