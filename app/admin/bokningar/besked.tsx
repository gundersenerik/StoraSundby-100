"use client";

import { createContext, useCallback, useContext, useState } from "react";

/**
 * Besked per bokning, ägda av sidan i stället för raden.
 *
 * När en bokning byter status flyttar raden mellan sidans listor
 * (förfrågningar → kommande → historik) i serverns omrendering, och då
 * monteras radkomponenten om — med lokalt tillstånd hade beskedet
 * försvunnit i samma ögonblick som det angick kansliet som mest
 * ("Inget mejl gick ut — hör av dig till gästen själv"). CI fällde
 * flödet gång på gång av exakt den kapplöpningen: syntes beskedet före
 * omrenderingen gick testet igenom, annars inte.
 *
 * Providern ligger på en stabil plats i trädet och överlever
 * omrenderingen, så beskedet följer bokningen vart raden än flyttar.
 */
export interface Besked {
  ok: boolean;
  text: string;
}

interface BeskedKontext {
  alla: Record<string, Besked>;
  satt: (id: string, besked: Besked | null) => void;
}

const Kontext = createContext<BeskedKontext | null>(null);

export function BeskedProvider({ children }: { children: React.ReactNode }) {
  const [alla, setAlla] = useState<Record<string, Besked>>({});
  const satt = useCallback((id: string, besked: Besked | null) => {
    setAlla((f) => {
      const nasta = { ...f };
      if (besked === null) delete nasta[id];
      else nasta[id] = besked;
      return nasta;
    });
  }, []);
  return <Kontext.Provider value={{ alla, satt }}>{children}</Kontext.Provider>;
}

export function useBesked(id: string): [Besked | null, (besked: Besked | null) => void] {
  const kontext = useContext(Kontext);
  if (!kontext) throw new Error("useBesked kräver BeskedProvider.");
  const { alla, satt } = kontext;
  const sattForId = useCallback((besked: Besked | null) => satt(id, besked), [id, satt]);
  return [alla[id] ?? null, sattForId];
}
