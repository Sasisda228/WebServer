import styles from "./SloganSection.module.css";

export default function SloganSection() {
  return (
    <section className={styles.sloganContainer}>
      <div className={styles.sloganContent}>
        <h1 className={styles.mainSlogan}>Играй по-взрослому</h1>
        <p className={styles.subSlogan}>Пушка на орбизах</p>
        <p className={styles.subSlogan}>Безопасно, но кайфово</p>
      </div>
    </section>
  );
}
