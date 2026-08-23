import type { Metadata } from "next";
import { InloggningsFormular } from "./formular";

export const metadata: Metadata = {
  title: "Logga in",
  robots: { index: false, follow: false },
};

export default async function LoggaIn({
  searchParams,
}: {
  searchParams: Promise<{ fel?: string }>;
}) {
  const { fel } = await searchParams;

  const felmeddelande =
    fel === "ogiltig-lank"
      ? "Länken har gått ut eller är redan använd. Begär en ny nedan."
      : fel === "saknad-kod"
        ? "Länken var ofullständig. Begär en ny nedan."
        : fel === "ej-behorig"
          ? "Du är inloggad, men adressen har ingen behörighet här. Kontakta den som sköter sajten."
          : null;

  return (
    <main style={{ padding: "var(--spacing-6)", maxWidth: "26rem", margin: "0 auto" }}>
      <h1>Logga in</h1>
      <p style={{ color: "var(--ink-muted)" }}>
        Du får en länk i mejlen. Inget lösenord att komma ihåg eller återställa.
      </p>

      {felmeddelande && (
        <p
          role="alert"
          style={{
            background: "var(--surface-alt)",
            borderLeft: "3px solid var(--warn)",
            borderRadius: "var(--radius-sm)",
            padding: "var(--spacing-3) var(--spacing-4)",
            fontSize: "var(--text-sm)",
          }}
        >
          {felmeddelande}
        </p>
      )}

      <InloggningsFormular />
    </main>
  );
}
