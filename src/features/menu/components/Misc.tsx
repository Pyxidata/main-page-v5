import { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, set, push, remove } from 'firebase/database';
import Spacer from '../../../shared/components/spacers/Spacer';
import { SpacerStyle } from '../../../shared/styles/SpacerStyle';
import EditableText from '../../../shared/components/editables/EditableText';
import Text from '../../../shared/components/texts/Text';
import EditableField from '../../../shared/components/editables/EditableField';
import { useUserStore } from '../../../shared/stores/userStore';
import { cn } from '../../../util/cn';
import { TextStyle } from '../../../shared/styles/TextStyle';

const db = getDatabase();

interface MiscData {
  text: string;
  url: string;
  miscItems: MiscItemData[];
}

interface MiscItemData {
  key: string; // firebase child key
  img: string;
  text: string;
  url: string;
}

export default function Misc() {
  const [data, setData] = useState<MiscData | null>(null);
  const { isEditMode } = useUserStore();

  useEffect(() => {
    const textRef = ref(db, 'misc');
    const unsubscribe = onValue(textRef, (snapshot) => {
      const res = snapshot.val();
      if (res) {
        const parsed: MiscData = {
          ...res,
          miscItems: res.miscItems
            ? Object.entries(res.miscItems).map(([key, value]) => ({
                key,
                ...(value as Omit<MiscItemData, 'key'>),
              }))
            : [],
        };
        setData(parsed);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAddItem = () => {
    const miscRef = ref(db, 'misc/miscItems');
    const newItemRef = push(miscRef);
    set(newItemRef, {
      img: '',
      text: 'New Item',
      url: '',
    });
  };

  const handleRemoveItem = (key: string) => {
    const miscRef = ref(db, `misc/miscItems/${key}`);
    remove(miscRef);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Text text="here are some other neat stuff i made!" animate />

      <Spacer className='h-8 sm:h-16' />

      {/* Misc Items Row */}
      <div className="w-full flex flex-row flex-wrap justify-evenly">
        {data?.miscItems?.map((item) => (
          <div key={item.key} className="flex flex-col items-center w-2/5">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block hover:scale-105 transition duration-500 border-2 sm:border-4 border-white/50 hover:border-white"
            >
              <img src={item.img} alt={item.text} className="w-20 h-20 sm:w-40 sm:h-40 p-2 sm:p-4 object-cover" />
            </a>

            <Spacer className='h-4 sm:h-8' />

            <EditableText
              className={cn(TextStyle.Body, "text-[10px] sm:text-base")}
              defaultText={item.text}
              path={`misc/miscItems/${item.key}`}
              field="text"
              label="Item description"
              animate
            />

            { isEditMode && <Spacer className={SpacerStyle.Gap} />}
            <EditableField
              defaultValue={item.img || ""}
              path={`misc/miscItems/${item.key}`}
              field="img"
              label="Image URL"
            />
            { isEditMode && <Spacer className={SpacerStyle.Gap} />}
            <EditableField
              defaultValue={item.url || ""}
              path={`misc/miscItems/${item.key}`}
              field="url"
              label="Link URL"
            />
            { isEditMode && <Spacer className={SpacerStyle.Gap} />}
            { isEditMode &&
              <button
                onClick={() => handleRemoveItem(item.key)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            }
          </div>
        ))}
      </div>

      { isEditMode &&
        <>
          <Spacer className={SpacerStyle.Item} />

          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            + Add Item
          </button>
        </>
      }
    </div>
  );
}
