"use client";

import { CustomButton, DashboardSidebar } from "@/components";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatCategoryName } from "../../../../utils/categoryFormating";

const DashboardCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch(`${process.env.API_URL || ""}/api/categories`, {
          next: { revalidate: 60 }, // обновлять раз в 60 секунд
        });

        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return (
    <div className="bg-white flex justify-start max-w-screen-2xl mx-auto h-full max-xl:flex-col max-xl:h-fit max-xl:gap-y-4">
      <DashboardSidebar />
      <div className="w-full">
        <h1 className="text-3xl font-semibold text-center mb-5">
          All Categories
        </h1>
        <div className="flex justify-end mb-5">
          <Link href="/admin/categories/new">
            <CustomButton
              buttonType="button"
              customWidth="110px"
              paddingX={10}
              paddingY={5}
              textSize="base"
              text="Add new category"
            />
          </Link>
        </div>
        <div className="xl:ml-5 w-full max-xl:mt-5 overflow-auto w-full h-[80vh]">
          {isLoading ? (
            <p className="text-center py-4">Loading...</p>
          ) : (
            <table className="table table-md table-pin-cols">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-4">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td>
                        <input type="checkbox" className="checkbox" />
                      </td>
                      <td>
                        <p>
                          {category?.name
                            ? formatCategoryName(category.name)
                            : "N/A"}
                        </p>
                      </td>
                      <td>
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="btn btn-ghost btn-xs"
                        >
                          details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardCategory;
