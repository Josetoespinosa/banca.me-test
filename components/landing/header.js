import { BrandLogo } from "@/components/landing/brand-logo";
import { ModeSwitch } from "@/components/landing/mode-switch";
import styles from "@/components/landing/landing.module.css";
import { mainNav } from "@/lib/site-content";

export function Header() {
  return (
    <header className={styles.headerWrap}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <BrandLogo href="/" />
          <nav className={styles.nav} aria-label="Principal">
            {mainNav.map((item) => (
              <a className={styles.navLink} key={item.label} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className={styles.headerActions}>
            <ModeSwitch />
            <a className={styles.ghostAction} href="/solicitud/finanzas">
              Ingresar
            </a>
            <a
              className={styles.solidAction}
              href="/solicitud/finanzas"
            >
              Solicitar Crédito
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
