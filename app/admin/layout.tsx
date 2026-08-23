import { redirect } from "next/navigation";
import { arAdmin, inloggadEpost } from "@/lib/supabase-server";
import { loggaUt } from "@/app/logga-in/actions";

/**
 * Skyddar allt under /admin.
 *
 * Kontrollen här styr vad som VISAS. Den är inte säkerhetsspärren — den
 * ligger i RLS och gäller även om någon skulle nå datan på annat sätt.
 * Två lager, och det undre är det som håller.
 *
 * Inloggningssidan ligger medvetet på /logga-in och INTE under /admin.
 * Låg den här under hade en villkorslös omdirigering skickat den till sig
 * själv i en oändlig loop, och undantaget som krävdes för att undvika det
 * gjorde att /admin renderade för utloggade besökare.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const epost = await inloggadEpost();

  if (!epost) {
    redirect("/logga-in");
  }

  if (!(await arAdmin())) {
    redirect("/logga-in?fel=ej-behorig");
  }

  return (
    <div style={{ minHeight: "100dvh" }}>
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--spacing-4)",
          padding: "var(--spacing-3) var(--spacing-5)",
          background: "var(--surface-alt)",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <strong style={{ fontFamily: "var(--font-display)" }}>Admin</strong>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: "var(--text-sm)", color: "var(--ink-muted)" }}>{epost}</span>
        <form action={loggaUt}>
          <button
            type="submit"
            style={{
              minHeight: "44px",
              padding: "0 var(--spacing-4)",
              fontSize: "var(--text-sm)",
              background: "transparent",
              color: "var(--ink)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
            }}
          >
            Logga ut
          </button>
        </form>
      </header>
      {children}
    </div>
  );
}
