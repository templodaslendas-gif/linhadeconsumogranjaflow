import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Curva Oficial do Integrador | GranjaFlow",
  description:
    "Dashboard interativa da Curva Oficial do Integrador, com consumo diário, acumulado, semanal e por fase.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
