// app/faq/page.tsx
"use client";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion"; // Добавляем AnimatePresence
import { useEffect, useState } from "react"; // Убираем useRef
import styles from "./faq.module.css"; // Основные стили страницы и кнопок
import modalStyles from "./faqModal.module.css"; // Стили для модального окна

// --- Интерфейс для статьи FAQ (без изменений) ---
interface FaqArticle {
  id: number;
  title: string;
  content: string;
  gradient: string | null;
}

// --- Базовый URL API (без изменений) ---
const API_BASE_URL = "/apiv3/"; // Убедись, что этот путь правильный для твоего API

// --- Компонент Модального Окна (взят из TeamAdvantages и адаптирован) ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Закрытие по клику на оверлей
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={modalStyles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={handleOverlayClick} // Закрытие по клику на фон
        >
          <motion.div
            className={modalStyles.modalContent}
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className={modalStyles.modalHeader}>
              <h2>{title}</h2>
              <button
                onClick={onClose}
                className={modalStyles.closeButton}
                aria-label="Закрыть"
              >
                &times; {/* Крестик */}
              </button>
            </div>
            <div className={modalStyles.modalBody}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// --- Основной Компонент Страницы FAQ ---
const FAQPage = () => {
  // Убираем ref и useScroll
  // const containerRef = useRef<HTMLDivElement>(null);
  // const { scrollYProgress } = useScroll({ container: containerRef });

  const [articles, setArticles] = useState<FaqArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<FaqArticle | null>(null); // Состояние для активной модалки

  // --- Логика загрузки данных (без изменений) ---
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get<FaqArticle[]>(
          `${API_BASE_URL}/faq-articles`
        );
        // Используем response.data напрямую, так как axios это делает
        setArticles(response.data);
      } catch (err: any) {
        // Лучше использовать any или AxiosError
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "An unknown error occurred";
        console.error("Failed to fetch articles:", err.response?.data || err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // --- Функции для управления модальным окном ---
  const handleOpenModal = (article: FaqArticle) => {
    setActiveModal(article);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  // --- Варианты анимации для кнопок (из TeamAdvantages) ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Небольшая задержка между появлением кнопок
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      // Добавляем кастомный параметр i для задержки
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05, // Увеличиваем задержку на основе индекса
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    }),
  };

  // --- Рендеринг ---
  if (loading) {
    return <div className={styles.loadingState}>Загрузка статей...</div>;
  }

  if (error) {
    return <div className={styles.errorState}>Ошибка загрузки: {error}</div>;
  }

  return (
    // Основной контейнер страницы
    <div className={styles.faqPageContainer}>
      {/* Убираем прогресс-бар */}
      {/* <motion.div className={styles.progressBar} style={{ scaleX: scrollYProgress }} /> */}

      <h1 className={styles.pageTitle}>Полезные статьи</h1>

      {/* Сетка для кнопок */}
      <motion.div
        className={styles.buttonsGrid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {articles.map((article, index) => (
          <motion.button
            key={article.id}
            className={styles.faqButton}
            onClick={() => handleOpenModal(article)}
            variants={itemVariants}
            custom={index} // Передаем индекс для кастомной задержки анимации
            whileHover={{
              y: -5,
              scale: 1.02,
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
            }}
            whileTap={{ scale: 0.97 }}
            // Добавляем стиль для градиентной рамки или фона, если есть градиент
            // style={
            //   article.gradient
            //     ? {
            //         borderImage: `${article.gradient} 1`,
            //         borderImageSlice: 1,
            //         borderWidth: "2px",
            //         borderStyle: "solid",
            //       }
            //     : {}
            // }
          >
            {/* Можно добавить иконку, если нужно */}
            {/* <div className={styles.buttonIconWrapper}>...</div> */}
            <div className={styles.buttonText}>
              <h3 className={styles.buttonTitle}>{article.title}</h3>
              <p className={styles.buttonDescription}>
                {/* Показываем начало статьи */}
                {article.content.substring(0, 100)}...
              </p>
            </div>
            {/* Эффект свечения можно добавить, если нужно */}
            {/* <div className={styles.buttonGlow} /> */}
          </motion.button>
        ))}
      </motion.div>

      {/* Модальное окно */}
      <Modal
        isOpen={!!activeModal} // Преобразуем в boolean
        onClose={handleCloseModal}
        title={activeModal?.title || ""} // Заголовок из активной статьи
      >
        {/* Полное содержимое статьи */}
        <div dangerouslySetInnerHTML={{ __html: activeModal?.content || "" }} />
        {/* Используем dangerouslySetInnerHTML, если контент содержит HTML, иначе просто {activeModal?.content} */}
      </Modal>
    </div>
  );
};

export default FAQPage;
