import { club } from "@/config/club";
import { routes } from "@/config/content";

/**
 * JSON-LD härledd ur club.ts.
 *
 * Gamla sajten har noll strukturerad data. En idrottsförening ska vara
 * maskinläsbar — det är så en förälder som googlar "träningstider stora
 * sundby" hittar rätt, och så kartan vet var anläggningen ligger.
 *
 * Ingenting skrivs här som redan står i club.ts. Byts organisationsnumret
 * dyker det upp i strukturerad data samtidigt som i sidfoten.
 *
 * Platshållarvärden utelämnas hellre än publiceras. Ett organisationsnummer
 * som lyder 802XXX-XXXX i Googles index är värre än inget alls.
 */

export function bassadress(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? `https://${club.site.domain}`;
}

const arPlatshallare = (v: unknown) => typeof v === "string" && v.includes("XXX");

export function sportsClub() {
  const { identity, contact, social, facility } = club;
  const bas = bassadress();

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SportsClub",
    "@id": `${bas}/#klubb`,
    name: identity.legalName,
    alternateName: [identity.shortName, ...identity.alternateNames],
    foundingDate: identity.foundedISO,
    description: identity.purposeVerbatim,
    url: bas,
    email: contact.email,
    sameAs: [social.facebook, social.instagram],
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.street,
      postalCode: contact.address.postalCode,
      addressLocality: contact.address.city,
      addressRegion: contact.address.region,
      addressCountry: contact.address.country,
    },
    sport: club.sections.filter((s) => s.active).map((s) => s.name),
  };

  if (!arPlatshallare(identity.orgNumber)) {
    data.taxID = identity.orgNumber;
  }
  if (contact.phone) {
    data.telephone = contact.phone;
  }
  if (facility.padelBookingUrl) {
    data.subOrganization = {
      "@type": "SportsActivityLocation",
      name: "Padelbana",
      url: facility.padelBookingUrl,
    };
  }

  return data;
}

export function place() {
  const { contact, facility } = club;
  const bas = bassadress();

  return {
    "@context": "https://schema.org",
    "@type": "Place",
    "@id": `${bas}/#anlaggning`,
    name: `${club.identity.shortName}s anläggning`,
    address: {
      "@type": "PostalAddress",
      streetAddress: contact.address.street,
      postalCode: contact.address.postalCode,
      addressLocality: contact.address.city,
      addressCountry: contact.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: contact.coordinates.lat,
      longitude: contact.coordinates.lng,
    },
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: `${facility.pitches.count} ${facility.pitches.type}splaner i ${facility.pitches.surface}`,
        value: true,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Elljusspår för längdskidor",
        value: facility.hasFloodlitSkiTrack,
      },
      {
        "@type": "LocationFeatureSpecification",
        name: "Padelbana",
        value: facility.hasPadelCourt,
      },
    ],
  };
}

export function breadcrumbs(delar: { namn: string; href: string }[]) {
  const bas = bassadress();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ namn: "Start", href: routes.home }, ...delar].map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: d.namn,
      item: `${bas}${d.href === "/" ? "" : d.href}`,
    })),
  };
}

/** JSON-LD i en script-tagg. Aldrig via dangerouslySetInnerHTML med rå data. */
export function jsonLd(data: unknown) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}
