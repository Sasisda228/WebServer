"use client"; // This component needs client-side interaction

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { MdChevronLeft, MdChevronRight } from "react-icons/md"; // Simple icons
import styles from "./ProductCarousel.module.css";

// Define the Product type (using title, images, and price as per your interface)
interface Product {
  id: string | number;
  title: string;
  images: string; // Assuming a single image URL string based on interface
  price: number; // Added price field
}

interface ProductCarouselProps {
  products: Product[];
  title?: string; // Optional title for the section
}

export default function ProductCarousel({
  products = [], // Default to empty array
  title = "Наши Товары",
}: ProductCarouselProps) {
  // Removed useState for albumGroupId - it caused the infinite loop
  // const [albumGroupId, setAlbumGroupId] = useState<string | null>(null);

  // Initialize Embla Carousel
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true, // Enable looping
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
            let albumGroupId: string | null = null; // Use a local variable
            const imageUrl = product.images; // Assuming product.images is the URL string

            if (
              imageUrl && // Check if imageUrl exists
              imageUrl.includes("ucarecdn.com") &&
              imageUrl.includes("/")
            ) {
              // Извлекаем ID альбома из URL
              const match = imageUrl.match(/ucarecdn\.com\/([^\/]+)/);
              if (match && match[1]) {
                albumGroupId = match[1]; // Assign to the local variable
              }
            }
            // --- End of local calculation ---

            // Construct the final image source URL using the local albumGroupId
            // Provide a fallback if albumGroupId couldn't be extracted or if the original URL should be used

            return (
              <div className={styles.emblaSlide} key={product.id}>
                <div className={styles.productImageContainer}>
                  <img
                    src={imageUrl + "nth/0/"} // Use the calculated or fallback sourcesrc={imageUrl + "nth/0/"} // Use the calculated or fallback source                    alt={product.title}
                    className={styles.productImage}
                    loading="lazy"
                    onError={(e) => {
                      // Optional: Handle image loading errors
                      e.currentTarget.src = "/placeholder.png";
                      e.currentTarget.onerror = null;
                    }}
                  />
                  {/* Stand simulation element */}
                  <div className={styles.stand}></div>
                </div>
                <h3 className={styles.productName}>{product.title}</h3>
                {/* Display product price */}
                <p className={styles.productPrice}>{product.price} ₽</p>
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
