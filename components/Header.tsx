"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SingleProductModal from "./SingleProductModal";
import styles from "./header.module.css";


const DEBOUNCE_DELAY = 300; // Delay in ms for debouncing search input
const Header = () => {
  useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear previous results and hide dropdown if query is too short
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsDropdownVisible(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsDropdownVisible(true);

    const handler = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://212.67.12.199:3001/api/search?query=${searchQuery || ""}`
        );
          if (!res.ok) {
            throw new Error("Network response was not ok");
          }
        const data: Product[] = await res.json();
        setSearchResults(data);
        setIsDropdownVisible(data.length > 0);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        setSearchResults([]);
        setIsDropdownVisible(false);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Show dropdown on focus if there's a query and results
  const handleInputFocus = () => {
    if (searchQuery.trim().length > 0 && searchResults.length > 0) {
      setIsDropdownVisible(true);
    }
  };

  // Hide dropdown on blur with a delay to allow clicking items
  const handleInputBlur = () => {
    setTimeout(() => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(document.activeElement)
      ) {
        setIsDropdownVisible(false);
      }
    }, 150);
  };

  // Handle clicking a search result item
  const handleResultClick = (product: Product) => {
    setSelectedProductSlug(product.slug);
    setIsModalOpen(true);
    setIsDropdownVisible(false);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductSlug(null);
  };

  const pathname = usePathname();
  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        {/* Верхняя строка: Логотип и действия пользователя */}
        <div className={styles.headerTop}>
          <div className={styles.headerLogo}>
            <Link href="/">
              <span className={styles.glitch} data-text="47">
                47
              </span>
            </Link>
            {encodeURIComponent(searchQuery.trim())}
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

        {/* Поле поиска и выпадающий список */}
        <div className={styles.searchContainer}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Поиск по каталогу..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            autoComplete="off"
          />

          {/* Выпадающий список результатов */}
          {isDropdownVisible && (
            <div className={styles.searchDropdown} ref={dropdownRef}>
              {isLoading && (
                <div className={styles.searchLoader}>Загрузка...</div>
              )}
              {!isLoading &&
                searchResults.length === 0 &&
                searchQuery.trim().length >= 2 && (
                  <div className={styles.searchNoResults}>
                    Ничего не найдено
                  </div>
                )}
              {!isLoading && searchResults.length > 0 && (
                <ul className={styles.searchResultsList}>
                  {searchResults.map((product) => (
                    <li key={product.id} className={styles.searchResultItem}>
                      <button
                        type="button"
                        onClick={() => handleResultClick(product)}
                        className={styles.searchResultButton}
                      >
                        <span className={styles.searchResultTitle}>
                          {product.title}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
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

      {/* Модальное окно товара */}
      {selectedProductSlug && (
        <SingleProductModal
          productSlug={selectedProductSlug}
          open={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default Header;

