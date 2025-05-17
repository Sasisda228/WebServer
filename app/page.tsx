import Counter from "@/components/Counter";
import LegalInfo from "@/components/LegalInfo";
import ProductCarousel from "@/components/ProductCarousel";
import ReviewsSection from "@/components/ReviewsSection";
import SloganSection from "@/components/SloganSection";
import dynamic from "next/dynamic";
// --- Data Fetching Functions (Server-Side) ---
// Replace with your actual API calls or data sources

// Example Product type (adjust as needed)

// Example Review type (adjust as needed)
interface Review {
  id: string | number;
  author: string;
  text: string;
}

async function getFeaturedProducts(): Promise<Product[]> {
  // TODO: Replace with your actual API endpoint or data fetching logic
  // Example fetching logic:
  const res = await fetch(`${process.env.API_URL}/api/products`, {
    cache: "no-store",
  }); // Or configure caching
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = await res.json();
  return data;

  // --- End Placeholder Data ---
}

async function getRecentReviews(): Promise<Review[]> {
  // TODO: Replace with your actual API endpoint or data fetching logic
  // Example:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/reviews/recent`, { cache: 'no-store' });
  // if (!res.ok) {
  //   throw new Error('Failed to fetch reviews');
  // }
  // const data = await res.json();
  // return data;

  // --- Placeholder Data ---
  console.log("Fetching recent reviews (server-side)...");
  await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate network delay
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
  // --- End Placeholder Data ---
}

// --- Dynamic Imports (Client Components) ---

// TeamAdvantages - Keep dynamic if it's heavy and uses client-side features extensively
const TeamAdvantages = dynamic(() => import("@/components/TeamAdvantages"), {
  ssr: true, // Keep SSR false if it relies heavily on client-side APIs/hooks like framer-motion
  loading: () => (
    <div
      style={{
        height: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--text-secondary)",
      }}
    >
      Загрузка преимуществ...
    </div>
  ), // Simple loading state
});

// --- Homepage Component (Server Component) ---

export default async function Home() {
  // Fetch data in parallel on the server
  const [products, reviews] = await Promise.all([
    getFeaturedProducts(),
    getRecentReviews(),
  ]);

  return (
    // Use a main tag for semantic structure
    <main>
      {/* Hero Section or other introductory content could go here */}
      <SloganSection />
      <section
        className="stats-section-wrapper"
        style={{
          padding: ".5rem 1rem",
          backgroundColor: "var(--primary-color)",
        }}
      >
        <h1 className="font-bold text-2xl text-white mb-2 flex justify-center">
          Вооружено бойцов
        </h1>

        <div className="flex justify-center">
          <Counter />
        </div>
      </section>
      {/* Product Carousel - Pass fetched data */}
      {/* ProductCarousel is a Client Component but receives data from the Server Component */}
      <ProductCarousel products={products} title="" />

      {/* Team Advantages Section - Dynamically loaded Client Component */}
      <TeamAdvantages />

      {/* Reviews Section - Pass fetched data */}
      {/* ReviewsSection is a Client Component using framer-motion */}
      <ReviewsSection reviews={reviews} title="Отзывы наших клиентов" />

      {/* Legal Info Footer - Server Component */}
      <LegalInfo />
    </main>
  );
}
