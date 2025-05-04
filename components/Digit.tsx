// components/Digit.tsx
import { useEffect, useState } from "react";

interface DigitProps {
  digit: number;
}

export default function Digit({ digit }: DigitProps) {
  const [currentDigit, setCurrentDigit] = useState(0);

  useEffect(() => {
    if (digit !== currentDigit) {
      setCurrentDigit(digit);
    }
  }, [digit]);

  return (
    <div className="inline-block h-10 overflow-hidden mr-1">
      <div
        className="flex flex-col h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateY(-${currentDigit}rem)` }}
      >
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="h-10 flex items-center justify-center text-4xl font-bold"
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}
