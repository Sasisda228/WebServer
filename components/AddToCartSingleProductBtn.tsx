// *********************
// Role of the component: Button for adding product to the cart on the single product page
// Name of the component: AddToCartSingleProductBtn.tsx
// Developer: Aleksandar Kuzmanovic
// Version: 1.0
// Component call: <AddToCartSingleProductBtn product={product} quantityCount={quantityCount}  />
// Input parameters: SingleProductBtnProps interface
// Output: Button with adding to cart functionality
// *********************
"use client";

import { useProductStore } from "@/app/_zustand/store";
import toast from "react-hot-toast";
import styles from "./ProfileModal.module.css";

const AddToCartSingleProductBtn = ({
  product,
  quantityCount,
}: SingleProductBtnProps) => {
  const { addToCart, calculateTotals } = useProductStore();

  const handleAddToCart = () => {
    addToCart({
      id: product?.id.toString(),
      title: product?.title,
      price: product?.price,
      image: product?.images,
      amount: quantityCount,
    });
    calculateTotals();
    toast.success("Успешно добавлено!");
  };
  return (
    <button onClick={handleAddToCart} className={styles.toCartButton}>
      Добавить в корзину
    </button>
  );
};

export default AddToCartSingleProductBtn;
