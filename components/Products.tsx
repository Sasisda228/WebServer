"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import ProductItem from "./ProductItem";

const Products = ({ slug }: any) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);

      const inStockNum = slug?.searchParams?.inStock === "true" ? 1 : 0;
      const outOfStockNum = slug?.searchParams?.outOfStock === "true" ? 1 : 0;

      let stockMode: string = "lte";
      if (inStockNum === 1) stockMode = "equals";
      if (outOfStockNum === 1) stockMode = "lt";
      if (inStockNum === 1 && outOfStockNum === 1) stockMode = "lte";
      if (inStockNum === 0 && outOfStockNum === 0) stockMode = "gt";

      try {
        const response = await axios.get(
          `/apiv3/products?filters[price][$lte]=${
            slug?.searchParams?.price || 100000
          }&filters[rating][$gte]=${
            Number(slug?.searchParams?.rating) || 0
          }&filters[inStock][$${stockMode}]=1&${
            slug?.params?.slug?.length > 0
              ? `filters[category][$equals]=${slug?.params?.slug}&`
              : ""
          }sort=${slug?.searchParams?.sort}`
        );
        if (isMounted) setProducts(response.data);
      } catch (error) {
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
    <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-2 ">
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
