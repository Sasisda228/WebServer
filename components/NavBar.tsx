"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MdExplore, MdHome } from "react-icons/md";
import CategoryBar from "./CategoryBar";
import styles from "./NavBar.module.css";
import ProfileModal from "./ProfileModal";

interface NavItem {
  label: string;
  route: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Главная", route: "/", icon: MdHome },
  { label: "Каталог", route: "/shop", icon: MdExplore },
];

const categories = ["Rifles", "Pistols", "Sights", "Bullets"];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState(pathname);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Update active item and selected category when pathname changes
  useEffect(() => {
    setActiveItem(pathname);

    // Extract category from pathname if in shop section
    if (pathname.startsWith("/shop/")) {
      const category = pathname.split("/")[2];
      if (category) {
        // Capitalize first letter
        const formattedCategory =
          category.charAt(0).toUpperCase() + category.slice(1);
        setSelectedCategory(formattedCategory);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [pathname]);

  // Handle navigation item click
  const handleItemClick = (
    route: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    setActiveItem(route);
    router.push(route);
  };

  // Handle logo click to open profile modal
  const handleLogoClick = () => {
    setModalOpen(true);
  };

  return (
    <>
      {/* Category Bar - appears when in shop section */}
      <CategoryBar categories={categories} currentCategory={selectedCategory} />

      <nav className={styles.navContainer} ref={navRef}>
        <div className={styles.navContent}>
          {/* Left navigation item (Home) */}
          <div className={styles.navSide}>
            {navItems.slice(0, 1).map((item) => {
              const Icon = item.icon;
              const isActive =
                item.route === "/"
                  ? activeItem === "/"
                  : activeItem.startsWith(item.route);

              return (
                <motion.div
                  key={item.route}
                  className={`${styles.navItem} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={(e) => handleItemClick(item.route, e)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                  {isActive && (
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

          {/* Center logo */}
          <motion.div
            className={styles.logoContainer}
            onClick={handleLogoClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={styles.glitchLogo}>
              <span className={styles.glitch} data-text="47">
                47
              </span>
            </div>
          </motion.div>

          {/* Right navigation item (Catalog) */}
          <div className={styles.navSide}>
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              const buttonLabel =
                item.route === "/shop" && selectedCategory
                  ? selectedCategory
                  : item.label;
              const isActive =
                item.route === "/"
                  ? activeItem === "/"
                  : activeItem.startsWith(item.route);

              return (
                <div key={item.route} className={styles.navItemWrapper}>
                  <motion.div
                    className={`${styles.navItem} ${
                      isActive ? styles.active : ""
                    }`}
                    onClick={(e) => handleItemClick(item.route, e)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Icon className={styles.navIcon} />
                    <span className={styles.navLabel}>{buttonLabel}</span>
                    {isActive && (
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
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Profile modal */}
      <AnimatePresence>
        {modalOpen && (
          <ProfileModal open={modalOpen} onClose={() => setModalOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
