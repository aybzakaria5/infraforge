import { useState, useEffect, useMemo } from 'react'
import type { Edge } from '@xyflow/react'

export function useCascadeAnimation(nodeCount: number, edges: Edge[]) {
  const [edgesVisible, setEdgesVisible] = useState(false)

  useEffect(() => {
    const delay = nodeCount * 50 + 200
    const t = setTimeout(() => setEdgesVisible(true), delay)
    return () => clearTimeout(t)
  }, [nodeCount])

  const animatedEdges = useMemo(() => {
    if (edgesVisible) return edges
    return edges.map(e => ({
      ...e,
      style: { ...e.style, opacity: 0 },
      animated: false,
    }))
  }, [edges, edgesVisible])

  return { animatedEdges, edgesVisible }
}
