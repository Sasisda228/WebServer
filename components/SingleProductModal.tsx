"use client";

import pageStyles from "@/app/product/[productSlug]/page.module.css"
import { AddToCartSingleProductBtn, BuyNowSingleProductBtn, StockAvailabillity } from "@/components"
import UploadcareImage from "@uploadcare/nextjs-loader"
import axios from "axios"
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"
import { FaChevronDown } from "react-icons/fa6"
import { IoShareSocialOutline } from "react-icons/io5"
import {
  default as modalStyles,
  default as styles,
} from "./SingleProductModal.module.css"

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
    "Здесь подробное описание товара, его характеристики и преимущества. Мы предоставляем только высококачественные товары, которые прошли тщательную проверку перед отправкой клиенту.",
  delivery:
    "Доставка осуществляется по всей России в течение 2-5 рабочих дней. Для Москвы и Санкт-Петербурга доступна экспресс-доставка в день заказа при оформлении до 14:00.",
  return:
    "Возврат товара возможен в течение 14 дней после получения. Товар должен быть в оригинальной упаковке и не иметь следов использования. Для оформления возврата свяжитесь с нашей службой поддержки.",
};

interface SingleProductModalProps {
  productSlug: string;
  open: boolean;
  onClose: () => void;
  basePath?: string; // Optional: Base path to revert to (e.g., '/')
}

export default function SingleProductModal({
  productSlug,
  open,
  onClose,
  basePath = "/", // Default base path
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

  // --- URL Management ---
  useEffect(() => {
    let originalScrollY: number | null = null;

    if (open && productSlug) {
      // Store scroll position and lock body scroll
      originalScrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${originalScrollY}px`;
      document.body.style.width = "100%";

      // Update URL
      const modalUrl = `${basePath}?modalProduct=${productSlug}`;
      // Use replaceState to avoid adding multiple modal entries to history
      window.history.replaceState(
        { ...window.history.state, modalProduct: productSlug },
        "",
        modalUrl
      );

      // Show swipe indicator
      setShowSwipeIndicator(true);
      const timer = setTimeout(() => {
        setShowSwipeIndicator(false);
      }, 3000);

      return () => {
        // Restore body scroll
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        if (originalScrollY !== null) {
          window.scrollTo(0, originalScrollY);
        }
        clearTimeout(timer);

        // Revert URL only if this modal instance was the one that set it
        const currentQuery = new URLSearchParams(window.location.search);
        if (currentQuery.get("modalProduct") === productSlug) {
          window.history.replaceState(
            { ...window.history.state, modalProduct: undefined },
            "",
            basePath
          );
        }
      };
    } else if (!open) {
      // Ensure body scroll is unlocked if modal closes unexpectedly
      if (document.body.style.position === "fixed") {
        originalScrollY = parseInt(document.body.style.top || "0", 10) * -1;
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        if (originalScrollY !== null) {
          window.scrollTo(0, originalScrollY);
        }
      }
      // Optional: Revert URL if closed externally, though the cleanup function handles the primary case.
      // Consider if this is needed based on how onClose is triggered.
      // const currentQuery = new URLSearchParams(window.location.search);
      // if (currentQuery.has("modalProduct")) {
      //     window.history.replaceState({...window.history.state, modalProduct: undefined }, "", basePath);
      // }
    }
  }, [open, productSlug, basePath]); // Removed router from dependencies as we use window.history

  // --- Fetching Data ---
  const fetchAlbumImages = async (groupId: string) => {
    try {
      const response = await fetch(
        `https://api.uploadcare.com/groups/${groupId}/`,
        {
          headers: {
            Accept: "application/vnd.uploadcare-v0.7+json",
            Authorization: `Uploadcare.Simple 75ae123269ffcd1362e6:dabbafb5c211c86840bc`, // Consider moving keys to env variables
          },
        }
      );
      if (!response.ok)
        throw new Error(`Error fetching album info: ${response.status}`);
      const data = await response.json();
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

  const fetchProductData = useCallback(async () => {
    // Only fetch if open and productSlug is present, but don't re-fetch if product data already exists
    if (!open || !productSlug || product) return;

    setLoading(true);
    try {
      const productRes = await axios.get(`/apiv3/slugs/${productSlug}`);
      const productData = productRes.data;
      setProduct(productData); // Set product data first

      // Fetch images only after product data is set
      if (productData?.id) {
        const imgsRes = await axios.get(`/apiv3/images/${productData.id}`);
        setImages(imgsRes.data); // Assuming this is still needed alongside album

        // Check for Uploadcare album URL in productData.images (if applicable)
        // Adjust this logic based on where the album URL actually comes from
        const potentialAlbumUrl = productData.images?.[0]; // Example: assuming it's the first image URL
        if (
          potentialAlbumUrl &&
          typeof potentialAlbumUrl === "string" &&
          potentialAlbumUrl.includes("ucarecdn.com/") &&
          potentialAlbumUrl.includes("/~") // Check if it's likely an album URL structure
        ) {
          const match = potentialAlbumUrl.match(/ucarecdn\.com\/([^\/]+)/);
          if (match && match[1]) {
            setAlbumGroupId(match[1]);
            await fetchAlbumImages(match[1]); // Await fetching album images
          } else {
            setAlbumImages([]); // Reset if no valid group ID found
            setAlbumGroupId(null);
          }
        } else {
          setAlbumImages([]); // Reset if no album URL
          setAlbumGroupId(null);
        }
      } else {
        setImages([]);
        setAlbumImages([]);
        setAlbumGroupId(null);
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      // Optionally reset state or show an error message in the modal
      setProduct(null);
      setImages([]);
      setAlbumImages([]);
      setAlbumGroupId(null);
    } finally {
      setLoading(false);
    }
  }, [productSlug, open, product]); // Add product to dependency array

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  // --- Event Handlers & Effects ---

  // Close on ESC
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

  // Focus Management
  useEffect(() => {
    if (open && modalRef.current) {
      setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 100); // Delay ensures modal is rendered
    }
  }, [open]);

  // Handle Drag End for Closing
  const handleDragEnd = (_event: any, info: any) => {
    if (info.offset.y > 100) {
      onClose(); // This will trigger the URL revert via the useEffect cleanup
    }
  };

  // Share Functionality
  const handleShare = async () => {
    // Construct the unique URL for this modal state
    const shareUrl = `${window.location.origin}${basePath}?modalProduct=${productSlug}`;
    const shareTitle = product?.title || "Посмотрите этот товар";
    const shareText = "Нашел интересный товар, который может вам понравиться!";

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log("Sharing failed", error);
        // Optional: Provide feedback to the user if sharing fails
      }
    } else {
      // Fallback: Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Ссылка скопирована в буфер обмена"); // Consider using a toast notification
      } catch (err) {
        console.error("Failed to copy URL: ", err);
        alert("Не удалось скопировать ссылку"); // Feedback on failure
      }
    }
  };

  // --- Animations ---
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
      transition: { type: "spring", damping: 25, stiffness: 300 },
    },
    exit: { opacity: 0, y: "100%", transition: { duration: 0.3 } },
  };

  // --- Sub-Components ---

  // Product Carousel
  function ProductCarousel({
    mainImage, // Keep if still used, otherwise remove
  }: {
    images: ImageItem[];
    mainImage: string;
  }) {
    // Use albumImages if albumGroupId is set, otherwise fallback or show placeholder
    const displayImages =
      albumGroupId && albumImages.length > 0 ? albumImages : [];
    const [current, setCurrent] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Reset current index if images change (e.g., loading different product)
    useEffect(() => {
      setCurrent(0);
    }, [albumGroupId]);

    const prev = () => {
      if (isTransitioning || displayImages.length <= 1) return;
      setIsTransitioning(true);
      setCurrent((c) => (c === 0 ? displayImages.length - 1 : c - 1));
      setTimeout(() => setIsTransitioning(false), 300); // Animation duration
    };

    const next = () => {
      if (isTransitioning || displayImages.length <= 1) return;
      setIsTransitioning(true);
      setCurrent((c) => (c === displayImages.length - 1 ? 0 : c + 1));
      setTimeout(() => setIsTransitioning(false), 300); // Animation duration
    };

    const select = (idx: number) => {
      if (isTransitioning || idx === current || displayImages.length <= 1)
        return;
      setIsTransitioning(true);
      setCurrent(idx);
      setTimeout(() => setIsTransitioning(false), 300); // Animation duration
    };

    const handleTouchStart = (e: React.TouchEvent) => {
      if (displayImages.length <= 1) return;
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (displayImages.length <= 1) return;
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (displayImages.length <= 1) return;
      if (touchStart - touchEnd > 75) {
        // Adjust sensitivity
        next();
      }
      if (touchStart - touchEnd < -75) {
        // Adjust sensitivity
        prev();
      }
      // Reset touch points
      setTouchStart(0);
      setTouchEnd(0);
    };

    if (!albumGroupId || displayImages.length === 0) {
      // Handle case where there are no album images (e.g., show placeholder or mainImage)
      return (
        <div
          className={styles.carouselWrapper}
          style={{
            aspectRatio: "3/4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0f0f0",
          }}
        >
          {/* Optional: Show a placeholder or the original mainImage if available */}
          {mainImage ? (
            <UploadcareImage
              alt={product?.title || "Product image"}
              src={mainImage} // Use the original mainImage URL
              width={600}
              height={800}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                maxHeight: "calc(100vh - 200px)",
              }}
            />
          ) : (
            <span>Image not available</span>
          )}
        </div>
      );
    }

    return (
      <div
        className={styles.carouselWrapper}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Main Image Display */}
        <motion.div
          key={current} // Key change triggers animation
          className={styles.carouselImage}
          initial={prefersReducedMotion ? {} : { opacity: 0.8 }}
          animate={prefersReducedMotion ? {} : { opacity: 1 }}
          transition={{ duration: 0.3 }} // Match transition timeout
          style={{ width: "100%", aspectRatio: "3/4", maxWidth: "100vw" }}
        >
          <UploadcareImage
            alt={`Product image ${current + 1} for ${product?.title}`}
            // Construct URL for the nth image in the album
            src={`https://ucarecdn.com/${albumGroupId}/nth/${current}/`}
            width={600} // Adjust as needed for desired quality/size
            height={800} // Adjust as needed
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // Use contain to avoid cropping
              maxHeight: "calc(100vh - 200px)", // Limit height on smaller screens
            }}
          />
        </motion.div>

        {/* Thumbnails (only if more than one image) */}
        {displayImages.length > 1 && (
          <div className={styles.carouselThumbnails}>
            {displayImages.map(
              (
                _img,
                idx // Use index for key/src
              ) => (
                <button
                  key={`${albumGroupId}-${idx}`}
                  className={`${styles.carouselThumbBtn} ${
                    idx === current ? styles.active : ""
                  }`}
                  onClick={() => select(idx)}
                  aria-label={`Фото ${idx + 1}`}
                  type="button"
                  disabled={isTransitioning}
                >
                  <UploadcareImage
                    alt={`Thumbnail ${idx + 1}`}
                    // Construct URL for the nth image thumbnail
                    src={`https://ucarecdn.com/${albumGroupId}/nth/${idx}/-/preview/64x64/-/format/auto/-/quality/smart/`} // Example Uploadcare transformations
                    width={48} // Smaller size for thumbs
                    height={48}
                    style={{ objectFit: "cover", display: "block" }}
                  />
                </button>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  // Product Tabs
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
              aria-controls={`tabpanel-${t.key}`} // Accessibility
              role="tab" // Accessibility
              aria-selected={tab === t.key} // Accessibility
            >
              {t.label}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            id={`tabpanel-${tab}`} // Accessibility
            role="tabpanel" // Accessibility
            aria-labelledby={`tab-${tab}`} // Accessibility (needs id on button)
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }} // Faster transition for tabs
            className={pageStyles.tabContent}
          >
            {TAB_CONTENT[tab]}
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={modalStyles.modalOverlay}
          {...overlayAnimation}
          onClick={onClose} // Close when clicking overlay
        >
          {/* Stop propagation prevents overlay click from closing when clicking modal content */}
          <motion.div
            className={modalStyles.modalContent}
            ref={modalRef}
            style={{
              opacity: prefersReducedMotion ? 1 : modalOpacity, // Respect reduced motion
              scale: prefersReducedMotion ? 1 : modalScale, // Respect reduced motion
              y: prefersReducedMotion ? 0 : y, // Use y directly for drag
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }} // Allow vertical drag
            dragElastic={0.1} // Adjust elasticity
            onDragEnd={handleDragEnd}
            {...(prefersReducedMotion ? {} : modalAnimation)} // Apply animation only if motion is preferred
            onClick={(e) => e.stopPropagation()}
            aria-modal="true"
            role="dialog"
            aria-labelledby="product-modal-title"
          >
            {/* Header with Drag Handle */}
            <div
              className={modalStyles.header}
              ref={initialFocusRef}
              tabIndex={-1} // Make focusable for initial focus
            >
              <div
                className={modalStyles.handle}
                title="Свайп вниз для закрытия"
                role="presentation" // It's decorative
              />
            </div>

            {/* Scrollable Body */}
            <div className={modalStyles.body} ref={dragConstraints}>
              {loading ? (
                <div className={modalStyles.loader}>
                  <div className={modalStyles.loaderSpinner} />
                  <span>Загрузка товара...</span>
                </div>
              ) : !product ? (
                <div className={modalStyles.error}>
                  <span>Не удалось загрузить информацию о товаре.</span>
                  <button onClick={fetchProductData}>Попробовать снова</button>
                </div>
              ) : (
                // Product Content Grid
                <div className={modalStyles.productContent}>
                  {/* Image Section */}
                  <div
                    className={modalStyles.productImageSection}
                    style={{ width: "100%" }} // Ensure it takes full width in its grid area
                  >
                    <ProductCarousel
                      images={images} // Pass necessary props
                      mainImage={product?.mainImage} // Pass necessary props
                    />
                  </div>

                  {/* Details Section */}
                  <div className={modalStyles.productDetailsSection}>
                    <motion.h1
                      id="product-modal-title"
                      className={pageStyles.title} // Reuse page styles if appropriate
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 15 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      {product?.title}
                    </motion.h1>

                    <motion.div
                      className={pageStyles.priceBlock} // Reuse page styles
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 15 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.15, duration: 0.3 }}
                    >
                      <span className={pageStyles.price}>
                        {product?.price} ₽
                      </span>
                      {/* Ensure StockAvailabillity receives valid numbers */}
                      <StockAvailabillity
                        stock={product?.stock ?? 0}
                        inStock={product?.inStock ?? 0} // Provide default if undefined
                      />
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                      className={modalStyles.actionButtons}
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 15 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      <AddToCartSingleProductBtn
                        quantityCount={1} // Default quantity
                        product={product}
                      />
                      <BuyNowSingleProductBtn
                        quantityCount={1} // Default quantity
                        product={product}
                      />
                    </motion.div>

                    {/* Wishlist & Share */}
                    <motion.div
                      className={modalStyles.wishlistWrapper}
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 15 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.25, duration: 0.3 }}
                    >
                      <div className="flex justify-between items-center flex-wrap gap-y-2">
                        {" "}
                        {/* Added flex-wrap and gap */}
                        {/* <AddToWishlistBtn
                          product={product}
                          // slug={productSlug} // slug is likely not needed if product object is passed
                        /> */}
                        <button
                          onClick={handleShare}
                          className="flex items-center gap-x-2 cursor-pointer text-lg hover:text-blue-600 transition-colors" // Added styling
                          aria-label="Поделиться товаром"
                          type="button"
                        >
                          <IoShareSocialOutline
                            className="text-xl" // Removed fixed color
                            aria-hidden="true"
                          />
                          <span>ПОДЕЛИТЬСЯ</span>
                        </button>
                      </div>
                    </motion.div>

                    {/* Tabs */}
                    <motion.div
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 15 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <ProductTabs />
                    </motion.div>

                    {/* Additional Info Block */}
                    <motion.div
                      className={modalStyles.infoBlock}
                      initial={
                        prefersReducedMotion ? {} : { opacity: 0, y: 15 }
                      }
                      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.3 }}
                    >
                      Здесь будет дополнительная информация о товаре, условиях
                      покупки, гарантии и других важных деталях для клиента. Вы
                      можете добавить сюда любые тексты, которые нужны для
                      вашего магазина.
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Swipe Down Indicator */}
              {showSwipeIndicator &&
                !loading &&
                product && ( // Show only when content is loaded
                  <motion.div
                    className={modalStyles.swipeIndicator}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }} // Fade in slightly later
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
