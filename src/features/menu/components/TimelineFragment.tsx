import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import EditableField from "../../../shared/components/editables/EditableField";
import { TextStyle } from "../../../shared/styles/TextStyle";
import { cn } from "../../../util/cn";
import Text from "../../../shared/components/texts/Text";
import Spacer from "../../../shared/components/spacers/Spacer";
import { SpacerStyle } from "../../../shared/styles/SpacerStyle";
import EditableText from "../../../shared/components/editables/EditableText";
import { useUserStore } from "../../../shared/stores/userStore";
import { ref, onValue, push, update, remove, getDatabase } from "firebase/database";
import { FragmentItemData } from "./TimelineGallery";

const db = getDatabase();

interface TimelineFragmentProps {
  getCoordinatesRef?: React.MutableRefObject<(() => FragmentItemData[]) | null>;
  scrollableParentRef: React.RefObject<HTMLDivElement>;
  activeFragmentKey: string | null;
}

type Art = {
  key: string;
  img: string;
}

type TimelineItem = {
  title: string;
  startDate: string;
  endDate?: string;
  description: string;
  arts: Record<string, Art>;
  color: string;
}

type TimelineItemWithKey = TimelineItem & { firebaseKey: string };

export default function TimelineFragment({ getCoordinatesRef, scrollableParentRef, activeFragmentKey }: TimelineFragmentProps) {
  const { isEditMode } = useUserStore();
  const [localGallerys, setLocalGallerys] = useState<TimelineItemWithKey[]>([]);
  const [imgEnabled, setImgEnabled] = useState(false);

  const galleryItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const initialScrollDoneRef = useRef(false);

  useEffect(() => {
    const galleryRef = ref(db, 'gallery/');
    const unsubscribe = onValue(galleryRef, (snapshot) => {
      const data = snapshot.val();
      const loadedGallerys: TimelineItemWithKey[] = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          loadedGallerys.push({
            firebaseKey: key,
            ...data[key],
            color: data[key].color || "#ffffff",
          });
        });
      }
      loadedGallerys.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      setLocalGallerys(loadedGallerys);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const calculateGalleryData = useCallback(() => {
    const data: FragmentItemData[] = [];
    const parentDiv = scrollableParentRef.current;

    if (!parentDiv) {
      return [];
    }

    const parentRect = parentDiv.getBoundingClientRect();

    localGallerys.forEach((item) => {
      const itemDiv = galleryItemRefs.current.get(item.firebaseKey);
      if (itemDiv) {
        const itemRect = itemDiv.getBoundingClientRect();
        const relativeX = itemRect.left - parentRect.left;
        const relativeY = itemRect.top - parentRect.top;

        const startDateMs = item.startDate ? new Date(item.startDate).getTime() : 0;
        const endDateMs = item.endDate ? new Date(item.endDate).getTime() : new Date().getTime();

        data.push({
          key: `gallery-${item.title.replace(/\s+/g, '-')}-${startDateMs}`,
          x: relativeX,
          y: relativeY,
          height: itemRect.height,
          title: item.title,
          startDate: startDateMs,
          endDate: endDateMs,
          color: item.color,
        });
      }
    });
    return data;
  }, [localGallerys, scrollableParentRef]);

  useLayoutEffect(() => {
    if (getCoordinatesRef) {
      getCoordinatesRef.current = calculateGalleryData;
    }
  }, [getCoordinatesRef, calculateGalleryData]);

  useEffect(() => {
    if (localGallerys.length > 0 && scrollableParentRef.current && !initialScrollDoneRef.current) {
      const firstGalleryKey = localGallerys[0].firebaseKey;
      const firstGalleryDiv = galleryItemRefs.current.get(firstGalleryKey);

      if (firstGalleryDiv) {
        const parentRect = scrollableParentRef.current.getBoundingClientRect();
        const itemRect = firstGalleryDiv.getBoundingClientRect();

        const targetScrollTop = (itemRect.top - parentRect.top) + scrollableParentRef.current.scrollTop - 180;

        scrollableParentRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth'
        });
        initialScrollDoneRef.current = true;
      }
    }
  }, [localGallerys, scrollableParentRef]);

  const handleAddGallery = () => {
    const newGalleryRef = push(ref(db, 'gallery/'));
    const newGallery: TimelineItem = {
      title: "New Timespan",
      startDate: `${new Date().getFullYear() - 1}-01-01`,
      endDate: new Date().toISOString().split('T')[0],
      description: "Description of this timespan",
      arts: {},
      color: "#ffffff",
    };
    update(newGalleryRef, newGallery);
  };

  const handleRemoveGallery = (keyToRemove: string) => {
    const galleryRef = ref(db, `gallery/${keyToRemove}`);
    remove(galleryRef);
  };

  const handleAddArt = (galleryKey: string) => {
    const newArtKey = `art-${Date.now()}`;
    const newArt = { key: newArtKey, img: "https://picsum.photos/200/300" };
    const artRef = ref(db, `gallery/${galleryKey}/arts/${newArtKey}`);
    update(artRef, newArt);
  };

  const handleRemoveArt = (galleryKey: string, artKey: string) => {
    const artRef = ref(db, `gallery/${galleryKey}/arts/${artKey}`);
    remove(artRef);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setImgEnabled(true)
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center w-full">
      <Spacer className={SpacerStyle.Paragraph} />
      <div className="flex flex-col gap-4 items-end w-full">
        {localGallerys.map((item) => {
          const startDateMs = item.startDate ? new Date(item.startDate).getTime() : 0;
          const itemKey = `gallery-${item.title.replace(/\s+/g, '-')}-${startDateMs}`;
          const isActive = itemKey === activeFragmentKey;
          const borderClass = isActive ? "border-white border-2 xl:-translate-x-[32px]" : "border-white/30 border-2";

          return (
            <div
              key={item.firebaseKey}
              ref={(el) => {
                if (el) {
                  galleryItemRefs.current.set(item.firebaseKey, el);
                } else {
                  galleryItemRefs.current.delete(item.firebaseKey);
                }
              }}
              className={cn(
                "flex w-full xl:w-[calc(100%-32px)] shadow-md p-4 relative transition-all duration-300 ease-in-out min-h-[300px] overflow-x-auto pr-4",
                borderClass
              )}
            >
              {isEditMode && (
                <button
                  onClick={() => handleRemoveGallery(item.firebaseKey)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm cursor-pointer z-10"
                  title="Remove Gallery"
                >
                  &times;
                </button>
              )}
              {/* Left side for text content */}
              <div className="flex flex-col pr-4 min-w-[300px] max-w-[300px]">
                <EditableText
                  defaultText={item.title}
                  className={cn(TextStyle.Subtitle, "mb-1 text-start sm:text-center")}
                  path={`gallery/${item.firebaseKey}`}
                  field="title"
                  label="Company Name"
                />
                <Text
                  text={`${item.startDate ? new Date(item.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''} - ${item.endDate ? new Date(item.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Present'}`}
                  className={cn(TextStyle.Label, "text-white/50 mb-2 text-start sm:text-center")}
                />
                {isEditMode && (
                  <>
                    <Spacer className={SpacerStyle.Item} />
                    <EditableField
                      defaultValue={item.startDate || ""}
                      path={`gallery/${item.firebaseKey}`}
                      field="startDate"
                      label="Start Date"
                      type="date"
                    />
                    <Spacer className={SpacerStyle.Item} />
                    <EditableField
                      defaultValue={item.endDate || ""}
                      path={`gallery/${item.firebaseKey}`}
                      field="endDate"
                      label="End Date (leave blank for Present)"
                      type="date"
                    />
                    <Spacer className={SpacerStyle.Item} />
                    <EditableField
                      defaultValue={item.color || "#ffffff"}
                      path={`gallery/${item.firebaseKey}`}
                      field="color"
                      label="Timeline Color"
                      type="color"
                    />
                  </>
                )}
                <EditableText
                  defaultText={item.description}
                  className={cn(TextStyle.Body, "text-white/30 text-start")}
                  path={`gallery/${item.firebaseKey}`}
                  field="description"
                  useTextArea
                  label="Description"
                />
              </div>

              {/* Right side for horizontally scrollable images */}
              <div className="flex-1 w-full flex gap-2 items-center lg:overflow-x-auto">
                {isEditMode && (
                  <button
                    onClick={() => handleAddArt(item.firebaseKey)}
                    className="flex-shrink-0 w-24 h-24 rounded-md bg-gray-700 text-white flex items-center justify-center text-3xl font-light hover:bg-gray-600 transition-colors"
                    title="Add Art"
                  >
                    +
                  </button>
                )}
                {item.arts && Object.entries(item.arts).reverse().map(([artKey, art]) => (
                  <div key={artKey} className="relative group flex-shrink-0">
                    {imgEnabled &&
                      <img src={art.img} alt="Art" className="h-64 object-contain rounded-md" />
                    }
                    <EditableField
                      defaultValue={art.img || ""}
                      path={`gallery/${item.firebaseKey}/arts/${artKey}`}
                      field="img"
                      label="Image URL"
                    />      
                    {isEditMode && (                
                      <button
                        onClick={() => handleRemoveArt(item.firebaseKey, artKey)}
                        className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white w-6 h-6 flex items-center justify-center rounded-full text-sm cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Art"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                <div className="lg:hidden">&nbsp;</div>
              </div>
            </div>
          );
        })}
        {isEditMode && (
          <button
            onClick={handleAddGallery}
            className="mt-4 px-4 py-2 rounded-md bg-green-500 text-white text-base font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 z-[1000]"
          >
            + Add Gallery
          </button>
        )}
      </div>
    </div>
  );
}