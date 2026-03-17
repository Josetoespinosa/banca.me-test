import { BrandLogo } from "@/components/landing/brand-logo";
import styles from "@/components/landing/landing.module.css";
import { footerColumns } from "@/lib/site-content";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contacto@banca.me";

export function Footer() {
  return (
    <footer className={styles.footerSection} id="contacto">
      <div className={styles.shell}>
        <div className={styles.footerGrid}>
          <div className={styles.footerBrand}>
            <BrandLogo href="#top" light />
            <div className={styles.footerAddress}>
              <p>Bancame SpA</p>
              <p>Eliodoro Yáñez 2990, Torre A, piso 3.</p>
              <p>Santiago, Chile</p>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </div>
          </div>
          <div className={styles.footerColumns}>
            {footerColumns.map((column) => (
              <div className={styles.footerColumn} key={column.title}>
                <h3 className={styles.footerColumnTitle}>{column.title}</h3>
                {column.links.map((link) => (
                  <a className={styles.footerLink} href={link.href} key={link.label}>
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
