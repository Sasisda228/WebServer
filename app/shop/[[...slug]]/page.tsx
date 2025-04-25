import { Pagination, Products } from "@/components"; // Products is now simpler
import axios from "axios"; // Assuming axios is still used for fetching
import dynamic from "next/dynamic";
import { Suspense } from "react";
import styles from "./ShopPage.module.css";
import ProductsLoading from "./loading"; // Create a loading component

// Dynamically import Filters as it's a client component with heavy logic
const Filters = dynamic(() => import("@/components/Filters"), {
  ssr: false,
  // Optional: Add a loading component specific to Filters if needed
  // loading: () => <p>Loading filters...</p>,
});

// Helper function to format slug
const formatCategorySlug = (slug: string | undefined): string => {
  if (!slug) return "All Products";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Define Product type (adjust based on your actual API response)
interface Product {
  id: string | number;
  title: string;
  images: string[];
  price: number;
  rating?: number;
  slug: string;
}

// Server-side data fetching function
async function getProducts(
  searchParams: { [key: string]: string | string[] | undefined },
  params: { slug?: string[] }
): Promise<Product[]> {
  const slugParam = params.slug?.[0]; // Assuming category is the first part of the slug
  const inStockNum = searchParams?.inStock === "true" ? 1 : 0;
  const outOfStockNum = searchParams?.outOfStock === "true" ? 1 : 0;
  const page = searchParams?.page ? Number(searchParams?.page) : 1;
  const price = searchParams?.price || "3000";
  const rating = searchParams?.rating || "0";
  const sort = searchParams?.sort || "defaultSort"; // Provide a default sort

  let stockMode: string = "lte"; // Default: show all (in stock <= 1)
  if (inStockNum === 1 && outOfStockNum === 0) stockMode = "equals"; // Only in stock (inStock == 1)
  if (outOfStockNum === 1 && inStockNum === 0) stockMode = "lt"; // Only out of stock (inStock < 1)
  // if (inStockNum === 1 && outOfStockNum === 1) stockMode = 'lte'; // Both selected (redundant, same as default)
  if (inStockNum === 0 && outOfStockNum === 0) stockMode = "gt"; // None selected (inStock > 1 - effectively shows nothing based on typical boolean stock) - *Review this logic* maybe default to 'lte' if none selected?

  // Construct the API URL carefully
  const apiUrl = `/api/products?filters[price][$lte]=${price}&filters[rating][$gte]=${rating}&filters[inStock][$${stockMode}]=1&${
    slugParam ? `filters[category][$equals]=${slugParam}&` : ""
  }sort=${sort}&page=${page}`;

  console.log("Fetching products from:", apiUrl); // For debugging

  try {
    // IMPORTANT: Use absolute URL or configure baseURL for axios if running server-side
    // Or better, use fetch API directly
    const response = await axios.get("http://localhost:3001" + apiUrl); // Example using env var
    // const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + apiUrl);
    // const data = await response.json();
    return response.data; // Adjust based on your API response structure
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return []; // Return empty array on error
  }
}

// The Page component is now async
const ShopPage = async ({
  params,
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  // Fetch products on the server
  const productsPromise = getProducts(searchParams, params);
  const categoryName = formatCategorySlug(params.slug?.[0]);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        {/* Optional: Add category title */}
        <h1 className={styles.categoryTitle}>{categoryName}</h1>

        <div className={styles.divider}></div>

        <div className={styles.grid}>
          {/* Filters are client-side and dynamically loaded */}
          <Filters />

          {/* Products are fetched server-side, shown with Suspense */}
          <div>
            <div className={styles.titleWrapper}>
              {/* Title can remain or be adjusted */}
              <h2 className={styles.title}>
                <span className={styles.titleGradient}>47STORE</span> Products
              </h2>
            </div>
            <Suspense fallback={<ProductsLoading />}>
              {/* Pass server-fetched data to Products */}
              {/* We await the promise *inside* the component that needs it */}
              <ProductsWrapper productsPromise={productsPromise} />
            </Suspense>
            {/* Pagination remains client-side */}
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component to resolve the promise within Suspense boundary
async function ProductsWrapper({
  productsPromise,
}: {
  productsPromise: Promise<Product[]>;
}) {
  const products = await productsPromise;
  return <Products products={products} />; // Pass resolved data
}

export default ShopPage;
