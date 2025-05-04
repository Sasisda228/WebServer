"use client";

import { useEffect, useRef, useState } from "react";

interface DigitProps {
  digit: number;
}

export default function Digit({ digit }: DigitProps) {
  const [currentDigit, setCurrentDigit] = useState(0);
  const digitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Небольшая задержка перед началом анимации для плавности
    const timer = setTimeout(() => {
      setCurrentDigit(digit);
    }, 50);

    return () => clearTimeout(timer); // Очистка таймера
  }, [digit]); // Эффект запускается при изменении digit

  // Высота одного элемента цифры (h-10 -> 2.5rem в Tailwind по умолчанию)
  const digitHeight = 2.5; // в rem

  return (
    // Внешний контейнер для стилизации ячейки
    <div className="inline-block p-1 bg-gray-800 rounded-md shadow-md mr-1 border border-gray-700">
      {/* Внутренний контейнер для механизма прокрутки */}
      <div
        className="h-10 overflow-hidden relative" // Убрали inline-block и mr-1 отсюда
        style={{ height: `${digitHeight}rem`, width: "1.75rem" }} // Задаем ширину явно (w-7) или подберите под шрифт
      >
        {/* Контейнер для всех цифр 0-9 */}
        <div
          ref={digitRef}
          className="flex flex-col transition-transform duration-1000 ease-in-out" // Настройте duration и ease по вкусу
          style={{
            transform: `translateY(-${currentDigit * digitHeight}rem)`, // Сдвигаем контейнер вверх
            height: `${digitHeight * 10}rem`, // Общая высота всех цифр
          }}
        >
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="h-10 flex items-center justify-center text-4xl font-bold text-white" // Цвет текста изменен на белый для контраста
              style={{ height: `${digitHeight}rem` }} // Явно задаем высоту
            >
              {i}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}