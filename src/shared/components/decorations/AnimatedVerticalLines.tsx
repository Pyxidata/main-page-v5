import { useEffect, useState } from "react";

export default function AnimatedVerticalLines() {
  const [animationId] = useState(() => `anim-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerHTML = `
      @keyframes fluctuateLine1-${animationId} {
        0% { height: calc(75vh - 350px); }
        50% { height: calc(100vh - 350px); }
        100% { height: calc(75vh - 350px); }
      }

      @keyframes fluctuateLine2-${animationId} {
        0% { height: calc(60vh - 350px); }
        50% { height: calc(100vh - 350px); }
        100% { height: calc(60vh - 350px); }
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [animationId]);

  return (
    <>
      <div
        className="absolute top-0 left-8 w-1 bg-white/50"
        style={{ animation: `fluctuateLine1-${animationId} 30s ease-in-out infinite` }}
      />
      <div
        className="absolute top-0 left-12 w-1 bg-white/30"
        style={{ animation: `fluctuateLine2-${animationId} 20s ease-in-out infinite` }}
      />
    </>
  );
}