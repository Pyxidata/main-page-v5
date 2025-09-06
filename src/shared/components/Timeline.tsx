import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type Timespan = {
  startDate?: number;
  endDate: number;
  color: string;
  key: string;
  title: string;
};

const calculateTimelineMetrics = (timespans: Timespan[], timelineHeightPx: number) => {
  if (timespans.length === 0 || timelineHeightPx <= 0) {
    const defaultMinTime = new Date('2000-01-01T00:00:00Z').getTime();
    const defaultMaxTime = new Date('2030-01-01T00:00:00Z').getTime();
    const defaultTotalRange = defaultMaxTime - defaultMinTime;
    return {
      minTime: defaultMinTime,
      maxTime: defaultMaxTime,
      pixelsPerMs: timelineHeightPx / defaultTotalRange,
      timelineHeightPx
    };
  }

  const allDates = timespans.flatMap(ts => ts.startDate ? [ts.startDate, ts.endDate] : [ts.endDate]);

  const actualMinMs = Math.min(...allDates);
  const actualMaxMs = Math.max(...allDates);

  const minDate = new Date(actualMinMs);
  const maxDate = new Date(actualMaxMs);

  const minYear = minDate.getFullYear();
  const maxYear = maxDate.getFullYear();

  const timelineMinTime = new Date(minYear, 0, 1, 0, 0, 0, 0).getTime();
  const timelineMaxTime = new Date(maxYear + 1, 0, 1, 0, 0, 0, 0).getTime();

  const totalTimeRangeMs = timelineMaxTime - timelineMinTime;
  const adjustedTotalTimeRangeMs = totalTimeRangeMs > 0 ? totalTimeRangeMs : 3600000;

  const pixelsPerMs = timelineHeightPx / adjustedTotalTimeRangeMs;

  return {
    minTime: timelineMinTime,
    maxTime: timelineMaxTime,
    pixelsPerMs,
    timelineHeightPx
  };
};

export default function Timeline({
  timespans,
  onActiveItemChange,
  activeItemKeyFromParent,
  onTimelineItemClick,
  onMetricsUpdate,
  getActiveTimelineItemCoordinatesRef,
} : {
  timespans: Timespan[];
  scrollableParentRef?: React.RefObject<HTMLDivElement>;
  onActiveItemChange: (key: string | null, x: number, y: number) => void;
  activeItemKeyFromParent: string | null;
  onTimelineItemClick: (key: string) => void;
  onMetricsUpdate: (metrics: { minTime: number; maxTime: number; pixelsPerMs: number; timelineHeightPx: number }) => void;
  getActiveTimelineItemCoordinatesRef: React.MutableRefObject<(() => { x: number; y: number } | null)>;
}) {
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const [timelineHeightPx, setTimelineHeightPx] = useState(0);

  const { minTime, maxTime, pixelsPerMs } = calculateTimelineMetrics(timespans, timelineHeightPx);
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [activeTimelineKey, setActiveTimelineKey] = useState<string | null>(null);

  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const getActiveItemCoordinates = useCallback(() => {
    if (activeTimelineKey && itemRefs.current.has(activeTimelineKey) && timelineContainerRef.current) {
      const activeItemElement = itemRefs.current.get(activeTimelineKey);
      if (activeItemElement && timelineContainerRef.current.parentElement) {
        const itemRect = activeItemElement.getBoundingClientRect();
        const commonParentRect = timelineContainerRef.current.parentElement.getBoundingClientRect();
        return {
          x: itemRect.right - commonParentRect.left,
          y: itemRect.top + itemRect.height / 2 - commonParentRect.top,
        };
      }
    }
    return null;
  }, [activeTimelineKey]);

  useEffect(() => {
    getActiveTimelineItemCoordinatesRef.current = getActiveItemCoordinates;
  }, [getActiveTimelineItemCoordinatesRef, getActiveItemCoordinates]);

  const updateTimelineHeight = useCallback(() => {
    if (timelineContainerRef.current && timelineContainerRef.current.parentElement) {
      const parentHeight = timelineContainerRef.current.parentElement.clientHeight;
      setTimelineHeightPx(parentHeight - 256);
    }
  }, [timelineContainerRef.current?.parentElement?.clientHeight]);

  useEffect(() => {
    updateTimelineHeight();
    window.addEventListener('resize', updateTimelineHeight);
    return () => {
      window.removeEventListener('resize', updateTimelineHeight);
    };
  }, [updateTimelineHeight]);

  useEffect(() => {
    setActiveTimelineKey(activeItemKeyFromParent);
  }, [activeItemKeyFromParent]);

  useEffect(() => {
    onMetricsUpdate({ minTime, maxTime, pixelsPerMs, timelineHeightPx });
  }, [timespans, timelineHeightPx, onMetricsUpdate, minTime, maxTime, pixelsPerMs]);

  useEffect(() => {
    if (activeItemKeyFromParent) {
      const timerId = setTimeout(() => {
        const activeItemElement = itemRefs.current.get(activeItemKeyFromParent);
        if (activeItemElement) {
          const rect = activeItemElement.getBoundingClientRect();
          onActiveItemChange(activeItemKeyFromParent, rect.right, rect.top + rect.height / 2);
        }
      }, 200);

      return () => clearTimeout(timerId);
    } else {
      onActiveItemChange(null, 0, 0);
    }
  }, [activeItemKeyFromParent]);

  const yearLabels = [];
  if (minTime && maxTime && pixelsPerMs > 0 && timelineHeightPx > 0) {
    const startYear = new Date(minTime).getFullYear();
    const endYear = new Date(maxTime).getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      const yearStartTimeMs = new Date(year, 0, 1, 0, 0, 0, 0).getTime();
      const positionFromBottomMs = yearStartTimeMs - minTime;
      const topPositionPx = timelineHeightPx - (positionFromBottomMs * pixelsPerMs);

      if (topPositionPx >= -10 && topPositionPx <= timelineHeightPx + 10) {
        yearLabels.push(
          <React.Fragment key={`year-${year}`}>
            <div
              className="absolute right-full -mr-14 sm:mr-4 rotate-90 text-[9px] sm:text-sm font-bold"
              style={{ top: `${topPositionPx}px`, transform: 'translateY(-50%)' }}
            >
              {year}
            </div>
            <div
              className="absolute left-1/2 -translate-x-1/2 w-8 sm:w-12 h-[2px]"
              style={{ top: `${topPositionPx}px`, backgroundColor: '#888888' }}
            ></div>
          </React.Fragment>
        );
      }
    }
  }

  let nowLine = null;
  if (minTime && maxTime && pixelsPerMs > 0 && timelineHeightPx > 0) {
    const currentTimeMs = Date.now();
    if (currentTimeMs >= minTime && currentTimeMs <= maxTime) {
      const positionFromBottomMs = currentTimeMs - minTime;
      const topPositionPx = timelineHeightPx - (positionFromBottomMs * pixelsPerMs);

      nowLine = (
        <>
          <div
            className="absolute left-1/2 -translate-x-1/2 w-10 sm:w-20 h-[2px] bg-red-500 z-[100]"
            style={{ top: `${topPositionPx}px` }}
          />
        </>
      );
    }
  }

  return (
    <motion.div 
      id="timeline-container" 
      className="flex justify-center items-center h-full"
      ref={timelineContainerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ delay: 2.7, duration: 0.5 }}    
    >
      <div
        className="relative flex justify-center w-6 sm:w-12 rounded-md shadow-lg"
        style={{ height: `${timelineHeightPx}px` }}
      >
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[3px]"
          style={{ top: '2px', backgroundColor: '#888888' }}
        />

        {yearLabels}
        {nowLine}

        {timespans.map((timespan) => {
          const isBox = timespan.startDate !== undefined;

          const itemStartMs = timespan.startDate !== undefined ? timespan.startDate : timespan.endDate;
          const itemEndMs = timespan.endDate;

          const positionFromBottomMs = itemStartMs - minTime;
          const positionFromBottomPx = positionFromBottomMs * pixelsPerMs;

          const durationMs = isBox ? (itemEndMs - itemStartMs) : 0;
          const heightPx = isBox ? durationMs * pixelsPerMs : 2;

          const topPositionPx = timelineHeightPx - (positionFromBottomPx + Math.max(2, heightPx));

          const blockColorClass = timespan.color || '#ffffff';

          const finalZIndex = isBox ? 20 : 15;

          const isHovered = hoveredKey === timespan.key;
          const isActive = activeTimelineKey === timespan.key;

          const opacityClass = (isHovered || isActive)
            ? 'opacity-100'
            : 'opacity-50';

          const widthClass = isBox
            ? (isHovered || isActive) ? 'w-7 sm:w-10' : 'w-5 sm:w-8'
            : 'w-12 sm:w-16'

          const itemSpecificClasses = isBox
            ? `left-1/2 -translate-x-1/2`
            : ``;

          const pinHeadClass = (isHovered || isActive)
            ? `translate-x-[62px] w-4 h-4`
            : `translate-x-[54px] w-4 h-4`

          const startDateFormatted = timespan.startDate
            ? new Date(timespan.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : '';
          const endDateFormatted = new Date(timespan.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

          const titleText = isBox
            ? `${timespan.title}\n${startDateFormatted} - ${endDateFormatted}`
            : `${timespan.title}\n${endDateFormatted}`;

          return (
            <div
              className={`${opacityClass}`}
              onClick={() => onTimelineItemClick(timespan.key)}
              onMouseEnter={() => setHoveredKey(timespan.key)}
              onMouseLeave={() => setHoveredKey(null)}
              style={{
                zIndex: finalZIndex + ((isHovered || isActive) ? 1 : 0),
                transform: isBox ? 'translateX(-50%)' : '',
                transition: 'opacity 300ms ease-in-out 50ms, width 300ms ease-in-out 50ms, transform 300ms ease-in-out 50ms',
              }}
              key={timespan.key}
            >
              <div
                ref={el => { if (el) itemRefs.current.set(timespan.key, el); else itemRefs.current.delete(timespan.key); }}
                className={`absolute ease-in-out
                          ${widthClass}
                          ${itemSpecificClasses}
                          flex items-center justify-center text-white text-xs cursor-pointer`}
                style={{
                  backgroundColor: blockColorClass,
                  opacity: 0.7,
                  top: `${topPositionPx}px`,
                  height: `${Math.max(4, heightPx)}px`,
                  transition: 'width 300ms 50ms, background-color 300ms 50ms, opacity 300ms 50ms'
                }}
                title={titleText}
              />

              { !isBox &&
                <div
                  className={`absolute rounded-full translate-x-[48px] ease-in-out
                            ${pinHeadClass}
                            `}
                  style={{
                    backgroundColor: blockColorClass,
                    top: `${topPositionPx-6}px`,
                    transition: 'width 300ms 50ms, height 300ms 50ms, background-color 300ms 50ms, opacity 300ms 50ms, transform 300ms 50ms'
                  }}
                />
              }
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}