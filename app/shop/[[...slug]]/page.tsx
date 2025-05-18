"use client";

import { Filters, Products } from "@/components";
import styles from "./ShopPage.module.css";

// improve readability of category text, for example category text "smart-watches" will be "smart watches"

const ShopPage = (slug: any) => {
  return (
    <div className={styles.root}>
      <div className={styles.container}>
        <div className={styles.divider}></div>
        {/* <div className={styles.titleWrapper}>
          <h1 className={styles.title}>
            <span className={styles.titleGradient}>47STORE</span>
            <br />
          </h1>
        </div> */}
        <div>
          <Filters />
          <Products slug={slug} />
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
