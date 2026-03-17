import { SectionHeading } from "@/components/landing/section-heading";
import styles from "@/components/landing/landing.module.css";
import { ecosystemMembers, legalNotes, trustBadges } from "@/lib/site-content";

export function TrustPanel() {
  return (
    <section className={styles.trustSection} id="recursos">
      <div className={styles.shell}>
        <SectionHeading
          description="Se mantiene el tono regulatorio y de confianza del HTML original, pero traducido a bloques reutilizables y legibles."
          eyebrow="Confianza"
          title="Regulación, transparencia y contexto operativo"
        />
        <div className={styles.trustGrid}>
          {trustBadges.map((badge) => (
            <article className={styles.badgeCard} key={badge.title}>
              <h3 className={styles.badgeTitle}>{badge.title}</h3>
              <p className={styles.badgeText}>{badge.copy}</p>
            </article>
          ))}
        </div>
        <div className={styles.legalBox}>
          <h3 className={styles.legalTitle}>Miembros de</h3>
          <div className={styles.ecosystemRow}>
            {ecosystemMembers.map((member) => (
              <span className={styles.ecosystemPill} key={member}>
                {member}
              </span>
            ))}
          </div>
          <div className={styles.legalList}>
            {legalNotes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
