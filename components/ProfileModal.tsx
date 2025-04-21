"use client";
import pageStyles from "@/app/product/[productSlug]/page.module.css";
import { isValidEmailAddressFormat } from "@/lib/utils";
import axios from "axios";
import { motion } from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import router from "next/router";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FaRegEnvelope,
  FaRegUser,
  FaSquareFacebook,
  FaSquarePinterest,
  FaSquareXTwitter,
} from "react-icons/fa6";
import styles from "./ProfileModal.module.css";

// Add animation for the form

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}
const TABS = [
  { label: "Вход", key: "login" },
  { label: "Регистрация", key: "register" },
];

const ProfileModal: React.FC<ProfileModalProps> = ({ open, onClose }) => {
  const { data: session } = useSession();
  const [show, setShow] = useState(open);
  const [closing, setClosing] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) {
      setShow(true);
      setClosing(false);
    } else if (show) {
      setClosing(true);
      setTimeout(() => {
        setShow(false);
        setClosing(false);
      }, 350);
    }
  }, [open]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };
  const handleSubmitReg = async (e: any) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    const confirmPassword = e.target[2].value;

    if (!isValidEmail(email)) {
      setError("Email is invalid");
      toast.error("Email is invalid");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password is invalid");
      toast.error("Password is invalid");
      return;
    }

    if (confirmPassword !== password) {
      setError("Passwords are not equal");
      toast.error("Passwords are not equal");
      return;
    }

    try {
      // sending API request for registering user
      const res = await axios.post(
        "/api/register",
        {
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 400) {
        toast.error("This email is already registered");
        setError("The email already in use");
      }
      if (res.status === 200) {
        setError("");
        toast.success("Registration successful");
        router.push("/login");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        toast.error("This email is already registered");
        setError("The email already in use");
      } else {
        toast.error("Error, try again");
        setError("Error, try again");
        console.log(error);
      }
    }
  };
  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };
  // Close on ESC
  useEffect(() => {
    if (!show) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [show, onClose]);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  const handleLogout = () => {
    setTimeout(() => signOut(), 1000);
    toast.success("Logout successful!");
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (
      e.currentTarget.elements.namedItem("email") as HTMLInputElement
    ).value;
    const password = (
      e.currentTarget.elements.namedItem("password") as HTMLInputElement
    ).value;

    if (!isValidEmailAddressFormat(email)) {
      setError("Email is invalid");
      toast.error("Email is invalid");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password is invalid");
      toast.error("Password is invalid");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      toast.error("Invalid email or password");
    } else {
      setError("");
      toast.success("Successful login");
      onClose();
    }
  };
  if (!show) return null;

  return (
    <div
      className={`${styles.overlay} ${
        !open || closing ? styles.overlayHidden : ""
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
          aria-label="Close profile modal"
        >
          ×
        </button>
        {session ? (
          <>
            <div className={styles.header}>
              <div>
                <div className={styles.imageWrap}>
                  <Image
                    src={
                      session?.user?.image
                        ? session.user.image
                        : "/user_placeholder.png"
                    }
                    width={220}
                    height={220}
                    alt={session?.user?.name || "User avatar"}
                    style={{ objectFit: "cover" }}
                    priority
                  />
                </div>
              </div>
              <div className={styles.info}>
                <h1 className={styles.title}>
                  {session?.user?.name || "No Name"}
                </h1>
                <p className={styles.price}>
                  <FaRegEnvelope className="inline mr-2" />
                  {session?.user?.email || "No Email"}
                </p>
                <div className={styles.actions}>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-x-2 font-semibold"
                  >
                    <FaRegUser className="text-white" />
                    <span>Log out</span>
                  </button>
                  <div className={styles.socials}>
                    <FaSquareFacebook />
                    <FaSquareXTwitter />
                    <FaSquarePinterest />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Tabs for Login/Register */}
            <div className={pageStyles.tabsWrapper}>
              <div className={pageStyles.tabsHeader}>
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    className={`${pageStyles.tabBtn} ${
                      tab === t.key ? pageStyles.active : ""
                    }`}
                    onClick={() => {
                      setTab(t.key as "login" | "register");
                      setError("");
                    }}
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
                className={pageStyles.tabContent}
              >
                {tab === "login" ? (
                  <form className={styles.profileForm} onSubmit={handleSubmit}>
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
                      />
                    </div>
                    <div className={styles.formActions}>
                      <div className={styles.rememberMe}>
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className={styles.formCheckbox}
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
                      <button className={styles.buyButton} type="submit">
                        Войти
                      </button>
                    </div>
                  </form>
                ) : (
                  <form
                    className={styles.profileForm}
                    onSubmit={handleSubmitReg}
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
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label
                        htmlFor="reg-password"
                        className={styles.formLabel}
                      >
                        Пароль
                      </label>
                      <input
                        id="reg-password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className={styles.formInput}
                        placeholder="********"
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
                        className={styles.formInput}
                        placeholder="********"
                      />
                    </div>
                    <div className={styles.buttonForm}>
                      <button className={styles.buyButton} type="submit">
                        Зарегистрироваться
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </>
        )}
      </div>
      {/* Animation keyframes for the form */}
      <style jsx global>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default ProfileModal;
