"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "@/components/landing/landing.module.css";

const modes = [
  { href: "/", label: "Cliente", match: (pathname) => !pathname.startsWith("/admin") },
  { href: "/admin", label: "Admin", match: (pathname) => pathname.startsWith("/admin") },
];

export function ModeSwitch() {
  const pathname = usePathname();

  return (
    <div aria-label="Modo de navegación" className={styles.modeSwitch} role="tablist">
      {modes.map((mode) => {
        const isActive = mode.match(pathname);

        return (
          <Link
            aria-selected={isActive}
            className={`${styles.modeSwitchOption} ${
              isActive ? styles.modeSwitchOptionActive : ""
            }`}
            href={mode.href}
            key={mode.label}
            role="tab"
          >
            {mode.label}
          </Link>
        );
      })}
    </div>
  );
}
