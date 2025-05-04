"use client";

import pageStyles from "@/app/product/[productSlug]/page.module.css"
import {
  AddToCartSingleProductBtn,
  AddToWishlistBtn,
  BuyNowSingleProductBtn,
  StockAvailabillity,
} from "@/components";
import axios from "axios";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { IoShareSocialOutline } from "react-icons/io5";
import {
  default as modalStyles,
  default as styles,
} from "./SingleProductModal.module.css";

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
  delivery:
    "Доставка осуществляется по всей России в течение 2-5 рабочих дней. Для Москвы и Санкт-Петербурга доступна экспресс-доставка в день заказа при оформлении до 14:00.",
  return:
    "Возврат товара возможен в течение 14 дней после получения. Товар должен быть в оригинальной упаковке и не иметь следов использования. Для оформления возврата свяжитесь с нашей службой поддержки.",
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
  const prefersReducedMotion = useReducedMotion();
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(true);
  const [albumGroupId, setAlbumGroupId] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);
  // Для свайпа вниз
  const y = useMotionValue(0);
  const modalOpacity = useTransform(y, [0, 300], [1, 0]);
  const modalScale = useTransform(y, [0, 300], [1, 0.9]);
  const dragConstraints = useRef(null);

  // Для фокуса и доступности
  const modalRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLDivElement>(null);

  // Блокировка скролла body при открытии модалки
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Показываем индикатор свайпа на 3 секунды
      setShowSwipeIndicator(true);
      const timer = setTimeout(() => {
        setShowSwipeIndicator(false);
      }, 3000);

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
        clearTimeout(timer);
      };
    }
  }, [open]);
  const fetchAlbumImages = async (groupId: string) => {
    try {
      // Используем Uploadcare REST API для получения информации о группе
      const response = await fetch(
        `https://api.uploadcare.com/groups/${groupId}/`,
        {
          headers: {
            Accept: "application/vnd.uploadcare-v0.7+json",
            Authorization: `Uploadcare.Simple 75ae123269ffcd1362e6:dabbafb5c211c86840bc`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching album info: ${response.status}`);
      }

      const data = await response.json();

      // Извлекаем URL всех файлов в группе
      if (data.files && Array.isArray(data.files)) {
        const imageUrls = data.files.map(
          (file: any) => file.original_file_url || file.cdn_url
        );
        setAlbumImages(imageUrls);
      }
    } catch (error) {
      console.error("Error fetching album images:", error);
    }
  };
  // Загрузка данных о продукте
  const fetchProductData = useCallback(async () => {
    if (!open || !productSlug) return;

    setLoading(true);
    try {
      const productRes = await axios.get(`/apiv3/slugs/${productSlug}`);
      const productData = productRes.data;
      setProduct(productData);

      if (
        productData.images &&
        Array.isArray(productData.images) &&
        productData.images.length > 0
      ) {
        const firstImage = productData.images[0];

        // Проверяем, является ли URL ссылкой на альбом Uploadcare
        if (firstImage.includes("ucarecdn.com") && firstImage.includes("/")) {
          // Извлекаем ID альбома из URL
          const match = firstImage.match(/ucarecdn\.com\/([^\/]+)/);
          if (match && match[1]) {
            setAlbumGroupId(match[1]);
            fetchAlbumImages(match[1]);
          }
        }
      }
      if (productData?.id) {
        const imgsRes = await axios.get(`/apiv3/images/${productData.id}`);
        setImages(imgsRes.data);
      } else {
        setImages([]);
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  }, [productSlug, open]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // Закрытие по ESC
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Фокус
  useEffect(() => {
    if (open && modalRef.current) {
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Обработка свайпа вниз
  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.y > 100) {
      onClose();
    }
  };

  // Поделиться товаром
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title || "Посмотрите этот товар",
          text: "Нашел интересный товар, который может вам понравиться!",
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing failed", error);
      }
    } else {
      // Fallback - копирование ссылки в буфер обмена
      navigator.clipboard.writeText(window.location.href);
      alert("Ссылка скопирована в буфер обмена");
    }
  };

  // Анимации
  const overlayAnimation = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const modalAnimation = {
    initial: { opacity: 0, y: "100%" },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: "100%",
      transition: { duration: 0.3 },
    },
  };

  // Карусель с улучшенным UX и полноэкранными изображениями
  function ProductCarousel({
    images,
    mainImage,
  }: {
    images: ImageItem[];
    mainImage: string;
  }) {
    const allImages = albumImages;
    const [current, setCurrent] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const prev = () => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((c) => (c === 0 ? allImages.length - 1 : c - 1));
      setTimeout(() => setIsTransitioning(false), 300);
    };

    const next = () => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent((c) => (c === allImages.length - 1 ? 0 : c + 1));
      setTimeout(() => setIsTransitioning(false), 300);
    };

    const select = (idx: number) => {
      if (isTransitioning || idx === current) return;
      setIsTransitioning(true);
      setCurrent(idx);
      setTimeout(() => setIsTransitioning(false), 300);
    };

    // Свайп для мобильных устройств
    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (touchStart - touchEnd > 100) {
        next();
      }
      if (touchStart - touchEnd < -100) {
        prev();
      }
    };

    return (
      <div
        className={styles.carouselWrapper}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* <button
          className={`${styles.carouselBtn} ${styles.carouselBtnLeft}`}
          onClick={prev}
          aria-label="Предыдущее фото"
          type="button"
          disabled={isTransitioning}
        >
          <FaChevronLeft size={22} />
        </button> */}

        <motion.div
          key={current}
          className={modalStyles.carouselImage}
          initial={prefersReducedMotion ? {} : { opacity: 0.7, scale: 0.98 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%", aspectRatio: "3/4", maxWidth: "100vw" }}
        >
          <img
            alt={`Product image ${current + 1}`}
            src={`https://ucarecdn.com/${albumGroupId}/nth/${current}/-/preview/751x1000/`}
            width={600}
            height={800}
            style={{
              width: "100%",
              maxHeight: "calc(100vh - 200px)",
            }}
          />
        </motion.div>

        {/* <button
          className={`${styles.carouselBtn} ${styles.carouselBtnRight}`}
          onClick={next}
          aria-label="Следующее фото"
          type="button"
          disabled={isTransitioning}
        >
          <FaChevronRight size={22} />
        </button> */}

        {/* Thumbnails */}
        <div className={styles.carouselThumbnails}>
          {albumImages.map((img, idx) => (
            <button
              key={img + idx}
              className={`${styles.carouselThumbBtn} ${
                idx === current ? styles.active : ""
              }`}
              onClick={() => select(idx)}
              aria-label={`Фото ${idx + 1}`}
              type="button"
              disabled={isTransitioning}
            >
              <img
                alt={`Product image ${idx + 1}`}
                src={`https://ucarecdn.com/${albumGroupId}/nth/${idx}/-/preview/751x1000/`}
                width="32"
                height="32"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Tabs с улучшенным UX
  function ProductTabs({ description }: { description?: string }) {
    const [tab, setTab] = useState("details");

    // Function to get the correct content based on the active tab
    const getCurrentTabContent = () => {
      if (tab === "details") {
        // Use the passed description, provide a fallback if it's empty/null
        return description || "Описание товара временно отсутствует.";
      }
      // For other tabs, use the static content from TAB_CONTENT
      return TAB_CONTENT[tab];
    };

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
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={pageStyles.tabContent}
          >
            {getCurrentTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Увеличенное изображение

  // Модальное окно
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={modalStyles.modalOverlay}
          {...overlayAnimation}
          onClick={onClose}
        >
          <motion.div
            className={modalStyles.modalContent}
            ref={modalRef}
            style={{ opacity: modalOpacity, scale: modalScale }}
            drag="y"
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            {...modalAnimation}
            onClick={(e) => e.stopPropagation()}
            aria-modal="true"
            role="dialog"
            aria-labelledby="product-modal-title"
          >
            <div
              className={modalStyles.header}
              ref={initialFocusRef}
              tabIndex={-1}
            >
              <div
                className={modalStyles.handle}
                title="Свайп вниз для закрытия"
                role="presentation"
              />
            </div>

            <div className={modalStyles.body} ref={dragConstraints}>
              {loading ? (
                <div className={modalStyles.loader}>
                  <div className={modalStyles.loaderSpinner} />
                  <span>Загрузка товара...</span>
                </div>
              ) : (
                <div className={modalStyles.productContent}>
                  <div
                    className={modalStyles.productImageSection}
                    style={{ width: "100%" }}
                  >
                    <ProductCarousel
                      images={images}
                      mainImage={product?.mainImage}
                    />
                  </div>

                  <div className={modalStyles.productDetailsSection}>
                    <motion.h1
                      id="product-modal-title"
                      className={pageStyles.title}
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 20 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.4 }}
                    >
                      {product?.title}
                    </motion.h1>

                    <motion.div
                      className={pageStyles.priceBlock}
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 20 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.4 }}
                    >
                      <span className={pageStyles.price}>
                        {product?.price} ₽
                      </span>
                      <StockAvailabillity
                        stock={product?.stock ?? 0}
                        inStock={product?.inStock}
                      />
                    </motion.div>

                    <motion.div
                      className={modalStyles.actionButtons}
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 20 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.4 }}
                    >
                      <AddToCartSingleProductBtn
                        quantityCount={1}
                        product={product}
                      />
                      <BuyNowSingleProductBtn
                        quantityCount={1}
                        product={product}
                      />
                    </motion.div>

                    <motion.div
                      className={modalStyles.wishlistWrapper}
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 20 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.4 }}
                    >
                      <div className="flex justify-between items-center">
                        <AddToWishlistBtn
                          product={product}
                          slug={productSlug}
                        />
                        <button
                          onClick={handleShare}
                          className="flex items-center gap-x-2 cursor-pointer"
                          aria-label="Поделиться товаром"
                        >
                          <IoShareSocialOutline className="text-xl text-custom-black" />
                          <span className="text-lg">ПОДЕЛИТЬСЯ</span>
                        </button>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 20 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                    >
                      <ProductTabs description={product?.description} />
                    </motion.div>

                    <motion.div
                      className={modalStyles.infoBlock}
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 20 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.4 }}
                    ></motion.div>
                  </div>
                </div>
              )}

              {/* Индикатор свайпа */}
              {showSwipeIndicator && (
                <motion.div
                  className={modalStyles.swipeIndicator}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <FaChevronDown size={24} />
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
