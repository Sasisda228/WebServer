"use client";
// Keep AnimatePresence only if needed for modal, consider removing if modal animation isn't critical
import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic"; // Import dynamic for lazy loading
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react"; // Added Suspense
import { MdExplore, MdHome } from "react-icons/md";
import CategoryBar from "./CategoryBar"; // Assuming CategoryBar is relatively light or optimized separately
import styles from "./NavBar.module.css";
// Removed ProfileModal direct import

// Lazy load ProfileModal
const ProfileModal = dynamic(() => import("./ProfileModal"), {
  // Optional: Add a loading component while the modal code is fetched
  // loading: () => <p>Loading profile...</p>,
  ssr: false, // Don't render modal on the server initially
});

interface NavItem {
  label: string;
  route: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Главная", route: "/", icon: MdHome },
  { label: "Каталог", route: "/shop", icon: MdExplore },
];

// Consider fetching categories dynamically if they change often,
// or pass them as props if they are static or fetched in the layout.
// For now, keeping it static as in the original code.
const categories = ["Rifles", "Pistols", "Sights", "Bullets"];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [, setActiveItem] = useState(pathname);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Removed unused navRef

  useEffect(() => {
    setActiveItem(pathname);
    if (pathname.startsWith("/shop/")) {
      const category = pathname.split("/")[2];
      if (category) {
        const formattedCategory =
          category.charAt(0).toUpperCase() + category.slice(1);
        setSelectedCategory(formattedCategory);
      } else {
        // Handle case like /shop where no category is selected yet
        setSelectedCategory(null);
      }
    } else {
      setSelectedCategory(null);
    }
  }, [pathname]);

  const handleItemClick = (
    route: string,
    e: React.MouseEvent<HTMLDivElement> // Keep type for event handling
  ) => {
    e.preventDefault(); // Prevent default if it's wrapping an anchor, otherwise maybe not needed
    // No need to setActiveItem here if useEffect handles it based on pathname
    router.push(route);
  };

  const handleLogoClick = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  return (
    <>
      {/* Category Bar - Render conditionally based on path */}
      {/* Consider if CategoryBar itself needs optimization or lazy loading */}
      {pathname.startsWith("/shop") && (
        <CategoryBar
          categories={categories}
          currentCategory={selectedCategory}
        />
      )}

      {/* Use standard nav tag */}
      <nav className={styles.navContainer}>
        <div className={styles.navContent}>
          {/* Left navigation item (Home) */}
          <div className={styles.navSide}>
            {navItems.slice(0, 1).map((item) => {
              const Icon = item.icon;
              // Simplified isActive check
              const isActive =
                item.route === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.route);

              return (
                // Use standard div with CSS transitions instead of motion.div
                <div
                  key={item.route}
                  className={`${styles.navItem} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={(e) => handleItemClick(item.route, e)}
                  role="button" // Add role for accessibility
                  tabIndex={0} // Add tabIndex for accessibility
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleItemClick(item.route, e as any);
                  }} // Basic keyboard accessibility
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{item.label}</span>
                  {/* Use CSS for the active indicator */}
                  <div className={styles.activeIndicator} />
                </div>
              );
            })}
          </div>

          {/* Center logo - Use standard div with CSS transitions */}
          <div
            className={styles.logoContainer}
            onClick={handleLogoClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleLogoClick();
            }}
          >
            <div className={styles.glitchLogo}>
              <span className={styles.glitch} data-text="47">
                47
              </span>
            </div>
          </div>

          {/* Right navigation item (Catalog) */}
          <div className={styles.navSide}>
            {navItems.slice(1).map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.route); // Catalog active if path starts with /shop
              // Determine label based on selected category when active
              const buttonLabel =
                isActive && selectedCategory ? selectedCategory : item.label;

              return (
                // Removed unnecessary wrapper div
                // Use standard div with CSS transitions
                <div
                  key={item.route}
                  className={`${styles.navItem} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={(e) => handleItemClick(item.route, e)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ")
                      handleItemClick(item.route, e as any);
                  }}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{buttonLabel}</span>
                  {/* Use CSS for the active indicator */}
                  <div className={styles.activeIndicator} />
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Profile modal - Rendered conditionally and lazy-loaded */}
      {/* Wrap dynamic component in Suspense if using a loading fallback */}
      {/* AnimatePresence kept for modal fade-in/out, remove if not needed */}
      <AnimatePresence>
        {modalOpen && (
          <Suspense fallback={null}>
            {" "}
            {/* Or fallback={<LoadingSpinner />} */}
            <ProfileModal open={modalOpen} onClose={handleCloseModal} />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
}
