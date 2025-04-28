"use client";
import { usePaginationStore } from "@/app/_zustand/paginationStore";
import { useSortStore } from "@/app/_zustand/sortStore";
import { usePathname, useRouter } from "next/navigation";
import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import styles from "./Filters.module.css";

export interface FiltersRef {
  toggle: () => void;
  open: () => void;
  close: () => void;
}

interface InputCategory {
  inStock: { text: string; isChecked: boolean };
  outOfStock: { text: string; isChecked: boolean };
  priceFilter: { text: string; value: number };
  ratingFilter: { text: string; value: number };
}

const defaultInputCategory: InputCategory = {
  inStock: { text: "instock", isChecked: true },
  outOfStock: { text: "outofstock", isChecked: true },
  priceFilter: { text: "price", value: 3000 },
  ratingFilter: { text: "rating", value: 0 },
};

const AccordionSection: React.FC<{
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, open, onToggle, children }) => (
  <div className={styles.accordionSection}>
    <button
      className={styles.accordionButton}
      onClick={onToggle}
      aria-expanded={open}
      type="button"
    >
      <span>{title}</span>
      <span>{open ? "▲" : "▼"}</span>
    </button>
    <div
      className={`${styles.accordionContent} ${
        open ? styles.accordionContentOpen : ""
      }`}
    >
      {open && <div>{children}</div>}
    </div>
  </div>
);

const sortOptions = [
  { label: "Default", value: "defaultSort" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
  { label: "Rating: High to Low", value: "ratingDesc" },
];

const Filters: ForwardRefRenderFunction<FiltersRef, {}> = (_, ref) => {
  const pathname = usePathname();
  const { replace } = useRouter();
  const { page } = usePaginationStore();
  const { sortBy, changeSortBy } = useSortStore();

  const [inputCategory, setInputCategory] =
    useState<InputCategory>(defaultInputCategory);
  const [openSection, setOpenSection] = useState<string | null>("availability");
  const [showModal, setShowModal] = useState(false);
  const [modalAnimation, setModalAnimation] = useState<"in" | "out" | null>(
    null
  );
  // Use refs for drag state to avoid re-renders during drag
  const dragY = useRef(0);
  const isDragging = useRef(false);
  const dragStartY = useRef<number | null>(null);
  const lastY = useRef<number | null>(null);
  const lastTime = useRef<number | null>(null);
  const velocity = useRef(0);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const dragFromHandle = useRef(false);

  // Expose toggle/open/close functions via ref
  useImperativeHandle(ref, () => ({
    toggle: () => {
      if (showModal) {
        handleCloseModal();
      } else {
        handleOpenModal();
      }
    },
    open: () => handleOpenModal(),
    close: () => handleCloseModal(),
  }));

  // Modal open/close handlers with animation
  const handleOpenModal = () => {
    setShowModal(true);
    setModalAnimation("in");
    // Reset drag state
    dragY.current = 0;
    isDragging.current = false;

    // Ensure modal starts at correct position
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.style.transform = "translateY(0)";
      }
    }, 10);
  };

  const handleCloseModal = () => {
    setModalAnimation("out");

    // Reset any inline transform that might be applied
    if (modalRef.current && !isDragging.current) {
      modalRef.current.style.transform = "";
    }

    setTimeout(() => {
      setShowModal(false);
      setModalAnimation(null);
      dragY.current = 0;
      isDragging.current = false;
    }, 350); // match animation duration
  };

  // Reset filters to default
  const handleReset = () => {
    setInputCategory(defaultInputCategory);
    changeSortBy("defaultSort");
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("outOfStock", inputCategory.outOfStock.isChecked.toString());
    params.set("inStock", inputCategory.inStock.isChecked.toString());
    params.set("rating", inputCategory.ratingFilter.value.toString());
    params.set("price", inputCategory.priceFilter.value.toString());
    params.set("sort", sortBy);
    params.set("page", page.toString());
    replace(`${pathname}?${params}`);
    // eslint-disable-next-line
  }, [inputCategory, sortBy, page, showModal]);

  // Enhanced drag logic with direct style manipulation for native-like feel
  const handleHandleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length !== 1) return;

    dragFromHandle.current = true;
    isDragging.current = true;
    dragStartY.current = e.touches[0].clientY - dragY.current;
    lastY.current = e.touches[0].clientY;
    lastTime.current = Date.now();

    // Prevent scroll behind modal
    e.stopPropagation();
  };

  // Modal listens for move/end only if dragFromHandle
  const handleModalTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (
      !isDragging.current ||
      !dragFromHandle.current ||
      dragStartY.current === null
    )
      return;

    const currentY = e.touches[0].clientY;
    let newY = currentY - dragStartY.current;

    // Add resistance when dragging up
    if (newY < 0) newY = newY * 0.3;

    // Update ref value
    dragY.current = newY;

    // Direct style manipulation for real-time updates
    if (modalRef.current) {
      modalRef.current.style.transform = `translateY(${newY}px)`;

      // Update drag handle style
      const handle = modalRef.current.querySelector(
        `.${styles.modalDragHandle}`
      ) as HTMLElement;
      if (handle) {
        handle.style.opacity = `${Math.max(0.5, 1 - newY / 120)}`;
        handle.style.transform = `scale(${Math.max(0.9, 1 - newY / 600)})`;
      }
    }

    // Calculate velocity
    const now = Date.now();
    if (lastY.current !== null && lastTime.current !== null) {
      velocity.current = (currentY - lastY.current) / (now - lastTime.current);
    }

    lastY.current = currentY;
    lastTime.current = now;

    e.stopPropagation();
  };

  const handleModalTouchEnd = () => {
    if (!isDragging.current || !dragFromHandle.current) return;

    isDragging.current = false;
    dragFromHandle.current = false;

    // If dragged far or fast, close modal
    if (dragY.current > 100 || velocity.current > 0.7) {
      if (modalRef.current) {
        modalRef.current.style.transition =
          "transform 0.22s cubic-bezier(.4,1.6,.2,1)";
        modalRef.current.style.transform = "translateY(600px)";
      }

      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.style.transition = "";
        }
        dragY.current = 0;
        handleCloseModal();
      }, 220);
    } else {
      // Animate bounce back
      if (modalRef.current) {
        modalRef.current.style.transition =
          "transform 0.22s cubic-bezier(.4,1.6,.2,1)";
        modalRef.current.style.transform = "translateY(0)";
      }

      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.style.transition = "";
        }
        dragY.current = 0;
      }, 220);
    }

    dragStartY.current = null;
    lastY.current = null;
    lastTime.current = null;
    velocity.current = 0;
  };

  // Animation classes
  const modalClass = [
    styles.modalBase,
    modalAnimation === "in" ? styles.modalIn : "",
    modalAnimation === "out" ? styles.modalOut : "",
    isDragging.current ? styles.modalDragging : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Drag handle dynamic style - initial state only
  // (real-time updates happen in handleModalTouchMove)
  const dragHandleStyle: React.CSSProperties = {
    opacity: 1,
    transform: "scale(1)",
    transition: "opacity 0.2s, transform 0.2s",
  };

  return (
    <>
      {/* Overlay */}
      {showModal && (
        <div
          className={
            styles.overlay +
            " " +
            (modalAnimation === "in"
              ? styles.overlayVisible
              : modalAnimation === "out"
              ? styles.overlayHidden
              : styles.overlayInvisible)
          }
          onClick={handleCloseModal}
        />
      )}

      {/* Modal */}
      {showModal && (
        <div
          ref={modalRef}
          className={modalClass}
          style={{
            transition: "transform 0.25s cubic-bezier(.4,1.6,.2,1)",
            touchAction: "none",
          }}
          aria-modal="true"
          role="dialog"
          onTouchMove={handleModalTouchMove}
          onTouchEnd={handleModalTouchEnd}
        >
          <div className={styles.modalHeader}>
            <div
              className={styles.modalDragHandle}
              style={dragHandleStyle}
              onTouchStart={handleHandleTouchStart}
            />
            <h3 className={styles.modalTitle}>Filters & Sorting</h3>
            <button
              className={styles.closeButton}
              onClick={handleCloseModal}
              aria-label="Close filters"
              type="button"
            >
              ×
            </button>
          </div>
          <div className={styles.modalContent}>
            {/* Sorting */}
            <AccordionSection
              title="Sort By"
              open={openSection === "sort"}
              onToggle={() =>
                setOpenSection(openSection === "sort" ? null : "sort")
              }
            >
              <div className={styles.sectionInner}>
                {sortOptions.map((opt) => (
                  <label
                    key={opt.value}
                    className={
                      styles.radioLabel + " " + styles.customRadioLabel
                    }
                  >
                    <input
                      type="radio"
                      name="sort"
                      checked={sortBy === opt.value}
                      onChange={() => changeSortBy(opt.value)}
                      className={
                        styles.radioInput + " " + styles.customRadioInput
                      }
                    />
                    <span className={styles.customRadioCheck}></span>
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </AccordionSection>

            {/* Availability */}
            <AccordionSection
              title="Availability"
              open={openSection === "availability"}
              onToggle={() =>
                setOpenSection(
                  openSection === "availability" ? null : "availability"
                )
              }
            >
              <div className={styles.sectionInner}>
                <label
                  className={
                    styles.checkboxLabel + " " + styles.customCheckboxLabel
                  }
                >
                  <input
                    type="checkbox"
                    checked={inputCategory.inStock.isChecked}
                    onChange={() =>
                      setInputCategory({
                        ...inputCategory,
                        inStock: {
                          text: "instock",
                          isChecked: !inputCategory.inStock.isChecked,
                        },
                      })
                    }
                    className={
                      styles.checkboxInput + " " + styles.customCheckboxInput
                    }
                  />
                  <span className={styles.customCheckboxCheck}></span>
                  <span>In stock</span>
                </label>
                <label
                  className={
                    styles.checkboxLabel + " " + styles.customCheckboxLabel
                  }
                >
                  <input
                    type="checkbox"
                    checked={inputCategory.outOfStock.isChecked}
                    onChange={() =>
                      setInputCategory({
                        ...inputCategory,
                        outOfStock: {
                          text: "outofstock",
                          isChecked: !inputCategory.outOfStock.isChecked,
                        },
                      })
                    }
                    className={
                      styles.checkboxInput + " " + styles.customCheckboxInput
                    }
                  />
                  <span className={styles.customCheckboxCheck}></span>
                  <span>Out of stock</span>
                </label>
              </div>
            </AccordionSection>

            {/* Price */}
            <AccordionSection
              title="Price"
              open={openSection === "price"}
              onToggle={() =>
                setOpenSection(openSection === "price" ? null : "price")
              }
            >
              <div className={styles.sectionInner}>
                <input
                  type="range"
                  min={0}
                  max={300000}
                  step={10}
                  value={inputCategory.priceFilter.value}
                  className={styles.styledSlider}
                  onChange={(e) =>
                    setInputCategory({
                      ...inputCategory,
                      priceFilter: {
                        text: "price",
                        value: Number(e.target.value),
                      },
                    })
                  }
                  style={{ touchAction: "none" }}
                />
                <span
                  className={styles.sliderValue}
                >{`Max price: $${inputCategory.priceFilter.value}`}</span>
              </div>
            </AccordionSection>

            {/* Rating */}
            <AccordionSection
              title="Minimum Rating"
              open={openSection === "rating"}
              onToggle={() =>
                setOpenSection(openSection === "rating" ? null : "rating")
              }
            >
              <div className={styles.sectionInner}>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={inputCategory.ratingFilter.value}
                  onChange={(e) =>
                    setInputCategory({
                      ...inputCategory,
                      ratingFilter: {
                        text: "rating",
                        value: Number(e.target.value),
                      },
                    })
                  }
                  className={styles.styledSlider}
                  step={1}
                  style={{ touchAction: "none" }}
                />
                <div className={styles.sliderTicks}>
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
              </div>
            </AccordionSection>
          </div>
          <div className={styles.modalFooter}>
            <button
              className={styles.resetButton}
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
            <button
              className={styles.applyButton}
              onClick={handleCloseModal}
              type="button"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default forwardRef(Filters);
