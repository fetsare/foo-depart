"use client";

import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (value: number) => {
    return value.toString().padStart(2, "0");
  };

  return (
    <div className="absolute top-4 left-4 text-sm font-bold sm:text-base md:text-xl lg:text-2xl text-white">
      {formatTime(time.getHours())}:{formatTime(time.getMinutes())}:
      {formatTime(time.getSeconds())}
    </div>
  );
}
