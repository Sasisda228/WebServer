// No "use client" needed if it just renders props
import ProductItem from "./ProductItem";

// Define Product type (should match the one used in the page)
interface Product {
  id: string | number;
  title: string;
  images: string[];
  price: number;
  rating?: number;
  slug: string;
}

interface ProductsProps {
  products: Product[];
}

// Now accepts products as a prop
const Products = ({ products }: ProductsProps) => {
  // No more useState, useEffect, or fetchProducts

  // Loading state is handled by Suspense in the parent component

  if (!products || products.length === 0) {
    return (
      <div className="w-full text-center py-10">
        <h3 className="text-3xl mt-5 text-center w-full col-span-full max-[1000px]:text-2xl max-[500px]:text-lg">
          No products found for specified query
        </h3>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-2 ">
      {products.map((product: Product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Products;
