import { cn } from "../../../util/cn";


export default function AnimatedChevron({
  flip = false,
  className = "",
} : {
  flip?: boolean;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-center">
      <svg
        className={cn("absolute animate-bounce translate-y-10", flip && "rotate-180", className)}
        viewBox="0 0 100 50"
        fill="none"
      >
        <polyline
          points="10,10 50,40 90,10"
          className="stroke-white opacity-60"
        />
      </svg>

      <svg
        className={cn("absolute delay-100 animate-bounce", flip && "rotate-180", className)}
        viewBox="0 0 100 50"
        fill="none"
      >
        <polyline
          points="10,10 50,40 90,10"
          className="stroke-white opacity-40"
        />
      </svg>

      <svg
        className={cn("absolute delay-200 animate-bounce -translate-y-10", flip && "rotate-180", className)}
        viewBox="0 0 100 50"
        fill="none"
      >
        <polyline
          points="10,10 50,40 90,10"
          className="stroke-white opacity-20"
        />
      </svg>
    </div>
 );
}