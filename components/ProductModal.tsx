"use client";
import {
  AddToWishlistBtn,
  ProductTabs,
  SingleProductDynamicFields,
  SingleProductRating,
  StockAvailabillity,
  UrgencyText,
} from "@/components";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import {
  FaSquareFacebook,
  FaSquarePinterest,
  FaSquareXTwitter,
} from "react-icons/fa6";
import styles from "./ProductModal.module.css";

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

interface ProductModalProps {
  open: boolean;
  onClose: () => void;
  product: any;
  images: ImageItem[];
  slug: string;
}

const ProductModal: React.FC<ProductModalProps> = ({
  open,
  onClose,
  product,
  images,
  slug,
}) => {
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);
  const [mainImage, setMainImage] = useState(product?.mainImage || "");
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setShow(true);
      setClosing(false);
      setMainImage(product?.mainImage || "");
    } else if (show) {
      setClosing(true);
      setTimeout(() => {
        setShow(false);
        setClosing(false);
      }, 350);
    }
  }, [open, product?.mainImage]);

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Close on ESC
  useEffect(() => {
    if (!show) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className={`${styles.overlay} ${
        !open || closing ? styles.overlayHidden : ""
      }`}
      ref={overlayRef}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className={`${styles.modal} ${closing ? styles.modalClosing : ""}`}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close product modal"
        >
          ×
        </button>
        <div className={styles.header}>
          <div>
            <div className={styles.imageWrap}>
              <Image
                src={mainImage ? `/${mainImage}` : "/product_placeholder.jpg"}
                width={220}
                height={220}
                alt={product?.title || "Product image"}
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
            <div className={styles.imagesRow}>
              {images?.map((img) => (
                <div
                  key={img.imageID}
                  className={`${styles.thumb} ${
                    mainImage === img.image ? styles.selected : ""
                  }`}
                  onClick={() => setMainImage(img.image)}
                  tabIndex={0}
                  aria-label="Select product image"
                  role="button"
                >
                  <Image
                    src={`/${img.image}`}
                    width={48}
                    height={48}
                    alt="Product thumbnail"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className={styles.info}>
            <SingleProductRating rating={product?.rating} />
            <h1 className={styles.title}>{product?.title}</h1>
            <p className={styles.price}>${product?.price}</p>
            <StockAvailabillity stock={94} inStock={product?.inStock} />
            <UrgencyText stock={product?.stock || 10} />
            <SingleProductDynamicFields product={product} />
            <div className={styles.actions}>
              <AddToWishlistBtn product={product} slug={slug} />
              <span className={styles.sku}>
                SKU: <span>abccd-18</span>
              </span>
              <div className={styles.socials}>
                <FaSquareFacebook />
                <FaSquareXTwitter />
                <FaSquarePinterest />
              </div>
            </div>
            <div className={styles.paymentRow}>
              <Image src="/visa.svg" width={38} height={38} alt="visa" />
              <Image
                src="/mastercard.svg"
                width={38}
                height={38}
                alt="mastercard"
              />
              <Image
                src="/ae.svg"
                width={38}
                height={38}
                alt="american express"
              />
              <Image src="/paypal.svg" width={38} height={38} alt="paypal" />
              <Image
                src="/dinersclub.svg"
                width={38}
                height={38}
                alt="diners club"
              />
              <Image
                src="/discover.svg"
                width={38}
                height={38}
                alt="discover"
              />
            </div>
          </div>
        </div>
        <div className={styles.tabsWrap}>
          <ProductTabs product={product} />
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
