import { DashboardSidebar } from "@/components";
import { Suspense } from "react";
import AddCategoryButton from "./AddCategoryButton";
import CategoryTable from "./CategoryTable";

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
          <Suspense fallback={<div>Loading categories...</div>}>
            <CategoryTable />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
