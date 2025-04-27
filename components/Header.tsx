"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link"; // Import Link
import { useEffect, useRef, useState } from "react";
import SingleProductModal from "./SingleProductModal";
import styles from "./header.module.css";

// Define the structure of a search result product (adjust as needed)
interface Product {
  id: string | number;
  title: string;
  slug: string;
  images?: string;
  price?: number;
}

const DEBOUNCE_DELAY = 1000; // Delay in ms for debouncing search input

const Header = () => {
  useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]); // Use Product type
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
    const trimmedQuery = searchQuery.trim();
    // Clear previous results and hide dropdown if query is too short
    // Changed minimum length back to 2
    if (trimmedQuery.length < 2) {
      setSearchResults([]);
      setIsDropdownVisible(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsDropdownVisible(true);

    const handler = setTimeout(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // Use empty string if undefined
        const encodedQuery = encodeURIComponent(trimmedQuery);

        // Use axios.get
        const response = await axios.get<Product[]>( // Specify expected data type
          `${baseUrl}/apiv3/search?query=${encodedQuery}` // Use relative path if baseUrl is empty or same origin
        );

        const data = response.data;
        setSearchResults(data);
        setIsDropdownVisible(data.length > 0);
      } catch (error) {
        console.error("Failed to fetch search results:", error);
        if (axios.isAxiosError(error)) {
          console.error(
            "Axios error details:",
            error.response?.status,
            error.response?.data
          );
        }
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
    if (searchQuery.trim().length >= 2 && searchResults.length > 0) {
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

  return (
    <>
      <header
        className={`${styles.header} ${isScrolled ? styles.scrolled : ""}`}
      >
        {/* Верхняя строка: Логотип и действия пользователя */}
        {/* Removed headerTop as logo is now near search */}
        {/* <div className={styles.headerTop}> ... </div> */}
        {/* Контейнер для лого и поиска */}
        <div className={styles.searchContainer}>
          {/* --- Added Logo Link --- */}
          <Link href="/" className={styles.searchLogoLink}>
            <span className={styles.searchLogoText}>47</span>
          </Link>
          {/* --- End Added Logo Link --- */}
          {/* Контейнер для инпута и выпадающего списка (для позиционирования) */}
          <div className={styles.searchInputWrapper}>
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
          </div>{" "}
          {/* End searchInputWrapper */}
        </div>{" "}
        {/* End searchContainer */}
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