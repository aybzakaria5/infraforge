import { memo } from 'react'
import {
  BaseEdge,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react'

const DOT_RADIUS = 3
const DOT_COUNT = 3

function FlowingDots({ path, color, duration }: { path: string; color: string; duration: number }) {
  return (
    <>
      {Array.from({ length: DOT_COUNT }, (_, i) => {
        const offset = (i / DOT_COUNT) * 100
        return (
          <g key={i}>
            {/* Trailing ghost */}
            <circle r={DOT_RADIUS} fill={color} opacity={0.3}>
              <animateMotion
                dur={`${duration}s`}
                repeatCount="indefinite"
                path={path}
                keyPoints={`${(offset - 10 + 100) % 100 / 100};${(offset - 10 + 100) % 100 / 100}`}
                keyTimes="0;1"
                begin={`${(i / DOT_COUNT) * duration}s`}
              />
              <animateMotion
                dur={`${duration}s`}
                repeatCount="indefinite"
                path={path}
                begin={`${(i / DOT_COUNT) * duration}s`}
              />
            </circle>
            {/* Main dot */}
            <circle r={DOT_RADIUS} fill={color} opacity={0.9}>
              <animateMotion
                dur={`${duration}s`}
                repeatCount="indefinite"
                path={path}
                begin={`${(i / DOT_COUNT) * duration}s`}
              />
            </circle>
          </g>
        )
      })}
    </>
  )
}

export const AnimatedFlowEdge = memo(function AnimatedFlowEdge({
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

  const strokeColor = (style?.stroke as string) || 'var(--color-accent-primary)'
  // Vary duration slightly per edge for organic feel
  const duration = 2 + ((id.charCodeAt(id.length - 1) % 15) / 10)

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          ...style,
          strokeWidth: style?.strokeWidth ?? 1.5,
        }}
        markerEnd={markerEnd}
      />
      <FlowingDots path={edgePath} color={strokeColor} duration={duration} />
    </>
  )
})
