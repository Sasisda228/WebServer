"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import styles from "./CategoryBar.module.css";
interface category {
  label: string;
  cat?: string; // Mark as optional for safety
}
interface CategoryBarProps {
  categories: category[];
  currentCategory?: category | null;
}

export default function CategoryBar({
  categories,
  currentCategory,
}: CategoryBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  // Check if we're in the shop section
  useEffect(() => {
    setIsVisible(true);
  }, [pathname]);

  // Handle scroll arrows visibility
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Scroll functions
  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  }, []);

  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      // Check initial scroll position
      handleScroll();

      // Scroll to active category if exists
      if (currentCategory?.cat) {
        const activeElement = scrollContainer.querySelector(
          `[data-category="${currentCategory.cat.toLowerCase()}"]`
        );
        if (activeElement) {
          const containerWidth = scrollContainer.clientWidth;
          const elementLeft = (activeElement as HTMLElement).offsetLeft;
          const elementWidth = (activeElement as HTMLElement).clientWidth;

          // Center the element
          scrollContainer.scrollTo({
            left: elementLeft - containerWidth / 2 + elementWidth / 2,
            behavior: "smooth",
          });
        }
      }
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, [currentCategory, isVisible, handleScroll]);

  // Handle category selection
  const handleCategoryClick = useCallback(
    (categoryCat?: string) => {
      if (categoryCat) {
        router.push(`/shop/${categoryCat.toLowerCase()}`);
      }
    },
    [router]
  );

  if (!isVisible) return null;

  // Filter out categories with undefined or empty cat
  const validCategories = categories.filter(
    (category) => typeof category.cat === "string" && category.cat.trim() !== ""
  );

  return (
    <AnimatePresence>
      <motion.div
        className={styles.categoryBarContainer}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Left scroll arrow */}
        <motion.button
          className={`${styles.scrollArrow} ${styles.leftArrow} ${
            showLeftArrow ? styles.visible : ""
          }`}
          onClick={scrollLeft}
          initial={{ opacity: 0 }}
          animate={{ opacity: showLeftArrow ? 1 : 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MdChevronLeft />
        </motion.button>

        {/* Categories scroll container */}
        <div className={styles.categoriesContainer} ref={scrollContainerRef}>
          {validCategories.map((category) => {
            // Defensive: category.cat is guaranteed to be a non-empty string here
            const catLower = category.cat!.toLowerCase();
            const isActive =
              currentCategory?.cat &&
              currentCategory.cat.toLowerCase() === catLower;

            return (
              <motion.button
                key={catLower}
                className={`${styles.categoryItem} ${
                  isActive ? styles.active : ""
                }`}
                onClick={() => handleCategoryClick(category.cat)}
                data-category={catLower}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {category.label}
                {isActive && (
                  <motion.div
                    className={styles.activeIndicator}
                    layoutId="categoryIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Right scroll arrow */}
        <motion.button
          className={`${styles.scrollArrow} ${styles.rightArrow} ${
            showRightArrow ? styles.visible : ""
          }`}
          onClick={scrollRight}
          initial={{ opacity: 0 }}
          animate={{ opacity: showRightArrow ? 1 : 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <MdChevronRight />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
