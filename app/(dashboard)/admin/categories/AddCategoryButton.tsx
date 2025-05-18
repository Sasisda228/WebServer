"use client";

import Link from "next/link";

export default function AddCategoryButton() {
  return (
    <Link href="/admin/categories/new">
      <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors w-[110px]">
        Add new category
      </button>
    </Link>
  );
}
