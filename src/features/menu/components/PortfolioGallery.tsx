import { useRef, useState, useCallback, useEffect } from "react";
import Spacer from "../../../shared/components/spacers/Spacer";
import { SpacerStyle } from "../../../shared/styles/SpacerStyle";
import instagram from '../../../assets/instagram.png';
import pixiv from '../../../assets/pixiv.png';
import twitter from '../../../assets/twitter.png';
import { motion, AnimatePresence } from 'framer-motion';
import GallerysFragment from "./TimelineFragment";
import { cn } from "../../../util/cn";
import BackButton from "../../../shared/components/buttons/BackButton";
import EditableField from "../../../shared/components/editables/EditableField";
import { useUserStore } from "../../../shared/stores/userStore";
import { getDatabase, ref, onValue, set, push, remove } from 'firebase/database';
import EditableText from "../../../shared/components/editables/EditableText";
import { TextStyle } from "../../../shared/styles/TextStyle";
import Text from "../../../shared/components/texts/Text";
import AnimatedHorizontalLine from "../../../shared/components/decorations/AnimatedHorizontalLines";
import Spinner from "../../../shared/components/decorations/Spinner";

const db = getDatabase();

interface GalleryItemData {
  key: string;
  url: string;
  description: string;
}

export default function PortfolioGallery({onBack} : {onBack: () => void}) {
  const [data, setData] = useState<GalleryItemData[] | null>(null);
  const { isEditMode } = useUserStore();
  
  const [showOverlay, setShowOverlay] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOverlay(false);
    }, 4000);

    const galleryRef = ref(db, 'portfolio');
    const unsubscribe = onValue(galleryRef, (snapshot) => {
      const res = snapshot.val();
      if (res) {
        const parsed: GalleryItemData[] = Object.entries(res).map(([key, value]) => ({
          key,
          url: (value as Omit<GalleryItemData, 'key'>).url,
          description: (value as Omit<GalleryItemData, 'key'>).description,
        }));
        setData(parsed);
      } else {
        setData([]);
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const handleAddItem = () => {
    const galleryRef = ref(db, 'portfolio');
    const newItemRef = push(galleryRef);
    set(newItemRef, {
      url: 'https://picsum.photos/300/200',
    });
  };

  const handleRemoveItem = (key: string) => {
    const galleryRef = ref(db, `portfolio/${key}`);
    remove(galleryRef);
  };

  const [socials, setSocials] = useState<{ [key: string]: string }>({});
  useEffect(() => {
    const socialsRef = ref(db, 'socials');
    const unsubscribe = onValue(socialsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSocials(data);
      } else {
        setSocials({});
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const iconStyle = cn(TextStyle.Body, 'transition duration-500 hover:blur-sm');

  return (
    <motion.div
      className={cn("flex flex-col w-full h-full no-scrollbar overflow-y-scroll")}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: {delay:0} }}
      transition={{
        duration: 0.5,
        delay: 1,
      }}
    >

      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="overlay"
            className="absolute inset-0 bg-black z-[1000] flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <Spinner size={250} dotSize={50}/>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className='absolute top-0 sm:top-4 -left-5 sm:left-6 z-[900]'
        initial={{ opacity: 0, translateX: 50 }}
        animate={{ opacity: 1, translateX: 0 }}
        exit={{ opacity: 0, translateX: 0, transition: {delay:0} }}
        transition={{
          duration: 0.5,
          delay: 4
        }}
      >
        <BackButton onClick={onBack} />
      </motion.div>

      <div
        className="relative flex flex-col items-center w-full p-2 sm:p-4 pt-10 sm:pt-20"
      >
        <motion.div
          initial={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ duration: 0.5, delay: 4 }}
        >
          <Text className={TextStyle.Title} text="Portfolio Gallery" animate animationDelay={1} />
        </motion.div>

        <Spacer className={SpacerStyle.Section} />

        <div className='relative flex w-full justify-center'>
          <motion.a 
            href={socials.pixiv} 
            className={iconStyle} 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.5, delay: 3.5 }}
          >
            <img src={pixiv} className="w-8 sm:w-10" />
          </motion.a>
          <Spacer className={SpacerStyle.Item} />
          <motion.a 
            href={socials.twitter} 
            className={iconStyle} 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.5, delay: 3.6 }}
          >
            <img src={twitter} className="w-8 sm:w-10" />
          </motion.a>
          <Spacer className={SpacerStyle.Item} />
          <motion.a 
            href={socials.instagram} 
            className={iconStyle} 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ opacity: 0, translateY: 50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.5, delay: 3.7 }}
          >
            <img src={instagram} className="w-8 sm:w-10" />
          </motion.a>
        </div>

        <Spacer className={SpacerStyle.Section} />
 
        <AnimatedHorizontalLine stay delay={1}/>

        <Spacer className={SpacerStyle.Section} />

        <div className="flex flex-col items-center gap-16 w-2/3">
          {data?.map((item) => (
            <div key={item.key} className="flex flex-col items-center">
              <img src={item.url} alt={`image: ${item.key}`} className="w-screen max-h-screen object-contain" />
              <Spacer className={SpacerStyle.Label} />
              <EditableText
                key={item.description}
                defaultText={item.description}
                className={cn("text-start")}
                useTextArea
                path={`portfolio/${item.key}`}
                field="description"
                label="description text"
                animate
                animationDuration={1500}
              />
              {isEditMode && <Spacer className={SpacerStyle.Gap} />}
              <EditableField
                defaultValue={item.url || ""}
                path={`portfolio/${item.key}`}
                field="url"
                label="Image URL"
              />
              {isEditMode && <Spacer className={SpacerStyle.Gap} />}
              {isEditMode && (
                <button
                  onClick={() => handleRemoveItem(item.key)}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Remove Image
                </button>
              )}
            </div>
          ))}
        </div>
        
        {isEditMode && (
          <>
            <Spacer className={SpacerStyle.Item} />
            <button
              onClick={handleAddItem}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-lg font-semibold"
            >
              + Add New Image
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}