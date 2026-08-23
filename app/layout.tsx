import type { Metadata } from "next";
import { club } from "@/config/club";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: club.identity.shortName,
    template: `%s | ${club.identity.shortName}`,
  },
  description: `Föreningssajt för ${club.identity.legalName}, grundad ${club.identity.foundedYear}.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={club.site.locale}>
      <body>{children}</body>
    </html>
  );
}
