"use client";

import pageStyles from "@/app/product/[productSlug]/page.module.css"
import {
  AddToCartSingleProductBtn,
  AddToWishlistBtn,
  BuyNowSingleProductBtn,
  StockAvailabillity,
} from "@/components";
import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa"; // Added FaTimes for close button
import { IoShareSocialOutline } from "react-icons/io5";
import { default as modalStyles } from "./SingleProductModal.module.css";

import type { EmblaOptionsType } from "embla-carousel"; // ← Типы теперь здесь
import useEmblaCarousel from "embla-carousel-react";
// Helper to manage CSS classes for animations
const manageAnimation = (
  elementRef: React.RefObject<HTMLElement>,
  shouldAnimate: boolean,
  animationClasses: {
    enter: string;
    enterActive: string;
    exit: string;
    exitActive: string;
  },
  duration: number,
  onAnimationEnd?: (type: "enter" | "exit") => void,
  isReducedMotion?: boolean
) => {
  const node = elementRef.current;
  if (!node) return;

  if (isReducedMotion) {
    // Just show/hide without animation
    if (shouldAnimate) {
      node.classList.remove(
        animationClasses.exit,
        animationClasses.exitActive,
        animationClasses.enter
      );
      node.classList.add(animationClasses.enterActive); // Directly to final state
      if (onAnimationEnd) onAnimationEnd("enter");
    } else {
      node.classList.remove(
        animationClasses.enter,
        animationClasses.enterActive,
        animationClasses.exit
      );
      node.classList.add(animationClasses.exitActive); // Directly to final state
      if (onAnimationEnd) onAnimationEnd("exit");
    }
    return;
  }

  if (shouldAnimate) {
    node.classList.remove(animationClasses.exit, animationClasses.exitActive);
    node.classList.add(animationClasses.enter);
    requestAnimationFrame(() => {
      node.classList.add(animationClasses.enterActive);
    });
    const timer = setTimeout(() => {
      node.classList.remove(
        animationClasses.enter,
        animationClasses.enterActive
      );
      if (onAnimationEnd) onAnimationEnd("enter");
    }, duration);
    return () => clearTimeout(timer);
  } else {
    node.classList.remove(animationClasses.enter, animationClasses.enterActive);
    node.classList.add(animationClasses.exit);
    requestAnimationFrame(() => {
      node.classList.add(animationClasses.exitActive);
    });
    const timer = setTimeout(() => {
      node.classList.remove(animationClasses.exit, animationClasses.exitActive);
      if (onAnimationEnd) onAnimationEnd("exit");
    }, duration);
    return () => clearTimeout(timer);
  }
};

const TABS = [
  { label: "Детали", key: "details" },
  { label: "Доставка", key: "delivery" },
  { label: "Возврат", key: "return" },
];

const TAB_CONTENT: Record<string, string> = {
  delivery:
    "Доставка осуществляется по всей России в течение 2-5 рабочих дней. Для Москвы и Санкт-Петербурга доступна экспресс-доставка в день заказа при оформлении до 14:00.",
  return:
    "Возврат товара возможен в течение 14 дней после получения. Товар должен быть в оригинальной упаковке и не иметь следов исп��льзования. Для оформления возврата свяжитесь с нашей службой поддержки.",
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
  const [loading, setLoading] = useState(true);
  const [showSwipeIndicator, setShowSwipeIndicator] = useState(true);
  const [albumGroupId, setAlbumGroupId] = useState<string | null>(null);
  const [albumImages, setAlbumImages] = useState<string[]>([]);

  const modalOverlayRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const initialFocusRef = useRef<HTMLDivElement>(null); // For header/handle
  const dragConstraintsRef = useRef<HTMLDivElement>(null); // For body scroll area

  // Reduced motion state
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setIsReducedMotion(mediaQuery.matches);
    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // State to control rendering of the modal after exit animation
  const [isModalRendered, setIsModalRendered] = useState(open);

  useEffect(() => {
    if (open) {
      setIsModalRendered(true); // Render immediately when opening
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      setShowSwipeIndicator(true);
      const timer = setTimeout(() => setShowSwipeIndicator(false), 3000);
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        window.scrollTo(0, scrollY);
        clearTimeout(timer);
      };
    }
  }, [open]);

  // Modal Animation Effect
  useEffect(() => {
    if (open) {
      // Enter animations
      manageAnimation(
        modalOverlayRef,
        true,
        {
          enter: modalStyles.modalOverlayEnter,
          enterActive: modalStyles.modalOverlayEnterActive,
          exit: modalStyles.modalOverlayExit,
          exitActive: modalStyles.modalOverlayExitActive,
        },
        300,
        undefined,
        isReducedMotion
      );
      manageAnimation(
        modalContentRef,
        true,
        {
          enter: modalStyles.modalContentEnter,
          enterActive: modalStyles.modalContentEnterActive,
          exit: modalStyles.modalContentExit,
          exitActive: modalStyles.modalContentExitActive,
        },
        300,
        undefined,
        isReducedMotion
      );
    } else if (isModalRendered) {
      // Only run exit if it was rendered
      // Exit animations
      manageAnimation(
        modalOverlayRef,
        false,
        {
          enter: modalStyles.modalOverlayEnter,
          enterActive: modalStyles.modalOverlayEnterActive,
          exit: modalStyles.modalOverlayExit,
          exitActive: modalStyles.modalOverlayExitActive,
        },
        200,
        undefined,
        isReducedMotion
      );
      manageAnimation(
        modalContentRef,
        false,
        {
          enter: modalStyles.modalContentEnter,
          enterActive: modalStyles.modalContentEnterActive,
          exit: modalStyles.modalContentExit,
          exitActive: modalStyles.modalContentExitActive,
        },
        300,
        () => {
          setIsModalRendered(false); // Unmount after exit animation
        },
        isReducedMotion
      );
    }
  }, [open, isModalRendered, isReducedMotion]);

  const fetchAlbumImages = async (groupId: string) => {
    try {
      const response = await fetch(
        `https://api.uploadcare.com/groups/${groupId}/`,
        {
          headers: {
            Accept: "application/vnd.uploadcare-v0.7+json",
            Authorization: `Uploadcare.Simple 75ae123269ffcd1362e6:dabbafb5c211c86840bc`,
          },
        }
      );
      if (!response.ok)
        throw new Error(`Error fetching album info: ${response.status}`);
      const data = await response.json();
      if (data.files && Array.isArray(data.files)) {
        setAlbumImages(data.files.map((file: any) => file.uuid));
      }
    } catch (error) {
      console.error("Error fetching album images:", error);
    }
  };

  const fetchProductData = useCallback(async () => {
    if (!productSlug) return; // Fetch data even if modal is not open yet, if slug changes
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
        if (firstImage.includes("ucarecdn.com") && firstImage.includes("/")) {
          const match = firstImage.match(/ucarecdn\.com\/([^\/]+)/);
          if (match && match[1]) {
            const groupId = match[1].split("/")[0];
            setAlbumGroupId(groupId);
            await fetchAlbumImages(groupId);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    } finally {
      setLoading(false);
    }
  }, [productSlug]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && initialFocusRef.current) {
      setTimeout(() => initialFocusRef.current?.focus(), 100);
    }
  }, [open]);

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
      navigator.clipboard.writeText(window.location.href);
      alert("Ссылка скопирована в буфер обмена");
    }
  };

  function ProductCarousel({
    albumGroupId,
    albumFileUUIDs,
  }: {
    albumGroupId: string | null;
    albumFileUUIDs: string[];
  }) {
    const OPTIONS: EmblaOptionsType = { loop: albumFileUUIDs.length > 1 };
    const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const scrollPrev = useCallback(
      () => emblaApi && emblaApi.scrollPrev(),
      [emblaApi]
    );
    const scrollNext = useCallback(
      () => emblaApi && emblaApi.scrollNext(),
      [emblaApi]
    );
    const scrollTo = useCallback(
      (index: number) => emblaApi && emblaApi.scrollTo(index),
      [emblaApi]
    );

    useEffect(() => {
      if (!emblaApi) return;
      const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
      emblaApi.on("select", onSelect);
      emblaApi.on("reInit", onSelect);
      onSelect(); // Initial sync
      return () => {
        emblaApi.off("select", onSelect);
        emblaApi.off("reInit", onSelect);
      };
    }, [emblaApi]);

    if (!albumGroupId || albumFileUUIDs.length === 0) {
      return (
        <div
          className={modalStyles.carouselImage}
          style={{
            width: "100%",
            aspectRatio: "3/4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#2a2a38" /* Darker placeholder */,
          }}
        >
          <span className="text-gray-400">Нет изображений</span>
        </div>
      );
    }

    return (
      <div className={modalStyles.emblaCarouselWrapper}>
        <div className={modalStyles.emblaViewport} ref={emblaRef}>
          <div className={modalStyles.emblaContainer}>
            {albumFileUUIDs.map((uuid, index) => (
              <div
                className={modalStyles.emblaSlide}
                key={albumGroupId + uuid + index}
              >
                <img
                  className={modalStyles.emblaSlideImg}
                  alt={`Product image ${index + 1}`}
                  src={`https://ucarecdn.com/${albumGroupId}/${uuid}/-/preview/800x1067/-/quality/smart/-/format/auto/`}
                  style={{
                    width: "100%",
                    height: "auto",
                    aspectRatio: "3/4",
                    maxHeight: "calc(100vh - 250px)",
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {albumFileUUIDs.length > 1 && (
          <>
            <button
              className={`${modalStyles.emblaButton} ${modalStyles.emblaButtonPrev}`}
              onClick={scrollPrev}
              aria-label="Предыдущее фото"
              type="button"
              disabled={!emblaApi?.canScrollPrev()}
            >
              <FaChevronLeft size={22} />
            </button>
            <button
              className={`${modalStyles.emblaButton} ${modalStyles.emblaButtonNext}`}
              onClick={scrollNext}
              aria-label="Следующее фото"
              type="button"
              disabled={!emblaApi?.canScrollNext()}
            >
              <FaChevronRight size={22} />
            </button>
          </>
        )}

        {albumFileUUIDs.length > 1 && (
          <div className={modalStyles.emblaThumbnails}>
            {albumFileUUIDs.map((uuid, idx) => (
              <button
                key={albumGroupId + uuid + idx + "-thumb"}
                className={`${modalStyles.emblaThumbBtn} ${
                  idx === selectedIndex ? modalStyles.emblaThumbActive : ""
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

  function ProductTabs({ description }: { description?: string }) {
    const [tab, setTab] = useState("details");
    // For tab content animation: key change on div will re-trigger CSS animation
    const getCurrentTabContent = () => {
      if (tab === "details")
        return description || "Описание товара временно отсутствует.";
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
        <div
          key={tab} // Key change triggers re-render and animation if class is applied
          className={`${pageStyles.tabContent} ${
            !isReducedMotion ? modalStyles.tabContentAnimated : ""
          }`}
        >
          {getCurrentTabContent()}
        </div>
      </div>
    );
  }

  // Staggered animation for product details
  // We'll apply classes with delays if needed, or a single class and CSS handles delays
  const detailItemBaseClass = !isReducedMotion
    ? modalStyles.detailItemAnimated
    : "";

  if (!isModalRendered && !open) {
    // Ensure component is unmounted after close animation
    return null;
  }

  return (
    // Portal or direct render
    <div
      ref={modalOverlayRef}
      className={`${modalStyles.modalOverlay} ${
        open ? "" : modalStyles.hiddenInitially
      }`} // Start hidden if not open
      onClick={onClose}
      role="presentation" // For click outside
    >
      <div
        ref={modalContentRef}
        className={`${modalStyles.modalContent} ${
          open ? "" : modalStyles.hiddenInitially
        }`}
        onClick={(e) => e.stopPropagation()}
        aria-modal="true"
        role="dialog"
        aria-labelledby="product-modal-title"
      >
        <div className={modalStyles.header} ref={initialFocusRef} tabIndex={-1}>
          <div
            className={modalStyles.handle}
            title="Перетащите для закрытия (функциональность удалена)" // Update title
            role="presentation"
          />
          <button
            onClick={onClose}
            className={modalStyles.closeButton}
            aria-label="Закрыть модальное окно"
          >
            <FaTimes />
          </button>
        </div>

        <div className={modalStyles.body} ref={dragConstraintsRef}>
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
                  albumGroupId={albumGroupId}
                  albumFileUUIDs={albumImages}
                />
              </div>

              <div className={modalStyles.productDetailsSection}>
                <h1
                  id="product-modal-title"
                  className={`${pageStyles.title} ${detailItemBaseClass}`}
                  style={
                    !isReducedMotion
                      ? ({ animationDelay: "0.1s" } as React.CSSProperties)
                      : {}
                  }
                >
                  {product?.title}
                </h1>

                <div
                  className={`${pageStyles.priceBlock} ${detailItemBaseClass}`}
                  style={
                    !isReducedMotion
                      ? ({ animationDelay: "0.2s" } as React.CSSProperties)
                      : {}
                  }
                >
                  <span className={pageStyles.price}>{product?.price} ₽</span>
                  <StockAvailabillity
                    stock={product?.stock ?? 0}
                    inStock={product?.inStock}
                  />
                </div>

                <div
                  className={`${modalStyles.actionButtons} ${detailItemBaseClass}`}
                  style={
                    !isReducedMotion
                      ? ({ animationDelay: "0.3s" } as React.CSSProperties)
                      : {}
                  }
                >
                  <AddToCartSingleProductBtn
                    quantityCount={1}
                    product={product}
                  />
                  <BuyNowSingleProductBtn quantityCount={1} product={product} />
                </div>

                <div
                  className={`${modalStyles.wishlistWrapper} ${detailItemBaseClass}`}
                  style={
                    !isReducedMotion
                      ? ({ animationDelay: "0.4s" } as React.CSSProperties)
                      : {}
                  }
                >
                  <div className="flex justify-between items-center">
                    <AddToWishlistBtn product={product} slug={productSlug} />
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-x-2 cursor-pointer"
                      aria-label="Поделиться товаром"
                    >
                      <IoShareSocialOutline className="text-xl text-custom-black" />
                      <span className="text-lg">ПОДЕЛИТЬСЯ</span>
                    </button>
                  </div>
                </div>

                <div
                  className={detailItemBaseClass}
                  style={
                    !isReducedMotion
                      ? ({ animationDelay: "0.5s" } as React.CSSProperties)
                      : {}
                  }
                >
                  <ProductTabs description={product?.description} />
                </div>
              </div>
            </div>
          )}

          {showSwipeIndicator &&
            open && ( // Only show if modal is open
              <div
                className={`${modalStyles.swipeIndicator} ${
                  !isReducedMotion ? modalStyles.swipeIndicatorAnimated : ""
                }`}
              >
                <FaChevronDown size={24} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}