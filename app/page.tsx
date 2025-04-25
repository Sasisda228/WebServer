"use client";
import dynamic from "next/dynamic";

// динамический импорт TeamAdvantages
const TeamAdvantages = dynamic(() => import("@/components/TeamAdvantages"), {
  ssr: false, // отключаем SSR, потому что framer-motion клиентский
  loading: () => <p style={{ textAlign: "center" }}>Загрузка секции...</p>,
});

const Home = () => {
  return (
    <div>
      <TeamAdvantages />
    </div>
  );
};

export default Home;
