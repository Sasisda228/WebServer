"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import styles from "./ProductCard.module.css";

// Dynamic import for UploadcareImage
const UploadcareImage = dynamic(
  () => import("@uploadcare/nextjs-loader").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          width: "100%",
          height: "200px",
          backgroundColor: "#eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }} // Adjusted height and added flex centering
        aria-label="Loading image..."
      >
        <span style={{ color: "#888", fontSize: "small" }}>Загрузка...</span>
      </div>
    ),
  }
);

// Define props interface, including the click handler
interface ProductItemProps {
  product: Product;
  onProductClick: (slug: string) => void; // Handler passed from parent
}

const ProductItem: React.FC<ProductItemProps> = ({
  product,
  onProductClick,
}) => {
  const [, setAlbumGroupId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null); // State for the final image URL

  useEffect(() => {
    // Determine the correct image URL (first image from album or direct URL)
    const firstImage = product.images?.[0]; // Use optional chaining

    if (
      firstImage &&
      firstImage.includes("ucarecdn.com") &&
      firstImage.includes("/~/")
    ) {
      // Check for group URL marker '/~/'
      const match = firstImage.match(/ucarecdn\.com\/([a-f0-9-]+~\d+)/); // Regex for group ID like 'uuid~count'
      if (match && match[1]) {
        setAlbumGroupId(match[1]);
        // Construct URL for the first image in the album (nth/0/)
        setImageUrl(
          `https://ucarecdn.com/${match[1]}/nth/0/-/preview/400x400/-/format/auto/-/quality/smart/`
        ); // Added preview transformations
      } else {
        // Fallback if parsing fails but looks like Uploadcare
        setAlbumGroupId(null);
        setImageUrl(firstImage); // Try using the URL directly as a fallback
        console.warn(`Could not parse Uploadcare group ID from: ${firstImage}`);
      }
    } else if (firstImage) {
      // Assume it's a direct image URL
      setAlbumGroupId(null);
      setImageUrl(firstImage);
    } else {
      // No images provided
      setAlbumGroupId(null);
      setImageUrl(null); // Set to null or a placeholder image URL
    }
  }, [product.images]);

  // Prevent modal opening when clicking on interactive elements inside the card
  const handleArticleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Ignore clicks on buttons, links, or elements with the specific data attribute
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("[data-ignore-article-click]")
    ) {
      return;
    }
    // Call the handler passed from the parent instead of setting local state
    onProductClick(product.slug);
  };

  // Handle keyboard activation (Enter or Space)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow activation with Enter or Space, but not if focus is on an interactive element inside
    const target = e.target as HTMLElement;
    if (
      (e.key === "Enter" || e.key === " ") &&
      !target.closest("button") && // Don't trigger if focus is on the button
      !target.closest("a") // Don't trigger if focus is on a link
    ) {
      e.preventDefault(); // Prevent default space bar scroll or Enter form submission
      // Call the handler passed from the parent
      onProductClick(product.slug);
    }
  };

  return (
    // Remove the outer fragment <>, not needed anymore
    <article
      className={styles.card}
      tabIndex={0} // Make the article focusable
      aria-label={`Открыть детали товара: ${product.title}`} // More descriptive label
      onClick={handleArticleClick}
      onKeyDown={handleKeyDown}
      style={{ cursor: "pointer" }}
      role="button" // Indicate it's interactive
    >
      <div
        className={styles.imageWrapper}
        // No need for aria-label here if the main article has a good one
      >
        {/* Display the image using the determined imageUrl */}
        {imageUrl ? (
          <UploadcareImage
            alt={`Изображение товара ${product.title}`} // More descriptive alt text
            src={imageUrl} // Use the determined URL
            width={200} // Define desired render width
            height={200} // Define desired render height (adjust aspect ratio if needed via CSS)
            // sizes="(max-width: 600px) 150px, 200px" // Example sizes attribute - adjust based on your grid layout
            style={{ objectFit: "cover", width: "100%", height: "100%" }} // Ensure image covers the area
          />
        ) : (
          // Placeholder if no image URL is available
          <div
            style={{
              width: "100%",
              height: "200px",
              backgroundColor: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }} // Consistent height
            aria-label="Изображение недоступно"
          >
            <span style={{ color: "#888", fontSize: "small" }}>Нет фото</span>
          </div>
        )}
      </div>
      <div className={styles.cardContent}>
        {/* Make title non-focusable if the card itself is focusable */}
        <div className={styles.title}>{product.title}</div>
        <div className={styles.priceRow}>
          {/* Format price correctly using Russian locale */}
          <span className={styles.price}>
            {product.price.toLocaleString("ru-RU", {
              style: "currency",
              currency: "RUB",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>
        <button
          className={styles.buyButton}
          // tabIndex={0} // Already focusable by default
          aria-label={`В корзину: ${product.title}`}
          type="button"
          data-ignore-article-click // Keep this to prevent article click handler
          onClick={(e) => {
            e.stopPropagation(); // Prevent article click handler
            console.log(`Add to cart: ${product.slug}`);
            // Add actual cart logic here
          }}
        >
          <span>В КОРЗИНУ</span>
        </button>
      </div>
      {/* Modal is now handled by the parent component */}
    </article>
  );
};

export default ProductItem;
