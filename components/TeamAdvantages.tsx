// components/TeamAdvantages/TeamAdvantages.tsx
"use client"; // Необходимо для useState (модальное окно) и useEffect/useRef (анимация)

import {
  AnimatePresence,
  motion,
  useAnimation,
  useInView,
} from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import styles from "./TeamAdvantages.module.css"; // Основные стили секции и кнопок
import modalStyles from "./TeamAdvantagesModal.module.css"; // Стили для модального окна

// Интерфейс для данных секции
interface SectionInfo {
  id: "team" | "club" | "store" | "help";
  title: string;
  shortDescription: string;
  icon: string; // Иконка для кнопки
  modalTitle: string;
  modalContent: React.ReactNode; // Содержимое модального окна может быть JSX
}

// Статические данные для секций
const sectionsData: SectionInfo[] = [
  {
    id: "team",
    title: "47Team",
    shortDescription:
      "Профессиональная разработка сайтов, приложений и сложных систем.",
    icon: "💻",
    modalTitle: "Команда 47Team",
    modalContent: (
      <>
        <p>
          Мы — сплоченная команда опытных программистов, дизайнеров и менеджеров
          проектов.
        </p>
        <p>
          Специализируемся на создании высоконагруженных веб-сервисов, мобильных
          приложений под iOS и Android, а также интеграции со сторонними API.
          Используем современный стек технологий: React, Next.js, Node.js,
          TypeScript, PostgreSQL.
        </p>
        <ul>
          <li>Анализ требований и проектирование архитектуры</li>
          <li>Разработка и тестирование</li>
          <li>Поддержка и развитие проектов</li>
        </ul>
      </>
    ),
  },
  {
    id: "club",
    title: "47Club",
    shortDescription:
      "Эксклюзивный контент: видео, статьи и инсайды индустрии.",
    icon: "🎬",
    modalTitle: "Закрытый Клуб 47Club",
    modalContent: (
      <>
        <p>
          47Club — это сообщество ��ля тех, кто ценит качественный и уникальный
          контент.
        </p>
        <p>
          Здесь вы найдете самые залипательные видео, обучающие материалы,
          разборы кейсов, интервью с экспертами и закулисные истории из мира IT
          и медиа. Контент создается эксклюзивно для участников клуба.
        </p>
        <p>
          Присоединяйтесь, чтобы получать знания, вдохновение и общаться с
          единомышленниками!
        </p>
      </>
    ),
  },
  {
    id: "store",
    title: "47Store",
    shortDescription:
      "Официальный мерч и тематические товары высокого качества.",
    icon: "🛒",
    modalTitle: "Магазин 47Store",
    modalContent: (
      <>
        <p>
          В 47Store представлен широкий ассортимент товаров для фанатов и
          профессионалов.
        </p>
        <p>
          Мы предлагаем качественный мерч с символикой 47 (одежда, аксессуары),
          а также тщательно отобранные товары, связанные с оружейной тематикой,
          тактич��ским снаряжением и выживанием. Вся продукция проходит строгий
          контроль качества.
        </p>
        <p>Следите за новинками и специальными предложениями!</p>
      </>
    ),
  },
  {
    id: "help",
    title: "47Help",
    shortDescription: "Поддержка, консультации и ответы на ваши вопросы.",
    icon: "❓",
    modalTitle: "Поддержка 47Help",
    modalContent: (
      <>
        <p>
          Нужна помощь или консультация? Служба поддержки 47Help всегда на
          связи.
        </p>
        <p>
          Мы готовы ответить на ваши вопросы, связанные с нашими продуктами
          (47Team, 47Club, 47Store), помочь с решением технических проблем или
          предоставить необходимую информацию.
        </p>
        <p>
          Свяжитесь с нами через форму на сайте или по указанным контактам. Мы
          ценим каждого клиента и стремимся предоставить лучший сервис.
        </p>
      </>
    ),
  },
];

// Варианты анимации для элементов
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1, // Задержка для последовательного появления
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

// Компонент модального окна
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

  // Закрытие по Esc
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={modalStyles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleOverlayClick} // Закрытие по клику на оверлей
        >
          <motion.div
            className={modalStyles.modalContent}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className={modalStyles.modalHeader}>
              <h2>{title}</h2>
              <button
                onClick={onClose}
                className={modalStyles.closeButton}
                aria-label="Закрыть"
              >
                &times;
              </button>
            </div>
            <div className={modalStyles.modalBody}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Основной компонент
const TeamAdvantages: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null); // Типизируем ref
  const isInView = useInView(ref, { once: true, amount: 0.3 }); // Анимация сработает один раз
  const controls = useAnimation();

  const [activeModal, setActiveModal] = useState<SectionInfo | null>(null);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [isInView, controls]);

  const handleOpenModal = (sectionId: SectionInfo["id"]) => {
    const section = sectionsData.find((s) => s.id === sectionId);
    if (section) {
      setActiveModal(section);
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      <section className={styles.section} ref={ref}>
        <motion.div
          className={styles.container}
          initial="hidden"
          animate={controls}
          variants={{
            visible: { transition: { staggerChildren: 0.1 } }, // Задержка между анимациями дочерних элементов
          }}
        >
          <motion.h2
            className={styles.title}
            variants={itemVariants}
            custom={0} // Первый элемент для анимации
          >
            Экосистема <span className={styles.highlight}>47</span>
          </motion.h2>

          <div className={styles.buttonsGrid}>
            {sectionsData.map((section, i) => (
              <motion.button
                key={section.id}
                className={styles.advantageButton}
                onClick={() => handleOpenModal(section.id)}
                variants={itemVariants}
                custom={i + 1} // Индекс для задержки анимации
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0px 8px 25px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={styles.buttonIcon}>{section.icon}</div>
                <div className={styles.buttonText}>
                  <h3 className={styles.buttonTitle}>{section.title}</h3>
                  <p className={styles.buttonDescription}>
                    {section.shortDescription}
                  </p>
                </div>
                <div className={styles.buttonGlow} />
              </motion.button>
            ))}
          </div>

          <motion.div
            className={styles.footer}
            variants={itemVariants}
            custom={sectionsData.length + 1} // Последний анимированный элемент
          >
            <p>Узнайте больше о каждом направлении</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Рендерим модальное окно */}
      <Modal
        isOpen={!!activeModal}
        onClose={handleCloseModal}
        title={activeModal?.modalTitle || ""}
      >
        {activeModal?.modalContent}
      </Modal>
    </>
  );
};

export default TeamAdvantages;
