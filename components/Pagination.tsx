// *********************
// Role of the component: Pagination for navigating the shop page
// Name of the component: Pagination.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <Pagination />
// Input parameters: no input parameters
// Output: Minimal, animated dark-themed pagination component
// *********************

"use client";
import React from "react";
import { usePaginationStore } from "@/app/_zustand/paginationStore";
import styles from "./Pagination.module.css";

const Pagination: React.FC = () => {
  // getting from Zustand store current page and methods for incrementing and decrementing current page
  const { page, incrementPage, decrementPage } = usePaginationStore();

  return (
    <nav className={styles.container} aria-label="Pagination Navigation">
      <button
        className={styles.btn}
        aria-label="Previous page"
        onClick={decrementPage}
        tabIndex={0}
        type="button"
      >
        <span aria-hidden="true">«</span>
      </button>
      <span className={styles.page}>Page {page}</span>
      <button
        className={styles.btn}
        aria-label="Next page"
        onClick={incrementPage}
        tabIndex={0}
        type="button"
      >
        <span aria-hidden="true">»</span>
      </button>
    </nav>
  );
};

export default Pagination;
