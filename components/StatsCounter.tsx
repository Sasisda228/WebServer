"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "./StatsCounter.module.css";

interface StatsCounterProps {
  initialValue?: number; // Начальное значение счетчика
  label: string; // Текст под счетчиком
}

const StatsCounter = ({ initialValue = 1234, label }: StatsCounterProps) => {
  const [count, setCount] = useState(initialValue);

  // Используем useSpring для плавной анимации числа
  const spring = useSpring(count, { mass: 0.8, stiffness: 75, damping: 15 });
  // Округляем значение для отображения целых чисел
  const displayCount = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    // Обновляем целевое значение для useSpring при изменении count
    spring.set(count);
  }, [spring, count]);

  useEffect(() => {
    // Увеличиваем счетчик каждую секунду
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1);
    }, 1000); // Интервал в 1 секунду

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
  }, []); // Пустой массив зависимостей - запускаем эффект один раз

  return (
    <div className={styles.counterWrapper}>
      {/* Это правильное использование displayCount с motion.span */}
      <motion.span className={styles.counterNumber}>{displayCount}</motion.span>
      <span className={styles.counterLabel}>{label}</span>
    </div>
  );
};

export default StatsCounter;