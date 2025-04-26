"use client";
// Using pageStyles only for tab styling consistency
import pageStyles from "@/app/product/[productSlug]/page.module.css"
import { isValidEmailAddressFormat } from "@/lib/utils"; // Using the util function
import { AnimatePresence, motion } from "framer-motion"
import { signIn } from "next-auth/react"; // signOut and useSession removed
import React, { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
// Removed unused icons: FaRegUser, FaSquareFacebook, FaSquarePinterest, FaSquareXTwitter
// Kept FaRegEnvelope for potential future use if needed, but not used currently
// import { FaRegEnvelope } from "react-icons/fa6";
import styles from "./ProfileModal.module.css"

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

const TABS = [
  { label: "Вход", key: "login" },
  { label: "Регистрация", key: "register" },
];

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2, ease: "easeIn" } },
};

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  // Removed useSession hook
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state

  // Effect to control modal visibility and closing animation
  useEffect(() => {
    if (open) {
      setShow(true);
      setClosing(false);
      // Reset state when opening
      setTab("login");
      setError("");
      setLoading(false);
    } else if (show) {
      setClosing(true);
      // Wait for animation to finish before hiding
      const timer = setTimeout(() => {
        setShow(false);
        setClosing(false); // Reset closing state
      }, 350); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [open, show]); // Added show to dependencies

  // Registration submit handler
  const handleSubmitReg = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit

    const emailInput = e.currentTarget.elements.namedItem(
      "email"
    ) as HTMLInputElement;
    const passwordInput = e.currentTarget.elements.namedItem(
      "password"
    ) as HTMLInputElement;
    const confirmPasswordInput = e.currentTarget.elements.namedItem(
      "confirmPassword"
    ) as HTMLInputElement;

    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    setError(""); // Clear previous errors

    if (!isValidEmailAddressFormat(email)) {
      setError("Некорректный формат email");
      toast.error("Некорректный формат email");
      return;
    }

    if (!password || password.length < 8) {
      setError("Пароль должен быть не менее 8 символов");
      toast.error("Пароль должен быть не менее 8 символов");
      return;
    }

    if (confirmPassword !== password) {
      setError("Пароли не совпадают");
      toast.error("Пароли не совпадают");
      return;
    }

    setLoading(true); // Set loading state
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 400) {
        const data = await res.json();
        const errorMessage = data.error || "Этот email уже зарегистрирован";
        setError(errorMessage);
        toast.error(errorMessage);
      } else if (res.ok) {
        // Check for successful status codes (e.g., 200, 201)
        setError("");
        toast.success("Регистрация успешна! Теперь вы можете войти.");
        setTab("login"); // Switch to login tab after successful registration
      } else {
        // Handle other non-OK responses
        const errorText = await res.text();
        setError(`Ошибка регистрации: ${res.status} ${errorText || ""}`);
        toast.error("Ошибка регистрации, попробуйте снова.");
      }
    } catch (error) {
      setError("Ошибка сети, попробуйте снова.");
      toast.error("Ошибка сети, попробуйте снова.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Login submit handler
  const handleSubmitLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return; // Prevent double submit

    const emailInput = e.currentTarget.elements.namedItem(
      "email"
    ) as HTMLInputElement;
    const passwordInput = e.currentTarget.elements.namedItem(
      "password"
    ) as HTMLInputElement;

    const email = emailInput.value;
    const password = passwordInput.value;

    setError(""); // Clear previous errors

    if (!isValidEmailAddressFormat(email)) {
      setError("Некорректный формат email");
      toast.error("Некорректный формат email");
      return;
    }

    if (!password || password.length < 8) {
      // Although login doesn't strictly need length check, it's good UX consistency
      setError("Введите пароль (минимум 8 символов)");
      toast.error("Введите пароль");
      return;
    }

    setLoading(true); // Set loading state
    try {
      const res = await signIn("credentials", {
        redirect: false, // Handle redirect manually or based on response
        email,
        password,
      });

      if (res?.error) {
        // More specific error messages could be returned from the credentials provider
        setError("Неверный email или пароль");
        toast.error("Неверный email или пароль");
      } else if (res?.ok) {
        setError("");
        toast.success("Вход выполнен успешно!");
        onClose(); // Close modal on successful login
      } else {
        // Handle cases where res is null or not ok without specific error
        setError("Ошибка входа. Попробуйте снова.");
        toast.error("Ошибка входа. Попробуйте снова.");
      }
    } catch (error) {
      setError("Ошибка сети, попробуйте снова.");
      toast.error("Ошибка сети, попробуйте снова.");
      console.error("Login error:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Close on ESC key
  useEffect(() => {
    if (!show) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);

  // Render nothing if not 'show'
  if (!show) return null;

  return (
    <div
      className={`${styles.overlay} ${
        !open || closing ? styles.overlayHidden : "" // Use !open for initial hidden state
      }`}
      ref={overlayRef}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      <div className={`${styles.modal} ${closing ? styles.modalClosing : ""}`}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Закрыть окно профиля"
        >
          ×
        </button>

        {/* --- Login/Register Section --- */}
        <div className={styles.authContainer}>
          {" "}
          {/* Added container for better structure */}
          {/* Tabs */}
          <div className={pageStyles.tabsWrapper}>
            <div className={pageStyles.tabsHeader}>
              {TABS.map((t) => (
                <button
                  key={t.key}
                  className={`${pageStyles.tabBtn} ${
                    tab === t.key ? pageStyles.active : ""
                  }`}
                  onClick={() => {
                    if (!loading) {
                      // Prevent tab switch while loading
                      setTab(t.key as "login" | "register");
                      setError(""); // Clear errors on tab switch
                    }
                  }}
                  type="button"
                  disabled={loading} // Disable tab switch while loading
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Animated Form Content */}
            <div className={styles.formContentWrapper}>
              {" "}
              {/* Wrapper for consistent height/animation */}
              <AnimatePresence mode="wait">
                {tab === "login" ? (
                  <motion.form
                    key="login-form"
                    className={styles.profileForm}
                    onSubmit={handleSubmitLogin}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className={styles.formGroup}>
                      <label htmlFor="email" className={styles.formLabel}>
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={styles.formInput}
                        placeholder="you@email.com"
                        autoFocus // Focus on first input
                        disabled={loading}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="password" className={styles.formLabel}>
                        Пароль
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className={styles.formInput}
                        placeholder="********"
                        disabled={loading}
                      />
                    </div>
                    <div className={styles.formActions}>
                      <div className={styles.rememberMe}>
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className={styles.formCheckbox}
                          disabled={loading}
                        />
                        <label
                          htmlFor="remember-me"
                          className={styles.formCheckboxLabel}
                        >
                          Запомнить меня
                        </label>
                      </div>
                      <a href="#" className={styles.forgotPassword}>
                        Забыли пароль?
                      </a>
                    </div>
                    {error && <div className={styles.formError}>{error}</div>}
                    <div className={styles.buttonForm}>
                      <button
                        className={styles.buyButton} // Consider renaming this style if used elsewhere
                        type="submit"
                        disabled={loading} // Disable button when loading
                      >
                        {loading ? "Вход..." : "Войти"}
                      </button>
                    </div>
                  </motion.form>
                ) : (
                  <motion.form
                    key="register-form"
                    className={styles.profileForm}
                    onSubmit={handleSubmitReg}
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className={styles.formGroup}>
                      <label htmlFor="reg-email" className={styles.formLabel}>
                        Email
                      </label>
                      <input
                        id="reg-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className={styles.formInput}
                        placeholder="you@email.com"
                        autoFocus // Focus on first input
                        disabled={loading}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label
                        htmlFor="reg-password"
                        className={styles.formLabel}
                      >
                        Пароль (мин. 8 символов)
                      </label>
                      <input
                        id="reg-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8} // Add minLength attribute
                        className={styles.formInput}
                        placeholder="********"
                        disabled={loading}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label
                        htmlFor="confirm-password"
                        className={styles.formLabel}
                      >
                        Подтвердите пароль
                      </label>
                      <input
                        id="confirm-password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        minLength={8} // Add minLength attribute
                        className={styles.formInput}
                        placeholder="********"
                        disabled={loading}
                      />
                    </div>
                    {error && <div className={styles.formError}>{error}</div>}
                    <div className={styles.buttonForm}>
                      <button
                        className={styles.buyButton} // Consider renaming
                        type="submit"
                        disabled={loading} // Disable button when loading
                      >
                        {loading ? "Регистрация..." : "Зарегистрироваться"}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        {/* Removed session display section */}
      </div>
      {/* Removed global style block - rely on framer-motion and CSS modules */}
    </div>
  );
};

export default ProfileModal;
