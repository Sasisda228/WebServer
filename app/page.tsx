import LegalInfo from "@/components/LegalInfo";
import ProductCarousel from "@/components/ProductCarousel";
import ReviewsSection from "@/components/ReviewsSection";
import SloganSection from "@/components/SloganSection";
import StatsCounter from "@/components/StatsCounter";
import dynamic from "next/dynamic";
import Link from "next/link"; // <--- Импортируем Link

// --- Data Fetching Functions (Server-Side) ---
// Replace with your actual API calls or data sources

// Example Product type (adjust as needed)
interface Product {
  id: string | number;
  title: string;
  images: string;
  price: number; // Добавим цену, если она есть в API
}

// Example Review type (adjust as needed)
interface Review {
  id: string | number;
  author: string;
  text: string;
}

async function getFeaturedProducts(): Promise<Product[]> {
  // TODO: Убедись, что API_URL определен в .env
  const apiUrl = process.env.API_URL || "http://localhost:3001/api"; // Фолбэк для локальной разработки
  try {
    const res = await fetch(`${apiUrl}/products?limit=8&isFeatured=true`, {
      // cache: "no-store", // Раскомментируй, если данные часто меняются
      next: { revalidate: 3600 }, // Или используй ревалидацию (например, каждый час)
    });
    if (!res.ok) {
      console.error(
        `Failed to fetch products: ${res.status} ${res.statusText}`
      );
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function getRecentReviews(): Promise<Review[]> {
  // TODO: Реализуй API для отзывов или используй статические данные
  console.log("Fetching recent reviews (server-side)...");
  await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate network delay
  return [
    {
      id: "r1",
      author: "Илья Жданов",
      text: "Отличный магазин, быстрая доставка и качественный товар!",
    },
    {
      id: "r2",
      author: "Мария Смирнова",
      text: "Автомат превзошел ожидания, дети в восторге (и муж тоже).",
    },
    {
      id: "r3",
      author: "Константин Петров",
      text: "Хороший выбор, но хотелось бы больше аксессуаров в наличии.",
    },
    {
      id: "r4",
      author: "Аноним",
      text: "Все супер, рекомендую!",
    },
  ];
}

// --- Dynamic Imports (Client Components) ---

const TeamAdvantages = dynamic(() => import("@/components/TeamAdvantages"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
        backgroundColor: "var(--primary-color)",
      }}
    >
      Загрузка преимуществ...
    </div>
  ),
});

// --- Homepage Component (Server Component) ---

export default async function Home() {
  const [products, reviews] = await Promise.all([
    getFeaturedProducts(),
    getRecentReviews(),
  ]);

  return (
    <main>
      <SloganSection />

      {/* --- Кнопка "Перейти в каталог" --- */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "1.5rem 1rem 0", // Отступ сверху и по бокам
          backgroundColor: "var(--primary-color)", // Фон как у соседних секций
        }}
      >
        <Link href="/shop" className="catalog-button">
          Перейти в каталог
        </Link>
      </div>
      {/* --------------------------------- */}

      {products && products.length > 0 && (
        <ProductCarousel products={products} title="Популярные товары" />
      )}

      <TeamAdvantages />

      <section
        className="stats-section-wrapper"
        style={{
          padding: "3rem 1rem",
          backgroundColor: "var(--primary-color)",
        }}
      >
        <StatsCounter label="Автоматов продано" initialValue={1357} />
      </section>

      {reviews && reviews.length > 0 && (
        <ReviewsSection reviews={reviews} title="Отзывы наших клиентов" />
      )}

      <LegalInfo />

      {/* --- Стили для кнопки (можно вынести в global.css или CSS модуль) --- */}
      <style jsx global>{`
        .catalog-button {
          display: inline-block;
          padding: 0.8rem 2rem;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-color, #ffffff);
          background: linear-gradient(
            90deg,
            var(--accent-color-1, #9a1840),
            var(--accent-color-2, #371b72)
          );
          border: none;
          border-radius: var(--border-radius, 12px);
          text-decoration: none;
          text-align: center;
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
        .catalog-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.3);
        }
        .catalog-button:active {
          transform: translateY(0);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </main>
  );
}
