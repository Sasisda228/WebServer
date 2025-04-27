"use client";

import axios from "axios"; // Используем axios для удобства
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styles from "./adminFaq.module.css"; // Создай этот CSS модуль

// Тип для статьи FAQ
interface FaqArticle {
  id: number;
  title: string;
  content: string;
  gradient: string | null;
}

// Базовый URL твоего Express API
// Убедись, что порт совпадает с тем, на котором запущен твой backend (server/app.js)
// В реальном приложении вынеси это в переменные окружения (.env.local)
const API_BASE_URL = "/apiv3/";

const FaqAdminPage = () => {
  const [articles, setArticles] = useState<FaqArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояние для формы (создание/редактирование)
  const [isEditing, setIsEditing] = useState<number | null>(null); // null для создания, id для редактирования
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    gradient: "",
  });

  // Загрузка статей при монтировании
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<FaqArticle[]>(
        `${API_BASE_URL}/faq-articles`
      );
      setArticles(response.data);
    } catch (err) {
      console.error("Failed to fetch articles:", err);
      setError("Не удалось загрузить статьи.");
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения полей формы
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик отправки формы (создание/обновление)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true); // Можно добавить локальный лоадер для формы

    const articleData = {
      title: formData.title,
      content: formData.content,
      gradient: formData.gradient || null, // Отправляем null если поле пустое
    };

    try {
      if (isEditing !== null) {
        // Обновление существующей статьи
        await axios.put(
          `${API_BASE_URL}/faq-articles/${isEditing}`,
          articleData
        );
      } else {
        // Создание новой статьи
        await axios.post(`${API_BASE_URL}/faq-articles`, articleData);
      }
      resetForm();
      await fetchArticles(); // Обновляем список после успешной операции
    } catch (err: any) {
      console.error("Failed to save article:", err);
      setError(err.response?.data?.error || "Не удалось сохранить статью.");
    } finally {
      setLoading(false); // Убираем общий лоадер
    }
  };

  // Начать редактирование статьи
  const handleEdit = (article: FaqArticle) => {
    setIsEditing(article.id);
    setFormData({
      title: article.title,
      content: article.content,
      gradient: article.gradient || "", // Устанавливаем пустую строку, если градиент null
    });
    window.scrollTo(0, 0); // Прокрутка к форме
  };

  // У��аление статьи
  const handleDelete = async (id: number) => {
    if (window.confirm("Вы уверены, что хотите удалить эту статью?")) {
      setLoading(true);
      setError(null);
      try {
        await axios.delete(`${API_BASE_URL}/faq-articles/${id}`);
        await fetchArticles(); // Обновляем список
      } catch (err: any) {
        console.error("Failed to delete article:", err);
        setError(err.response?.data?.error || "Не удалось удалить статью.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Сброс формы
  const resetForm = () => {
    setIsEditing(null);
    setFormData({ title: "", content: "", gradient: "" });
  };

  return (
    <div className={styles.adminContainer}>
      <h1>Управление статьями FAQ</h1>

      {error && <p className={styles.error}>{error}</p>}

      {/* Форма для создания/редактирования */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>
          {isEditing !== null
            ? "Редактировать статью"
            : "Добавить новую статью"}
        </h2>
        <div className={styles.formGroup}>
          <label htmlFor="title">Заголовок:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="content">Содержание:</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={6}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="gradient">Градиент (CSS, необязательно):</label>
          <input
            type="text"
            id="gradient"
            name="gradient"
            value={formData.gradient}
            onChange={handleInputChange}
            placeholder="linear-gradient(45deg, #9a1840, #371b72)"
          />
        </div>
        <div className={styles.formActions}>
          <button type="submit" disabled={loading}>
            {loading
              ? "Сохранение..."
              : isEditing !== null
              ? "Обновить"
              : "Добавить"}
          </button>
          {isEditing !== null && (
            <button type="button" onClick={resetForm} disabled={loading}>
              Отмена
            </button>
          )}
        </div>
      </form>

      <hr className={styles.divider} />

      {/* Список существующих статей */}
      <h2>Существующие статьи</h2>
      {loading && articles.length === 0 && <p>Загрузка...</p>}
      {!loading && articles.length === 0 && <p>Статьи не найдены.</p>}

      {articles.length > 0 && (
        <ul className={styles.articleList}>
          {articles.map((article) => (
            <li key={article.id} className={styles.articleItem}>
              <div>
                <h3>{article.title}</h3>
                <p className={styles.articleContentPreview}>
                  {article.content.substring(0, 100)}...{" "}
                  {/* Показываем превью */}
                </p>
                {article.gradient && (
                  <p>
                    <small>Градиент: {article.gradient}</small>
                  </p>
                )}
              </div>
              <div className={styles.articleActions}>
                <button onClick={() => handleEdit(article)} disabled={loading}>
                  Редактировать
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  disabled={loading}
                  className={styles.deleteButton}
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FaqAdminPage;
