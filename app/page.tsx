import { club } from "@/config/club";

/**
 * Platshållarstartsida.
 *
 * Finns bara för att bevisa att kedjan main -> Vercel -> publik URL
 * fungerar innan det finns något att deploya. Ersätts i modul 1.
 */
export default function Home() {
  const age = club.identity.ageAt();

  return (
    <main>
      <h1>{club.identity.shortName}</h1>
      <p>
        Ny föreningssajt under uppbyggnad. {club.identity.legalName} grundades{" "}
        {club.identity.foundedYear} och fyller {age} år.
      </p>
      <p>
        Nuvarande sajt finns tills vidare på{" "}
        <a href={`https://${club.site.domain}`}>{club.site.domain}</a>.
      </p>
    </main>
  );
}
