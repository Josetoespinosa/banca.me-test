import styles from "@/components/landing/landing.module.css";

export function HeroVisual() {
  return (
    <div className={styles.visualStage} aria-hidden="true">
      <div className={styles.visualGlow} />
      <div className={styles.phoneFrame}>
        <div className={styles.phoneTop}>
          <div className={styles.phoneAvatar}>BM</div>
          <span className={styles.phonePill}>Evaluación activa</span>
        </div>
        <div className={styles.phoneBody}>
          <div className={styles.phoneMetric}>
            <span className={styles.metricLabel}>Límite estimado</span>
            <strong className={styles.metricValue}>$2.450.000</strong>
            <div className={styles.metricProgress}>
              <span className={styles.progressFill} />
            </div>
          </div>
          <div className={styles.phoneSplit}>
            <div className={styles.splitCard}>
              <span className={styles.metricLabel}>CAE referencial</span>
              <strong className={styles.metricValue}>Desde 1.24%</strong>
            </div>
            <div className={styles.splitCard}>
              <span className={styles.metricLabel}>Tiempo de respuesta</span>
              <strong className={styles.metricValue}>12 hrs</strong>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.floatingTicket}>
        <span className={styles.metricLabel}>Compra ahora, paga después</span>
        <strong className={styles.metricValue}>Sin tarjeta</strong>
      </div>
      <div className={styles.floatingBadge}>100% online</div>
    </div>
  );
}
