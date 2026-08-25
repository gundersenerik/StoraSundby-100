/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DESIGNKONTRAKT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Det här filen låser designens STRUKTUR, inte dess uttryck.
 *
 *  Skillnaden är viktig. Skalorna, de semantiska namnen och temakontraktet
 *  är bindande: de gör att sajten hänger ihop och att en färgändring slår
 *  igenom överallt.
 *
 *  Färg- och typografivärdena kommer ur klubbens levererade profiler:
 *  content/design/fargprofil/ och content/design/typografi/, båda byggda på
 *  en inventering av storasundbygoif.com 2026-08-24. Navy #001D3B och
 *  digitalblå #094B92 är exakt observerade på webbplatsen; skalorna runt
 *  dem är profilens rekommenderade utbyggnad.
 *
 *  ABSOLUT REGEL: ingen komponent får skriva ett hex-värde, en pixelmarginal
 *  utanför skalan eller en egen fontstorlek. Allt går genom tokens härifrån,
 *  exponerade som CSS-variabler. Kontrolleras av `npm run lint:hardcoded`.
 * ═══════════════════════════════════════════════════════════════════════════
 */

export const design = {
  /**
   * Semantiska färgroller. Komponenter refererar ALLTID till rollen,
   * aldrig till en färg. `bg-surface`, inte `bg-white`.
   *
   * Värdena mappar färgprofilens semantiska tokens till kontraktets roller.
   * Varje roll används både som text och som yta någonstans i koden, så
   * varje värde är valt för att klara 4,5:1 åt båda hållen mot sina
   * grannytor — verifierat i tests/enhet/kontrast.test.ts och av axe i E2E.
   */
  color: {
    light: {
      paper: "#FFFFFF",      // sidans botten — gamla sajtens canvas är vit
      surface: "#FFFFFF",    // kort, paneler
      surfaceAlt: "#F1F1F1", // profilens "spare", tabellhuvuden, sekundära ytor
      ink: "#001D3B",        // navy 900, exakt observerad — brödtext och identitet
      inkMuted: "#40566C",   // profilens fasta motsvarighet till navy 75 % på vitt
      line: "#CFD6DD",       // border-default ur den blåtonade neutralskalan
      brand: "#094B92",      // navy 600, exakt observerad — länkar och primär handling
      brandInk: "#FFFFFF",   // text ovanpå brand
      accent: "#1424A8",     // PRELIMINÄR logotyp-cobalt (rasterprovad) — används
                             // sparsamt tills en vektorlogotyp bekräftar kulören
      ok: "#086541",         // success 700
      warn: "#854B05",       // warning 700
      danger: "#9F1C2C",     // error 700
    },
    dark: {
      paper: "#001225",      // navy 950
      surface: "#001D3B",    // navy 900
      surfaceAlt: "#052D59", // navy 800
      ink: "#FFFFFF",
      inkMuted: "#99A5B1",   // profilens text-inverse-muted
      line: "rgb(255 255 255 / 28%)", // profilens border-default i mörkt läge
      brand: "#B9D2EA",      // navy 200 — primär handling och länk på mörkt
      brandInk: "#001D3B",
      accent: "#A4B2FF",     // royal 300, samma preliminära förbehåll som ljust
      ok: "#6EE7B7",         // success 300
      warn: "#FFC443",       // warning 300
      danger: "#FF9AA3",     // error 300
    },
  },

  /**
   * Temakontrakt. Sajten ska fungera i tre lägen, inte två:
   * ljust valt, mörkt valt, och systemstyrt (inget val gjort).
   *
   * Definiera hela den ljusa paletten på `:root`, redefiniera ENBART
   * tokens i `@media (prefers-color-scheme: dark)` guardat med
   * `:root:not([data-theme="light"])`, och igen i `:root[data-theme="dark"]`.
   *
   * En färg vars enda definition ligger i ett media- eller [data-theme]-block
   * gäller aldrig i det systemstyrda läget. Det är den klassiska buggen.
   */
  themeStrategy: "class-and-media" as const,

  /**
   * Typografisk skala. Inga storlekar utanför den här listan.
   *
   * Stegen följer typografiprofilens responsiva skala: rem-bas plus en
   * liten viewportdel med tydliga min/max, så att användarens zoom och
   * textinställningar fortfarande får effekt. Aldrig enbart vw.
   */
  type: {
    scale: {
      xs: "0.8125rem",                                    // caption/metadata, 13px
      sm: "0.875rem",                                     // liten brödtext, 14px
      base: "1rem",                                       // UI-brödtext, 16px
      lg: "clamp(1.125rem, 1.1rem + 0.125vw, 1.25rem)",   // ingress, 18–20px
      xl: "clamp(1.375rem, 1.3rem + 0.375vw, 1.625rem)",  // h4, 22–26px
      "2xl": "clamp(1.625rem, 1.475rem + 0.75vw, 2rem)",  // h3, 26–32px
      "3xl": "clamp(2rem, 1.7rem + 1.5vw, 3rem)",         // h2, 32–48px
      "4xl": "clamp(2.5rem, 2rem + 2.5vw, 4rem)",         // h1, 40–64px
      "5xl": "clamp(3rem, 2.25rem + 3.75vw, 5.5rem)",     // display, 48–88px
    },
    /**
     * En familj, två roller. Archivo Variable bär både rubriker och brödtext:
     * smalare och tyngre i rubriker (breddaxeln), normalbred och lugn i text.
     * Filen laddas versionslåst via next/font i app/layout.tsx och exponeras
     * som --font-archivo; fallbackarna har verifierade svenska diakriter.
     */
    family: {
      display: 'var(--font-archivo), "Arial Narrow", ui-sans-serif, system-ui, sans-serif',
      body: 'var(--font-archivo), ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
    },
    /**
     * Rubrikernas uttryck ur typografiprofilen: vikt och bredd per nivå.
     * Breddaxeln skapar sportkaraktären i stora rubriker — brödtext och
     * små UI-texter ligger alltid på 100 %. Gå aldrig under 75 % bredd.
     */
    headings: {
      h1: { weight: 800, stretch: "80%", leading: 1.0, size: "4xl" },
      h2: { weight: 750, stretch: "86%", leading: 1.05, size: "3xl" },
      h3: { weight: 700, stretch: "92%", leading: 1.1, size: "2xl" },
      h4: { weight: 700, stretch: "100%", leading: 1.2, size: "xl" },
    },
    lineHeight: { tight: 1.1, snug: 1.3, normal: 1.625, relaxed: 1.75 },
    /** Brödtext ska ligga nära 66 tecken per rad. */
    measure: "66ch",
  },

  /** Spacingskala i rem. Inga marginaler utanför den. */
  space: [0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12] as const,

  radius: { none: "0", sm: "4px", md: "8px", lg: "12px", pill: "999px" },

  /** Brytpunkter. Mobilen först — de flesta besökarna är föräldrar med telefon. */
  breakpoints: { sm: "480px", md: "768px", lg: "1024px", xl: "1280px" },

  /**
   * Tillgänglighet. Detta är krav, inte ambition.
   * Respektera `prefers-reduced-motion` överallt där något rör sig.
   */
  a11y: {
    minContrastBody: 4.5,
    minContrastLarge: 3,
    minTouchTargetPx: 44,
    focusVisibleRequired: true,
    respectReducedMotion: true,
  },
} as const;

export type Design = typeof design;
