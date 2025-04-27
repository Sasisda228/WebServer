"use client";

import { AnimatePresence, motion } from "framer-motion";
import styles from "./FlippingDigit.module.css"; // Создадим этот CSS модуль

interface FlippingDigitProps {
  digit: number; // Цифра для отображения (0-9)
}

const FlippingDigit = ({ digit }: FlippingDigitProps) => {
  const digitString = String(digit);

  // Варианты анимации для перелистывания
  const variants = {
    initial: { rotateX: -90, y: -25, opacity: 0 }, // Начинаем повернутым сверху
    animate: { rotateX: 0, y: 0, opacity: 1 }, // Поворачиваем в нормальное положение
    exit: { rotateX: 90, y: 25, opacity: 0 }, // Уходим поворотом вниз
  };

  return (
    <div className={styles.digitContainer}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={digitString} // Ключ важен для AnimatePresence
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={styles.digit}
        >
          {digitString}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

export default FlippingDigit;
