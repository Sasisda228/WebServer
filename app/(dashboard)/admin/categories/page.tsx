import { DashboardSidebar } from "@/components";
import dynamic from "next/dynamic";

// Dynamically import client components with no SSR to reduce bundle size
const CategoryTable = dynamic(() => import("./CategoryTable"), {
  ssr: false,
  loading: () => <div>Loading categories...</div>,
});

const AddCategoryButton = dynamic(() => import("./AddCategoryButton"), {
  ssr: false,
  loading: () => (
    <div className="w-[110px] h-[38px] bg-gray-200 animate-pulse rounded"></div>
  ),
});

export default function DashboardCategory() {
  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4">
      <DashboardSidebar />
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-center mb-5">
          All Categories
        </h1>
        <div className="flex justify-end mb-5">
          <AddCategoryButton />
        </div>
        <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto w-full h-[80vh]">
          <CategoryTable />
        </div>
      </div>
    </div>
  );
}
