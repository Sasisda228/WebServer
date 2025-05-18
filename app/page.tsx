import LegalInfo from "@/components/LegalInfo";
import ReviewsSection from "@/components/ReviewsSection";
import SloganSection from "@/components/SloganSection";
import TeamAdvantages from "@/components/TeamAdvantages";

// Указываем Next.js, что эта страница должна быть статической
export const dynamic = "force-static";
// Можно также добавить revalidate, если нужно периодическое обновление
export const revalidate = 3600; // обновление раз в час

// Example Review type (adjust as needed)
interface Review {
  id: string | number;
  author: string;
  text: string;
}

// Для статической страницы данные должны быть предопределены
// или получены во время сборки
function getRecentReviews(): Review[] {
  // Статические данные без имитации задержки
  return [
    {
      id: "r1",
      author: "Аноним",
      text: "Супер игрушка для мальчишек! Мой сразу начал военные тактики разрабатывать 😂 Держит удар, не ломается.",
    },
    {
      id: "r2",
      author: "Андрей",
      text: "Заказывали на день рождения племяннику, все гости были в шоке от этих орбизных пушек! Быстрая доставка, качественный пластик!! Советую!",
    },
    {
      id: "r3",
      author: "Аноним",
      text: "Заказал пушку неделю назад – работает как часы! Шарики летят по ощущениям метров на 5-10, точность отличная. Корпус реально похож на настоящий, но безопасный. Супер-весело играть на улице!",
    },
  ];
}

// Главная страница теперь не async
export default function Home() {
  // Получаем данные синхронно для статической генерации
  const reviews = getRecentReviews();

  return (
    <main>
      <SloganSection />
      <TeamAdvantages />
      <ReviewsSection reviews={reviews} title="Отзывы наших клиентов" />
      <LegalInfo />
    </main>
  );
}
