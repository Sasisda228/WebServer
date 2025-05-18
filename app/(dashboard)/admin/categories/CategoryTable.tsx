"use client";

import Link from "next/link"
import { useEffect, useState } from "react"
import { formatCategoryName } from "../../../../utils/categoryFormating"

export default function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/apiv3/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) return <div>Loading categories...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <table className="table table-md table-pin-cols">
      <thead>
        <tr>
          <th>
            <label>
              <input type="checkbox" className="checkbox" />
            </label>
          </th>
          <th>Name</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {categories.map((category) => (
          <tr key={category.id}>
            <th>
              <label>
                <input type="checkbox" className="checkbox" />
              </label>
            </th>
            <td>
              <div>
                <p>{formatCategoryName(category.name)}</p>
              </div>
            </td>
            <th>
              <Link
                href={`/admin/categories/${category.id}`}
                className="btn btn-ghost btn-xs"
              >
                details
              </Link>
            </th>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th></th>
          <th>Name</th>
          <th></th>
        </tr>
      </tfoot>
    </table>
  );
}