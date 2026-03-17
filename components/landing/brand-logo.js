import styles from "@/components/landing/landing.module.css";

export function BrandLogo({ href = "/", light = false }) {
  return (
    <a className={styles.brandLink} href={href} aria-label="Banca.me">
      <span className={styles.brandMark} aria-hidden="true">
        <span className={styles.brandRing} />
        <span className={styles.brandDot} />
      </span>
      <span className={`${styles.brandWord} ${light ? styles.brandWordLight : ""}`}>
        Banca.me
      </span>
    </a>
  );
}
