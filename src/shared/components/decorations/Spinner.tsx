
export default function Spinner({
  size = 60,
  dotSize = 10,
  animationDuration = '2s',
} : {
  size?: number;
  dotSize?: number;
  animationDuration?: string;
}) {
  const orbitRadius = (size / 2) - (dotSize / 2);

  const durationInSeconds = parseFloat(animationDuration);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
      }}
    >
      <style>
        {`
          @keyframes groupOrbitClockwise {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(1080deg); }
          }

          @keyframes groupOrbitCounterClockwise {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(-360deg); }
          }

          @keyframes dotTranslateInAndOut {
            0% { transform: translateX(0px); }
            50% { transform: translateX(${orbitRadius}px); }
            100% { transform: translateX(0px); }
          }

          @keyframes dotTranslateOutAndIn {
            0% { transform: translateX(${orbitRadius}px); }
            50% { transform: translateX(0px); }
            100% { transform: translateX(${orbitRadius}px); }
          }
        `}
      </style>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `groupOrbitClockwise ${animationDuration} cubic-bezier(0.8, 0.0, 0.9, 1.0) infinite`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={`dot-cw-${i}`}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `rotate(${i * (360 / 3)}deg)`,
            }}
          >
            <div
              className="absolute rounded-full bg-white/50"
              style={{
                width: dotSize,
                height: dotSize,
                animation: `dotTranslateInAndOut ${durationInSeconds}s linear infinite`,
              }}
            />
          </div>
        ))}
      </div>

      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          animation: `groupOrbitCounterClockwise ${animationDuration} cubic-bezier(0.8, 0.0, 0.9, 1.0) infinite`,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={`dot-ccw-${i}`}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transform: `rotate(${i * (360 / 3) + 60}deg)`,
            }}
          >
            <div
              className="absolute rounded-full bg-transparent border-2 border-white/50"
              style={{
                width: dotSize,
                height: dotSize,
                animation: `dotTranslateOutAndIn ${durationInSeconds}s linear infinite`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
