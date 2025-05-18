"use client";

import { CustomButton } from "@/components"
import Link from "next/link"

export default function AddCategoryButton() {
  return (
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
  );
}