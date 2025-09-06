import React, { ReactNode, forwardRef, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../util/cn';
import LoadingIcon from '../decorations/LoadingIcon';
import defaultColor from '../../colors.json';

type PageLayoutProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  quickLoad?: boolean;
  noLoad?: boolean;
  longLoad?: boolean;
  bgLinks?: string[];
  /** Crossfade duration in ms */
  fadeMs?: number;
  /** Time between switches in ms (includes dwell time while fully visible) */
  intervalMs?: number;
  /** Initial delay before the first switch in ms */
  initialDelayMs?: number;
};

const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(
  (
    {
      className,
      longLoad = false,
      quickLoad = false,
      noLoad = false,
      bgLinks = [],
      children,
      fadeMs = 2000,
      intervalMs = 10000,
      initialDelayMs = 10000,
    },
    ref
  ) => {
    const [showLoading, setShowLoading] = useState(true);
    const [loadingOpacity, setLoadingOpacity] = useState(1);
    const [currentBgIndex, setCurrentBgIndex] = useState(0);

    const startTimerRef = useRef<number | null>(null);
    const cycleTimerRef = useRef<number | null>(null);

    // Loading overlay timing (kept as-is)
    useEffect(() => {
      const fadeOut = window.setTimeout(
        () => setLoadingOpacity(0),
        noLoad ? 0 : quickLoad ? 300 : longLoad ? 4000 : 2000
      );
      const hide = window.setTimeout(
        () => setShowLoading(false),
        noLoad ? 0 : quickLoad ? 800 : longLoad ? 4500 : 2500
      );
      return () => {
        clearTimeout(fadeOut);
        clearTimeout(hide);
      };
    }, [noLoad, quickLoad, longLoad]);

    // Preload images to avoid flashes during the first crossfade
    useEffect(() => {
      bgLinks.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    }, [bgLinks]);

    // Background cycling (simple index bump; AnimatePresence handles the crossfade)
    useEffect(() => {
      if (bgLinks.length <= 1) return;

      startTimerRef.current = window.setTimeout(() => {
        // Advance once at start so the first transition is predictable
        setCurrentBgIndex((i) => (i + 1) % bgLinks.length);
        cycleTimerRef.current = window.setInterval(() => {
          setCurrentBgIndex((i) => (i + 1) % bgLinks.length);
        }, intervalMs);
      }, initialDelayMs);

      return () => {
        if (startTimerRef.current) clearTimeout(startTimerRef.current);
        if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
      };
    }, [bgLinks.length, intervalMs, initialDelayMs]);

    return (
      <div className="relative w-full flex justify-center h-screen overflow-hidden">
        {/* Background crossfade */}
        {bgLinks.length > 0 && (
          <div className="absolute inset-0">
            <AnimatePresence>
              <motion.div
                key={bgLinks[currentBgIndex] || `bg-${currentBgIndex}`}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${bgLinks[currentBgIndex]})` }}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ 
                  opacity: 1,
                  scale: 1,
                }}
                exit={{ opacity: 0, scale: 1 }}
                transition={{
                  opacity: { duration: fadeMs / 1000, ease: "easeInOut" },
                  scale: { duration: intervalMs / 1000, ease: "linear" }, // zoom spans full interval
                }}
              />
            </AnimatePresence>
          </div>
        )}

        <div className="absolute inset-0 bg-black/80">
          <div
            className={cn('overflow-y-scroll h-screen flex flex-col items-center', className)}
            ref={ref}
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
          >
            {children}
          </div>
        </div>

        {showLoading && (
          <div
            className="fixed inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-500"
            style={{
              backgroundColor: (defaultColor as any)?.bbg ?? 'black',
              opacity: loadingOpacity,
              pointerEvents: loadingOpacity === 0 ? 'none' : 'auto',
            }}
          >
            <LoadingIcon loop={false} />
          </div>
        )}
      </div>
    );
  }
);

PageLayout.displayName = 'PageLayout';
export default PageLayout;
