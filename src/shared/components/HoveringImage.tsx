import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../util/cn';
import LoadingIcon from './decorations/LoadingIcon';
import Spinner from './decorations/Spinner';

export default function HoveringImage({
  className = '',
  src = '',
  padding = 30
}: {
  className?: string;
  src: string;
  padding?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);
  const rotatingRef = useRef<HTMLDivElement>(null);

  const [rotation, setRotation] = useState({ rotateY: 0, rotateX: 0 });
  const [gradientPosition, setGradientPosition] = useState({ x: 0, y: 0 });
  const [imageWrapperDimensions, setImageWrapperDimensions] = useState({ width: 0, height: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [loadingOpacity, setLoadingOpacity] = useState(1);

  const MAX_ROTATION_Y = 20;
  const MAX_ROTATION_X = 20;
  const MAX_GRADIENT_MOVEMENT = 20;

  const updateImageWrapperDimensions = useCallback(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setImageWrapperDimensions({
        width: clientWidth - padding * 2,
        height: clientHeight - padding * 2,
      });
    }
  }, [padding]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateImageWrapperDimensions();

    const observer = new ResizeObserver(() => {
      updateImageWrapperDimensions();
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [updateImageWrapperDimensions, padding]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (rotatingRef.current && imageWrapperDimensions.width > 0 && imageWrapperDimensions.height > 0) {
      const { left, top, width, height } = rotatingRef.current.getBoundingClientRect();

      const xFromCenter = e.clientX - (left + width / 2);
      const yFromCenter = e.clientY - (top + height / 2);

      const normalizedX = xFromCenter / (width / 2);
      const normalizedY = yFromCenter / (height / 2);

      const newRotateY = normalizedX * MAX_ROTATION_Y;
      const newRotateX = -normalizedY * MAX_ROTATION_X;

      setRotation({ rotateY: newRotateY, rotateX: newRotateX });

      const newGradientX = normalizedX * MAX_GRADIENT_MOVEMENT;
      const newGradientY = normalizedY * MAX_GRADIENT_MOVEMENT;
      setGradientPosition({ x: newGradientX, y: newGradientY });
    }
  }, [imageWrapperDimensions]);

  const handleMouseLeave = useCallback(() => {
    setRotation({ rotateY: 0, rotateX: 0 });
    setGradientPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    const rotatingElement = rotatingRef.current;

    if (rotatingElement) {
      rotatingElement.addEventListener('mousemove', handleMouseMove);
      rotatingElement.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (rotatingElement) {
        rotatingElement.removeEventListener('mousemove', handleMouseMove);
        rotatingElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

  const handleImageLoad = useCallback(() => {
    updateImageWrapperDimensions();
    setLoadingOpacity(0);
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(hideTimer);
  }, [updateImageWrapperDimensions]);

  const handleImageError = useCallback(() => {
    setLoadingOpacity(0);
    const hideTimer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(hideTimer);
  }, []);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setLoadingOpacity(0);
      return;
    }

    setIsLoading(true);
    setLoadingOpacity(1);

    const checkImageComplete = () => {
      if (imgElementRef.current && imgElementRef.current.complete && imgElementRef.current.src === src) {
        setLoadingOpacity(0);
        const hideTimer = setTimeout(() => {
          setIsLoading(false);
        }, 500);
        return () => clearTimeout(hideTimer);
      }
      return undefined;
    };

    const initialCheckTimer = setTimeout(checkImageComplete, 0);

    return () => clearTimeout(initialCheckTimer);
  }, [src]);

  const maxTotalRotation = Math.sqrt(MAX_ROTATION_Y * MAX_ROTATION_Y + MAX_ROTATION_X * MAX_ROTATION_X);
  const currentTotalRotation = Math.sqrt(rotation.rotateY * rotation.rotateY + rotation.rotateX * rotation.rotateX);
  const dynamicOpacity = Math.min(currentTotalRotation / maxTotalRotation, 1);

  return (
    <div
      ref={containerRef}
      className={cn("relative flex items-center justify-center overflow-visible", className)}
      style={{
        perspective: '1000px',
        overflow: 'hidden',
        padding: `${padding}px`
      }}
    >
      <div
        ref={rotatingRef}
        className="absolute overflow-visible"
        style={{
          width: `${imageWrapperDimensions.width}px`,
          height: `${imageWrapperDimensions.height}px`,
          transform: `rotateY(${rotation.rotateY}deg) rotateX(${rotation.rotateX}deg)`,
          transition: 'transform 0.1s ease-out',
          willChange: 'transform',
          transformStyle: 'preserve-3d',
          opacity: isLoading ? 0 : 1,
        }}
      >
        <img
          ref={imgElementRef}
          src={src}
          alt="Hovering Image"
          className="block object-cover w-full h-full"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div
          className="absolute inset-0 z-10"
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(255,255,255,0) 15%, rgba(255,255,255,0.2) 30%, rgba(255,255,255,0.0) 45%, rgba(255,255,255,0.0) 55%, rgba(255,255,255,0.6) 65%, rgba(255,255,255,0) 75%)`,
            backgroundSize: '200% 200%',
            backgroundPosition: `${50 + gradientPosition.x}% ${50 + gradientPosition.y}%`,
            transition: 'background-position 0.1s ease-out, opacity 0.3s ease-out',
            pointerEvents: 'none',
            opacity: dynamicOpacity,
          }}
        />
      </div>

      {isLoading && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-transparent z-20 transition-opacity duration-500 ease-out"
          style={{ opacity: loadingOpacity, pointerEvents: loadingOpacity === 0 ? 'none' : 'auto' }}
        >
          <Spinner />
        </div>
      )}
    </div>
  );
}
