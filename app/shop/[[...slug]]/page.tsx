"use client";

import {
  Filters,
  Pagination,
  Products,
  SingleProductModal,
} from "@/components"; // Import SingleProductModal
import { usePathname, useSearchParams } from "next/navigation"; // Import hooks
import { useEffect, useState } from "react"; // Import hooks
import styles from "./ShopPage.module.css";

// Helper function to improve readability of category text
const formatCategoryTitle = (slugParam: string | undefined): string => {
  if (!slugParam) {
    return "Все товары"; // Default title if no slug
  }
  // Replace hyphens with spaces and capitalize words
  return slugParam
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ShopPage = (props: {
  params: { slug?: string[] };
  searchParams: any;
}) => {
  const { slug } = props.params; // Extract slug array from params
  const categorySlug = slug?.[0]; // Get the first part of the slug as the category

  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [activeModalSlug, setActiveModalSlug] = useState<string | null>(null);

  // Effect to sync modal state with URL parameter
  useEffect(() => {
    const modalSlugFromUrl = searchParams.get("modalProduct");
    if (modalSlugFromUrl) {
      // Check if the modal isn't already set to this slug to avoid infinite loops
      if (activeModalSlug !== modalSlugFromUrl) {
        setActiveModalSlug(modalSlugFromUrl);
      }
    } else {
      // If the parameter is removed from URL (e.g., browser back button), close the modal
      if (activeModalSlug) {
        setActiveModalSlug(null);
      }
    }
    // Only depend on searchParams string representation for changes
  }, [searchParams.toString(), activeModalSlug]); // Added activeModalSlug to dependencies

  // Handler for opening the modal via product click
  const handleProductClick = (productSlug: string) => {
    setActiveModalSlug(productSlug);
    // Update URL to reflect the open modal, adding to history
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("modalProduct", productSlug);
    // Use replaceState to avoid adding multiple modal entries when clicking items rapidly
    // Use pushState if you want each modal open to be a separate history entry
    window.history.pushState(
      null,
      "",
      `${pathname}?${currentParams.toString()}`
    );
    // Alternatively, use Next.js router (might cause slight delay or refetch depending on setup)
    // router.push(`${pathname}?${currentParams.toString()}`, { scroll: false });
  };

  // Handler for closing the modal
  const handleModalClose = () => {
    const currentSlug = activeModalSlug; // Store slug before setting to null
    setActiveModalSlug(null);
    // Update URL to remove the modal parameter, replacing the current history entry
    const currentParams = new URLSearchParams(searchParams.toString());
    // Ensure we only remove the param if it matches the modal we are closing
    if (currentParams.get("modalProduct") === currentSlug) {
      currentParams.delete("modalProduct");
      const queryString = currentParams.toString();
      // Use replaceState to remove param without adding back navigation step
      window.history.replaceState(
        null,
        "",
        queryString ? `${pathname}?${queryString}` : pathname
      );
      // Alternatively, use Next.js router
      // router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    }
  };

  // Format the title based on the category slug
  const pageTitle = formatCategoryTitle(categorySlug);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* Optional: Add a divider or breadcrumbs here */}
        {/* <div className={styles.divider}></div> */}

        <div className={styles.grid}>
          {/* Filters Section (consider making it sticky or collapsible on mobile) */}
          <aside className={styles.filtersSection}>
           <Filters />
          </aside>

          {/* Main Content Section */}
          <main className={styles.mainContent}>
            <div className={styles.titleWrapper}>
              <h1 className={styles.title}>
                {/* Display the formatted title */}
                {pageTitle}
                {/* Optional: Keep the gradient text if desired */}
                {/* <span className={styles.titleGradient}>47STORE</span> */}
              </h1>
              {/* You might want to add sorting options here */}
            </div>

            {/* Pass the click handler down to Products */}
            <Products slug={props} onProductClick={handleProductClick} />

            <Pagination />
          </main>
        </div>
      </div>

      {/* Render the SingleProductModal conditionally */}
      {/* Use a key to ensure modal remounts/resets if slug changes drastically,
          though internal useEffect in modal should handle data fetching */}
      {activeModalSlug && (
        <SingleProductModal
          key={activeModalSlug} // Optional: force remount on slug change
          productSlug={activeModalSlug}
          open={!!activeModalSlug}
          onClose={handleModalClose}
          basePath={pathname} // Pass the base path for URL reversion
        />
      )}
    </div>
  );
};

export default ShopPage;

