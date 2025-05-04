// "use client";

// import { useEffect, useState } from "react";
// import FlippingDigit from "./FlippingDigit";
// import styles from "./StatsCounter.module.css";

// interface StatsCounterProps {
//   initialValue?: number;
//   label: string;
// }

// const StatsCounter = ({ initialValue = 1234, label }: StatsCounterProps) => {
//   const [count, setCount] = useState(initialValue);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCount((prevCount) => prevCount + 1);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   // Преобразуем число в массив цифр
//   const digits = String(count).split("").map(Number);

//   return (
//     <div className={styles.counterWrapper}>
//       <div className={styles.counterNumber}>
//         {digits.map((digit, index) => (
//           // Ключ теперь зависит ТОЛЬКО от позиции (index).
//           // React будет переиспользовать этот компонент для данной позиции,
//           // но передавать ему новый проп 'digit', когда он изменится.
//           // AnimatePresence ВНУТРИ FlippingDigit обработает смену пропа.
//           <FlippingDigit key={index} digit={digit} />
//         ))}
//       </div>
//       <span className={styles.counterLabel}>{label}</span>
//     </div>
//   );
// };

// export default StatsCounter;
