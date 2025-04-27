import LegalInfo from "@/components/LegalInfo";
import ProductCarousel from "@/components/ProductCarousel";
import ReviewsSection from "@/components/ReviewsSection";
import dynamic from "next/dynamic";

// --- Data Fetching Functions (Server-Side) ---
// Replace with your actual API calls or data sources

// Example Product type (adjust as needed)
interface Product {
  id: string | number;
  title: string;
  images: string;
  price: number; // Ensure price is included if used in ProductCarousel
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
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`,
      {
        // Use NEXT_PUBLIC_API_BASE_URL consistently
        cache: "no-store", // Or configure caching
      }
    );
    if (!res.ok) {
      console.error(
        `Failed to fetch products: ${res.status} ${res.statusText}`
      );
      // Return empty array or throw error depending on desired behavior
      return [];
      // throw new Error("Failed to fetch products");
    }
    const data = await res.json();
    // Ensure data is an array, provide default if not
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error in getFeaturedProducts:", error);
    return []; // Return empty array on fetch error
  }
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
      author: "Илья Жданов",
      text: "Всё хуйня, переделывайте)",
    },
    {
      id: "r2",
      author: "Илья Жданов",
      text: "Всё хуйня, переде��ывайте)",
    },
    {
      id: "r3",
      author: "Илья Жданов",
      text: "Всё хуйня, переделывайте)",
    },
    {
      id: "r4",
      author: "Илья Жданов",
      text: "Всё хуйня, переделывайте)",
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
        backgroundColor: "var(--primary-color)", // Match background
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
      {/* --- Added Slogan Section --- */}
      {/* <SloganSection /> */}

      {/* Product Carousel - Pass fetched data */}
      {/* ProductCarousel is a Client Component but receives data from the Server Component */}
      {/* Banner/background for carousel is handled within ProductCarousel.module.css */}
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
