"use client";
import SingleProductModal from "@/components/SingleProductModal"; // путь поправьте под ваш проект
import Image from "next/image";
import React, { useState } from "react";
import styles from "./ProductCard.module.css";

interface Product {
  id: string | number;
  title: string;
  mainImage: string;
  price: number;
  rating?: number;
  slug: string;
}

const ProductItem: React.FC<{ product: Product }> = ({ product }) => {
  const [modalOpen, setModalOpen] = useState(false);

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
          <Image
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
          />
        </div>
        <div className={styles.cardContent}>
          <div className={styles.title} tabIndex={0}>
            {product.title}
          </div>
          <div className={styles.priceRow}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
          </div>
          <button
            className={styles.buyButton}
            tabIndex={0}
            aria-label={`В КОРЗИНУ: ${product.title}`}
            type="button"
            data-ignore-article-click
            onClick={(e) => {
              e.stopPropagation();
              // Здесь можно добавить логику добавления в корзину
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
