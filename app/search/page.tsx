"use client"; // Convert to Client Component

import {
  ProductItem,
  SectionTitle,
  SingleProductModal, // Import the modal
} from "@/components";
import { usePathname, useSearchParams } from "next/navigation"; // Import hooks
import { useEffect, useState } from "react"; // Import hooks

const SearchPage = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeModalSlug, setActiveModalSlug] = useState<string | null>(null);
  const search = searchParams.get("search") || "";

  // Data Fetching Effect
  useEffect(() => {
    let isMounted = true;
    const fetchSearchResults = async () => {
      if (!search) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://212.67.12.199:3001/api/search?query=${encodeURIComponent(
            search || ""
          )}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) setProducts(data);
      } catch (err) {
        console.error("Failed to fetch search results:", err);
        if (isMounted) setError("Failed to load search results.");
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSearchResults();

    return () => {
      isMounted = false; // Cleanup function
    };
  }, [search]);

  // Modal URL Sync Effect
  useEffect(() => {
    const modalSlugFromUrl = searchParams.get("modalProduct");
    if (modalSlugFromUrl) {
      if (activeModalSlug !== modalSlugFromUrl) {
        setActiveModalSlug(modalSlugFromUrl);
      }
    } else {
      if (activeModalSlug) {
        setActiveModalSlug(null);
      }
    }
  }, [searchParams.toString(), activeModalSlug]);

  // Modal Handlers
  const handleProductClick = (productSlug: string) => {
    setActiveModalSlug(productSlug);
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.set("modalProduct", productSlug);
    window.history.pushState(
      null,
      "",
      `${pathname}?${currentParams.toString()}`
    );
  };

  const handleModalClose = () => {
    const currentSlug = activeModalSlug;
    setActiveModalSlug(null);
    const currentParams = new URLSearchParams(searchParams.toString());
    if (currentParams.get("modalProduct") === currentSlug) {
      currentParams.delete("modalProduct");
      const queryString = currentParams.toString();
      window.history.replaceState(
        null,
        "",
        queryString ? `${pathname}?${queryString}` : pathname
      );
    }
  };

  return (
    <div>
      <SectionTitle title="Search Page" path="Home | Search" />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {search && !loading && !error && (
          <h3 className="text-4xl text-center py-10 max-sm:text-3xl">
            Showing results for {search}
          </h3>
        )}

        {loading && <div className="text-center py-10">Loading results...</div>}

        {error && <div className="text-center py-10 text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-2">
            {products.length > 0
              ? products.map((product: Product) => (
                  <ProductItem
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                  />
                ))
              : search && (
                  <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
                    No products found for specified query
                  </h3>
                )}
          </div>
        )}
      </div>

      {/* Render the SingleProductModal conditionally */}
      {activeModalSlug && (
        <SingleProductModal
          key={activeModalSlug}
          productSlug={activeModalSlug}
          open={!!activeModalSlug}
          onClose={handleModalClose}
          basePath={pathname}
        />
      )}
    </div>
  );
};

export default SearchPage;
