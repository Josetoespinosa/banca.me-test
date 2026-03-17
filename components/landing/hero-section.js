"use client";

import { useState } from "react";

import { HeroVisual } from "@/components/landing/hero-visual";
import { LeadFormDialog } from "@/components/landing/lead-form-dialog";
import styles from "@/components/landing/landing.module.css";
import { heroHighlights } from "@/lib/site-content";

export function HeroSection() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <section className={styles.heroSection} id="personas">
      <div className={styles.shell}>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Financiamiento transparente, hoy</p>
            <h1 className={styles.heroTitle}>
              Solicita tu evaluación y entiende tus opciones antes de tomar deuda.
            </h1>
            <p className={styles.heroText}>
              Una landing limpia para presentar créditos personales y soluciones para
              empresas con foco en claridad, velocidad y confianza.
            </p>
            <div className={styles.heroActions}>
              <button
                className={styles.primaryButton}
                onClick={() => setIsDialogOpen(true)}
                type="button"
              >
                Empezar
              </button>
              <a
                className={styles.secondaryButton}
                href="/solicitud/finanzas"
              >
                Continuar Solicitud
              </a>
            </div>
            <div className={styles.heroMeta}>
              {heroHighlights.map((item) => (
                <span className={styles.chip} key={item}>
                  {item}
                </span>
              ))}
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statCard}>
                <strong className={styles.statValue}>12 hrs</strong>
                <span className={styles.statLabel}>Tiempo de respuesta estimado</span>
              </div>
              <div className={styles.statCard}>
                <strong className={styles.statValue}>100%</strong>
                <span className={styles.statLabel}>Flujo online y reusable</span>
              </div>
              <div className={styles.statCard}>
                <strong className={styles.statValue}>2 líneas</strong>
                <span className={styles.statLabel}>Personas y empresas</span>
              </div>
            </div>
          </div>
          <div className={styles.heroPanel}>
            <HeroVisual />
          </div>
        </div>
      </div>
      <LeadFormDialog onClose={() => setIsDialogOpen(false)} open={isDialogOpen} />
    </section>
  );
}
