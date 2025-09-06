import { useEffect, useState } from "react";
import { cn } from "../../../util/cn";

export default function AnimatedHorizontalLine({
  className = "",
  stay = false,
  delay = 0.2,
}: {
  className?: string;
  stay?: boolean;
  delay?: number;
}) {
  const [animationId] = useState(
    () => `anim-horizontal-${Math.random().toString(36).substring(2, 9)}`
  );

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";

    const expandFromCenterKeyframes = `
      @keyframes expandFromCenter-${animationId} {
        0% { width: 0; }
        100% { width: 100%; }
      }
    `;

    const shrinkToCenterKeyframes = `
      @keyframes shrinkToCenter-${animationId} {
        0% { width: 100%; }
        100% { width: 0; }
      }
    `;

    if (stay) {
      styleSheet.innerHTML = `
        ${expandFromCenterKeyframes}
      `;
    } else {
      styleSheet.innerHTML = `
        ${expandFromCenterKeyframes}
        ${shrinkToCenterKeyframes}
      `;
    }

    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [animationId, stay]);

  const animationName = stay
    ? `expandFromCenter-${animationId}`
    : `expandFromCenter-${animationId}, shrinkToCenter-${animationId}`;
  const animationDuration = stay ? "3s" : "3s, 3s";
  const animationTimingFunction = "cubic-bezier(0.19, 1, 0.22, 1)";
  const animationDelay = `${delay}s`;
  const animationFillMode = stay ? "forwards" : "none";

  return (
    <div
      className={cn("h-0.5 bg-white/50 mx-auto block", className)}
      style={{
        animation: `${animationName} ${animationDuration} ${animationTimingFunction} ${animationDelay} ${animationFillMode}`,
      }}
    />
  );
}