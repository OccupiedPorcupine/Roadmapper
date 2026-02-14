"use client";

import { BaseEdge, getSmoothStepPath } from "reactflow";
import type { EdgeProps } from "reactflow";

export default function ShineEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  pathOptions,
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: Math.max(pathOptions?.borderRadius ?? 20, 20),
    offset: pathOptions?.offset ?? 20,
  });

  return (
    <>
      {/* Base dim line */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: "rgba(255, 255, 255, 0.15)",
          strokeWidth: 2,
        }}
      />

      {/* Animated glowing dash */}
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: "rgba(255, 255, 255, 0.5)",
          strokeWidth: 3,
          strokeDasharray: "20 100", // Slightly longer dash for the blur to catch
          filter: "blur(2px)",
          animation: "shine-flow 3s linear infinite",
        }}
      />

      {/* Inject animation keyframes once (or relies on global css, but we can inject here for self-containment) */}
      <style>
        {`
          @keyframes shine-flow {
            from {
              stroke-dashoffset: 110;
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </>
  );
}
