import { memo } from 'react'
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'

export const DashedEdge = memo(function DashedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        ...style,
        strokeDasharray: '8 4',
        strokeWidth: style?.strokeWidth ?? 1,
        stroke: style?.stroke ?? 'var(--color-border-default)',
      }}
      markerEnd={markerEnd}
    />
  )
})
