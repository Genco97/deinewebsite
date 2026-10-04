"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { positionenSuchen } from "@/app/crm/karte/actions";
import { buttonClass } from "@/components/ui";

/** Trägt Leads ohne Position nach und nach auf der Karte ein. */
export function PositionenSuchen({ offen, team }: { offen: number; team: boolean }) {
  const router = useRouter();
  const [laeuft, setLaeuft] = useState(false);
  const [rest, setRest] = useState(offen);
  const [fertig, setFertig] = useState(0);
  const [fehler, setFehler] = useState<string | null>(null);

  async function starten() {
    setLaeuft(true);
    setFehler(null);
    let r = rest;
    try {
      while (r > 0) {
        const s = await positionenSuchen(team);
        if (s.fehler) {
          setFehler(s.fehler);
          break;
        }
        setFertig((f) => f + s.gefunden + s.nichtGefunden);
        // Kein Fortschritt (z. B. keine Rechte) → aufhören statt endlos zu laufen
        if (s.gefunden + s.nichtGefunden === 0) break;
        r = s.rest;
        setRest(r);
        router.refresh();
      }
    } catch {
      setFehler("Das hat nicht geklappt. Bitte versuch es nochmal.");
    }
    setLaeuft(false);
    router.refresh();
  }

  const gesamt = fertig + rest;
  return (
    <div role="status" className="rounded-xl border border-brand/30 bg-brand-light p-4">
      {laeuft ? (
        <>
          <p className="font-semibold text-ink">
            Adressen werden gesucht … {fertig} von {gesamt}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full bg-brand transition-all" style={{ width: `${gesamt ? (fertig / gesamt) * 100 : 0}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted">Etwa 1 Sekunde pro Betrieb. Du kannst die Seite offen lassen und zuschauen.</p>
        </>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink">
            <strong>{rest} {rest === 1 ? "Betrieb ist" : "Betriebe sind"} noch nicht auf der Karte.</strong>{" "}
            <span className="text-muted">Die Position wird einmal aus der Adresse gesucht.</span>
          </p>
          <button type="button" onClick={starten} className={buttonClass("primary", "shrink-0")}>
            Jetzt eintragen
          </button>
        </div>
      )}
      {fehler ? <p className="mt-2 text-sm font-semibold text-danger">{fehler}</p> : null}
    </div>
  );
}
