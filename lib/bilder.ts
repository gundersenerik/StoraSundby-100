import type { StaticImageData } from "next/image";
import bollarPaGras from "@/bilder/bollar-pa-gras.jpeg";
import grasmattanLaggs from "@/bilder/grasmattan-laggs.jpeg";
import gymnastikhallenPlintar from "@/bilder/gymnastikhallen-plintar.jpeg";
import klubbflaggan from "@/bilder/klubbflaggan.jpeg";
import klubbstuganHammargardetsIp from "@/bilder/klubbstugan-hammargardets-ip.jpeg";
import orienteringskartaOjaNorra from "@/bilder/orienteringskarta-oja-norra.jpeg";
import padelbananKvall from "@/bilder/padelbanan-kvall.jpeg";
import skidsparVinterdag from "@/bilder/skidspar-vinterdag.jpeg";
import sommardagPaPlanerna from "@/bilder/sommardag-pa-planerna.jpeg";
import stugornaHostsol from "@/bilder/stugorna-hostsol.jpeg";
import traningskvall from "@/bilder/traningskvall.jpeg";

/**
 * Föreningens egna fotografier, curerade ur de 28 som hämtades hem från
 * gamla sajten (content/legacy/bilder, provenans i inventering.json).
 * Principen ur docs/DESIGN-TRENDER.md: få men bärande — en bild per sida,
 * där den belägger något sidan påstår. Riktiga foton på riktiga platser,
 * aldrig genrebilder.
 *
 * Samtycke till publicering, inklusive bilder med personer, bekräftades av
 * Erik 2026-08-25. Byt gärna bilder senare — alt-texten beskriver det som
 * faktiskt syns och får aldrig påstå mer än så (namn, år och platser bara
 * när de syns i bilden eller är belagda i KALLOR).
 *
 * Alt-texterna följer samma röstregler som all annan text och testas mot
 * voice.forbidden i tests/enhet/bilder.test.ts.
 */
export interface Foreningsbild {
  bild: StaticImageData;
  alt: string;
  /** Visas som figcaption när sammanhanget behöver den. */
  bildtext?: string;
}

export const bilder = {
  stugorna: {
    bild: stugornaHostsol,
    alt: "Röda uthyrningsstugor med verandor och grusgångar, i höstsol med skogen bakom",
  },
  bollarPaGras: {
    bild: bollarPaGras,
    alt: "En hög med träningsbollar på gräsplanen, med klubbhusen i bakgrunden",
  },
  klubbstugan: {
    bild: klubbstuganHammargardetsIp,
    alt: "Röd klubbstuga med altan och skylten Hammargärdets IP",
  },
  grasmattanLaggs: {
    bild: grasmattanLaggs,
    alt: "Vuxna och barn lägger gräsmattan för hand, rulle för rulle, på den sandiga planen",
    bildtext:
      "Ur föreningens bildarkiv: gräsmattan läggs för hand. Vet du när bilden togs, eller vilka som är med? Hör av dig till kansliet.",
  },
  sommardagPaPlanerna: {
    bild: sommardagPaPlanerna,
    alt: "Sommardag på gräsplanerna med småmål uppställda och lag samlade längs kanten",
  },
  klubbflaggan: {
    bild: klubbflaggan,
    alt: "Föreningens vita flagga med klubbmärket, rest på gräset framför röda byggnader",
  },
} as const;

/**
 * Sektionssidornas bilder, nycklade på slug. Sektioner utan eget foto i
 * arkivet står utan bild tills klubben skickar ett — hellre ingen bild än
 * en genrebild.
 */
export const sektionsbilder: Partial<Record<string, Foreningsbild>> = {
  fotboll: {
    bild: traningskvall,
    alt: "Bollar, västar och koner på gräset en träningskväll, i lågt motljus",
  },
  orientering: {
    bild: orienteringskartaOjaNorra,
    alt: "Orienteringskarta över Öja Norra med kompass och en orange-vit skärm",
  },
  padel: {
    bild: padelbananKvall,
    alt: "Padelbanan med blått underlag, upplyst av strålkastare i skymningen",
  },
  gymnastik: {
    bild: gymnastikhallenPlintar,
    alt: "Plintar av trä uppställda i gymnastikhallen",
  },
  skidor: {
    bild: skidsparVinterdag,
    alt: "Skidåkare i preparerade spår en solig vinterdag, med snötyngda ekar intill",
  },
};
