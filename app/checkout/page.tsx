"use client";

import {
  isValidCardNumber,
  isValidCreditCardCVVOrCVC,
  isValidCreditCardExpirationDate,
  isValidEmailAddressFormat,
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
// Базовый URL API (лучше вынести в .env.local)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Helper function to get the correct product image URL (из первого файла)
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

// Функция добавления продукта к заказу (из второго фрагмента)
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
      // Можно добавить более детальную обработку ошибок API
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
  // Состояние формы из первого файла (используем address вместо adress)
  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    lastname: "",
    phone: "",
    email: "",
    cardName: "",
    cardNumber: "",
    expirationDate: "",
    cvc: "",
    company: "",
    address: "", // Используем 'address'
    apartment: "",
    city: "",
    country: "",
    postalCode: "",
    orderNotice: "",
  });
  const router = useRouter();

  // Анимации для секций (из первого файла)
  const sectionVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 18 },
    },
    exit: { opacity: 0, y: -40, transition: { duration: 0.25 } },
  };

  // Удаление товара (из первого файла)
  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.success("Товар удалён из корзины");
  };

  // Обновление полей формы (из первого файла)
  const handleOrderInput = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCheckoutForm({ ...checkoutForm, [e.target.name]: e.target.value });
  };

  // Логика отправки заказа (объединенная)
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderLoading(true);
    setError(null); // Добавим сброс ошибки

    // --- Валидация из второго фрагмента ---
    if (
      !checkoutForm.name ||
      !checkoutForm.lastname ||
      !checkoutForm.phone ||
      !checkoutForm.email ||
      !checkoutForm.cardName ||
      !checkoutForm.cardNumber ||
      !checkoutForm.expirationDate ||
      !checkoutForm.cvc ||
      !checkoutForm.company || // Добавлено company
      !checkoutForm.address || // Используем address
      !checkoutForm.apartment ||
      !checkoutForm.city ||
      !checkoutForm.country ||
      !checkoutForm.postalCode
    ) {
      toast.error("Пожалуйста, заполните все обязательные поля");
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
    // Валидация телефона (можно добавить более строгую)
    if (!checkoutForm.phone.match(/^\+?[0-9\s\-()]{7,}$/)) {
      toast.error("Некорректный формат телефона");
      setOrderLoading(false);
      return;
    }
    if (!isValidEmailAddressFormat(checkoutForm.email)) {
      toast.error("Некорректный формат email");
      setOrderLoading(false);
      return;
    }
    if (!isValidNameOrLastname(checkoutForm.cardName)) {
      toast.error("Некорректное имя на карте");
      setOrderLoading(false);
      return;
    }
    if (!isValidCardNumber(checkoutForm.cardNumber)) {
      toast.error("Некорректный номер карты");
      setOrderLoading(false);
      return;
    }
    if (!isValidCreditCardExpirationDate(checkoutForm.expirationDate)) {
      toast.error("Некорректная дата окончания карты (ММ/ГГ или ММ/ГГГГ)");
      setOrderLoading(false);
      return;
    }
    if (!isValidCreditCardCVVOrCVC(checkoutForm.cvc)) {
      toast.error("Некорректный CVC/CVV (3 или 4 цифры)");
      setOrderLoading(false);
      return;
    }
    // --- Конец валидации ---

    try {
      // --- Отправка заказа (из второго фрагмента) ---
      const orderResponse = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: checkoutForm.name,
          lastname: checkoutForm.lastname,
          phone: checkoutForm.phone,
          email: checkoutForm.email,
          company: checkoutForm.company,
          address: checkoutForm.address, // Используем 'address'
          apartment: checkoutForm.apartment,
          postalCode: checkoutForm.postalCode,
          status: "processing", // Статус по умолчанию
          total: Math.round(total + total / 5 + SHIPPING_COST), // Отправляем итоговую сумму
          city: checkoutForm.city,
          country: checkoutForm.country,
          orderNotice: checkoutForm.orderNotice,
        }),
      });

      if (!orderResponse.ok) {
        // Попытка получить сообщение об ошибке из API
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

      // Добавление продуктов к заказу
      // Используем Promise.all для параллельной отправки (быстрее)
      await Promise.all(
        products.map((product) =>
          addOrderProduct(orderId, product.id, product.amount)
        )
      );
      // --- Конец отправки заказа ---

      // Успех: очистка, уведомление, смена шага
      clearCart();
      toast.success("Заказ успешно создан!");
      setStep("success"); // Переключаемся на шаг успеха

      // Сбрасываем форму (опционально, т.к. пользователь уходит со страницы)
      setCheckoutForm({
        name: "",
        lastname: "",
        phone: "",
        email: "",
        cardName: "",
        cardNumber: "",
        expirationDate: "",
        cvc: "",
        company: "",
        address: "",
        apartment: "",
        city: "",
        country: "",
        postalCode: "",
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
      setOrderLoading(false); // Убираем индикатор загрузки в любом случае
    }
  };

  // Редирект, если корзина пуста (из первого файла, немного изменено)
  useEffect(() => {
    // Проверяем только если шаг не 'success' и корзина пуста
    if (step !== "success" && products.length === 0) {
      toast.error("Ваша корзина пуста. Перенаправление...");
      // Небольшая задержка перед редиректом, чтобы пользователь увидел сообщение
      const timer = setTimeout(() => {
        router.push("/");
      }, 1500);
      return () => clearTimeout(timer); // Очистка таймера при размонтировании
    }
  }, [products, step, router]);

  // Состояние для ошибки (новое)
  const [error, setError] = useState<string | null>(null);

  // --- Рендеринг компонента (из первого файла, с мелкими правками) ---
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
              {/* Отображение пусто корзины или списка товаров */}
              {products.length === 0 ? (
                <div className={styles.emptyCart}>
                  {/* ... (код для пустой корзины как в первом файле) ... */}
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
              {/* Итоги корзины и кнопка "Перейти к оформлению" */}
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
              {/* Отображение ошибки API */}
              {error && <p className={styles.apiError}>{error}</p>}
              <form
                className={styles.orderForm}
                onSubmit={handleOrderSubmit}
                autoComplete="off" // Отключаем автозаполнение браузера для примера
                noValidate // Отключаем встроенную валидацию HTML5
              >
                {/* --- Поля формы (как в первом файле) --- */}
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
                <div className={styles.formRow}>
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
                  <div className={styles.formGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={checkoutForm.email}
                      onChange={handleOrderInput}
                    />
                  </div>
                </div>

                <h3 className={styles.formSectionTitle}>Адрес доставки</h3>
                <div className={styles.formGroup}>
                  {" "}
                  {/* Company на всю ширину */}
                  <label htmlFor="company">Компания (необязательно)</label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={checkoutForm.company}
                    onChange={handleOrderInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  {" "}
                  {/* Address на всю ширину */}
                  <label htmlFor="address">Адрес</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={checkoutForm.address}
                    onChange={handleOrderInput}
                    placeholder="Улица, дом"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="apartment">Квартира/Офис</label>
                    <input
                      type="text"
                      id="apartment"
                      name="apartment"
                      required
                      value={checkoutForm.apartment}
                      onChange={handleOrderInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="city">Город</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={checkoutForm.city}
                      onChange={handleOrderInput}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="country">Страна</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      required
                      value={checkoutForm.country}
                      onChange={handleOrderInput}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="postalCode">Почтовый индекс</label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      required
                      value={checkoutForm.postalCode}
                      onChange={handleOrderInput}
                    />
                  </div>
                </div>

                <h3 className={styles.formSectionTitle}>Детали оплаты</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="cardName">Имя на карте</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    required
                    value={checkoutForm.cardName}
                    onChange={handleOrderInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="cardNumber">Номер карты</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    required
                    value={checkoutForm.cardNumber}
                    onChange={handleOrderInput}
                    placeholder="XXXX XXXX XXXX XXXX"
                  />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="expirationDate">Срок действия</label>
                    <input
                      type="text"
                      id="expirationDate"
                      name="expirationDate"
                      required
                      value={checkoutForm.expirationDate}
                      onChange={handleOrderInput}
                      placeholder="ММ/ГГ"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="cvc">CVC/CVV</label>
                    <input
                      type="text"
                      id="cvc"
                      name="cvc"
                      required
                      value={checkoutForm.cvc}
                      onChange={handleOrderInput}
                      placeholder="XXX"
                    />
                  </div>
                </div>

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

                {/* Итоги заказа (как в первом файле) */}
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

                {/* Кнопки Назад/Оформить (как в первом файле) */}
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