import Products from "@/components/Products";
import dynamic from "next/dynamic";
import styles from "./ShopPage.module.css";
const Filters = dynamic(() => import("@/components/Filters"), { ssr: false });
const Pagination = dynamic(() => import("@/components/Pagination"), {
  ssr: false,
});

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
}

async function getProducts(
  params: Props["params"],
  searchParams: Props["searchParams"]
) {
  const price = searchParams.price ?? "3000";
  const rating = searchParams.rating ?? "0";
  const sort = searchParams.sort ?? "id:desc";
  const page = searchParams.page ?? "1";

  const inStockNum = searchParams.inStock === "true" ? 1 : 0;
  const outOfStockNum = searchParams.outOfStock === "true" ? 1 : 0;

  let stockMode = "lte";
  if (inStockNum === 1 && outOfStockNum === 0) stockMode = "equals";
  if (inStockNum === 0 && outOfStockNum === 1) stockMode = "lt";
  if (inStockNum === 0 && outOfStockNum === 0) stockMode = "gt";

  const category = params.slug;

  const query = new URLSearchParams({
    [`filters[price][$lte]`]: price,
    [`filters[rating][$gte]`]: rating,
    [`filters[inStock][$${stockMode}]`]: "1",
    [`filters[category][$equals]`]: category,
    sort,
    page,
  });
  ///apiv3/products?...
  const res = await fetch(
    `http://http://212.67.12.199:3001/api/products?${query}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data;
}

export default async function ShopPage({ params, searchParams }: Props) {
  const formattedSlug = params.slug.replace(/-/g, " ");
  const products = await getProducts(params, searchParams);

  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.divider}></div>

        <div className={styles.grid}>
          <div>
            <div className={styles.titleWrapper}>
              <h1 className={styles.title}>
                <span className={styles.titleGradient}>47STORE</span>
                <br />
                {formattedSlug}
              </h1>
            </div>

            <Filters />
            <Products products={products} />
            <Pagination />
          </div>
        </div>
      </div>
    </div>
  );
}
