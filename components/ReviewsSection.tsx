"use client"; // Needs client-side hooks for animation

import { motion, useInView } from "framer-motion";
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
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export default function ReviewsSection({
  reviews = [],
  title = "Что о нас говорят",
}: ReviewsSectionProps) {
  const containerRef = useRef(null);
  // Trigger animation when the container is slightly in view
  const isInView = useInView(containerRef, { once: true, amount: 0.1 });

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className={styles.reviewsContainer} ref={containerRef}>
      <h2 className={styles.reviewsHeader}>{title}</h2>
      <div className={styles.reviewsGrid}>
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            className={styles.reviewCard}
            variants={cardVariants}
            initial="hidden"
            // Animate only when the container is in view
            animate={isInView ? "visible" : "hidden"}
            // Add a slight delay based on index for staggered effect
            custom={index}
            transition={{ delay: isInView ? index * 0.1 : 0, duration: 0.5 }}
          >
            <p className={styles.reviewText}>{review.text}</p>
            <p className={styles.reviewAuthor}>{review.author}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
