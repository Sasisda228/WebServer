"use client";

import { useEffect, useState } from "react";
import FlippingDigit from "./FlippingDigit"; // Импортируем новый компонент
import styles from "./StatsCounter.module.css";

interface StatsCounterProps {
  initialValue?: number;
  label: string;
}

const StatsCounter = ({ initialValue = 1234, label }: StatsCounterProps) => {
  const [count, setCount] = useState(initialValue);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000); // Интервал в 1 секунду

    return () => clearInterval(interval);
  }, []);

  // Преобразуем число в массив цифр (строк)
  const digits = String(count).split("").map(Number);

  return (
    <div className={styles.counterWrapper}>
      <div className={styles.counterNumber}>
        {" "}
        {/* Обертка для цифр */}
        {digits.map((digit, index) => (
          // Используем FlippingDigit для каждой цифры
          // Добавляем уникальный ключ, включающий индекс, на случай повторяющихся цифр
          <FlippingDigit key={`${digit}-${index}`} digit={digit} />
        ))}
      </div>
      <span className={styles.counterLabel}>{label}</span>
    </div>
  );
};

export default StatsCounter;