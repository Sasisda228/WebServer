"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link"; // Import Link for navigation
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// Import necessary icons
import {
  MdExplore,
  MdHome,
  MdPersonOutline,
  MdShoppingCart,
} from "react-icons/md";
import CategoryBar from "./CategoryBar";
import styles from "./NavBar.module.css";
import ProfileModal from "./ProfileModal";
interface category {
  label: string;
  cat: string;
}
interface NavItem {
  label: string;
  route: string; // Route or identifier
  icon: React.ElementType;
  action?: "navigate" | "modal"; // Define action type
}

// Updated navItems array
const navItems: NavItem[] = [
  { label: "Главная", route: "/", icon: MdHome, action: "navigate" },
  { label: "Каталог", route: "/shop", icon: MdExplore, action: "navigate" },
  // Items for the right side
  {
    label: "Корзина",
    route: "/checkout",
    icon: MdShoppingCart,
    action: "navigate",
  },
  {
    label: "Профиль",
    route: "profile_modal",
    icon: MdPersonOutline,
    action: "modal",
  }, // Use a unique route/key for modal action
];

const categories: category[] = [
  { label: "Автоматы", cat: "Rifles" },
  { label: "Пистолеты", cat: "Pistols" },
  { label: "наборы", cat: "Packs" },
  { label: "Орбизы", cat: "Orbiz" },
  { label: "Прицелы", cat: "Sights" },
  { label: "Дополнительно", cat: "Other" },
]; // Keep categories if CategoryBar is still used

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [, setActiveItem] = useState(pathname);
  const [selectedCategory, setSelectedCategory] = useState<category | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  // navRef removed as it wasn't used in the provided snippet logic

  // Update active item and selected category when pathname changes
  useEffect(() => {
    // Determine active item based on path segments for better matching
    const currentBaseRoute = "/" + (pathname.split("/")[1] || "");
    setActiveItem(currentBaseRoute); // Set active based on base path (e.g., /shop, /cart)

    // Handle category selection display
    if (pathname.startsWith("/shop/")) {
      const category = pathname.split("/")[2];
      // setSelectedCategory(
      //   categories.find((ctg) => ctg.cat.toLowerCase() === category)
      // );
      setSelectedCategory(
        categories.filter((ctg) => ctg.cat.toLowerCase() === category)[0]
      );
    } else {
      setSelectedCategory(null);
    }
  }, [pathname]);

  // Handle navigation item click
  const handleItemClick = (item: NavItem) => {
    if (item.action === "modal" && item.route === "profile_modal") {
      setModalOpen(true);
    } else if (item.action === "navigate") {
      // Don't necessarily set active item here, rely on useEffect based on actual pathname
      router.push(item.route);
    }
    // If other modal types were added, handle them here
  };

  // Function to check if an item should be considered active
  const isNavItemActive = (itemRoute: string): boolean => {
    if (itemRoute === "/") {
      return pathname === "/"; // Only active if exactly "/"
    }
    // For other routes, check if the pathname starts with the item's route
    return itemRoute !== "/" && pathname.startsWith(itemRoute);
  };

  return (
    <>
      {/* Category Bar - appears when in shop section */}
      {/* Keep if needed, ensure categories are passed */}
      <CategoryBar categories={categories} currentCategory={selectedCategory} />

      <nav className={styles.navContainer}>
        <div className={styles.navContent}>
          {/* Left navigation items (Home, Catalog) */}
          <div className={styles.navSide}>
            {navItems.slice(0, 2).map((item) => {
              // Items 0 and 1
              const Icon = item.icon;
              const isActive = isNavItemActive(item.route);

              return (
                <motion.div
                  key={item.route}
                  className={`${styles.navItem} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={() => handleItemClick(item)} // Pass the whole item
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  role="button" // Add role
                  tabIndex={0} // Add tabIndex
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleItemClick(item);
                  }} // Basic keyboard accessibility
                >
                  <Icon className={styles.navIcon} />
                  {/* Show selected category name if active and available, otherwise default label */}
                  <span className={styles.navLabel}>
                    {item.route === "/shop" && isActive && selectedCategory
                      ? selectedCategory.cat
                      : item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className={styles.activeIndicator}
                      layoutId="activeIndicator" // Keep unique layoutId for smooth transition
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Center logo button - Navigates to /faq */}
          <Link href="/faq" passHref legacyBehavior>
            <motion.a // Use motion.a for animation on the anchor tag
              className={styles.logoContainer} // Reuse logo container style
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Перейти к частым вопросам"
            >
              <div className={styles.glitchLogo}>
                {" "}
                {/* Keep inner styling */}
                <span className={styles.glitch} data-text="47">
                  47
                </span>
              </div>
            </motion.a>
          </Link>

          {/* Right navigation items (Cart, Profile) */}
          <div className={styles.navSide}>
            {navItems.slice(2).map((item) => {
              // Items 2 and 3
              const Icon = item.icon;
              // Profile button doesn't show active state based on path
              const isActive =
                item.action === "navigate" && isNavItemActive(item.route);

              return (
                // Removed unnecessary wrapper div
                <motion.div
                  key={item.route}
                  className={`${styles.navItem} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={() => handleItemClick(item)} // Pass the whole item
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleItemClick(item);
                  }}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                  {/* Active indicator only for navigation items */}
                  {isActive && item.action === "navigate" && (
                    <motion.div
                      className={styles.activeIndicator}
                      layoutId="activeIndicator"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Profile modal - controlled by modalOpen state */}
      <AnimatePresence>
        {modalOpen && (
          <ProfileModal open={modalOpen} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}