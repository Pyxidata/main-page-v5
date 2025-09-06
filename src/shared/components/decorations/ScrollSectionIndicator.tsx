
interface ScrollSectionIndicatorProps {
  numberOfSections: number;
  activeSectionIndex: number;
  onSectionClick: (index: number) => void;
}

export default function ScrollSectionIndicator({
  numberOfSections,
  activeSectionIndex,
  onSectionClick,
}: ScrollSectionIndicatorProps) {

  return (
    <div className="absolute bottom-8 left-8 flex flex-col space-y-4 z-50 opacity-30 hover:opacity-100 transition duration-500">
      {Array.from({ length: numberOfSections }).map((_, index) => (
        <div
          key={index}
          className="w-20 h-20 border-8 border-double border-white/50 cursor-pointer bg-transparent flex items-center justify-center"
          onClick={() => onSectionClick(index)}
        >
          <div
            className={`
              w-6 h-6 absolute 
              transition-all duration-1000 ease-in-out 
              ${activeSectionIndex > index
                ? `bg-white/50`
                : `bg-transparent`}
            `}
            style={{
              transform: `skew(35deg, 35deg) ${activeSectionIndex > index ? 'rotateZ(0deg)' : 'rotateZ(90deg)'}`
            }}
          />

          <div
            className={`
              w-12 h-12 absolute
              transition-all duration-300 ease-in-out
              ${activeSectionIndex === index
                ? `bg-white/50 border-4 border-[#888888]`
                : `bg-transparent border-transparent border-0 hover:border-white/50 hover:border-4` // Inactive state: transparent border, then fades to white on hover
              }
              hover:w-14 hover:h-14
            `}
          />
        </div>
      ))}
    </div>
  );
}