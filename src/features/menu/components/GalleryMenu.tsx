import Spacer from '../../../shared/components/spacers/Spacer';
import { SpacerStyle } from '../../../shared/styles/SpacerStyle';
import Text from '../../../shared/components/texts/Text';
import { cn } from '../../../util/cn';
import { TextStyle } from '../../../shared/styles/TextStyle';
import historyIcon from '../../../assets/history.svg';
import portfolioIcon from '../../../assets/portfolio.svg';

export default function GalleryMenu({
  onPortfolioClick,
  onTimelineClick,
} : {
  onPortfolioClick: () => void;
  onTimelineClick: () => void;
}) {

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Text text="click to see some drawings i've made!" animate />

      <Spacer className='h-8 sm:h-16' />

      {/* Misc Items Row */}
      <div className="w-full flex flex-row flex-wrap justify-evenly">
        <div className="flex flex-col items-center w-2/5">
          <button
            onClick={onPortfolioClick}
            className="block hover:scale-105 transition duration-500 border-2 sm:border-4 border-white/50 hover:border-white"
          >
            <img src={portfolioIcon} className="w-20 h-20 sm:w-40 sm:h-40 p-2 sm:p-4 object-cover" />
          </button>

          <Spacer className='h-4 sm:h-8' />

          <Text
            className={cn(TextStyle.Body, "text-[10px] sm:text-base")}
            text="Portfolio"
            animate
          />
        </div>

        <div className="flex flex-col items-center w-2/5">
          <button
            onClick={onTimelineClick}
            className="block hover:scale-105 transition duration-500 border-2 sm:border-4 border-white/50 hover:border-white"
          >
            <img src={historyIcon} className="w-20 h-20 sm:w-40 sm:h-40 p-2 sm:p-4 object-cover" />
          </button>

          <Spacer className='h-4 sm:h-8' />

          <Text
            className={cn(TextStyle.Body, "text-[10px] sm:text-base")}
            text="Timeline"
            animate
          />
        </div>
      </div>
    </div>
  );
}
