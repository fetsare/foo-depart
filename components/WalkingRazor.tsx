"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function WalkingRazor() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: -150, y: 50 });
  const [direction, setDirection] = useState<"left" | "right">("right");

  const triggerWalk = () => {
    const randomY = Math.random() * 60 + 10;
    const newDirection = Math.random() > 0.5 ? "right" : "left";
    setDirection(newDirection);
    setPosition({
      x: newDirection === "right" ? -150 : window.innerWidth + 50,
      y: randomY,
    });
    setIsVisible(true);

    setTimeout(() => {
      setIsVisible(false);
    }, 15000);
  };

  useEffect(() => {
    // Test mode - trigger on Ctrl/Cmd + K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        triggerWalk();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Random delay between 30 seconds to 3 minutes before first appearance
    const initialDelay = Math.random() * (180000 - 30000) + 30000;

    const scheduleNextAppearance = () => {
      // Rare appearances: between 2-5 minutes
      const delay = Math.random() * (300000 - 120000) + 120000;

      setTimeout(() => {
        triggerWalk();
        scheduleNextAppearance();
      }, delay);
    };

    // Initial appearance
    setTimeout(() => {
      triggerWalk();
      scheduleNextAppearance();
    }, initialDelay);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 walking-razor"
      style={{
        top: `${position.y}vh`,
        left: direction === "right" ? `${position.x}px` : "auto",
        right: direction === "left" ? `${position.x}px` : "auto",
        transform: direction === "left" ? "scaleX(-1)" : "none",
      }}
    >
      <Image
        src="/razor.png"
        alt=""
        width={120}
        height={120}
        className="animate-spin"
        priority={false}
        style={{ filter: "brightness(0) invert(1)" }}
      />

      <style jsx>{`
        .walking-razor {
          animation: ${direction === "right" ? "walkRight" : "walkLeft"} 10s
            linear;
        }

        @keyframes walkRight {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(
                ${typeof window !== "undefined"
                  ? window.innerWidth + 200
                  : 1600}px
              );
          }
        }

        @keyframes walkLeft {
          from {
            transform: translateX(0) scaleX(-1);
          }
          to {
            transform: translateX(
                -${typeof window !== "undefined"
                    ? window.innerWidth + 200
                    : 1600}px
              )
              scaleX(-1);
          }
        }
      `}</style>
    </div>
  );
}
