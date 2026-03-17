import { TrackingScripts } from "@/components/landing/tracking-scripts";

import "./globals.css";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "Banca.me";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: `${siteName} | Financiamiento transparente, hoy`,
  description:
    "Landing preparada en Next.js para presentar créditos personales, soluciones para empresas y captación de leads.",
  openGraph: {
    title: `${siteName} | Financiamiento transparente, hoy`,
    description:
      "Solicita tu evaluación, descubre productos para personas y soluciones para empresas en una experiencia limpia y reutilizable.",
    url: siteUrl,
    siteName,
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Financiamiento transparente, hoy`,
    description:
      "Landing preparada en Next.js con formulario, bloques reutilizables y backend placeholder en FastAPI.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <TrackingScripts />
        {children}
      </body>
    </html>
  );
}
