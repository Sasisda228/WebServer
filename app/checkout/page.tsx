"use client";
import {
  isValidCardNumber,
  isValidCreditCardCVVOrCVC,
  isValidCreditCardExpirationDate,
  isValidEmailAddressFormat,
  isValidNameOrLastname,
} from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaCircleQuestion, FaXmark } from "react-icons/fa6";
import { useProductStore } from "../_zustand/store";
import styles from "./CheckoutPage.module.css";

const SHIPPING_COST = 5;

const CheckoutPage = () => {
  const { products, total, removeFromCart, clearCart } = useProductStore();
  const [step, setStep] = useState<"cart" | "order" | "success">("cart");
  const [orderLoading, setOrderLoading] = useState(false);
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
    address: "",
    apartment: "",
    city: "",
    country: "",
    postalCode: "",
    orderNotice: "",
  });
  const router = useRouter();

  // Анимации для секций
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

  const validateForm = () => {
    if (
      !checkoutForm.name ||
      !checkoutForm.lastname ||
      !checkoutForm.phone ||
      !checkoutForm.email ||
      !checkoutForm.cardName ||
      !checkoutForm.cardNumber ||
      !checkoutForm.expirationDate ||
      !checkoutForm.cvc ||
      !checkoutForm.company ||
      !checkoutForm.address ||
      !checkoutForm.apartment ||
      !checkoutForm.city ||
      !checkoutForm.country ||
      !checkoutForm.postalCode
    ) {
      toast.error("Пожалуйста, заполните все обязательные поля");
      return false;
    }
    if (!isValidNameOrLastname(checkoutForm.name)) {
      toast.error("Некорректный формат имени");
      return false;
    }
    if (!isValidNameOrLastname(checkoutForm.lastname)) {
      toast.error("Некорректный формат фамилии");
      return false;
    }
    if (!isValidEmailAddressFormat(checkoutForm.email)) {
      toast.error("Некорректный формат email");
      return false;
    }
    if (!isValidNameOrLastname(checkoutForm.cardName)) {
      toast.error("Некорректное имя на карте");
      return false;
    }
    if (!isValidCardNumber(checkoutForm.cardNumber)) {
      toast.error("Некорректный номер карты");
      return false;
    }
    if (!isValidCreditCardExpirationDate(checkoutForm.expirationDate)) {
      toast.error("Некорректная дата окончания карты");
      return false;
    }
    if (!isValidCreditCardCVVOrCVC(checkoutForm.cvc)) {
      toast.error("Некорректный CVC/CVV");
      return false;
    }
    return true;
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setOrderLoading(true);
    // Имитация отправки заказа
    setTimeout(() => {
      setOrderLoading(false);
      clearCart();
      setStep("success");
    }, 1800);
  };

  // Если корзина пуста, редиректим на главную
  React.useEffect(() => {
    if (products.length === 0 && step !== "success") {
      router.push("/");
    }
  }, [products, step, router]);

  return (
    <div className={styles.checkoutWrapper}>
      <div className={styles.divider}></div>

      <div className={styles.titleWrapper}>
        <h1 className={styles.title}>
          <span className={styles.titleGradient}>Корзина</span>
          <br />
        </h1>
      </div>
      <div className={styles.checkoutContainer}>
        <AnimatePresence mode="wait">
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
                  {products.map((product) => (
                    <motion.li
                      key={product.id}
                      className={styles.cartItem}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={styles.productImage}>
                        <Image
                          width={96}
                          height={96}
                          src={
                            product?.image
                              ? `/${product.image}`
                              : "/product_placeholder.jpg"
                          }
                          alt={product.title}
                          className={styles.image}
                        />
                      </div>
                      <div className={styles.productInfo}>
                        <h3 className={styles.productTitle}>{product.title}</h3>
                        <p className={styles.productPrice}>{product.price} ₽</p>
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
                  ))}
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
              <form
                className={styles.orderForm}
                onSubmit={handleOrderSubmit}
                autoComplete="off"
              >
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
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="address">Адрес</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      value={checkoutForm.address}
                      onChange={handleOrderInput}
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="apartment">Квартира</label>
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
                <div className={styles.formGroup}>
                  <label htmlFor="orderNotice">Комментарий к заказу</label>
                  <textarea
                    id="orderNotice"
                    name="orderNotice"
                    rows={2}
                    value={checkoutForm.orderNotice}
                    onChange={handleOrderInput}
                  />
                </div>
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
                    <span>Налог:</span>
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
                <div className={styles.orderActions}>
                  <button
                    type="button"
                    className={styles.backBtn}
                    onClick={() => setStep("cart")}
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
                Ваш заказ успешно оформлен. Мы свяжемся с вами для
                подтверждения.
              </p>
              <Link href="/" className={styles.backToShopBtn}>
                На главную
              </Link>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CheckoutPage;
