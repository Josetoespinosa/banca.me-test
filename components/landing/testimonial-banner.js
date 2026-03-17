import styles from "@/components/landing/landing.module.css";
import { testimonial } from "@/lib/site-content";

export function TestimonialBanner() {
  return (
    <section className={styles.contentSection}>
      <div className={styles.shell}>
        <blockquote className={styles.quoteBlock}>
          <p className={styles.quoteText}>“{testimonial.quote}”</p>
          <footer className={styles.quoteAuthor}>-{testimonial.author}</footer>
        </blockquote>
      </div>
    </section>
  );
}
