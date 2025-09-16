import { useRef, useState, useCallback, useEffect } from "react";
import Spacer from "../../../shared/components/spacers/Spacer";
import { SpacerStyle } from "../../../shared/styles/SpacerStyle";
import ConnectingLines, { Point } from "../../../shared/components/decorations/ConnectingLines";
import Timeline, { Timespan } from "../../../shared/components/Timeline";
import { motion, AnimatePresence } from 'framer-motion';
import GallerysFragment from "./TimelineFragment";
import { cn } from "../../../util/cn";
import BackButton from "../../../shared/components/buttons/BackButton";

export interface FragmentItemData {
  key: string;
  x: number;
  y: number;
  height: number;
  title: string;
  startDate?: number;
  endDate: number;
  color: string;
}

const getTimelineItemData = (item: FragmentItemData): Timespan => {
  const convertedStartDate = item.startDate ? new Date(item.startDate).getTime() : undefined;
  const convertedEndDate = new Date(item.endDate).getTime();

  return {
    key: item.key,
    title: item.title,
    startDate: convertedStartDate,
    endDate: convertedEndDate,
    color: item.color
  };
};

export default function TimelineGallery({onBack} : {onBack: () => void}) {
  const [pointsToConnect, setPointsToConnect] = useState<[Point, Point, Point, Point]>([
    {x:0, y:0}, {x:0, y:0}, {x:0, y:0}, {x:0, y:0}
  ]);
  const [timelineItems, setTimelineItems] = useState<Timespan[]>([]);
  const [activeTimelineItemInfo, setActiveTimelineItemInfo] = useState<{ key: string | null; coordinates: Point | null }>({ key: null, coordinates: null });
  const [connectingLinesDisabled, setConnectingLinesDisabled] = useState(true);
  const [connectingLinesVisible, setConnectingLinesVisible] = useState(false);
  const [connectingLinesOffset, setConnectingLinesOffset] = useState(120);

  const pageDivRef = useRef<HTMLDivElement>(null);
  const scrollableContentDivRef = useRef<HTMLDivElement>(null);
  const commonLayoutParentRef = useRef<HTMLDivElement>(null);
  const getActiveTimelineItemCoordinatesRef = useRef<(() => Point | null)>(() => null);
  
  const lastScrollTimeRef = useRef(Date.now());

  const fragmentCoordinatesRefs = {
    miscellaneous: useRef<(() => FragmentItemData[]) | null>(null),
  };

  const areTimelineItemsEqual = (a: Timespan[], b: Timespan[]): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const itemA = a[i];
      const itemB = b[i];
      if (itemA.key !== itemB.key) {
        return false;
      }
    }
    return true;
  };

  const arePointsEqual = (a: [Point, Point, Point, Point], b: [Point, Point, Point, Point]): boolean => {
    for (let i = 0; i < a.length; i++) {
      if (a[i].x !== b[i].x || a[i].y !== b[i].y) {
        return false;
      }
    }
    return true;
  };

  const getAllFragmentItems = useCallback((): FragmentItemData[] => {
    const rawFragmentItems: FragmentItemData[] = [];
    if (fragmentCoordinatesRefs.miscellaneous.current) {
      rawFragmentItems.push(...fragmentCoordinatesRefs.miscellaneous.current());
    }
    return rawFragmentItems;
  }, [fragmentCoordinatesRefs]);

  useEffect(() => {
    const rawFragmentItems = getAllFragmentItems();
    const newProcessedTimelineItems: Timespan[] = rawFragmentItems.map(getTimelineItemData);

    setTimelineItems(prevItems => {
      if (!areTimelineItemsEqual(prevItems, newProcessedTimelineItems)) {
        return newProcessedTimelineItems;
      }
      return prevItems;
    });
  }, []);

  const updateCoordinatesAndState = useCallback(() => {
    const internalScrollDiv = scrollableContentDivRef.current;
    const commonParentDiv = commonLayoutParentRef.current;
    const pageLayoutDiv = pageDivRef.current;

    if (!internalScrollDiv || !commonParentDiv || !pageLayoutDiv) {
      return;
    }

    const commonParentRect = commonParentDiv.getBoundingClientRect();
    const scrollableHeight = internalScrollDiv.scrollHeight - internalScrollDiv.offsetHeight;

    let scrollPercentage = 0;
    if (scrollableHeight > 0) {
      scrollPercentage = internalScrollDiv.scrollTop / scrollableHeight;
    }

    const rawFragmentItems = getAllFragmentItems();

    const newProcessedTimelineItems: Timespan[] = rawFragmentItems.map(getTimelineItemData);
    setTimelineItems(prevItems => {
      if (!areTimelineItemsEqual(prevItems, newProcessedTimelineItems)) {
        return newProcessedTimelineItems;
      }
      return prevItems;
    });

    let selectedFragmentItem: FragmentItemData | null = null;
    let minDifference = Infinity;

    if (rawFragmentItems.length > 0 && internalScrollDiv.scrollHeight > 0) {
      rawFragmentItems.forEach(item => {
        const itemCenterYInScrollContent = item.y + internalScrollDiv.scrollTop + item.height / 2;
        const itemPercentage = itemCenterYInScrollContent / internalScrollDiv.scrollHeight;

        const difference = Math.abs(itemPercentage - scrollPercentage);

        if (difference < minDifference) {
          minDifference = difference;
          selectedFragmentItem = item;
        }
      });
    }

    let p4_x = 0;
    let p4_y = 0;
    let selectedItemKeyForConnection: string | null = null;
    const scrollDivRect = internalScrollDiv.getBoundingClientRect();

    if (selectedFragmentItem) {
      const item: FragmentItemData = selectedFragmentItem
      p4_y = (item.y + item.height / 2) + (scrollDivRect.top - commonParentRect.top);
      p4_x = scrollDivRect.left - commonParentRect.left + 16;
      selectedItemKeyForConnection = item.key;
    } else {
      p4_x = scrollDivRect.left - commonParentRect.left + 16;
      p4_y = scrollDivRect.top - commonParentRect.top;
      selectedItemKeyForConnection = null;
    }

    const scrollDivTopRelativeToCommonParent = scrollDivRect.top - commonParentRect.top;
    const scrollDivBottomRelativeToCommonParent = scrollDivRect.bottom - commonParentRect.top;

    p4_y = Math.max(scrollDivTopRelativeToCommonParent + 8, Math.min(p4_y, scrollDivBottomRelativeToCommonParent - 8));

    setActiveTimelineItemInfo(prevInfo => {
      if (prevInfo.key !== selectedItemKeyForConnection) {
        return { key: selectedItemKeyForConnection, coordinates: null };
      }
      return prevInfo;
    });

    let p1_x = Infinity;
    let p1_y = 0;

    if (activeTimelineItemInfo.key === selectedItemKeyForConnection && activeTimelineItemInfo.coordinates) {
      p1_x = activeTimelineItemInfo.coordinates.x;
      p1_y = activeTimelineItemInfo.coordinates.y;

      const p2_x = p4_x - connectingLinesOffset;
      const p2_y = p1_y;

      const p3_x = p4_x - connectingLinesOffset;
      const p3_y = p4_y;

      const newPointsToConnect: [Point, Point, Point, Point] = [
        { x: p1_x, y: p1_y },
        { x: p2_x, y: p2_y },
        { x: p3_x, y: p3_y },
        { x: p4_x, y: p4_y },
      ];

      setPointsToConnect(prevPoints => {
        if (!arePointsEqual(prevPoints, newPointsToConnect)) {
          return newPointsToConnect;
        }
        return prevPoints;
      });
    }
  }, [activeTimelineItemInfo, connectingLinesOffset]);

  useEffect(() => {
    const internalScrollDiv = scrollableContentDivRef.current;
    const pageLayoutDiv = pageDivRef.current;

    const handleScrollEvent = () => {
      if (!connectingLinesDisabled) {
        lastScrollTimeRef.current = Date.now();
        setConnectingLinesVisible(false);
        updateCoordinatesAndState();
      }
    };

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (!connectingLinesDisabled && now - lastScrollTimeRef.current > 200 && !connectingLinesVisible) {
        setConnectingLinesVisible(true);
      }
    }, 400);

    if (internalScrollDiv) {
      internalScrollDiv.addEventListener('scroll', handleScrollEvent);
    }
    if (pageLayoutDiv) {
      pageLayoutDiv.addEventListener('scroll', handleScrollEvent);
    }

    // Initial call to set up coordinates
    updateCoordinatesAndState();

    return () => {
      clearTimeout(intervalId);

      if (internalScrollDiv) {
        internalScrollDiv.removeEventListener('scroll', handleScrollEvent);
      }
      if (pageLayoutDiv) {
        pageLayoutDiv.removeEventListener('scroll', handleScrollEvent);
      }
    };
  }, [connectingLinesVisible]);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setConnectingLinesDisabled(false)
      setConnectingLinesVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const scrollDiv = scrollableContentDivRef.current;
    if (!scrollDiv) return;

    const resizeObserver = new ResizeObserver(() => {
      updateCoordinatesAndState();
    });

    Array.from(scrollDiv.children).forEach((child) => {
      resizeObserver.observe(child);
    });

    resizeObserver.observe(scrollDiv);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleGlobalResize = () => {
      if (window.innerWidth < 420) {
        setConnectingLinesOffset(20);
      } else if (window.innerWidth < 640) {
        setConnectingLinesOffset(30);
      } else if (window.innerWidth < 768) {
        setConnectingLinesOffset(45);
      } else if (window.innerWidth < 1024) {
        setConnectingLinesOffset(60);
      } else if (window.innerWidth < 1280) {
        setConnectingLinesOffset(90);
      } else if (window.innerWidth < 1536) {
        setConnectingLinesOffset(60);
      } else {
        setConnectingLinesOffset(90);
      }
      
      setTimeout(() => {
        setActiveTimelineItemInfo(prevInfo => {
            if (prevInfo.key && getActiveTimelineItemCoordinatesRef.current) {
                const newCoordinates = getActiveTimelineItemCoordinatesRef.current();
                return { key: prevInfo.key, coordinates: newCoordinates };
            }
            return { key: prevInfo.key, coordinates: null };
        });
        updateCoordinatesAndState();
      }, 100);
    };
    
    handleGlobalResize();

    window.addEventListener('resize', handleGlobalResize);
    return () => {
        window.removeEventListener('resize', handleGlobalResize);
    };
  }, [updateCoordinatesAndState]);

  useEffect(() => {
    const handleGlobalResize = () => {
      setTimeout(() => {
        setActiveTimelineItemInfo(prevInfo => {
            if (prevInfo.key && getActiveTimelineItemCoordinatesRef.current) {
                const newCoordinates = getActiveTimelineItemCoordinatesRef.current();
                return { key: prevInfo.key, coordinates: newCoordinates };
            }
            return { key: prevInfo.key, coordinates: null };
        });
        updateCoordinatesAndState();
      }, 100);
    };
    window.addEventListener('resize', handleGlobalResize);
    return () => {
        window.removeEventListener('resize', handleGlobalResize);
    };
  }, []);

  const handleTimelineItemCoordinateUpdate = useCallback((key: string | null, x: number, y: number) => {
    const commonParentDiv = commonLayoutParentRef.current;
    if (key && commonParentDiv) {
      const commonParentRect = commonParentDiv.getBoundingClientRect();
      setActiveTimelineItemInfo({ key: key, coordinates: { x: x - commonParentRect.left, y: y - commonParentRect.top } });
    } else {
      setActiveTimelineItemInfo({ key: null, coordinates: null });
    }
  }, []);

  const [timelineMetrics, setTimelineMetrics] = useState<{ minTime: number; maxTime: number; pixelsPerMs: number; timelineHeightPx: number } | null>(null);

  const handleTimelineMetricsUpdate = useCallback((metrics: { minTime: number; maxTime: number; pixelsPerMs: number; timelineHeightPx: number }) => {
    setTimelineMetrics(metrics);
  }, []);

  const handleTimelineItemClick = useCallback((clickedKey: string) => {
    const scrollDiv = scrollableContentDivRef.current;
    const pageLayoutDiv = pageDivRef.current;
    
    if (!scrollDiv || !timelineMetrics || timelineItems.length === 0 || !pageLayoutDiv) {
      return;
    }

    const targetFragment = getAllFragmentItems().find(item => item.key === clickedKey);

    if (!targetFragment) {
      return;
    }

    const rawFragmentItems = getAllFragmentItems();
    if (rawFragmentItems.length === 0) {
      return;
    }

    let minY = Infinity;
    let maxY = -Infinity;

    rawFragmentItems.forEach(item => {
      const itemCenterY = item.y + item.height / 2;
      minY = Math.min(minY, itemCenterY);
      maxY = Math.max(maxY, itemCenterY);
    });

    const totalContentHeightBetweenExtremes = maxY - minY;
    
    const targetItemCenterY = targetFragment.y + targetFragment.height / 2;
    const relativeTargetY = targetItemCenterY - minY;

    let targetScrollPercentage = 0;
    if (totalContentHeightBetweenExtremes > 0) {
      targetScrollPercentage = relativeTargetY / totalContentHeightBetweenExtremes;
    }

    const internalScrollableHeight = scrollDiv.scrollHeight - scrollDiv.offsetHeight;
    const finalScrollTop = targetScrollPercentage * internalScrollableHeight + 10;

    scrollDiv.scrollTo({
      top: finalScrollTop,
      behavior: 'smooth',
    });
  }, [timelineMetrics, timelineItems, getAllFragmentItems]);

  const snapY = useCallback(() => {
    if (typeof window === 'undefined') return false;
    if (window.innerHeight >= 720) return true;
    return false;
  }, [])
  
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (scrollableContentDivRef.current) {
  //       scrollableContentDivRef.current.scrollTo({
  //         top: scrollableContentDivRef.current.scrollHeight,
  //       });
  //     }
  //   }, 800);
  //   return () => clearTimeout(timer);
  // }, []);

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     if (scrollableContentDivRef.current) {
  //       scrollableContentDivRef.current.scrollTo({
  //         top: 0,
  //         behavior: 'smooth',
  //       });
  //     }
  //   }, 2000);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div
      className={cn("flex flex-col w-[90%] h-full", snapY() && "snap-y snap-mandatory")}
      ref={pageDivRef}
    >
      <motion.div
        className='absolute top-0 sm:top-4 -left-5 sm:left-6 z-[900]'
        initial={{ opacity: 0, translateX: 50 }}
        animate={{ opacity: 1, translateX: 0 }}
        exit={{ opacity: 0, translateX: 0, transition: {delay:0} }}
        transition={{
          duration: 0.5,
          delay: 0.5
        }}
      >
        <BackButton onClick={onBack} />
      </motion.div>

      <div
        className="relative flex items-center justify-between w-full h-full ml-2 sm:ml-16"
        ref={commonLayoutParentRef}
      >
        {/* Timeline + Connecting Lines */}
        <>
          <AnimatePresence>
            {connectingLinesVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0"
              >
                <ConnectingLines
                  points={pointsToConnect}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Timeline
            timespans={timelineItems}
            scrollableParentRef={scrollableContentDivRef}
            onActiveItemChange={handleTimelineItemCoordinateUpdate}
            activeItemKeyFromParent={activeTimelineItemInfo.key}
            onTimelineItemClick={handleTimelineItemClick}
            onMetricsUpdate={handleTimelineMetricsUpdate}
            getActiveTimelineItemCoordinatesRef={getActiveTimelineItemCoordinatesRef}
          />
        </>

        {/* Scrollable gallery list */}
        <div className='w-[80%] sm:w-[75%] xl:w-[85%] max-h-[90%] flex justify-center sm:mr-12 lg:mr-8'>
          <AnimatePresence>
            <motion.div
              className="max-h-[90%] flex flex-col overflow-y-scroll px-4"
              style={{
                borderTopWidth: 4, 
                borderBottomWidth: 4, 
                borderColor: "#888888",
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              ref={scrollableContentDivRef}
              initial={{ opacity: 0, width: "0%" }}
              animate={{ opacity: 1, width: "100%" }}
              exit={{ opacity: 0, width: "0%", transition: {delay:0} }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.5 }}
              >

                <Spacer className={SpacerStyle.Item} />
                <GallerysFragment
                  getCoordinatesRef={fragmentCoordinatesRefs.miscellaneous}
                  scrollableParentRef={scrollableContentDivRef}
                  activeFragmentKey={activeTimelineItemInfo.key}
                />
                <Spacer className={SpacerStyle.Item} />

              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}