"use client";
import { motion, useScroll } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "./faq.module.css";

// Определяем тип для статьи FAQ
interface FaqArticle {
  id: number;
  title: string;
  content: string;
  gradient: string | null;
}

// Базовый URL для Express API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const FAQPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: containerRef });

  const [articles, setArticles] = useState<FaqArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/faq-articles`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: FaqArticle[] = await response.json();
        setArticles(data);
      } catch (err) {
        console.error("Failed to fetch articles:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div className={styles.loadingState}>Загрузка статей...</div>;
  }

  if (error) {
    return <div className={styles.errorState}>Ошибка загрузки: {error}</div>;
  }

  return (
    <div ref={containerRef} className={styles.container}>
      <motion.div
        className={styles.progressBar}
        style={{ scaleX: scrollYProgress }}
      />

      {articles.map((article) => (
        <section
          key={article.id}
          className={styles.fullpageSection}
          style={{
            background:
              article.gradient || "linear-gradient(45deg, #333, #555)",
          }}
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
