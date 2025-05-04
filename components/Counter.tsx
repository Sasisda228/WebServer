"use client";

import { useEffect, useState } from "react"
import Digit from "./Digit"

// Определите желаемое количество цифр для отображения
const DISPLAY_DIGITS = 5;

export default function Counter() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Получаем данные с сервера
    fetch("/api/count")
      .then((res) => res.json())
      .then((data) => {
        const fetchedCount = Number(data.count);
        if (!isNaN(fetchedCount)) {
          setCount(fetchedCount);
        } else {
          console.error("Получено невалидное значение счетчика:", data.count);
          setCount(0); // Устанавливаем значение по умолчанию при ошибке
        }
        setIsLoading(false);
      })
      .catch(error => {
         console.error("Ошибка при получении данных счетчика:", error);
         setCount(0); // Устанавливаем значение по умолчанию при ошибке сети
         setIsLoading(false);
      });
  }, []);

  // Подготавливаем массив цифр для отображения
  // Добавляем ведущие нули, если число короче DISPLAY_DIGITS
  const digits = (isLoading || count === null)
    ? Array(DISPLAY_DIGITS).fill(0) // Показываем нули во время загрузки или если данных нет
    : count.toString().padStart(DISPLAY_DIGITS, "0").split("").map(Number);

  return (
    <div className="flex space-x-1">
      {isLoading
        ? // Показываем плейсхолдеры во время загрузки
          [...Array(DISPLAY_DIGITS)].map((_, i) => (
            <div
              key={i}
              // Размеры должны совпадать с Digit
              className="inline-block h-10 w-7 bg-gray-200 rounded animate-pulse mr-1" // Ширину (w-7) можно подстроить под шрифт
            ></div>
          ))
        : // Рендерим анимированные цифры
          digits.map((digit, index) => (
            <Digit key={index} digit={digit} />
          ))}
    </div>
  );
}