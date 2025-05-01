"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import styles from "./CategoryBar.module.css";
interface category {
  label: string;
  cat: string;
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
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      // Check initial scroll position
      handleScroll();

      // Scroll to active category if exists
      if (currentCategory) {
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
  }, [currentCategory, isVisible]);

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    router.push(`/shop/${category.toLowerCase()}`);
  };

  if (!isVisible) return null;

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
          {categories.map((category, index) => {
            const isActive = currentCategory
              ? currentCategory?.cat.toLowerCase() ===
                category.cat.toLowerCase()
              : false;

            return (
              <motion.button
                key={index}
                className={`${styles.categoryItem} ${
                  isActive ? styles.active : ""
                }`}
                onClick={() => handleCategoryClick(category.cat)}
                data-category={category.cat.toLowerCase()}
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
