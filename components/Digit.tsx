"use client";

import { useEffect, useRef, useState } from "react";

interface DigitProps {
  digit: number;
}

export default function Digit({ digit }: DigitProps) {
  const [currentDigit, setCurrentDigit] = useState(0);
  const digitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay before starting animation for smoothness
    const timer = setTimeout(() => {
      setCurrentDigit(digit);
    }, 50);

    return () => clearTimeout(timer); // Cleanup timer
  }, [digit]); // Effect runs when digit changes

  // Height of one digit element (h-10 -> 2.5rem in Tailwind by default)
  const digitHeight = 2.5; // in rem

  return (
    <div
      className="inline-block h-10 overflow-hidden mr-1 relative"
      style={{ height: `${digitHeight}rem` }}
    >
      {/* Container for all digits 0-9 */}
      <div
        ref={digitRef}
        className="flex flex-col transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateY(-${currentDigit * digitHeight}rem)`, // Shift container up
          height: `${digitHeight * 10}rem`, // Total height of all digits
        }}
      >
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-center text-4xl font-bold"
            style={{ height: `${digitHeight}rem` }} // Explicitly set height
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
