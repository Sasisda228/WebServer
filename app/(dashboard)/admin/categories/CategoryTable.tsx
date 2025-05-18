"use client";

import Link from "next/link"
import { useEffect, useState } from "react"

// Define minimal type to avoid importing from large type files
type Category = {
  id: string;
  name: string;
};

// Simple formatter function to avoid importing utils
const formatCategoryName = (name: string): string => {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

export default function CategoryTable() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use AbortController for cleanup
    const controller = new AbortController();

    const fetchCategories = async () => {
      try {
        const response = await fetch("/apiv3/categories", {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Error fetching categories:", err);
          setError("Failed to load categories. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();

    // Cleanup function
    return () => controller.abort();
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
