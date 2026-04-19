import { useState, useCallback, useMemo } from 'react'
import type { Node, Edge, NodeDragHandler } from '@xyflow/react'

export function useDragEffects(nodes: Node[], edges: Edge[]) {
  const [draggingId, setDraggingId] = useState<string | null>(null)

  const connectedToDrag = useMemo(() => {
    if (!draggingId) return null
    const ids = new Set<string>([draggingId])
    edges.forEach(e => {
      if (e.source === draggingId) ids.add(e.target)
      if (e.target === draggingId) ids.add(e.source)
    })
    return ids
  }, [draggingId, edges])

  const dragNodes = useMemo(() => {
    if (!connectedToDrag) return nodes
    return nodes.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: connectedToDrag.has(n.id) ? 1 : 0.3,
        transition: 'opacity 200ms ease-out',
      },
    }))
  }, [nodes, connectedToDrag])

  const onNodeDragStart: NodeDragHandler = useCallback((_, node) => {
    setDraggingId(node.id)
  }, [])

  const onNodeDragStop: NodeDragHandler = useCallback(() => {
    // Small delay so the fade-back animation is visible
    setTimeout(() => setDraggingId(null), 100)
  }, [])

  return {
    dragNodes,
    onNodeDragStart,
    onNodeDragStop,
    isDragging: draggingId !== null,
  }
}
