import Image from "next/image";
import React from "react";
import styles from "./ProductCard.module.css";

interface ProductCardProps {
  product: {
    id: string | number;
    title: string;
    image: string;
    price: number;
    rating?: number;
    onClick?: () => void;
  };
  onBuy?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy }) => {
  return (
    <article className={styles.card} tabIndex={0} aria-label={product.title}>
      <div className={styles.imageWrapper}>
        <Image
          src={product.image}
          alt={product.title}
          fill
          className={styles.image}
          sizes="(max-width: 600px) 100vw, 180px"
          priority
          draggable={false}
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.title} title={product.title}>
          {product.title}
        </h3>
        <div className={styles.priceRow}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          {typeof product.rating === "number" && (
            <span className={styles.rating} title={`Rating: ${product.rating}`}>
              ★ {product.rating.toFixed(1)}
            </span>
          )}
        </div>
        <button
          className={styles.buyButton}
          tabIndex={0}
          aria-label={`Buy: ${product.title}`}
          onClick={onBuy}
        >
          Buy
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
