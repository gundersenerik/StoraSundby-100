import { club } from "@/config/club";

/**
 * E-post via Resend — 3 000 mejl per månad gratis, se KOSTNADER.md.
 *
 * Utan RESEND_API_KEY skickas ingenting; funktionen säger det med
 * skickat: false så att anroparen kan berätta det för användaren i stället
 * för att låtsas. Bokningsflödet ska fungera i utveckling och innan
 * e-postdomänen är verifierad, bara utan mejl.
 *
 * PERSONUPPGIFTER LOGGAS ALDRIG. Vid fel loggas statuskod och ämnesrad,
 * aldrig mottagare eller innehåll.
 */
export interface Epost {
  till: string;
  amne: string;
  text: string;
  svarTill?: string;
}

export async function skickaEpost(epost: Epost): Promise<{ skickat: boolean }> {
  const nyckel = process.env.RESEND_API_KEY;
  if (!nyckel) {
    console.info(`[epost] RESEND_API_KEY saknas — "${epost.amne}" skickades inte.`);
    return { skickat: false };
  }

  const avsandare =
    process.env.EPOST_AVSANDARE ?? `${club.identity.shortName} <noreply@${club.site.domain}>`;

  const svar = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${nyckel}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: avsandare,
      to: [epost.till],
      subject: epost.amne,
      text: epost.text,
      ...(epost.svarTill ? { reply_to: [epost.svarTill] } : {}),
    }),
  });

  if (!svar.ok) {
    console.error(`[epost] Resend svarade ${svar.status} för "${epost.amne}".`);
    return { skickat: false };
  }
  return { skickat: true };
}
