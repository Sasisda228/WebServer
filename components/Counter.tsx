"use client";

import { useEffect, useState } from "react"
import Digit from "./Digit"

export default function Counter() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Получаем данные с сервера
    fetch("/api/count")
      .then((res) => res.json())
      .then((data) => {
        setCount(data.count);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || count === null) {
    return (
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="inline-block h-10 w-8 bg-gray-200 rounded animate-pulse"
          ></div>
        ))}
      </div>
    );
  }

  const digits = count.toString().split("").map(Number);

  return (
    <div className="flex space-x-1">
      {digits.map((digit, index) => (
        <Digit key={index} digit={digit} />
      ))}
    </div>
  );
}
