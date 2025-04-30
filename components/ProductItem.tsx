"use client";
const SingleProductModal = dynamic(
  () => import("@/components/SingleProductModal"),
  {
    ssr: false, // Modals are client-side interactive elements
    // Optional: Add loading state if needed, but often not necessary for modals
    // loading: () => <p>Loading details...</p>
  }
);
import { useProductStore } from "@/app/_zustand/store";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import styles from "./ProductCard.module.css";
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

  useEffect(() => {
    const firstImage = product.images[0];

    if (firstImage.includes("ucarecdn.com") && firstImage.includes("/")) {
      // Извлекаем ID альбома из URL
      const match = firstImage.match(/ucarecdn\.com\/([^\/]+)/);
      if (match && match[1]) {
        setAlbumGroupId(match[1]);
      }
    }
  }, [product.images]);
  const { addToCart } = useProductStore();

  const handleAddToCart = () => {
    addToCart({
      id: product?.id.toString(),
      title: product?.title,
      price: product?.price,
      images: product?.images,
      amount: 1,
    });
  };
  // Prevent modal opening when clicking on interactive elements inside the card
  const handleArticleClick = (e: React.MouseEvent) => {
    // If the click originated from a button or a link, do nothing
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
        onClick={handleArticleClick}
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
          {albumGroupId && (
            <img
              src={`https://ucarecdn.com/${albumGroupId}/nth/0/-/preview/751x1000/`}
              alt={`Product image 1`}
              width={200}
              height={200}
              sizes="(max-width: 600px) 100vw, 180px"
            />
          )}

          {/* <Image
            src={
              product.mainImage
                ? `/${product.mainImage}`
                : "/product_placeholder.jpg"
            }
            alt={product.title}
            fill
            className={styles.image}
            sizes="(max-width: 600px) 100vw, 180px"
            priority
            draggable={false}
          /> */}
        </div>
        <div className={styles.cardContent}>
          <div className={styles.title} tabIndex={0}>
            {product.title}
          </div>
          <div className={styles.priceRow}>
            <span className={styles.price}>{product?.price} ₽</span>
          </div>
          <button
            className={styles.buyButton}
            tabIndex={0}
            aria-label={`В КОРЗИНУ: ${product.title}`}
            type="button"
            data-ignore-article-click
            onClick={() => {
              handleAddToCart();
            }}
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
