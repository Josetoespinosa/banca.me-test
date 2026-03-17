import { BrandLogo } from "@/components/landing/brand-logo";
import styles from "@/components/landing/landing.module.css";
import { mainNav } from "@/lib/site-content";

export function Header() {
  return (
    <header className={styles.headerWrap}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <BrandLogo href="#top" />
          <nav className={styles.nav} aria-label="Principal">
            {mainNav.map((item) => (
              <a className={styles.navLink} key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <a className={styles.ghostAction} href="#contacto">
              Ingresar
            </a>
            <a
              className={styles.solidAction}
              href="/"
              rel="noreferrer"
              target="_blank"
            >
              Pagar Crédito
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
