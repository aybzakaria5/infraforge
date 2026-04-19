import { useState, useCallback, useMemo } from 'react'
import type { Node, Edge, NodeMouseHandler } from '@xyflow/react'

export function useNodeSpotlight(nodes: Node[], edges: Edge[]) {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  const connectedIds = useMemo(() => {
    if (!hoveredNodeId) return null
    const ids = new Set<string>([hoveredNodeId])
    edges.forEach(e => {
      if (e.source === hoveredNodeId) ids.add(e.target)
      if (e.target === hoveredNodeId) ids.add(e.source)
    })
    return ids
  }, [hoveredNodeId, edges])

  const connectedEdgeIds = useMemo(() => {
    if (!hoveredNodeId) return null
    const ids = new Set<string>()
    edges.forEach(e => {
      if (e.source === hoveredNodeId || e.target === hoveredNodeId) ids.add(e.id)
    })
    return ids
  }, [hoveredNodeId, edges])

  const spotlightNodes = useMemo(() => {
    if (!connectedIds) return nodes
    return nodes.map(n => ({
      ...n,
      style: {
        ...n.style,
        opacity: connectedIds.has(n.id) ? 1 : 0.4,
        transition: 'opacity 200ms ease-out',
      },
    }))
  }, [nodes, connectedIds])

  const spotlightEdges = useMemo(() => {
    if (!connectedEdgeIds) return edges
    return edges.map(e => ({
      ...e,
      style: {
        ...e.style,
        opacity: connectedEdgeIds.has(e.id) ? 1 : 0.15,
        strokeWidth: connectedEdgeIds.has(e.id) ? 2.5 : (e.style?.strokeWidth ?? 1.5),
        transition: 'opacity 200ms ease-out, stroke-width 200ms ease-out',
      },
    }))
  }, [edges, connectedEdgeIds])

  const onNodeMouseEnter: NodeMouseHandler = useCallback((_, node) => {
    setHoveredNodeId(node.id)
  }, [])

  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoveredNodeId(null)
  }, [])

  return {
    spotlightNodes,
    spotlightEdges,
    onNodeMouseEnter,
    onNodeMouseLeave,
  }
}
