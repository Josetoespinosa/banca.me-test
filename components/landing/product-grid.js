import { SectionHeading } from "@/components/landing/section-heading";
import styles from "@/components/landing/landing.module.css";
import { personalProducts } from "@/lib/site-content";

export function ProductGrid() {
  return (
    <section className={styles.contentSection}>
      <div className={styles.shell}>
        <SectionHeading
          description="Dos productos principales, presentados en tarjetas reutilizables y listas para extenderse con más variantes."
          eyebrow="Productos"
          title="Paga y financia como quieras"
        />
        <div className={styles.cardsGrid}>
          {personalProducts.map((card) => (
            <article className={styles.productCard} key={card.title}>
              <div
                className={`${styles.productArt} ${
                  card.tone === "ink" ? styles.productArtInk : styles.productArtViolet
                }`}
              >
                <div className={styles.productIcon} />
              </div>
              <div className={styles.productBody}>
                <p className={styles.cardEyebrow}>{card.eyebrow}</p>
                <h3 className={styles.productTitle}>{card.title}</h3>
                <p className={styles.productCopy}>{card.description}</p>
                <ul className={styles.bulletList}>
                  {card.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                <a
                  className={styles.cardLink}
                  href={card.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  Saber más
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
