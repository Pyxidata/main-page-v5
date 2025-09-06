import { useState } from 'react';
import { TextStyle } from '../../styles/TextStyle';
import { cn } from '../../../util/cn';


export default function Swapper({
  leftLabel = "Left",
  rightLabel = "Right",
  className = "",
  onChange,
  isLeftByDefault = true,
} : {
  leftLabel: string;
  rightLabel: string;
  className?: string;
  onChange?: (swapped: boolean) => void;
  isLeftByDefault?: boolean;
}) {
  const [isLeftActive, setIsLeftActive] = useState(isLeftByDefault);

  const handleLeftClick = () => {
    if (!isLeftActive) {
      setIsLeftActive(true);
      if (onChange) {
        onChange(true);
      }
    }
  };

  const handleRightClick = () => {
    if (isLeftActive) {
      setIsLeftActive(false);
      if (onChange) {
        onChange(false);
      }
    }
  };

  const buttonBaseStyle = `
    flex-1 text-center py-2 px-4 cursor-pointer relative z-10
    transition-colors duration-200 ease-in-out
    text-lg sm:text-2xl
  `;

  return (
    <div className={`
      relative flex justify-center items-center
      w-64 sm:w-96 mx-auto
      border-2 border-white overflow-hidden
      ${className}
    `}>
      <div
        className={`
          absolute top-0 h-full bg-white
          transition-all duration-300 ease-in-out
        `}
        style={{
          width: '50%',
          left: isLeftActive ? '0%' : '50%',
        }}
      ></div>

      <button
        className={cn(
          TextStyle.Subtitle,
          buttonBaseStyle,
          isLeftActive ? 'text-black' : 'text-white'
        )}
        onClick={handleLeftClick}
      >
        {leftLabel}
      </button>

      <button
        className={cn(
          TextStyle.Subtitle,
          buttonBaseStyle,
          !isLeftActive ? 'text-black' : 'text-white'
        )}
        onClick={handleRightClick}
      >
        {rightLabel}
      </button>
    </div>
  );
}
