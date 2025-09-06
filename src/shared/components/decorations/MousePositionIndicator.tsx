import { useState, useEffect, useCallback, useRef } from 'react';

interface PlottedDot {
  id: string; 
  x: number; 
  y: number; 
  opacity: number; 
}

export default function MousePositionIndicator() {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [plottedDots, setPlottedDots] = useState<PlottedDot[]>([]);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const mousePositionRef = useRef(mousePosition);

  const maxContainerDimension = 200; 

  const calculateContainerSize = useCallback(() => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let newWidth = maxContainerDimension;
    let newHeight = maxContainerDimension;

    if (windowWidth > windowHeight) {
      newHeight = maxContainerDimension * (windowHeight / windowWidth);
    } else {
      newWidth = maxContainerDimension * (windowWidth / windowHeight);
    }
    setContainerSize({ width: newWidth, height: newHeight });
  }, []);

  useEffect(() => {
    mousePositionRef.current = mousePosition;
  }, [mousePosition]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    calculateContainerSize();
    window.addEventListener('resize', calculateContainerSize);
    return () => {
      window.removeEventListener('resize', calculateContainerSize);
    };
  }, [calculateContainerSize]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (containerSize.width === 0 || containerSize.height === 0) {
        return;
      }

      const currentMouseX = mousePositionRef.current.x;
      const currentMouseY = mousePositionRef.current.y;

      const newDotX = (currentMouseX / window.innerWidth) * containerSize.width;
      const newDotY = (currentMouseY / window.innerHeight) * containerSize.height;

      setPlottedDots(prevDots => {
        const newDot: PlottedDot = {
          id: `${Date.now()}`, 
          x: newDotX,
          y: newDotY,
          opacity: 1,
        };

        const maxDots = 8;
        const updatedDots = [...prevDots.slice(prevDots.length > maxDots -1 ? prevDots.length - (maxDots - 1) : 0), newDot];

        return updatedDots.map((dot, index) => ({
          ...dot,
          opacity: (index + 1) / updatedDots.length, 
        }));
      });
    }, 100); 

    return () => clearInterval(interval); 
  }, [containerSize]); 

  return (
    <div
      className="absolute bottom-8 right-[136px] transform opacity-30 hover:opacity-100 transition duration-500"
      style={{
        width: `${containerSize.width+12}px`,
        height: `${containerSize.height+12}px`,
      }}
    >
      <p className="absolute -top-6 text-white/70 text-sm whitespace-nowrap">
        {`(${mousePosition.x}, ${mousePosition.y})`}
      </p>
      <div
        className="w-full h-full border-2 border-white/50 rounded-lg overflow-clip"
      >
        <svg 
          width={containerSize.width} 
          height={containerSize.height} 
          className="absolute top-0 left-0"
          style={{ pointerEvents: 'none' }} 
        >
          {plottedDots.map((dot, index) => {
            if (index === 0) return null; 
            const prevDot = plottedDots[index - 1];
            const lineOpacity = Math.min(dot.opacity, prevDot.opacity) / 2; 

            return (
              <line
                key={`line-${prevDot.id}-${dot.id}`}
                x1={prevDot.x+6}
                y1={prevDot.y+6}
                x2={dot.x+6}
                y2={dot.y+6}
                stroke="white" 
                strokeWidth="1"
                opacity={lineOpacity}
                vectorEffect="non-scaling-stroke" 
              />
            );
          })}
        </svg>

        {plottedDots.map(dot => (
          <div
            key={dot.id} 
            className="absolute border-white/50 border rounded-full"
            style={{
              width: '8px',   
              height: '8px',  
              left: `${dot.x + 2}px`, 
              top: `${dot.y + 2}px`,  
              opacity: dot.opacity,   
              transition: 'opacity 0.5s ease-out', 
              pointerEvents: 'none', 
            }}
          />
        ))}
      </div>
    </div>
  );
}