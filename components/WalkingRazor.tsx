"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function WalkingRazor() {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: -150, y: 50 });
  const [direction, setDirection] = useState<"left" | "right">("right");

  useEffect(() => {
    // Random delay between 30 seconds to 3 minutes before first appearance
    const initialDelay = Math.random() * (180000 - 30000) + 30000;

    const scheduleNextAppearance = () => {
      // Rare appearances: between 2-5 minutes
      const delay = Math.random() * (300000 - 120000) + 120000;

      setTimeout(() => {
        // Random vertical position (between 10% and 70% of viewport height)
        const randomY = Math.random() * 60 + 10;

        // Random direction
        const newDirection = Math.random() > 0.5 ? "right" : "left";
        setDirection(newDirection);

        // Start position off-screen
        setPosition({
          x: newDirection === "right" ? -150 : window.innerWidth + 50,
          y: randomY,
        });

        setIsVisible(true);

        // Hide after animation completes (about 15 seconds)
        setTimeout(() => {
          setIsVisible(false);
          scheduleNextAppearance();
        }, 15000);
      }, delay);
    };

    // Initial appearance
    setTimeout(() => {
      const newDirection = Math.random() > 0.5 ? "right" : "left";
      setDirection(newDirection);
      setPosition({
        x: newDirection === "right" ? -150 : window.innerWidth + 50,
        y: Math.random() * 60 + 10,
      });
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
        scheduleNextAppearance();
      }, 15000);
    }, initialDelay);
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
        className="animate-walk"
        priority={false}
      />

      <style jsx>{`
        .walking-razor {
          animation: ${direction === "right" ? "walkRight" : "walkLeft"} 15s
            linear;
        }

        @keyframes walkRight {
          from {
            transform: translateX(0) rotate(0deg);
          }
          25% {
            transform: translateX(
                ${typeof window !== "undefined" ? window.innerWidth / 4 : 400}px
              )
              rotate(-8deg);
          }
          50% {
            transform: translateX(
                ${typeof window !== "undefined" ? window.innerWidth / 2 : 800}px
              )
              rotate(8deg);
          }
          75% {
            transform: translateX(
                ${typeof window !== "undefined"
                  ? (window.innerWidth * 3) / 4
                  : 1200}px
              )
              rotate(-8deg);
          }
          to {
            transform: translateX(
                ${typeof window !== "undefined"
                  ? window.innerWidth + 200
                  : 1600}px
              )
              rotate(0deg);
          }
        }

        @keyframes walkLeft {
          from {
            transform: translateX(0) rotate(0deg) scaleX(-1);
          }
          25% {
            transform: translateX(
                -${typeof window !== "undefined"
                    ? window.innerWidth / 4
                    : 400}px
              )
              rotate(-8deg) scaleX(-1);
          }
          50% {
            transform: translateX(
                -${typeof window !== "undefined"
                    ? window.innerWidth / 2
                    : 800}px
              )
              rotate(8deg) scaleX(-1);
          }
          75% {
            transform: translateX(
                -${typeof window !== "undefined"
                    ? (window.innerWidth * 3) / 4
                    : 1200}px
              )
              rotate(-8deg) scaleX(-1);
          }
          to {
            transform: translateX(
                -${typeof window !== "undefined"
                    ? window.innerWidth + 200
                    : 1600}px
              )
              rotate(0deg) scaleX(-1);
          }
        }

        .animate-walk {
          animation:
            bobWalk 0.15s ease-in-out infinite,
            sideToSide 0.3s ease-in-out infinite;
        }

        @keyframes bobWalk {
          0%,
          100% {
            transform: translateY(0) scaleY(1);
          }
          50% {
            transform: translateY(-10px) scaleY(0.95);
          }
        }

        @keyframes sideToSide {
          0%,
          100% {
            transform: translateX(-15px) rotate(-10deg);
          }
          50% {
            transform: translateX(15px) rotate(10deg);
          }
        }
      `}</style>
    </div>
  );
}
