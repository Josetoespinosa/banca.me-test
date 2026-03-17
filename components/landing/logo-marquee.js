import styles from "@/components/landing/landing.module.css";
import { partners } from "@/lib/site-content";

const marqueeItems = [...partners, ...partners];

export function LogoMarquee() {
  return (
    <section className={styles.partnerSection}>
      <div className={styles.shell}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEyebrow}>Alianzas</p>
          <h2 className={styles.sectionTitle}>Marcas que ya trabajan con este modelo</h2>
        </div>
        <div className={styles.marqueeWrap}>
          <div className={styles.marqueeTrack}>
            {marqueeItems.map((partner, index) => (
              <span className={styles.logoPill} key={`${partner}-${index}`}>
                {partner}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
