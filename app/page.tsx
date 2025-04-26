import LegalInfo from "@/components/LegalInfo";
import ProductCarousel from "@/components/ProductCarousel";
import ReviewsSection from "@/components/ReviewsSection";
import dynamic from "next/dynamic";

// --- Data Fetching Functions (Server-Side) ---
// Replace with your actual API calls or data sources

// Example Product type (adjust as needed)
interface Product {
  id: string | number;
  name: string;
  imageUrl: string;
}

// Example Review type (adjust as needed)
interface Review {
  id: string | number;
  author: string;
  text: string;
}

async function getFeaturedProducts(): Promise<Product[]> {
  // TODO: Replace with your actual API endpoint or data fetching logic
  // Example fetching logic:
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/featured`, { cache: 'no-store' }); // Or configure caching
  // if (!res.ok) {
  //   throw new Error('Failed to fetch products');
  // }
  // const data = await res.json();
  // return data;

  // --- Placeholder Data ---
  console.log("Fetching featured products (server-side)...");
  await new Promise((resolve) => setTimeout(resolve, 50)); // Simulate network delay
  return [
    { id: 1, name: "AK-47 | Redline", imageUrl: "/images/placeholder-ak.png" }, // Replace with actual paths
    { id: 2, name: "M4A4 | Howl", imageUrl: "/images/placeholder-m4.png" },
    {
      id: 3,
      name: "AWP | Dragon Lore",
      imageUrl: "/images/placeholder-awp.png",
    },
    {
      id: 4,
      name: "Glock-18 | Fade",
      imageUrl: "/images/placeholder-glock.png",
    },
    {
      id: 5,
      name: "Karambit | Doppler",
      imageUrl: "/images/placeholder-knife.png",
    },
  ];
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
      author: "ProGamer123",
      text: "Отличный сервис! Быстро получил свой скин, все честно.",
    },
    {
      id: "r2",
      author: "CSGO_Fan",
      text: "Большой выбор и хорошие цены. Рекомендую!",
    },
    {
      id: "r3",
      author: "SkinCollector",
      text: "Нашел редкий скин, которого нигде не было. Спасибо!",
    },
    {
      id: "r4",
      author: "NoobMaster69",
      text: "Все супер, поддержка отвечает быстро.",
    },
  ];
  // --- End Placeholder Data ---
}

// --- Dynamic Imports (Client Components) ---

// TeamAdvantages - Keep dynamic if it's heavy and uses client-side features extensively
const TeamAdvantages = dynamic(() => import("@/components/TeamAdvantages"), {
  ssr: false, // Keep SSR false if it relies heavily on client-side APIs/hooks like framer-motion
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

      {/* Product Carousel - Pass fetched data */}
      {/* ProductCarousel is a Client Component but receives data from the Server Component */}
      <ProductCarousel products={products} title="Популярные товары" />

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
