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
            question: "Это что вообще — оружие или игрушка? Это безопасно?",
            answer: [
              "Это игрушка, но не “лёгкая поделка”. Э��о орбизный автомат — стреляет мягкими водяными шариками, которые при попадании просто лопаются.",
              "",
              "Не травмирует, не пачкает, не требует разрешения.",
              "",
              "Проверено: можно играть даже с 5 лет под присмотром, спокойно запускать во дворе или в лесу.",
            ].join("\n"),
          },
          {
            id: 2,
            question: "Из чего сделан автомат? Это пластик, который сломается?",
            answer: [
              "Нет. Мы работаем только с моделями из прочного нейлона, а не из тонкого ABS-пластика.",
              "",
              "Многие модели усилены: металлический ствол, шестерёнки, затвор, флажок, мощный гирбокс.",
              "",
              "Это реальные тяжёлые автоматы — по ощущениям почти как страйкбольные.",
            ].join("\n"),
          },
          {
            id: 3,
            question: "А отдача и движущийся затвор — это реально работает?",
            answer: [
              "Да. Почти все наши модели оснащены системой Blowback — это значит, затвор двигается, и ощущается отдача, как у настоящего.",
              "",
              "Это главный кайф — ты не просто “жмёшь кнопку”, а реально чувствуешь стрельбу.",
            ].join("\n"),
          },
          {
            id: 4,
            question: "Можно ли накрутить глушитель, прицел, обвесы?",
            answer: [
              "Конечно. На большинстве моделей есть резьба 14 мм под глушитель/трассер и крепления для прицелов.",
              "",
              "Многие идут с планкой Пикатинни или “ласточкиным хвостом”, а некоторые можно доработать — и у нас сразу есть такие крышки.",
            ].join("\n"),
          },
          {
            id: 5,
            question: "Это вообще законно? Можно по улице идти с ним?",
            answer: [
              "Да, это абсолютно легально.",
              "",
              "Это не оружие, это игрушка. Она не имеет дульной энергии, запрещённых элементов или боевых патронов.",
              "",
              "На улице с собой носить — не рекомендуем, чтобы не пугать прохожих, но во дворе, на даче, в лесу — сколько угодно.",
            ].join("\n"),
          },
          {
            id: 6,
            question:
              "Я хочу подарить. Это вообще нормально — дарить такой автомат ребёнку?",
            answer: [
              "Не просто нормально — это самый популярный подарок у нас.",
              "",
              "Дарят на дни рождения, Новый год, выпускной, 23 февраля.",
              "",
              "Дети в восторге, взрослые удивляются, насколько всё “по-настоящему”.",
              "",
              "Плюс: идёт в подарочной упаковке, готов к вручению.",
            ].join("\n"),
          },
          {
            id: 7,
            question: "Что с гарантией и возвратом? Если что — пропадёте?",
            answer: [
              "Нет. Мы на связи, работаем честно, и если вдруг что-то пошло не так — в течение 14 дней разбираемся, помогаем, решаем.",
              "",
              "Не пропадаем. У нас шоурум в Москве и свои каналы связи. Мы не “однодневка”.",
            ].join("\n"),
          },
          {
            id: 8,
            question: "Можно приехать и посмотреть вживую?",
            answer: [
              "Да, у нас есть шоурум в Москве. Можно потрогать, пострелять, выбрать лично.",
              "",
              "Напишите нам — сориентируем по времени и адресу.",
            ].join("\n"),
          },
          {
            id: 9,
            question: "Доставка работает? Куда отправляете?",
            answer: [
              "Да, доставляем по всей России.",
              "",
              "По Москве — курьером (от 99₽, в течение нескольких часов).",
              "",
              "В регионы — СДЭК или Почта России, как удобно.",
              "",
              "Всё упаковано, всё доезжает в целости",
            ].join("\n"),
          },
        ]}
      />

      <LegalInfo />
    </main>
  );
}
