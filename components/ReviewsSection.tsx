"use client"; // Needs client-side hooks for animation

import { useRef } from "react";
import styles from "./ReviewsSection.module.css";

// Define the Review type
interface Review {
  id: string | number;
  author: string;
  text: string;
}

interface ReviewsSectionProps {
  reviews: Review[];
  title?: string;
}

// Animation variants for cards

export default function ReviewsSection({
  reviews = [],
  title = "Что о нас говорят",
}: ReviewsSectionProps) {
  const containerRef = useRef(null);
  // Trigger animation when the container is slightly in view

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className={styles.reviewsContainer} ref={containerRef}>
      <h2 className={styles.reviewsHeader}>{title}</h2>
      <div className={styles.reviewsGrid}>
        {reviews.map((review) => (
          <div className={styles.reviewCard}>
            <p className={styles.reviewText}>{review.text}</p>
            <p className={styles.reviewAuthor}>{review.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
