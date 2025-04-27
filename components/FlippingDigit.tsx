"use client";

import { AnimatePresence, motion } from "framer-motion";
import styles from "./FlippingDigit.module.css";

interface FlippingDigitProps {
  digit: number; // Цифра для отображения (0-9)
}

const FlippingDigit = ({ digit }: FlippingDigitProps) => {
  const digitString = String(digit);

  const variants = {
    initial: { rotateX: -90, y: -25, opacity: 0 },
    animate: { rotateX: 0, y: 0, opacity: 1 },
    exit: { rotateX: 90, y: 25, opacity: 0 },
  };

  return (
    <div className={styles.digitContainer}>
      {/* AnimatePresence теперь здесь, отслеживает смену ключа у motion.span */}
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          // Ключ теперь зависит ТОЛЬКО от цифры.
          // Когда проп digit меняется, этот ключ меняется,
          // и AnimatePresence запускает exit/initial/animate.
          key={digitString}
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