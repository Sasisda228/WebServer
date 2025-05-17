// components/TeamAdvantages/TeamAdvantages.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "./TeamAdvantages.module.css"; // Основные стили
import modalStyles from "./TeamAdvantagesModal.module.css"; // Стили модалки

// ... (Интерфейсы SectionInfo, ModalProps и массив sectionsData остаются ТЕМИ ЖЕ) ...
// Интерфейс для данных секции
interface SectionInfo {
  id: "team" | "club" | "store" | "help";
  title: string;
  shortDescription: string;
  icon: string; // Иконка для кнопки
  modalTitle: string;
  modalContent: React.ReactNode; // Содержимое модального окна может быть JSX
}

// Статические данные для секций (можно оставить как есть или обновить текст)
const sectionsData: SectionInfo[] = [
  {
    id: "team",
    title: "47Team",
    shortDescription: "О наших труженниках",
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
    shortDescription: "Мемы, рилсы, обзоры",
    icon: "🎬",
    modalTitle: "Закрытый Клуб 47Club",
    modalContent: (
      <>
        <p>
          47Club — это сообщество ля тех, кто ценит качественный и уникальный
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
    title: "47Help",
    shortDescription: "Если терзают вопросы",
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
          тактичским снаряжением и выживанием. Вся продукция проходит строгий
          контроль качества.
        </p>
        <p>Следите за новинками и специальными предложениями!</p>
      </>
    ),
  },
  {
    id: "help",
    title: "47Info",
    shortDescription: "Если есть трудности",
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
      // Блокируем скролл фона при открытом модальном окне
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleEsc);
    } else {
      // Разблокируем скролл при закрытии
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset"; // Убедимся, что скролл разблокирован при размонтировании
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={`${modalStyles.overlay} ${
        isOpen ? modalStyles.overlayVisible : ""
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`${modalStyles.modalContent} ${
          isOpen ? modalStyles.modalVisible : ""
        }`}
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
      </div>
    </div>
  );
};

// Основной компонент
const TeamAdvantages: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeModal, setActiveModal] = useState<SectionInfo | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

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
      <section className={styles.section} ref={sectionRef}>
        <div
          className={`${styles.container} ${
            isVisible ? styles.containerVisible : ""
          }`}
        >
          <h2
            className={`${styles.title} ${
              isVisible ? styles.itemVisible : styles.itemHidden
            }`}
            style={{ animationDelay: "0ms" }}
          >
            Мы - <span className={styles.highlight}>47</span>
          </h2>

          <div className={styles.buttonsGrid}>
            {sectionsData.map((section, i) => (
              <button
                key={section.id}
                className={`${styles.advantageButton} ${
                  isVisible ? styles.itemVisible : styles.itemHidden
                }`}
                onClick={() => handleOpenModal(section.id)}
                style={{ animationDelay: `${(i + 1) * 100}ms` }}
              >
                <div className={styles.buttonIconWrapper}>
                  <span className={styles.buttonIcon}>{section.icon}</span>
                </div>
                <div className={styles.buttonText}>
                  <h3 className={styles.buttonTitle}>{section.title}</h3>
                  <p className={styles.buttonDescription}>
                    {section.shortDescription}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div
            className={`${styles.footer} ${
              isVisible ? styles.itemVisible : styles.itemHidden
            }`}
            style={{ animationDelay: `${(sectionsData.length + 1) * 100}ms` }}
          >
            <p>Узнайте больше о каждом направлении</p>
          </div>
        </div>
      </section>

      {/* Модальное окно */}
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
