"use client";

import pageStyles from "@/app/product/[productSlug]/page.module.css"
import {
  AddToCartSingleProductBtn,
  AddToWishlistBtn,
  BuyNowSingleProductBtn,
  StockAvailabillity,
} from "@/components";
import axios from "axios";
import useEmblaCarousel from "embla-carousel-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaChevronDown, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
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

      // Извлекаем UUID всех файлов в группе для использования с Embla Carousel
      if (data.files && Array.isArray(data.files)) {
        const fileUUIDs = data.files.map((file: any) => file.uuid);
        setAlbumImages(fileUUIDs);
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

  // Карусель с Embla для улучшенного UX и полноэкранных изображений
  function ProductCarousel({
    images,
    mainImage,
  }: {
    images: ImageItem[];
    mainImage: string;
  }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    useEffect(() => {
      if (!emblaApi) return;
      
      const onInit = () => {
        setScrollSnaps(emblaApi.scrollSnapList());
      };
      
      const onSelect = () => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
      };
      
      emblaApi.on("select", onSelect);
      emblaApi.on("reInit", onInit);
      emblaApi.on("reInit", onSelect);

      onInit();
      onSelect();
      
      return () => {
        emblaApi.off("select", onSelect);
        emblaApi.off("reInit", onInit);
        emblaApi.off("reInit", onSelect);
      };
    }, [emblaApi]);

    if (!albumGroupId || albumImages.length === 0) {
      return (
        <div className={modalStyles.carouselImage} style={{ 
          width: "100%", 
          aspectRatio: "3/4", 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: '#f0f0f0' 
        }}>
          <span>Нет изображений</span>
        </div>
      );
    }

    return (
      <div className={styles.emblaCarouselWrapper}>
        <div className={styles.emblaViewport} ref={emblaRef}>
          <div className={styles.emblaContainer}>
            {albumImages.map((uuid, index) => (
              <div className={styles.emblaSlide} key={uuid + index}>
                <motion.div
                  className={modalStyles.carouselImage}
                  initial={prefersReducedMotion ? {} : { opacity: 0.7, scale: 0.98 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  <img
                    className={styles.emblaSlideImg}
                    alt={`Product image ${index + 1}`}
                    src={`https://ucarecdn.com/${albumGroupId}/${uuid}/-/preview/800x1067/-/quality/smart/-/format/auto/`}
                    style={{
                      width: "100%",
                      height: "auto",
                      aspectRatio: "3/4",
                      maxHeight: "calc(100vh - 200px)",
                      objectFit: "contain",
                    }}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {albumImages.length > 1 && (
          <>
            <button
              className={`${styles.emblaButton} ${styles.emblaButtonPrev}`}
              onClick={scrollPrev}
              aria-label="Предыдущее фото"
              type="button"
            >
              <FaChevronLeft size={22} />
            </button>
            <button
              className={`${styles.emblaButton} ${styles.emblaButtonNext}`}
              onClick={scrollNext}
              aria-label="Следующее фото"
              type="button"
            >
              <FaChevronRight size={22} />
            </button>
          </>
        )}

        {albumImages.length > 1 && (
          <div className={styles.emblaThumbnails}>
            {albumImages.map((uuid, idx) => (
              <button
                key={uuid + idx + "-thumb"}
                className={`${styles.emblaThumbBtn} ${
                  idx === selectedIndex ? styles.emblaThumbActive : ""
                }`}
                onClick={() => scrollTo(idx)}
                aria-label={`Фото ${idx + 1}`}
                type="button"
              >
                <img
                  alt={`Thumbnail ${idx + 1}`}
                  src={`https://ucarecdn.com/${albumGroupId}/${uuid}/-/preview/100x133/-/quality/smart/-/format/auto/`}
                  width="50"
                  height="67"
                  style={{ objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        )}
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
