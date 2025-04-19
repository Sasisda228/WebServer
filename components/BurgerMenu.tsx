import { useState } from "react";
import styles from "./BurgerMenu.module.css";
const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.menuContainer}>
      {/* Hamburger Icon */}
      <div
        className={`${styles.hamburger} ${isOpen ? styles.open : ""}`}
        onClick={toggleMenu}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
        <ul>
          <li>Home</li>
          <li>About</li>
          <li>Services</li>
          <li>Contact</li>
        </ul>
      </div>

      {/* Overlay */}
      {isOpen && <div className={styles.overlay} onClick={toggleMenu}></div>}
    </div>
  );
};

export default BurgerMenu;
