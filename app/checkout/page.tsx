"use client";

// Убираем импорт isValidNameOrLastname, т.к. будем использовать встроенный regex
import UploadcareImage from "@uploadcare/nextjs-loader"
import axios from "axios"
import { AnimatePresence, motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { FaCheck, FaCircleQuestion, FaXmark } from "react-icons/fa6"
import { useProductStore } from "../_zustand/store"
import styles from "./CheckoutPage.module.css"

const SHIPPING_COST = 5;
const TAX_RATE = 0.20; // 20% налог, вынесен в константу
const API_BASE_URL = "/apiv3/";

// Helper function to get the correct product image URL (без изменений)
function getProductImageUrl(product: {
  images?: string[];
  image?: string;
}): string | null {
  if (product.images && product.images.length > 0) {
    const firstImage = product.images[0];
    if (
      firstImage.startsWith("https://ucarecdn.com/") &&
      firstImage.match(/^https:\/\/ucarecdn\.com\/[^/]+\/?$/)
    ) {
      const match = firstImage.match(/ucarecdn\.com\/([^/]+)/);
      if (match && match[1]) {
        const groupId = match[1];
        return `https://ucarecdn.com/${groupId}/nth/0/-/preview/751x1000/`;
      }
    }
    return firstImage;
  }
  if (product.image) {
    return `/${product.image}`;
  }
  return null;
}

// --- Функция добавления продукта к заказу (с axios) ---
const addOrderProduct = async (
  orderId: string,
  productId: string,
  productQuantity: number
) => {
  try {
    // Используем axios.post
    await axios.post(`${API_BASE_URL}/order-product`, {
      customerOrderId: orderId,
      productId: productId,
      quantity: productQuantity,
    });
    // Axios по умолчанию считает успешными только 2xx статусы,
    // поэтому отдельная проверка response.ok не нужна.
  } catch (error: any) { // Используем any или AxiosError
    // Axios помещает детали ошибки в error.response
    const errorMsg = error.response?.data?.message || error.message || "Неизвестная ошибка";
    console.error(
      `Error adding product ${productId} to order ${orderId}:`,
      error.response?.data || error
    );
    toast.error(
      `Ошибка при добавлении товара ${productId} к заказу: ${errorMsg}`
    );
  }
};

const CheckoutPage = () => {
  const {
    products,
    total: subTotal,
    removeFromCart,
    calculateTotals,
    clearCart,
  } = useProductStore(); // Переименуем total в subTotal для ясности
  const [step, setStep] = useState<"cart" | "order" | "success">("cart");
  const [orderLoading, setOrderLoading] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    adress: "", // Исправлено с adress на adress
    orderNotice: "",
  });
  const router = useRouter();

  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    exit: { opacity: 0, y: -40, transition: { duration: 0.25 } },
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    calculateTotals();
    toast.success("Товар удалён из корзины");
  };

  const handleOrderInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCheckoutForm({ ...checkoutForm, [e.target.name]: e.target.value });
  };

  // --- Расчет стоимости ---
  const calculatedTax = subTotal * TAX_RATE;
  const finalTotal =
    subTotal === 0 ? 0 : Math.round(subTotal + calculatedTax + SHIPPING_COST);

  // --- Обновленная логика отправки заказа ---
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setError(null);

    // --- Обновленная валидация ---
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s\-]+$/u; // Добавляем кириллицу, пробелы, дефисы

    if (
      !checkoutForm.name ||
      !checkoutForm.lastname ||
      !checkoutForm.phone ||
      !checkoutForm.adress // Добавлена проверка адреса
    ) {
      toast.error(
        "Пожалуйста, заполните все обязательные поля (Имя, Фамилия, Телефон, Адрес)"
      );
      setOrderLoading(false);
      return;
    }
    if (!nameRegex.test(checkoutForm.name)) {
      // Используем regex
      toast.error(
        "Некорректный формат имени (допустимы буквы, пробелы, дефисы)"
      );
      setOrderLoading(false);
      return;
    }
    if (!nameRegex.test(checkoutForm.lastname)) {
      // Используем regex
      toast.error(
        "Некорректный формат фамилии (допустимы буквы, пробелы, дефисы)"
      );
      setOrderLoading(false);
      return;
    }
    if (!checkoutForm.phone.match(/^\+?[0-9\s\-()]{7,}$/)) {
      toast.error("Некорректный формат телефона");
      setOrderLoading(false);
      return;
    }
    // Дополнительная валидация адреса (просто на непустоту)
    if (checkoutForm.adress.trim().length < 5) {
      // Пример: минимальная длина адреса
      toast.error("Пожалуйста, введите корректный адрес (мин. 5 символов)");
      setOrderLoading(false);
      return;
    }
    // --- Конец валидации ---

    try {
      // --- Отправка заказа с axios ---
      const orderPayload = {
        name: checkoutForm.name,
        lastname: checkoutForm.lastname,
        phone: checkoutForm.phone,
        email: "-",
        company: "-",
        adress: checkoutForm.adress, // <--- Исправлено: отправляем введенный адрес
        apartment: "-",
        postalCode: "-",
        status: "processing",
        total: finalTotal, // <--- Отправляем корректно рассчитанную итоговую сумму
        city: "-",
        country: "-",
        orderNotice: checkoutForm.orderNotice || "-",
      };

      // Используем axios.post, данные ответа будут в response.data
      const orderResponse = await axios.post(
        `${API_BASE_URL}/orders`,
        orderPayload
      );

      // Получаем ID из данных ответа axios
      const orderId: string = orderResponse.data.id;

      if (!orderId) {
        throw new Error("Не удалось получить ID созданного заказа.");
      }

      // Добавление продуктов (использует обновленный addOrderProduct с axios)
      await Promise.all(
        products.map((product) =>
          addOrderProduct(orderId, product.id, product.amount)
        )
      );

      clearCart();
      toast.success("Заказ успешно создан!");
      setStep("success");

      setCheckoutForm({
        name: "",
        lastname: "",
        phone: "",
        adress: "",
        orderNotice: "",
      });
    } catch (error: any) {
      // Используем any или AxiosError
      // Axios помещает детали ошибки в error.response
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Произошла неизвестная ошибка.";
      console.error("Order submission failed:", error.response?.data || error);
      setError(errorMsg);
      toast.error(`Ошибка оформления заказа: ${errorMsg}`);
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    calculateTotals();
    if (step !== "success" && products.length === 0) {
      toast.error("Ваша корзина пуста. Перенаправление...");
      const timer = setTimeout(() => {
        router.push("/");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [products, step, router]);

  const [error, setError] = useState<string | null>(null);

  // --- JSX (без изменений) ---
  return (
    <div className={styles.checkoutWrapper}>
      <div className={styles.divider}></div>

      <div className={styles.titleWrapper}>
        <h1 className={styles.title}>
          <span className={styles.titleGradient}>
            {step === "cart" && "Корзина"}
            {step === "order" && "Оформление"}
            {step === "success" && "Заказ принят"}
          </span>
        </h1>
      </div>
      <div className={styles.checkoutContainer}>
        <AnimatePresence mode="wait">
          {/* --- Шаг 1: Корзина --- */}
          {step === "cart" && (
            <motion.section
              key="cart"
              className={styles.cartSection}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {products.length === 0 ? (
                <div className={styles.emptyCart}>
                  <Image
                    src="/empty_cart.svg"
                    width={180}
                    height={180}
                    alt="Пустая корзина"
                  />
                  <p>Ваша корзина пуста</p>
                  <Link
                    href="/"
                    className={`${styles.backToShopBtn} ${styles.secondaryButton}`}
                  >
                    Вернуться к покупкам
                  </Link>
                </div>
              ) : (
                <ul className={styles.cartList}>
                  {products.map((product) => {
                    const imageUrl = getProductImageUrl(product);
                    return (
                      <motion.li
                        key={product.id}
                        className={styles.cartItem}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={styles.productImage}>
                          {imageUrl ? (
                            <UploadcareImage
                              alt={product.title}
                              src={imageUrl}
                              width={96}
                              height={96}
                              style={{
                                borderRadius: "12px",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <div className={styles.noImagePlaceholder}>
                              No Image
                            </div>
                          )}
                        </div>
                        <div className={styles.productInfo}>
                          <h3 className={styles.productTitle}>
                            {product.title}
                          </h3>
                          <p className={styles.productPrice}>
                            {product.price} ₽
                          </p>
                          <span className={styles.productAmount}>
                            x{product.amount}
                          </span>
                          <button
                            onClick={() => handleRemoveItem(product.id)}
                            className={styles.removeBtn}
                            aria-label="Удалить товар"
                          >
                            <FaXmark size={18} />
                          </button>
                          <div className={styles.stockStatus}>
                            <FaCheck className={styles.inStockIcon} />
                            <span>В наличии</span>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </ul>
              )}
              {products.length > 0 && (
                <motion.div
                  className={styles.cartSummary}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className={styles.summaryRow}>
                    <span>Товары:</span>
                    <span>{subTotal} ₽</span> {/* Используем subTotal */}
                  </div>
                  <div className={styles.summaryRow}>
                    <span>
                      Доставка
                      <FaCircleQuestion
                        className={styles.infoIcon}
                        title="Стоимость доставки по РФ"
                      />
                    </span>
                    <span>{SHIPPING_COST} ₽</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Налог ({Math.round(TAX_RATE * 100)}%):</span>
                    {/* Отображаем округленный налог */}
                    <span>{Math.round(calculatedTax)} ₽</span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span>Итого:</span>
                    {/* Отображаем итоговую сумму */}
                    <span>{finalTotal} ₽</span>
                  </div>
                  <button
                    className={styles.nextBtn}
                    onClick={() => setStep("order")}
                  >
                    Перейти к оформлению
                  </button>
                </motion.div>
              )}
            </motion.section>
          )}

          {/* --- Шаг 2: Оформление --- */}
          {step === "order" && (
            <motion.section
              key="order"
              className={styles.orderSection}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <h2 className={styles.sectionTitle}>Оформление заказа</h2>
              {error && <p className={styles.apiError}>{error}</p>}
              <form
                className={styles.orderForm}
                onSubmit={handleOrderSubmit}
                autoComplete="off"
                noValidate
              >
                {/* <h3 className={styles.formSectionTitle}>
                  Контактная информация
                </h3> */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="name">Имя</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={checkoutForm.name}
                      onChange={handleOrderInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="lastname">Фамилия</label>
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      required
                      value={checkoutForm.lastname}
                      onChange={handleOrderInput}
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Телефон</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={checkoutForm.phone}
                    onChange={handleOrderInput}
                    placeholder="+7 (XXX) XXX-XX-XX"
                  />
                </div>

                {/* <h3 className={styles.formSectionTitle}>Адрес доставки</h3> */}
                <div className={styles.formGroup}>
                  <label htmlFor="adress">Адрес</label>
                  <input
                    type="text"
                    id="adress"
                    name="adress"
                    required
                    value={checkoutForm.adress}
                    onChange={handleOrderInput}
                    placeholder="Город, Улица, дом, квартира/офис"
                  />
                </div>

                {/* <h3 className={styles.formSectionTitle}>Дополнительно</h3> */}
                <div className={styles.formGroup}>
                  <label htmlFor="orderNotice">
                    Ваш ник в телеграм и комментарий к заказу
                  </label>
                  <textarea
                    id="orderNotice"
                    name="orderNotice"
                    rows={3}
                    value={checkoutForm.orderNotice}
                    onChange={handleOrderInput}
                  />
                </div>

                <div className={styles.orderSummary}>
                  <div className={styles.summaryTotal}>
                    <span>Итого:</span>
                    {/* Отображаем итоговую сумму */}
                    <span>{subTotal} ₽</span>
                  </div>
                </div>

                <div className={styles.orderActions}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setStep("cart")}
                    disabled={orderLoading}
                  >
                    Назад в корзину
                  </button>
                  <button
                    type="submit"
                    className={styles.payBtn}
                    disabled={orderLoading}
                  >
                    {orderLoading ? "Оформляем..." : "Оформить заказ"}
                  </button>
                </div>
              </form>
            </motion.section>
          )}

          {/* --- Шаг 3: Успех --- */}
          {step === "success" && (
            <motion.section
              key="success"
              className={styles.successSection}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className={styles.successIcon}>
                <FaCheck size={48} />
              </div>
              <h2 className={styles.sectionTitle}>Спасибо за заказ!</h2>
              <p className={styles.successText}>
                Ваш заказ успешно оформлен. Мы свяжемся с вами для подтверждения
                в ближайшее время.
              </p>
              <Link
                href="/"
                className={`${styles.backToShopBtn} ${styles.secondaryButton}`}
              >
                Вернуться на главную
              </Link>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckoutPage;
