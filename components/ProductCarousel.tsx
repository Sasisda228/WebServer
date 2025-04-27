"use client"; // This component needs client-side interaction

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md"; // Simple icons
import styles from "./ProductCarousel.module.css";

// Define the Product type (using title, images, and price as per your interface)


interface ProductCarouselProps {
  products: Product[];
  title?: string; // Optional title for the section
}

export default function ProductCarousel({
  products = [], // Default to empty array
  title = "Наши Товары",
}: ProductCarouselProps) {
  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false, // Enable looping
    align: "center", // Center the active slide
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
            // --- Calculate albumGroupId locally for *this* product ---
            const imageUrl = product.images[0]; // Assuming product.images is the URL string

            if (
              imageUrl && // Check if imageUrl exists
              imageUrl.includes("ucarecdn.com") &&
              imageUrl.includes("/")
            ) {
              // Извлекаем ID альбома из URL
              const match = imageUrl.match(/ucarecdn\.com\/([^\/]+)/);
              if (match && match[1]) {
              }
            }
            // --- End of local calculation ---

            // Construct the final image source URL using the local albumGroupId
            // Provide a fallback if albumGroupId couldn't be extracted or if the original URL should be used

            return (
              <>
                <div className={styles.emblaSlide} key={product.id}>
                  <div className={styles.productImageContainer}>
                    <img
                      width={350}
                      height={350}
                      src={
                        "https://ucarecdn.com/0cca0ce2-2ec2-4d7e-b20c-bffbd953d6a5/"
                      } // Use finalImageUrl or a placeholder
                      alt={product.title}
                      className={styles.productImage}
                      loading="lazy" // Add lazy loading
                      onError={(e) => {
                        // Optional: Handle image loading errors
                        e.currentTarget.src = "/placeholder.png";
                        e.currentTarget.onerror = null;
                      }}
                    />
                    {/* Stand simulation element */}
                    <div className={styles.stand}></div>
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.title}</h3>
                    <p className={styles.productPrice}>{product.price} ₽</p>
                    <button className={styles.productButton} disabled>
                      {" "}
                      {/* Added button */}
                      Перейти к товару
                    </button>
                  </div>
                </div>
              </>
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