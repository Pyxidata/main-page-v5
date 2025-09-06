import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import HoveringImage from '../../../shared/components/HoveringImage';
import Spacer from '../../../shared/components/spacers/Spacer';
import { SpacerStyle } from '../../../shared/styles/SpacerStyle';
import EditableText from '../../../shared/components/editables/EditableText';
import Text from '../../../shared/components/texts/Text';
import { motion, AnimatePresence } from 'framer-motion';
import EditableField from '../../../shared/components/editables/EditableField';
import { cn } from '../../../util/cn';
import { TextStyle } from '../../../shared/styles/TextStyle';

const db = getDatabase();

interface AboutMeData {
  text: string,
  pfp: string,
}

export default function AboutMe() {
  const [data, setData] = useState<AboutMeData | null>(null);

useEffect(() => {

  const textRef = ref(db, 'aboutMe');
  const unsubscribe = onValue(textRef, (snapshot) => {
    const res = snapshot.val();
    if (res) {
      setData(res as AboutMeData);
    }
  });

  return () => {
    unsubscribe();
  };
}, []);

  return (
    <div className='w-full h-full flex flex-col items-center justify-between'>

      <AnimatePresence>
        <motion.div
        className='absolute top-3 sm:top-16'
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <HoveringImage 
            src={data?.pfp || ""} 
            className="w-32 h-32 sm:w-48 sm:h-48 object-cover" 
            padding={16}
          />
        </motion.div>
      </AnimatePresence>

      <Text 
        text="hihi! im pyxidataa, also known as kevin or k chan" 
        className={cn(TextStyle.Body, "text-[9px] sm:text-base mt-28 sm:mt-52")}
        animate
      />

      <EditableText
        className={cn(TextStyle.Body, "text-[9px] sm:text-base leading-[1.2]")}
        defaultText={data?.text || ""}
        useTextArea
        path="aboutMe"
        field="text"
        label="My description"
        animate
      />

      <EditableField
        defaultValue={data?.pfp || ""}
        path="aboutMe"
        field="pfp"
        label="Profile picture URL"
      />
    </div>
  );
}