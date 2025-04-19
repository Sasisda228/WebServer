"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  MdExplore,
  MdHome,
  MdOutlineVideoLibrary,
  MdPersonOutline,
} from "react-icons/md";
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
  { label: "Видео", route: "/videos", icon: MdOutlineVideoLibrary },
  { label: "Профиль", route: "/profile", icon: MdPersonOutline },
];

const categories = ["Rifles", "Pistols", "Sights", "Bullets"];

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [activeItem, setActiveItem] = useState(pathname);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const [modalOpen, SetModalOpen] = useState(false);
  useEffect(() => {
    setActiveItem(pathname);
  }, [pathname]);

  // Обработчик клика по вкладке
  const handleItemClick = (
    route: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    e.preventDefault(); // Предотвращаем стандартное поведение ссылки
    if (route === "/profile") {
      SetModalOpen(!modalOpen);
    } else if (route === "/shop") {
      setIsCategoryOpen(!isCategoryOpen); // Открываем/закрываем список категорий
    } else {
      setIsCategoryOpen(false); // Закрываем список категорий
      setSelectedCategory(null); // Сбрасываем выбранную категорию
      setActiveItem(route); // Обновляем активную вкладку
      router.push(route); // Use Next.js router for navigation
    }
  };

  // Обработчик выбора категории
  const handleCategoryClick = (category: string) => {
    setIsCategoryOpen(false); // Закрываем список категорий
    setSelectedCategory(category); // Сохраняем выбранную категорию
    const newRoute = `/shop/${category.toLowerCase()}`;
    setActiveItem(newRoute); // Обновляем активную вкладку
    router.push(newRoute); // Use Next.js router for navigation
  };

  return (
    <>
      <nav className={styles.navContainer}>
        <ul ref={navRef} className={styles.bottomNav}>
          {navItems.map((item) => {
            const Icon = item.icon;

            // Определяем текст для кнопки
            const buttonLabel =
              item.route === "/shop" && selectedCategory
                ? selectedCategory
                : item.label;

            // Проверка активности вкладки
            const isActive =
              item.route === "/" // Для главной страницы
                ? activeItem === "/"
                : activeItem.startsWith(item.route);

            return (
              <li key={item.route} className={styles.navItemWrapper}>
                <div
                  className={`${styles.navItem} ${
                    isActive ? styles.active : ""
                  }`}
                  onClick={(e) => handleItemClick(item.route, e)}
                >
                  <Icon className={styles.navIcon} />
                  <span className={styles.navLabel}>{buttonLabel}</span>
                </div>

                {/* Выпадающий список категорий */}
                {item.route === "/shop" && isCategoryOpen && (
                  <div className={styles.categoryDropdown}>
                    <ul className={styles.categoryList}>
                      {categories.map((category, index) => (
                        <li key={index} className={styles.categoryItem}>
                          <button
                            type="button"
                            className={styles.categoryButton}
                            onClick={() => handleCategoryClick(category)}
                          >
                            {category}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
      {modalOpen && (
        <ProfileModal open={modalOpen} onClose={() => SetModalOpen(false)} />
      )}
    </>
  );
}
