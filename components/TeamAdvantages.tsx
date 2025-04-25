// TeamAdvantages.tsx

import { motion, useAnimation, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
import styles from "./TeamAdvantages.module.css";

const TeamAdvantages = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const advantages = [
    {
      title: "47Club",
      description: "Самые крутые/залипательные/прикольные видео",
      icon: "📊",
    },
    {
      title: "47Team",
      description: "Лучшая команда программистов, дизайнеров, менеджеров",
      icon: "🤝",
    },
    {
      title: "47Store",
      description: "Масштабный магазин по продаже оружейной тематики",
      icon: "🛡️",
    },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "backOut",
      },
    }),
  };

  return (
    <section className={styles.section} ref={ref}>
      <motion.div
        className={styles.container}
        initial="hidden"
        animate={controls}
        variants={{
          visible: {
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        <motion.h2
          className={styles.title}
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          variants={itemVariants}
          custom={0}
        >
          Кто такие <span className={styles.highlight}>47</span>?
        </motion.h2>

        <div className={styles.grid}>
          {advantages.map((advantage, i) => (
            <motion.div
              key={advantage.title}
              className={styles.card}
              variants={itemVariants}
              custom={i + 1}
              whileHover={{ y: -5 }}
            >
              <div className={styles.iconWrapper}>
                <span className={styles.icon}>{advantage.icon}</span>
              </div>
              <h3 className={styles.cardTitle}>{advantage.title}</h3>
              <p className={styles.cardDescription}>{advantage.description}</p>
              <div className={styles.glow} />
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.footer}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={itemVariants}
          custom={5}
        >
          <p className={styles.footerText}>
            Присоединяйтесь к сообществу профессионалов
          </p>
          <button className={styles.ctaButton}>
            <span>Вступить в клуб</span>
            <div className={styles.buttonGlow} />
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default TeamAdvantages;
