"use client";

import {
  // Убираем неиспользуемые валидаторы карт и email
  // isValidCardNumber,
  // isValidCreditCardCVVOrCVC,
  // isValidCreditCardExpirationDate,
  // isValidEmailAddressFormat,
  isValidNameOrLastname,
} from "@/lib/utils";
import UploadcareImage from "@uploadcare/nextjs-loader";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaCircleQuestion, FaXmark } from "react-icons/fa6";
import { useProductStore } from "../_zustand/store";
import styles from "./CheckoutPage.module.css";

const SHIPPING_COST = 5;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

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
        return `https://ucarecdn.com/${groupId}/nth/0/`;
      }
    }
    return firstImage;
  }
  if (product.image) {
    return `/${product.image}`;
  }
  return null;
}

// Функция добавления продукта к заказу (без изменений)
const addOrderProduct = async (
  orderId: string,
  productId: string,
  productQuantity: number
) => {
  try {
    const response = await fetch(`${API_BASE_URL}/order-product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerOrderId: orderId,
        productId: productId,
        quantity: productQuantity,
      }),
    });
    if (!response.ok) {
      console.error(
        `Failed to add product ${productId} to order ${orderId}: ${response.statusText}`
      );
      toast.error(`Не удалось добавить товар ${productId} к заказу.`);
    }
  } catch (error) {
    console.error(
      `Error adding product ${productId} to order ${orderId}:`,
      error
    );
    toast.error(`Ошибка при добавлении товара ${productId} к заказу.`);
  }
};

const CheckoutPage = () => {
  const { products, total, removeFromCart, clearCart } = useProductStore();
  const [step, setStep] = useState<"cart" | "order" | "success">("cart");
  const [orderLoading, setOrderLoading] = useState(false);
  // --- Упрощенное состояние формы ---
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    address: "",
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
    toast.success("Товар удалён из корзины");
  };

  const handleOrderInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCheckoutForm({ ...checkoutForm, [e.target.name]: e.target.value });
  };

  // --- Обновленная логика отправки заказа ---
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setError(null);

    // --- Упрощенная валидация ---
    if (
      !checkoutForm.name ||
      !checkoutForm.lastname ||
      !checkoutForm.phone ||
      !checkoutForm.address
    ) {
      toast.error(
        "Пожалуйста, заполните все обязательные поля (Имя, Фамилия, Телефон, Адрес)"
      );
      setOrderLoading(false);
      return;
    }
    if (!isValidNameOrLastname(checkoutForm.name)) {
      toast.error("Некорректный формат имени");
      setOrderLoading(false);
      return;
    }
    if (!isValidNameOrLastname(checkoutForm.lastname)) {
      toast.error("Некорректный формат фамилии");
      setOrderLoading(false);
      return;
    }
    if (!checkoutForm.phone.match(/^\+?[0-9\s\-()]{7,}$/)) {
      toast.error("Некорректный формат телефона");
      setOrderLoading(false);
      return;
    }
    // --- Конец валидации ---

    try {
      // --- Отправка заказа с заглушками '-' ---
      const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: checkoutForm.name,
          lastname: checkoutForm.lastname,
          phone: checkoutForm.phone,
          email: "-", // Заглушка
          company: "-", // Заглушка
          address: checkoutForm.address,
          apartment: "-", // Заглушка
          postalCode: "-", // Заглушка
          status: "processing",
          total: Math.round(total + total / 5 + SHIPPING_COST),
          city: "-", // Заглушка
          country: "-", // Заглушка
          orderNotice: checkoutForm.orderNotice || "-", // Отправляем '-' если пусто
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Ошибка создания заказа: ${orderResponse.statusText}`
        );
      }

      const orderData = await orderResponse.json();
      const orderId: string = orderData.id;

      if (!orderId) {
        throw new Error("Не удалось получить ID созданного заказа.");
      }

      await Promise.all(
        products.map((product) =>
          addOrderProduct(orderId, product.id, product.amount)
        )
      );

      clearCart();
      toast.success("Заказ успешно создан!");
      setStep("success");

      // Сброс упрощенной формы
      setCheckoutForm({
        name: "",
        lastname: "",
        phone: "",
        address: "",
        orderNotice: "",
      });
    } catch (error) {
      console.error("Order submission failed:", error);
      setError(
        error instanceof Error ? error.message : "Произошла неизвестная ошибка."
      );
      toast.error(
        `Ошибка оформления заказа: ${
          error instanceof Error ? error.message : "Неизвестная ошибка"
        }`
      );
    } finally {
      setOrderLoading(false);
    }
  };

  useEffect(() => {
    if (step !== "success" && products.length === 0) {
      toast.error("Ваша корзина пуста. Перенаправление...");
      const timer = setTimeout(() => {
        router.push("/");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [products, step, router]);

  const [error, setError] = useState<string | null>(null);

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
          {/* --- Шаг 1: Корзина (без изменений) --- */}
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
                  <Link href="/" className={styles.backToShopBtn}>
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
                    <span>{total} ₽</span>
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
                    <span>Налог (прим.):</span>
                    <span>{Math.round(total / 5)} ₽</span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span>Итого:</span>
                    <span>
                      {total === 0
                        ? 0
                        : Math.round(total + total / 5 + SHIPPING_COST)}{" "}
                      ₽
                    </span>
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

          {/* --- Шаг 2: Оформление (Упрощенная форма) --- */}
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
                {/* --- Упрощенные поля формы --- */}
                <h3 className={styles.formSectionTitle}>
                  Контактная информация
                </h3>
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
                  {" "}
                  {/* Телефон на всю ширину */}
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

                <h3 className={styles.formSectionTitle}>Адрес доставки</h3>
                <div className={styles.formGroup}>
                  {" "}
                  {/* Адрес на всю ширину */}
                  <label htmlFor="address">Адрес</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={checkoutForm.address}
                    onChange={handleOrderInput}
                    placeholder="Город, Улица, дом, квартира/офис"
                  />
                </div>

                {/* Удалены поля: company, apartment, city, country, postalCode */}
                {/* Удалена секция "Детали оплаты" */}

                <h3 className={styles.formSectionTitle}>Дополнительно</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="orderNotice">Комментарий к заказу</label>
                  <textarea
                    id="orderNotice"
                    name="orderNotice"
                    rows={3}
                    value={checkoutForm.orderNotice}
                    onChange={handleOrderInput}
                  />
                </div>
                {/* --- Конец упрощенных полей --- */}

                {/* Итоги заказа (без изменений) */}
                <div className={styles.orderSummary}>
                  <div className={styles.summaryRow}>
                    <span>Товары:</span>
                    <span>{total} ₽</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Доставка:</span>
                    <span>{SHIPPING_COST} ₽</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Налог (прим.):</span>
                    <span>{Math.round(total / 5)} ₽</span>
                  </div>
                  <div className={styles.summaryTotal}>
                    <span>Итого:</span>
                    <span>
                      {total === 0
                        ? 0
                        : Math.round(total + total / 5 + SHIPPING_COST)}{" "}
                      ₽
                    </span>
                  </div>
                </div>

                {/* Кнопки Назад/Оформить (без изменений) */}
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

          {/* --- Шаг 3: Успех (без изменений) --- */}
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
                Ваш заказ успешно оформле��. Мы свяжемся с вами для
                подтверждения в ближайшее время.
              </p>
              <Link href="/" className={styles.backToShopBtn}>
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