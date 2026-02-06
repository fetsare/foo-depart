import { Suspense } from "react";
import DepartureBoard from "@/components/DepartureBoard";
import { fetchRawDepartures } from "@/lib/actions";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { validateConfig } from "@/lib/constants";
import Image from "next/image";

export default async function Home() {
  validateConfig();

  const rawData = await fetchRawDepartures();

  return (
    <>
      <SpeedInsights />
      <Suspense fallback={<div className="min-h-screen bg-black" />}>
        <DepartureBoard rawDepartures={rawData} />
      </Suspense>
      <div className="fixed bottom-0 left-0 right-0 bg-black py-1 px-4 z-40">
        <div className="flex items-center justify-between">
          <div className="text-xs sm:text-sm text-gray-400">
            Ugla
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/fetsare/manbacken-depart"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <Image
                src="/github-icon.svg"
                alt="GitHub repository"
                width={16}
                height={16}
              />
            </a>
            <img
              src="https://img.shields.io/github/last-commit/fetsare/foo-depart"
              alt="GitHub last commit"
              className="h-4"
            />
          </div>
        </div>
      </div>
    </>
  );
}
