import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import styles from "@/components/application/application-flow.module.css";

const adminCards = [
  {
    title: "Solicitudes",
    value: "Próximamente",
    copy: "Aquí vas a listar todas las solicitudes, incluyendo rechazadas por identidad.",
  },
  {
    title: "KPIs",
    value: "Próximamente",
    copy: "Este bloque mostrará aceptación, rechazo e indecisos con foco operativo.",
  },
  {
    title: "Revisión Manual",
    value: "Próximamente",
    copy: "La siguiente iteración puede priorizar los casos marcados como indecisos.",
  },
];

export default function AdminPage() {
  return (
    <>
      <Header />
      <section className={styles.pageSection}>
        <div className={styles.pageShell}>
          <div className={styles.introBlock}>
            <p className={styles.pageEyebrow}>Admin</p>
            <h1 className={styles.pageTitle}>Vista inicial del panel administrativo</h1>
            <p className={styles.pageText}>
              Este es el lado admin base. Por ahora solo existe como destino del
              switch del header, para dejar preparado el lugar donde luego vas a ver
              usuarios, KPIs, gráficos y solicitudes indecisas.
            </p>
          </div>

          <div className={styles.pageGrid} style={{ marginTop: "24px", gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
            {adminCards.map((card) => (
              <article className={styles.formCard} key={card.title}>
                <p className={styles.pageEyebrow}>{card.title}</p>
                <h2 className={styles.summaryTitle} style={{ marginTop: "12px" }}>
                  {card.value}
                </h2>
                <p className={styles.pageText}>{card.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
