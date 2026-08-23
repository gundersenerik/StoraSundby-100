import { todo } from "./placeholder";

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  DESIGNKONTRAKT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Det här filen låser designens STRUKTUR, inte dess uttryck.
 *
 *  Skillnaden är viktig. Skalorna, de semantiska namnen och temakontraktet
 *  är bindande: de gör att sajten hänger ihop och att en färgändring slår
 *  igenom överallt. Men de konkreta färgvärdena är platshållare tills vi
 *  har klubbens riktiga färger, och den visuella tonen är fortfarande
 *  utvecklarens att välja inom den riktning som beskrivs i prompten.
 *
 *  Med andra ord: du bestämmer hur det ska se ut. Du bestämmer inte att
 *  det ska finnas sjutton olika gråtoner.
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
   * Värdena är platshållare. Byt dem när klubbens riktiga färger är kända
   * (se club.brand) — rollerna och namnen ändras inte.
   */
  color: todo(
    {
      light: {
        paper: "#FBFAF5",      // sidans botten
        surface: "#FFFFFF",    // kort, paneler
        surfaceAlt: "#F3F2EB", // tabellhuvuden, sekundära ytor
        ink: "#14180F",        // brödtext
        inkMuted: "#5A6152",   // sekundär text
        line: "#DFDDD2",       // ramar och avdelare
        brand: "#1B4D3E",      // klubbens primärfärg
        brandInk: "#FFFFFF",   // text ovanpå brand
        accent: "#F0B429",     // knappar, markeringar
        ok: "#2C6640",
        warn: "#9A5F1E",
        danger: "#B0303A",
      },
      dark: {
        paper: "#101410",
        surface: "#171C16",
        surfaceAlt: "#1E241C",
        ink: "#E9EBE4",
        inkMuted: "#9AA294",
        line: "#2B322A",
        brand: "#6FBF95",
        brandInk: "#0C120E",
        accent: "#FFC857",
        ok: "#6FBF87",
        warn: "#D9A05C",
        danger: "#F08A90",
      },
    },
    {
      path: "design.color",
      note:
        "PLATSHÅLLARFÄRGER. Rollerna är bindande, värdena inte. Hämta klubbens " +
        "riktiga färger från dräkt, logotyp och webbshopens sortiment och byt " +
        "värdena här — då slår de igenom i hela sajten.",
      blocksLaunch: true,
    },
  ),

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

  /** Typografisk skala. Inga storlekar utanför den här listan. */
  type: {
    scale: {
      xs: "0.78rem",
      sm: "0.88rem",
      base: "1rem",
      lg: "1.14rem",
      xl: "1.33rem",
      "2xl": "1.62rem",
      "3xl": "2.05rem",
      "4xl": "2.7rem",
      "5xl": "3.6rem",
    },
    /**
     * Två roller räcker. Displayfonten bär personlighet, brödfonten bär text.
     * Båda måste ha bra svenska diakriter (å, ä, ö) och en riktig fallback.
     * Enbart systemfonter eller Google Fonts — inget som kostar.
     */
    family: todo(
      {
        display: '"Fraunces", "Iowan Old Style", Georgia, serif',
        body: '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif',
      },
      {
        path: "design.type.family",
        note:
          "Förslag, inte beslut. Välj ett par som passar en hundraårig " +
          "byförening. Kontrollera att å, ä och ö renderar korrekt i båda.",
      },
    ),
    lineHeight: { tight: 1.15, snug: 1.35, normal: 1.6, relaxed: 1.75 },
    /** Brödtext ska ligga nära 65 tecken per rad. */
    measure: "65ch",
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
