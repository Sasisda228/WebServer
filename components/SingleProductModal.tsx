"use client";

import pageStyles from "@/app/product/[productSlug]/page.module.css";
import {
  AddToCartSingleProductBtn,
  AddToWishlistBtn,
  BuyNowSingleProductBtn,
  StockAvailabillity,
  UrgencyText,
} from "@/components";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaXmark } from "react-icons/fa6";
import modalStyles from "./SingleProductModal.module.css";

interface ImageItem {
  imageID: string;
  productID: string;
  image: string;
}

const TABS = [
  { label: "Детали", key: "details" },
  { label: "Доставка", key: "delivery" },
  { label: "Возврат", key: "return" },
];

const TAB_CONTENT: Record<string, string> = {
  details:
    "Здесь подробное описание товара, его характеристики и преимущества.",
  delivery: "Доставка осуществляется по всей России в течение 2-5 дней.",
  return: "Возврат товара возможен в течение 14 дней после получения.",
};

interface SingleProductModalProps {
  productSlug: string;
  open: boolean;
  onClose: () => void;
}

export default function SingleProductModal({
  productSlug,
  open,
  onClose,
}: SingleProductModalProps) {
  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // For focus trap and accessibility
  const modalRef = useRef<HTMLDivElement>(null);

  // Блокировка скролла body при открытии модалки
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:3001/api/slugs/${productSlug}`).then((r) =>
        r.json()
      ),
    ])
      .then(async ([productData]) => {
        setProduct(productData);
        if (productData?.id) {
          const imgs = await fetch(
            `http://localhost:3001/api/images/${productData.id}`
          ).then((r) => r.json());
          setImages(imgs);
        } else {
          setImages([]);
        }
      })
      .finally(() => setLoading(false));
  }, [productSlug, open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus();
    }
  }, [open]);

  // Карусель
  function ProductCarousel({
    images,
    mainImage,
  }: {
    images: ImageItem[];
    mainImage: string;
  }) {
    const allImages = [mainImage, ...images.map((img) => img.image)].filter(
      Boolean
    );
    const [current, setCurrent] = useState(0);

    const prev = () =>
      setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1));
    const next = () =>
      setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));
    const select = (idx: number) => setCurrent(idx);

    return (
      <div className={pageStyles.carouselWrapper}>
        <button
          className={`${pageStyles.carouselBtn} ${pageStyles.left}`}
          onClick={prev}
          aria-label="Предыдущее фото"
          type="button"
        >
          <FaChevronLeft size={22} />
        </button>
        <motion.div
          key={current}
          className={pageStyles.carouselImage}
          initial={{ opacity: 0.7, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <Image
            src={`/${allImages[current]}`}
            alt="Фото товара"
            fill
            className="object-contain"
            sizes="(max-width: 900px) 100vw, 800px"
            priority
          />
        </motion.div>
        <button
          className={`${pageStyles.carouselBtn} ${pageStyles.right}`}
          onClick={next}
          aria-label="Следующее фото"
          type="button"
        >
          <FaChevronRight size={22} />
        </button>
        {/* Thumbnails */}
        <div className={pageStyles.carouselThumbnails}>
          {allImages.map((img, idx) => (
            <button
              key={img + idx}
              className={`${pageStyles.carouselThumbBtn} ${
                idx === current ? pageStyles.active : ""
              }`}
              onClick={() => select(idx)}
              aria-label={`Фото ${idx + 1}`}
              type="button"
            >
              <Image
                src={`/${img}`}
                alt={`Миниатюра ${idx + 1}`}
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tabs logic
  function ProductTabs() {
    const [tab, setTab] = useState("details");
    return (
      <div className={pageStyles.tabsWrapper}>
        <div className={pageStyles.tabsHeader}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${pageStyles.tabBtn} ${
                tab === t.key ? pageStyles.active : ""
              }`}
              onClick={() => setTab(t.key)}
              type="button"
            >
              {t.label}
            </button>
          ))}
        </div>
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={pageStyles.tabContent}
        >
          {TAB_CONTENT[tab]}
        </motion.div>
      </div>
    );
  }

  // Модальное окно
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={modalStyles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={modalStyles.modalContent}
            ref={modalRef}
            initial={{ scale: 0.96, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0.7 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            aria-modal="true"
            role="dialog"
          >
            <div className={modalStyles.header}>
              <div
                className={modalStyles.handle}
                title="Закрыть"
                onClick={onClose}
                tabIndex={0}
                role="button"
                aria-label="Закрыть модальное окно"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onClose();
                }}
              />
              <button
                onClick={onClose}
                className={modalStyles.closeBtn}
                aria-label="Закрыть"
                type="button"
              >
                <FaXmark size={22} />
              </button>
            </div>
            <div className={modalStyles.body}>
              {loading ? (
                <div className={modalStyles.loader}>
                  <span>Загрузка...</span>
                </div>
              ) : (
                <>
                  <ProductCarousel
                    images={images}
                    mainImage={product?.mainImage}
                  />
                  <h1 className={pageStyles.title}>{product?.title}</h1>
                  <div className={pageStyles.priceBlock}>
                    <span className={pageStyles.price}>{product?.price} ₽</span>
                    <StockAvailabillity
                      stock={product?.stock ?? 0}
                      inStock={product?.inStock}
                    />
                    {product?.inStock === 1 && (
                      <UrgencyText stock={product?.stock ?? 5} />
                    )}
                  </div>
                  <div>
                    <AddToCartSingleProductBtn
                      quantityCount={1}
                      product={product}
                    />
                  </div>
                  <div>
                    <BuyNowSingleProductBtn
                      quantityCount={1}
                      product={product}
                    />
                  </div>
                  <div className={pageStyles.wishlistWrapper}>
                    <AddToWishlistBtn product={product} slug={productSlug} />
                  </div>
                  <ProductTabs />
                  <div className={pageStyles.infoBlock}>
                    Здесь будет дополнительная информация о товаре, условиях
                    покупки, гарантии и других важных деталях для клиента. Вы
                    можете добавить сюда любые тексты, которые нужны для вашего
                    магазина.
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
