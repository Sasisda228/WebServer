"use client";
import { motion, useScroll } from "framer-motion";
import styles from "./faq.module.css";

const FAQPage = () => {
  const { scrollYProgress } = useScroll();

  const articles = [
    {
      title: "Как выбрать пушку",
      content: [
        "1. Определите цель использования",
        "2. Обратите внимание на калибр",
        "3. Проверьте эргономику",
        "4. Учитывайте вес и баланс",
      ],
      gradient: "linear-gradient(45deg, #9a1840, #371b72)",
    },
    {
      title: "ТОП 5 орбизов",
      content: [
        "1. Orbiz Pro-X2000",
        "2. Quantum Trajectory Q4",
        "3. Nebula Striker N9",
        "4. Vortex Velocity V12",
        "5. Eclipse E5 Elite",
      ],
      gradient: "linear-gradient(135deg, #371b72, #0d47a1)",
    },
    {
      title: "Чек-лист новичка",
      content: [
        "✓ Проверка безопасности",
        "✓ Настройка прицела",
        "✓ Тестовые выстрелы",
        "✓ Чистка ствола",
        "✓ Хранение оборудования",
      ],
      gradient: "linear-gradient(45deg, #0d47a1, #4CAF50)",
    },
  ];

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.progressBar}
        style={{ scaleX: scrollYProgress }}
      />

      {articles.map((article, index) => (
        <section
          key={index}
          className={styles.fullpageSection}
          style={{ background: article.gradient }}
        >
          <div className={styles.contentWrapper}>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={styles.title}
            >
              {article.title}
            </motion.h1>

            <ul className={styles.list}>
              {article.content.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 + 0.3 }}
                  className={styles.listItem}
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      ))}
    </div>
  );
};

export default FAQPage;
