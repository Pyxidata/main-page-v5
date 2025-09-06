
interface ScrollAmountIndicatorProps {
  currentSectionScrollAmount: number;
  sectionHeight: number;
}

export default function ScrollAmountIndicator({
  currentSectionScrollAmount,
  sectionHeight,
}: ScrollAmountIndicatorProps) {
  const numberOfBars = 17;
  const filledBars = Math.round((currentSectionScrollAmount / sectionHeight + 0.5) * numberOfBars);

  return (
    <div className="absolute bottom-10 right-8 flex flex-col-reverse z-50 opacity-30 hover:opacity-100 transition duration-500">
      {Array.from({ length: numberOfBars }).map((_, index) => (
        <div
          key={index}
          className={`
            w-16 h-[2px] rounded-sm my-2
            transition-colors duration-200 ease-in-out
            ${index >= filledBars ? 'bg-white/10' : 'bg-white/50'}
          `}
          style={{
            transform: "rotateZ(-30deg)"
          }}
        />
      ))}
    </div>
  );
}