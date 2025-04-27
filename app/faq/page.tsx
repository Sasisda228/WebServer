"use client";
import { motion, useScroll } from "framer-motion";
import { useRef } from "react";
import styles from "./faq.module.css";

const FAQPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  const articles = [
    {
      title: "Как выбрать пушку",
      content:
        "При выборе пушки важно определить цель использования: для спорта, развлечения или тренировок. Обратите внимание на калибр – он влияет на дальность и точность. Проверьте эргономику: как оружие лежит в руке, удобно ли им управлять. Не забывайте учитывать вес и баланс, особенно если планируете длительное использование.",
      gradient: "linear-gradient(45deg, #9a1840, #371b72)",
    },
    {
      title: "ТОП 5 орбизов",
      content:
        "На рынке представлено множество моделей орбизов. Среди лучших выделяются: Orbiz Pro-X2000 за свою надежность, Quantum Trajectory Q4 с отличной точностью, Nebula Striker N9 для любителей футуристичного дизайна, Vortex Velocity V12 с высокой скорострельностью и Eclipse E5 Elite как универсальный вариант для разных задач.",
      gradient: "linear-gradient(135deg, #371b72, #0d47a1)",
    },
    {
      title: "Чек-лист новичка",
      content:
        "Перед первым использованием обязательно проведите проверку безопасности оружия. Настройте прицел для точной стрельбы и сделайте несколько тестовых выстрелов для калибровки. После использования не забывайте чистить ствол. Правильное хранение оборудования продлит его срок службы и обеспечит безопасность.Перед первым использованием обязательно проведите проверку безопасности оружия. Настройте прицел для точной стрельбы и сделайте несколько тестовых выстрелов для калибровки. После использования не забывайте чистить ствол. Правильное хранение оборудования продлит его срок службы и обеспечит безопасность.",
      gradient: "linear-gradient(45deg, #0d47a1, #4CAF50)",
    },
  ];

  return (
    <div ref={containerRef} className={styles.container}>
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
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={styles.title}
            >
              {article.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={styles.articleContent}
            >
              {article.content}
            </motion.p>
          </div>
        </section>
      ))}
    </div>
  );
};

export default FAQPage;
