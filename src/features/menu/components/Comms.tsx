import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue } from 'firebase/database';
import HoveringImage from '../../../shared/components/HoveringImage';
import Spacer from '../../../shared/components/spacers/Spacer';
import { SpacerStyle } from '../../../shared/styles/SpacerStyle';
import EditableText from '../../../shared/components/editables/EditableText';
import Text from '../../../shared/components/texts/Text';
import VGenLogo from '../../../assets/vgen.png';
import AnimatedChevron from '../../../shared/components/decorations/AnimatedChevron';
import { cn } from '../../../util/cn';
import { TextStyle } from '../../../shared/styles/TextStyle';

const db = getDatabase();

interface CommsData {
  text: string,
  url: string,
}

export default function Comms() {
  const [data, setData] = useState<CommsData | null>(null);

useEffect(() => {

  const textRef = ref(db, 'comms');
  const unsubscribe = onValue(textRef, (snapshot) => {
    const res = snapshot.val();
    if (res) {
      setData(res as CommsData);
    }
  });

  return () => {
    unsubscribe();
  };
}, []);

  return (
    <div className='w-full h-full flex flex-col items-center justify-center'>

      <Text 
        text="i primarily do commissions on vgen!"
        animate
      />

      <Spacer className='h-40 sm:h-80' />

      <div className="absolute left-20 sm:left-40" style={{ transform: 'rotate(270deg)' }}>
        <AnimatedChevron className='w-12 sm:w-24'/>
      </div>

      <a
        className="absolute w-24 h-24 sm:w-48 sm:h-48 rounded-full bg-white/50 hover:bg-[#B8FF26] transition duration-500"
        href={data?.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img src={VGenLogo} />
      </a>

      <div className="absolute right-20 sm:right-40" style={{ transform: 'rotate(90deg)' }}>
        <AnimatedChevron className='w-12 sm:w-24'/>
      </div>

      <EditableText
        className={cn(TextStyle.Body, "text-[9px] sm:text-base")}
        defaultText={data?.text || ""}
        useTextArea
        path="comms"
        field="text"
        label="Description"
        animate
      />
    </div>
  );
}