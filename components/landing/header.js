"use client";

import { useState } from "react";

import { BrandLogo } from "@/components/landing/brand-logo";
import { LeadFormDialog } from "@/components/landing/lead-form-dialog";
import { ModeSwitch } from "@/components/landing/mode-switch";
import styles from "@/components/landing/landing.module.css";
import { mainNav } from "@/lib/site-content";

export function Header() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
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
              <a className={styles.ghostAction} href="/">
                Ingresar
              </a>
              <button
                className={styles.solidAction}
                onClick={() => setIsDialogOpen(true)}
                type="button"
              >
                Solicitar Crédito
              </button>
            </div>
          </div>
        </div>
      </header>
      <LeadFormDialog onClose={() => setIsDialogOpen(false)} open={isDialogOpen} />
    </>
  );
}
