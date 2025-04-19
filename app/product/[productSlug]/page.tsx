"use client";

import {
  AddToCartSingleProductBtn,
  AddToWishlistBtn,
  BuyNowSingleProductBtn,
  StockAvailabillity,
  UrgencyText,
} from "@/components";
import { motion } from "framer-motion";
import Image from "next/image";
import { notFound } from "next/navigation";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import styles from "./page.module.css";

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

const SingleProductPage = async ({ params }: SingleProductPageProps) => {
  // Fetch product
  const data = await fetch(
    `http://localhost:3001/api/slugs/${params.productSlug}`
  );
  const product = await data.json();

  // Fetch images
  const imagesData = await fetch(
    `http://localhost:3001/api/images/${product.id}`
  );
  const images = await imagesData.json();

  if (!product || product.error) {
    notFound();
  }

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
      <div className={styles.carouselWrapper}>
        <button
          className={`${styles.carouselBtn} ${styles.left}`}
          onClick={prev}
          aria-label="Предыдущее фото"
          type="button"
        >
          <FaChevronLeft size={22} />
        </button>
        <motion.div
          key={current}
          className={styles.carouselImage}
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
          className={`${styles.carouselBtn} ${styles.right}`}
          onClick={next}
          aria-label="Следующее фото"
          type="button"
        >
          <FaChevronRight size={22} />
        </button>
        {/* Thumbnails */}
        <div className={styles.carouselThumbnails}>
          {allImages.map((img, idx) => (
            <button
              key={img + idx}
              className={`${styles.carouselThumbBtn} ${
                idx === current ? styles.active : ""
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
      <div className={styles.tabsWrapper}>
        <div className={styles.tabsHeader}>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`${styles.tabBtn} ${
                tab === t.key ? styles.active : ""
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
          className={styles.tabContent}
        >
          {TAB_CONTENT[tab]}
        </motion.div>
      </div>
    );
  }

  // Main layout
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* Карусель фото */}
        <ProductCarousel images={images} mainImage={product?.mainImage} />

        {/* Название товара */}
        <h1 className={styles.title}>{product?.title}</h1>

        {/* Цена и наличие */}
        <div className={styles.priceBlock}>
          <span className={styles.price}>{product?.price} ₽</span>
          <StockAvailabillity
            stock={product?.stock ?? 0}
            inStock={product?.inStock}
          />
          {product?.inStock === 1 && (
            <UrgencyText stock={product?.stock ?? 5} />
          )}
        </div>

        {/* Кнопка добавить в корзину */}
        <div>
          <AddToCartSingleProductBtn quantityCount={1} product={product} />
        </div>
        <div>
          <BuyNowSingleProductBtn quantityCount={1} product={product} />
        </div>
        {/* Кнопка wishlist */}
        <div className={styles.wishlistWrapper}>
          <AddToWishlistBtn product={product} slug={params.productSlug} />
        </div>

        {/* Вкладки */}
        <ProductTabs />

        {/* Текст ниже вкладок */}
        <div className={styles.infoBlock}>
          ��десь будет дополнительная информация о товаре, условиях покупки,
          гарантии и других важных деталях для клиента. Вы можете добавить сюда
          любые тексты, которые нужны для вашего магазина.
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
