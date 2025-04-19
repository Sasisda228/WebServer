"use client";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper } from "swiper/react";
import styles from "./Carousel.module.css";

// const slides: SlideType[] = [
//   {
//     id: 1,
//     image: "/123.png",
//     title: "HK416 A5",
//     description: "Топовая реплика с тактическим обвесом",
//     price: "34 999 ₽",
//     accentColor: "#00a1e4",
//   },
//   {
//     id: 2,
//     image: "/123.png",
//     title: "M4A1",
//     description: "Классическая армейская версия",
//     price: "29 999 ₽",
//     accentColor: "#e4a100",
//   },
//   {
//     id: 3,
//     image: "/ak47.png",
//     title: "AK-74M",
//     description: "Надежный российский автомат",
//     price: "27 999 ₽",
//     accentColor: "#e40000",
//   },
//   {
//     id: 4,
//     image: "/123.png",
//     title: "SCAR-L",
//     description: "Современная тактическая винтовка",
//     price: "39 999 ₽",
//     accentColor: "#00e4a1",
//   },
//   {
//     id: 5,
//     image: "/123.png",
//     title: "MP5",
//     description: "Компактный пистолет-пулемет",
//     price: "24 999 ₽",
//     accentColor: "#a100e4",
//   },
// ];

const Carousel = () => {
  return (
    <section className={styles.carouselSection}>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
          bulletClass: "custom-bullet",
          bulletActiveClass: "custom-bullet-active",
        }}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        slidesPerView={1.15}
        spaceBetween={14}
        centeredSlides={true}
        className={styles.swiper}
        grabCursor={true}
        speed={600}
        breakpoints={{
          480: { slidesPerView: 1.4, spaceBetween: 18 },
          640: { slidesPerView: 2.1, spaceBetween: 20 },
          900: { slidesPerView: 3, spaceBetween: 24, centeredSlides: false },
          1200: { slidesPerView: 4, spaceBetween: 25, centeredSlides: false },
        }}
      >
        {/* {slides.map((slide) => (
          <SwiperSlide key={slide.id} className={styles.slide}>
            <ProductCard />
          </SwiperSlide>
        ))} */}
      </Swiper>
    </section>
  );
};

export default Carousel;
