// *********************
// Role of the component: Showing stars for the given rating number
// Name of the component: ProductItemRating.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 2.0
// Component call: <ProductItemRating productRating={productRating} />
// Input parameters: { productRating: number }
// Output: Displays star rating with support for full, half, and empty stars
// *********************

"use client";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsStarHalf } from "react-icons/bs";

const ProductItemRating = ({
  productRating,
  showValue = false,
  className = "",
}: {
  productRating: number;
  showValue?: boolean;
  className?: string;
}) => {
  // Create an array of 5 stars
  const stars = Array.from({ length: 5 }, (_, index) => {
    // Determine if this star should be filled, half-filled, or empty
    if (index + 0.5 < productRating) {
      // Full star
      return <AiFillStar key={index} className="text-yellow-400 text-xl" />;
    } else if (index < productRating) {
      // Half star
      return <BsStarHalf key={index} className="text-yellow-400 text-xl" />;
    } else {
      // Empty star
      return <AiOutlineStar key={index} className="text-yellow-400 text-xl" />;
    }
  });

  return (
    <div className={`flex items-center ${className}`}>
      {stars}
      {showValue && (
        <span className="ml-1 text-sm text-gray-600">
          ({productRating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default ProductItemRating;
