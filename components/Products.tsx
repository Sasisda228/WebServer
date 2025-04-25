// components/Products.tsx (без "use client")
import ProductItem from "./ProductItem";

interface Props {
  products: Product[];
}

export default function Products({ products }: Props) {
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
}
