"use client";

import React from "react"
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion"
import { useRef } from "react"
import { cn } from "@/lib/utils"

export function Button({
  borderRadius = "1.75rem",
  children,
  as: Component = "button",
  containerClassName,
  borderClassName,
  duration,
  className,
  ...otherProps
}: {
  borderRadius?: string
  children: React.ReactNode
  as?: React.ElementType
  containerClassName?: string
  borderClassName?: string
  duration?: number
  className?: string
  [key: string]: unknown
}) {
  return (
    <Component
      className={cn(
        "relative h-16 w-40 overflow-hidden bg-transparent p-[1px] text-xl",
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <MovingBorder duration={duration} rx={30} ry={30}>
          <div
            className={cn(
              "h-20 w-20 opacity-90 bg-[radial-gradient(var(--sky-500,#0ea5e9)_40%,transparent_60%)]",
              borderClassName
            )}
          />
        </MovingBorder>
      </div>

      <div
        className={cn(
          "relative flex h-full w-full items-center justify-center border border-slate-800 bg-slate-900/[0.8] text-sm text-white antialiased backdrop-blur-xl",
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  )
}

/** Rounded-rect path (clockwise) using arcs - full perimeter for reliable getPointAtLength */
function roundedRectPath(r = 15) {
  return `M ${r} 0 L ${100 - r} 0 A ${r} ${r} 0 0 1 100 ${r} L 100 ${100 - r} A ${r} ${r} 0 0 1 ${100 - r} 100 L ${r} 100 A ${r} ${r} 0 0 1 0 ${100 - r} L 0 ${r} A ${r} ${r} 0 0 1 ${r} 0`
}

export const MovingBorder = ({
  children,
  duration = 2000,
  rx = 15,
  ry,
  ...otherProps
}: {
  children: React.ReactNode
  duration?: number
  rx?: number | string
  ry?: number | string
  [key: string]: unknown
}) => {
  const pathRef = useRef<SVGPathElement | null>(null)
  const progress = useMotionValue<number>(0)
  const accumulatedRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const r = typeof rx === "string" ? parseFloat(rx) : rx ?? 15
  const pathD = roundedRectPath(r)

  useAnimationFrame((time, delta) => {
    const el = pathRef.current
    if (!el) return
    const length = el.getTotalLength()
    if (length <= 0) return
    const dt = typeof delta === "number" ? delta : lastTimeRef.current ? time - lastTimeRef.current : 0
    lastTimeRef.current = time
    const progressPerMs = length / duration
    accumulatedRef.current = (accumulatedRef.current + dt * progressPerMs) % length
    progress.set(accumulatedRef.current)
  })

  const x = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).x ?? 0
  )
  const y = useTransform(
    progress,
    (val) => pathRef.current?.getPointAtLength(val).y ?? 0
  )
  // viewBox is 0–100 so path coords are 0–100; use % so orb follows border at any size
  const xPct = useTransform(x, (v) => `${v}%`)
  const yPct = useTransform(y, (v) => `${v}%`)

  const transform = useMotionTemplate`translateX(${xPct}) translateY(${yPct}) translateX(-50%) translateY(-50%)`

  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        {...otherProps}
      >
        <path fill="none" d={pathD} ref={pathRef} />
      </svg>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "inline-block",
          transform,
        }}
      >
        {children}
      </motion.div>
    </>
  )
}
