import styles from "@/components/landing/landing.module.css";

export function SectionHeading({ eyebrow, title, description, light = false }) {
  return (
    <div className={styles.sectionHeader}>
      <p className={styles.sectionEyebrow}>{eyebrow}</p>
      <h2 className={`${styles.sectionTitle} ${light ? styles.sectionTitleLight : ""}`}>
        {title}
      </h2>
      <p
        className={`${styles.sectionDescription} ${
          light ? styles.sectionDescriptionLight : ""
        }`}
      >
        {description}
      </p>
    </div>
  );
}
