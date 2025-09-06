import React, { useRef, useEffect } from 'react';
import { cn } from '../../../util/cn';

export interface Point {
  x: number;
  y: number;
}

const DEFAULT_POINTS: [Point, Point, Point, Point] = [
  { x: Infinity, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: 0 },
];

export default function ConnectingLines({
  points = DEFAULT_POINTS,
  width = '100%',
  height = '100%',
  className = "",
} : {
  points?: [Point, Point, Point, Point];
  width?: string | number;
  height?: string | number;
  className?: string;
}) {
  const polylineRef = useRef<SVGPolylineElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const animationDuration = 300;
    const visibilityDelay = 300;

    const lineElement = polylineRef.current;
    if (lineElement) {
      const length = lineElement.getTotalLength();

      lineElement.style.strokeDasharray = `${length} ${length}`;
      lineElement.style.strokeDashoffset = `${length}`;
      lineElement.style.opacity = '0';
      lineElement.style.transition = 'none';

      lineElement.getBoundingClientRect();

      lineElement.style.transition = `opacity 150ms ease-out ${visibilityDelay}ms, stroke-dashoffset ${animationDuration}ms linear ${visibilityDelay}ms`;
      lineElement.style.opacity = '1';

      lineElement.style.strokeDashoffset = '0';
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.style.transition = 'none';
        polylineRef.current.style.strokeDashoffset = '0';
        polylineRef.current.style.opacity = '1';
      }
    };
  }, [points]);

  if (points.length < 4) {
    return null;
  }

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div
      ref={containerRef}
      className={cn("absolute overflow-hidden pointer-events-none z-[15]", className)}
      style={{ width, height }}
    >
      <svg className="w-full h-full">
        <polyline
          ref={polylineRef}
          points={polylinePoints}
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    </div>
  );
};