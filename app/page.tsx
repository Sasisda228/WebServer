"use client";
import FAQSection from "@/components/FAQSection";
import LegalInfo from "@/components/LegalInfo";
import SloganSection from "@/components/SloganSection";
import TeamAdvantages from "@/components/TeamAdvantages";
import { useEffect, useState } from "react";

// Главная страница теперь не async
export default function Home() {
  // Получаем данные синхронно для статической генерации
  const [scrollPosition, setScrollPosition] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const fullText = "Добро пожаловать!";
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth);

    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    // Typing animation
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 200); // Adjust typing speed here (milliseconds)

    // Blinking cursor animation
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Clean up event listeners
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);
  const isDesktop = windowWidth >= 1024;

  return (
    <main>
      <section className="relative h-[86vh] overflow-hidden">
        {/* Background image with parallax effect */}
        <div
          className="absolute inset-0 xl:h-[180vh] h-[100vh] w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/background.jpg')",
            backgroundPositionY: isDesktop ? "-10rem" : "top",
            transform: isDesktop
              ? `translateY(${-scrollPosition * 0.5}px)`
              : "none",
          }}
        />

        {/* Container for centered text */}
        <div className="absolute inset-0 flex items-start justify-center px-4 top-4">
          <div className="relative">
            {/* Radial gradient background behind text */}
            <div
              className="absolute inset-0 -m-8 rounded-full blur-md"
              style={{
                background:
                  "radial-gradient(circle, rgba(0, 0, 0, 0.7) 0%, rgba(255,255,255,0) 70%)",
                transform: "scale(2)",
              }}
            ></div>

            {/* Text content */}
            <h1 className="relative text-4xl font-bold text-white drop-shadow-lg text-center lg:text-6xl">
              {displayText}
              <span
                className={`${
                  showCursor ? "opacity-100" : "opacity-0"
                } ml-1 animate-pulse`}
              >
                |
              </span>
            </h1>
          </div>
        </div>

        {/* Bottom gradient overlay for smooth transition */}
        <div className="absolute bottom-0 h-32 w-full bg-gradient-to-t from-black/80 to-transparent"></div>
      </section>
      <SloganSection />
      <TeamAdvantages />
      <FAQSection
        faqs={[
          {
            id: 1,
            question: "Как быстро вы доставляете?",
            answer:
              "Мы доставляем заказы в течение 2-3 рабочих дней по городу.",
          },
          {
            id: 2,
            question: "Какие способы оплаты доступны?",
            answer:
              "Вы можете оплатить картой, наличными при получении или через электронные кошельки.",
          },
        ]}
      />

      <LegalInfo />
    </main>
  );
}
