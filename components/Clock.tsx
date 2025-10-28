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
    <div className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400">
      {formatTime(time.getHours())}:{formatTime(time.getMinutes())}:
      {formatTime(time.getSeconds())}
    </div>
  );
}
