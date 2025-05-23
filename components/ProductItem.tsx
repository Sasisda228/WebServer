"use client";
import { useProductStore } from "@/app/_zustand/store";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./ProductCard.module.css";
// Dynamic import of modal component
const SingleProductModal = dynamic(
  () => import("@/components/SingleProductModal"),
  {
    ssr: false, // Modals are client-side interactive elements
  }
);
interface Product {
  id: string | number;
  title: string;
  images: string[];
  price: number;
  rating?: number;
  slug: string;
}

const ProductItem: React.FC<{ product: Product }> = ({ product }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [albumGroupId, setAlbumGroupId] = useState<string | null>(null);

  const { addToCart } = useProductStore();

  useEffect(() => {
    const firstImage = product.images[0];
    if (firstImage) {
      if (firstImage.includes("ucarecdn.com") && firstImage.includes("/")) {
        // Extract album ID from URL
        const match = firstImage.match(/ucarecdn\.com\/([^\/]+)/);
        if (match && match[1]) {
          setAlbumGroupId(match[1]);
        }
      }
    }
  }, [product.images]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    addToCart({
      id: product?.id.toString(),
      title: product?.title,
      price: product?.price,
      images: product?.images,
      amount: 1,
    });
  };

  // Handle card click to open modal
  const handleCardClick = (e: React.MouseEvent) => {
    // If the click originated from a button, do nothing
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("[data-ignore-article-click]")
    ) {
      return;
    }
    setModalOpen(true);
  };

  return (
    <>
      <article
        className={styles.card}
        tabIndex={0}
        aria-label={product.title}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setModalOpen(true);
        }}
        style={{ cursor: "pointer" }}
        role="button"
      >
        <div
          className={styles.imageWrapper}
          aria-label={`View ${product.title}`}
        >
          {albumGroupId ? (
            <Image
              src={`https://ucarecdn.com/${albumGroupId}/nth/0/-/preview/751x1000/`}
              alt={product.title}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <Image
              src="/product_placeholder.jpg"
              alt={product.title}
              className={styles.image}
              loading="lazy"
            />
          )}
          <div className={styles.imageOverlay}></div>
        </div>

        <div className={styles.cardContent}>
          <h3 className={styles.title} tabIndex={0}>
            {product.title}
          </h3>

          <div className={styles.priceRow}>
            <span className={styles.price}>{product?.price} ₽</span>
            {product.rating && (
              <span className={styles.rating}>★ {product.rating}</span>
            )}
          </div>

          <button
            className={styles.buyButton}
            tabIndex={0}
            aria-label={`В КОРЗИНУ: ${product.title}`}
            type="button"
            data-ignore-article-click
            onClick={handleAddToCart}
          >
            <span>В КОРЗИНУ</span>
          </button>
        </div>
      </article>
      {modalOpen && (
        <SingleProductModal
          productSlug={product.slug}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default ProductItem;
