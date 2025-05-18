"use client";
import { useEffect, useState } from "react";
import ProductItem from "./ProductItem";

interface Product {
  id: string | number;
  title: string;
  images: string[];
  price: number;
  rating?: number;
  slug: string;
}

interface ProductsProps {
  slug: {
    params: {
      slug: string;
    };
  };
}

const Products = ({ slug }: ProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/apiv3/products?category=${slug?.params?.slug}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        if (isMounted) setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full text-center py-10">
        <span>Загрузка товаров...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-4 md:grid-cols-3 sm:grid-cols-2 xs:grid-cols-1 justify-items-center">
      {products.length > 0 ? (
        products.map((product: Product) => (
          <div key={product.id} className="w-full">
            <ProductItem product={product} />
          </div>
        ))
      ) : (
        <h3 className="text-xl font-medium mt-5 text-center w-full col-span-full">
          No products found for specified query
        </h3>
      )}
    </div>
  );
};

export default Products;
