"use client";
import { useEffect, useState } from "react";
import ProductItem from "./ProductItem";

const Products = ({ slug }: any) => {
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
    <div className="grid grid-cols-3 justify-items-center max-lg:gap-x-2 max-[1300px]:gap-x-10 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-2 ">
      {products.length > 0 ? (
        products.map((product: Product) => (
          <ProductItem key={product.id} product={product} />
        ))
      ) : (
        <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
          No products found for specified query
        </h3>
      )}
    </div>
  );
};

export default Products;
