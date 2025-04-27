"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./header.module.css";
const Header = () => {
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathname = usePathname();
  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}>
      {/* Верхняя строка: Логотип и действия пользователя */}
      <div className={styles.headerTop}>
        <div className={styles.headerLogo}>
          <Link href="/">
            <span className={styles.glitch} data-text="47">
              47
            </span>
          </Link>
        </div>
        {}
        {/* Панель действий пользователя */}
        <div className={styles.actions}>
          {pathname.startsWith("/shop") && (
            <>
              {/* <button
                className={styles.searchButton}
                onClick={() => setSearchActive(!searchActive)}
              >
                <FaSearch size={20} />
              </button> */}
              {/* <button
                className="rounded-full"
                aria-label="Open filters"
                onClick={() => filtersRef.current?.toggle()}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: 8,
                  color: "#fff",
                  border: "none",
                  fontWeight: 600,
                }}
              >
                <FaFilter size={20} />
              </button>
              <Filters ref={filtersRef} /> */}
            </>
          )}
        </div>
      </div>

      {/* Поле поиска */}
      <div className={`${styles.searchBar} ${""}`}>
        <input
          type="text"
          placeholder="Поиск по каталогу..."
          className={styles.searchInput}
        />
      </div>

      {/* Категории
      <div className={styles.categoryBar}>
        {[1, 2, 3].map((num) => (
          <button key={num} className={styles.categoryButton}>
            Категория {num}
          </button>
        ))}
      </div> */}
    </header>
  );
};

export default Header;
