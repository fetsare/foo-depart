import Image from "next/image";

interface LastMetroWarningProps {
  isUrgentDeparture: boolean;
  urgentDepartureTime?: number;
}

export default function LastMetroWarning({
  isUrgentDeparture,
  urgentDepartureTime,
}: LastMetroWarningProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ animation: "custom-pulse 20s ease-in-out infinite" }}
    >
      <div className="bg-red-600 border-8 border-red-800 rounded-3xl p-8 md:p-16 lg:p-24 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-4 mb-4 md:mb-8">
            <Image
              src="/razor.png"
              alt="Warning"
              width={120}
              height={120}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 animate-spin"
            />
            <p className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold text-white">
              LAST METRO
            </p>
            <Image
              src="/razor.png"
              alt="Warning"
              width={120}
              height={120}
              className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 2xl:w-36 2xl:h-36 animate-spin"
            />
          </div>
          {urgentDepartureTime !== undefined && (
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold text-white">
              Departing in {urgentDepartureTime} min
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
