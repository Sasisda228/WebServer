"use client";
import { motion } from "framer-motion";
import styles from "./Hero.module.css";

const Hero = () => {
  return (
    <motion.section
      className={styles.hero}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Заголовок с анимацией */}
      <motion.div
        className={styles.titleWrapper}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring" }}
      >
        <h1 className={styles.title}>
          {/* <span className={styles.titleGradient}>МЫ 47</span> */}
          <br />
          {/* <motion.span
            className={styles.titleHighlight}
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          >
            ТАКТИЧЕСКИЙ АРСЕНАЛ
          </motion.span> */}
        </h1>
      </motion.div>
      {/* Карусель (адаптированная под новый дизайн) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        {/* <Carousel /> */}
      </motion.div>
      {/* CTA-кнопка с градиентным свечением */}
      <motion.div
        className={styles.ctaWrapper}
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <button className={styles.ctaButton}>
          <span>В БОЙ →</span>
          <div className={styles.buttonGlow} />
        </button>
      </motion.div>
    </motion.section>
  );
};

export default Hero;
