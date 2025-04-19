"use client";
import Link from "next/link";
import {
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaHome,
  FaSortAlphaDown,
} from "react-icons/fa";
import styles from "./ShopUI.module.css";

// --- Breadcrumb ---
export const Breadcrumb = ({ category }: { category?: string }) => (
  <nav className={styles.breadcrumb}>
    <ul>
      <li>
        <Link href="/">
          <FaHome className={styles.icon} />
          <span>Home</span>
        </Link>
      </li>
      <li>
        <Link href="/shop">Shop</Link>
      </li>
      <li>
        <span>{category || "All products"}</span>
      </li>
    </ul>
  </nav>
);

// --- Filters ---
export const Filters = ({
  filters,
  setFilters,
  onMobileClose,
  isMobileOpen,
}: {
  filters: any;
  setFilters: (f: any) => void;
  onMobileClose?: () => void;
  isMobileOpen?: boolean;
}) => {
  // For mobile, show as a modal/drawer
  return (
    <div
      className={`${styles.filters} ${
        isMobileOpen ? styles.filtersMobileOpen : ""
      }`}
    >
      <div className={styles.filtersHeader}>
        <FaFilter className={styles.icon} />
        <span>Filters</span>
        {onMobileClose && (
          <button className={styles.closeBtn} onClick={onMobileClose}>
            ×
          </button>
        )}
      </div>
      <div className={styles.filterGroup}>
        <label>
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={() =>
              setFilters({ ...filters, inStock: !filters.inStock })
            }
          />
          <span>In Stock</span>
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.outOfStock}
            onChange={() =>
              setFilters({ ...filters, outOfStock: !filters.outOfStock })
            }
          />
          <span>Out of Stock</span>
        </label>
      </div>
      <div className={styles.filterGroup}>
        <span>Price: up to ${filters.price}</span>
        <input
          type="range"
          min={0}
          max={3000}
          step={10}
          value={filters.price}
          onChange={(e) =>
            setFilters({ ...filters, price: Number(e.target.value) })
          }
        />
      </div>
      <div className={styles.filterGroup}>
        <span>Minimum Rating: {filters.rating}</span>
        <input
          type="range"
          min={0}
          max={5}
          step={1}
          value={filters.rating}
          onChange={(e) =>
            setFilters({ ...filters, rating: Number(e.target.value) })
          }
        />
        <div className={styles.ratingLabels}>
          {[0, 1, 2, 3, 4, 5].map((r) => (
            <span key={r}>{r}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- SortBy ---
export const SortBy = ({
  sort,
  setSort,
}: {
  sort: string;
  setSort: (s: string) => void;
}) => (
  <div className={styles.sortBy}>
    <FaSortAlphaDown className={styles.icon} />
    <select value={sort} onChange={(e) => setSort(e.target.value)}>
      <option value="defaultSort">Default</option>
      <option value="titleAsc">A-Z</option>
      <option value="titleDesc">Z-A</option>
      <option value="lowPrice">Lowest Price</option>
      <option value="highPrice">Highest Price</option>
    </select>
  </div>
);

// --- Pagination ---
export const Pagination = ({
  page,
  setPage,
  totalPages,
}: {
  page: number;
  setPage: (p: number) => void;
  totalPages: number;
}) => (
  <div className={styles.pagination}>
    <button
      className={styles.pageBtn}
      onClick={() => setPage(Math.max(1, page - 1))}
      disabled={page === 1}
      aria-label="Previous page"
    >
      <FaChevronLeft />
    </button>
    <span className={styles.pageNumber}>
      Page {page} / {totalPages}
    </span>
    <button
      className={styles.pageBtn}
      onClick={() => setPage(Math.min(totalPages, page + 1))}
      disabled={page === totalPages}
      aria-label="Next page"
    >
      <FaChevronRight />
    </button>
  </div>
);

// --- Products ---
export const Products = ({ products }: { products: any[] }) => (
  <div className={styles.productsGrid}>
    {products.length > 0 ? (
      products.map((product) => (
        <div key={product.id} className={styles.productCard}>
          <img
            src={product.image}
            alt={product.title}
            className={styles.productImg}
          />
          <div className={styles.productInfo}>
            <h3 className={styles.productTitle}>{product.title}</h3>
            <div className={styles.productMeta}>
              <span className={styles.productPrice}>${product.price}</span>
              <span className={styles.productRating}>★ {product.rating}</span>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className={styles.noProducts}>
        No products found for specified query
      </div>
    )}
  </div>
);
