import styles from "./LegalInfo.module.css";

export default function LegalInfo() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.legalContainer}>
      <div className={styles.legalContent}>
        <p>
          © {currentYear} 47 Inc. Все права защищены. ИНН: 1234567890 | ОГРН:
          1234567890123
        </p>
        <p>
          Юридический адрес: [Ваш Адрес]. Информация на сайте не является
          публичной офертой.
        </p>
        <p>
          <a href="/terms">Условия использования</a> |{" "}
          <a href="/privacy">Политика конфиденциальности</a>
        </p>
        {/* Добавьте другую необходимую юридическую информацию */}
      </div>
    </footer>
  );
}
