"use client";
import { Product } from "@/typings"; // Import the Product type if not already globally available
import axios from "axios";
import { useEffect, useState } from "react";
import ProductItem from "./ProductItem";

// Define an interface for the props
interface ProductsProps {
  slug: any; // Keep your existing slug type for now
  onProductClick: (slug: string) => void; // Add the handler prop
}

const Products = ({ slug, onProductClick }: ProductsProps) => {
  // Destructure onProductClick here
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);

      // Consider refining slug parsing for better type safety if possible
      const inStockNum = slug?.searchParams?.inStock === "true" ? 1 : 0;
      const outOfStockNum = slug?.searchParams?.outOfStock === "true" ? 1 : 0;
      const page = slug?.searchParams?.page
        ? Number(slug?.searchParams?.page)
        : 1;
      const price = slug?.searchParams?.price || 3000;
      const rating = Number(slug?.searchParams?.rating) || 0;
      const sort = slug?.searchParams?.sort || "title:asc"; // Default sort
      const categoryFilter = slug?.params?.slug?.[0]
        ? `filters[category][slug][$eq]=${slug.params.slug[0]}&`
        : ""; // Example using slug for category

      // Determine stock filtering logic
      let stockFilter = "";
      if (inStockNum === 1 && outOfStockNum === 0) {
        stockFilter = "filters[inStock][$gt]=0&"; // Only in stock
      } else if (inStockNum === 0 && outOfStockNum === 1) {
        stockFilter = "filters[inStock][$eq]=0&"; // Only out of stock
      }
      // If both are checked or neither is checked, don't add a stock filter (show all)

      // Construct the API URL more clearly
      const apiUrl = `/apiv3/products?populate=category&filters[price][$lte]=${price}&filters[rating][$gte]=${rating}&${categoryFilter}${stockFilter}sort=${sort}&pagination[page]=${page}&pagination[pageSize]=12`; // Added pageSize

      try {
        // Use the constructed URL
        const response = await axios.get(apiUrl);
        // Assuming your API returns data in response.data.data for Strapi v4 structure
        if (isMounted) setProducts(response.data.data || response.data); // Adjust based on actual API response structure
      } catch (error) {
        console.error("Error fetching products:", error); // Log the error
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [slug]); // Dependency array remains the same

  if (loading) {
    return (
      <div className="w-full text-center py-10">
        {/* Consider using a more visually appealing loader/skeleton */}
        <span>Загрузка товаров...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 justify-items-center gap-x-4 gap-y-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
      {" "}
      {/* Adjusted grid classes slightly */}
      {products.length > 0 ? (
        products.map((product: Product) => (
          <ProductItem
            key={product.id}
            product={product}
            onProductClick={onProductClick} // Pass the handler down here
          />
        ))
      ) : (
        <div className="col-span-full text-center py-10">
          {" "}
          {/* Ensure this takes full width */}
          <h3 className="text-2xl text-gray-600">Товары не найдены</h3>
          <p className="text-gray-500">
            Попробуйте изменить параметры фильтрации.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;