import { SectionHeading } from "@/components/landing/section-heading";
import styles from "@/components/landing/landing.module.css";
import { businessServices } from "@/lib/site-content";

export function BusinessGrid() {
  return (
    <section className={styles.businessSection} id="empresas">
      <div className={styles.shell}>
        <SectionHeading
          description="Evalúa riesgo y ofrece financiamiento a clientes y colaboradores en una experiencia pensada para alianzas comerciales."
          eyebrow="Empresas"
          light
          title="Conoce nuestros servicios para empresas"
        />
        <div className={styles.businessGrid}>
          {businessServices.map((service) => (
            <article
              className={`${styles.businessCard} ${
                service.tone === "lime" ? styles.businessCardLime : styles.businessCardViolet
              }`}
              key={service.title}
            >
              <p className={styles.cardEyebrow}>{service.eyebrow}</p>
              <h3 className={styles.businessTitle}>{service.title}</h3>
              <p className={styles.businessText}>{service.description}</p>
              <a
                className={styles.cardLink}
                href={service.href}
              >
                Saber más
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
