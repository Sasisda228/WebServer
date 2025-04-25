// Example Loading Skeleton for Products
export default function ProductsLoading() {
  // You can create a more sophisticated skeleton UI
  return (
    <div className="w-full text-center py-10">
      <span>Загрузка товаров...</span>
      {/* Optional: Add skeleton placeholders */}
      {/* <div className="grid grid-cols-3 justify-items-center gap-x-2 gap-y-5 max-[1300px]:grid-cols-3 max-lg:grid-cols-2 max-[500px]:grid-cols-2 ">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full h-64 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div> */}
    </div>
  );
}
