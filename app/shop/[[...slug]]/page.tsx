"use client";

import { Filters, FiltersRef, Pagination, Products } from "@/components";
import { usePaginationStore } from "@/store/paginationStore";
import { useSortStore } from "@/store/sortStore";
import { useEffect, useRef, useState } from "react";
import styles from "./ShopPage.module.css";

const ShopPage = (slug: any) => {
  const filtersRef = useRef<FiltersRef>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { setPage } = usePaginationStore();
  const { changeSortBy } = useSortStore();

  // Initialize stores from URL parameters
  useEffect(() => {
    if (!slug || isInitialized) return;

    try {
      // Initialize pagination
      const pageParam = slug?.searchParams?.page;
      if (pageParam) {
        setPage(Number(pageParam));
      }

      // Initialize sorting
      const sortParam = slug?.searchParams?.sort;
      if (sortParam) {
        changeSortBy(sortParam);
      }

      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing from URL parameters:", error);
    }
  }, [slug, isInitialized, setPage, changeSortBy]);

  // Format category name for display
  const formatCategoryName = (category: string): string => {
    if (!category) return "";
    return category
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get category from slug
  const categoryName = slug?.params?.slug?.[0]
    ? formatCategoryName(slug.params.slug[0])
    : "";

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div>
            <div className={styles.divider}></div>

            <div className={styles.titleWrapper}>
              <h1 className={styles.title}>
                <span className={styles.titleGradient}>47STORE</span>
                {categoryName && (
                  <>
                    <br />
                    <span className={styles.categoryName}>{categoryName}</span>
                  </>
                )}
              </h1>
            </div>
            <Filters ref={filtersRef} />
            <Products slug={slug} />
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;