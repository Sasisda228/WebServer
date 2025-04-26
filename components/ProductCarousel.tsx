"use client"; // This component needs client-side interaction

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md"; // Simple icons
import styles from "./ProductCarousel.module.css";

// Define the Product type (adjust based on your actual data structure)
interface Product {
  id: string | number;
  title: string;
  images: string; // Assuming PNG or other image URL
}

interface ProductCarouselProps {
  products: Product[];
  title?: string; // Optional title for the section
}

export default function ProductCarousel({
  products = [], // Default to empty array
  title = "Наши Товары",
}: ProductCarouselProps) {
  const [albumGroupId, setAlbumGroupId] = useState<string | null>(null);

  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true, // Enable looping
    align: "start", // Align slides to the start
    containScroll: "trimSnaps", // Optional: Adjust scroll behavior
  });

  // State for button enabled/disabled status
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  // Scroll functions
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Update button states when carousel settles or re-initializes
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); // Set initial state
    emblaApi.on("select", onSelect); // Listen for slide changes
    emblaApi.on("reInit", onSelect); // Listen for re-initialization
    return () => {
      // Clean up listeners when component unmounts
      if (emblaApi) {
        emblaApi.off("select", onSelect);
        emblaApi.off("reInit", onSelect);
      }
    };
  }, [emblaApi, onSelect]);

  if (!products || products.length === 0) {
    return null; // Don't render anything if no products
  }

  return (
    <section className={styles.carouselContainer}>
      <h2 className={styles.carouselHeader}>{title}</h2>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {products.map((product) => {
            const firstImage = product.images[0];

            if (
              firstImage.includes("ucarecdn.com") &&
              firstImage.includes("/")
            ) {
              // Извлекаем ID альбома из URL
              const match = firstImage.match(/ucarecdn\.com\/([^\/]+)/);
              if (match && match[1]) {
                setAlbumGroupId(match[1]);
              }
            }
            return (
              <div className={styles.emblaSlide} key={product.id}>
                {/* Use next/image for optimization if using Next.js */}
                <img
                  src={`https://ucarecdn.com/${albumGroupId}/nth/0/`}
                  alt={product.title}
                  className={styles.productImage}
                  loading="lazy" // Lazy load images outside initial viewport
                />
                <h3 className={styles.productName}>{product.title}</h3>
                <div className={styles.dlight}></div>{" "}
                {/* Dlight effect element */}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.controls}>
        <button
          className={styles.arrow}
          onClick={scrollPrev}
          disabled={!prevBtnEnabled}
          aria-label="Previous Product"
        >
          <MdChevronLeft className={styles.arrowIcon} />
        </button>
        <button
          className={styles.arrow}
          onClick={scrollNext}
          disabled={!nextBtnEnabled}
          aria-label="Next Product"
        >
          <MdChevronRight className={styles.arrowIcon} />
        </button>
      </div>
    </section>
  );
}
