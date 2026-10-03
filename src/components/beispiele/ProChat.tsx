"use client";

import { useEffect, useRef, useState } from "react";
import { SALON, euroGanz } from "@/lib/beispiele";

type Nachricht = { von: "ki" | "ich"; text: string };

const VORSCHLAEGE = ["Was kostet Färben?", "Wann habt ihr offen?", "Wo seid ihr?", "Termin buchen"];

const preis = (id: string) => {
  const l = SALON.leistungen.find((x) => x.id === id)!;
  return `${l.name} kostet ab ${euroGanz(l.preis)} und dauert ca. ${l.dauer} Minuten.`;
};

// Vorbereitete Antworten – im Beispiel ohne echte KI, damit nichts kostet.
const REGELN: { muster: RegExp; antwort: () => string }[] = [
  { muster: /balayage|str[äa]hn/i, antwort: () => `${preis("straehnen")} Wir beraten Sie vorher gratis, welcher Ton zu Ihnen passt.` },
  { muster: /f[äa]rb|farbe|ansatz/i, antwort: () => `${preis("farbe")} Wir arbeiten mit ammoniakfreien Farben.` },
  { muster: /herren|mann|bart/i, antwort: () => `${preis("herren")} Bei Jonas sind Sie dafür genau richtig.` },
  { muster: /kind/i, antwort: () => preis("kinder") },
  { muster: /hochzeit|hochsteck|ball|fest/i, antwort: () => `${preis("styling")} Selin kommt auf Wunsch auch zu Ihnen nach Hause.` },
  { muster: /preis|kost|schnitt|damen|teuer/i, antwort: () => `${preis("damen")} Eine Übersicht aller Preise finden Sie weiter oben bei „Leistungen“.` },
  {
    muster: /offen|öffnung|oeffnung|zeit|wann|samstag|montag|heute|morgen/i,
    antwort: () => `Wir haben ${SALON.oeffnungszeiten.filter((o) => o.zeit !== "geschlossen").map((o) => `${o.tage} ${o.zeit}`).join(" und ")} offen. Montag und Sonntag ist geschlossen.`,
  },
  { muster: /\bwo\b|adresse|anfahrt|u-?bahn|parken/i, antwort: () => `Sie finden uns in der ${SALON.strasse}, ${SALON.plz} ${SALON.ort} – 3 Minuten von der U3 Neubaugasse.` },
  { muster: /termin|buch|reserv|frei/i, antwort: () => "Gern! Scrollen Sie zu „Termin buchen“ – dort sehen Sie alle freien Zeiten und buchen in 20 Sekunden. Oder rufen Sie uns an: " + SALON.telefon },
  { muster: /karte|zahl|bar|bankomat/i, antwort: () => "Sie können bar, mit Bankomat-, Kreditkarte oder mit dem Handy zahlen." },
  { muster: /\b(hallo|hi|servus)\b|grüß|gruess/i, antwort: () => "Servus! 👋 Wie kann ich Ihnen helfen?" },
  { muster: /danke/i, antwort: () => "Sehr gern! Wir freuen uns auf Ihren Besuch. ✂️" },
];

function antwortFuer(frage: string) {
  return (
    REGELN.find((r) => r.muster.test(frage))?.antwort() ??
    `Gute Frage! Das beantwortet Ihnen Mila am besten persönlich unter ${SALON.telefon}. Ich kann Ihnen sonst bei Preisen, Öffnungszeiten, Anfahrt und Terminen helfen.`
  );
}

export function ProChat() {
  const [offen, setOffen] = useState(false);
  const [verlauf, setVerlauf] = useState<Nachricht[]>([
    { von: "ki", text: `Hallo! Ich bin der KI-Assistent von ${SALON.name}. Fragen Sie mich nach Preisen, Öffnungszeiten oder einem Termin.` },
  ]);
  const [tippt, setTippt] = useState(false);
  const [eingabe, setEingabe] = useState("");
  const liste = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    liste.current?.scrollTo({ top: liste.current.scrollHeight, behavior: "smooth" });
  }, [verlauf, tippt]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function senden(text: string) {
    const frage = text.trim();
    if (!frage || tippt) return;
    setVerlauf((v) => [...v, { von: "ich", text: frage }]);
    setEingabe("");
    setTippt(true);
    timer.current = setTimeout(() => {
      setVerlauf((v) => [...v, { von: "ki", text: antwortFuer(frage) }]);
      setTippt(false);
    }, 700 + Math.min(1200, frage.length * 25));
  }

  return (
    <>
      {offen ? (
        <div
          role="dialog"
          aria-label="KI-Assistent"
          className="fixed bottom-4 right-4 z-50 flex h-[min(520px,calc(100dvh-2rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#11111a]/95 shadow-[0_20px_80px_rgba(124,58,237,0.35)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-gradient-to-r from-fuchsia-500/20 via-violet-500/20 to-cyan-400/20 px-4 py-3">
            <div className="flex items-center gap-3">
              <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 text-lg">✦</span>
              <div>
                <p className="font-bold leading-tight">Mila KI</p>
                <p className="text-xs text-emerald-300">● online · antwortet sofort</p>
              </div>
            </div>
            <button onClick={() => setOffen(false)} aria-label="Chat schließen" className="grid h-11 w-11 place-items-center rounded-full text-xl hover:bg-white/10">
              ×
            </button>
          </div>

          <div ref={liste} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {verlauf.map((n, i) => (
              <p
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${
                  n.von === "ich" ? "ml-auto rounded-br-md bg-violet-500 text-white" : "rounded-bl-md bg-white/10 text-white/90"
                }`}
              >
                {n.text}
              </p>
            ))}
            {tippt ? (
              <p className="pro-tippen w-fit rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 text-white/70" aria-label="Assistent schreibt">
                <span />
                <span />
                <span />
              </p>
            ) : null}
          </div>

          <div className="flex gap-2 overflow-x-auto px-4 pb-2">
            {VORSCHLAEGE.map((v) => (
              <button
                key={v}
                onClick={() => senden(v)}
                className="shrink-0 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-violet-400 hover:text-white"
              >
                {v}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              senden(eingabe);
            }}
            className="flex gap-2 border-t border-white/10 p-3"
          >
            <label htmlFor="pro-chat-eingabe" className="sr-only">
              Ihre Frage
            </label>
            <input
              id="pro-chat-eingabe"
              value={eingabe}
              onChange={(e) => setEingabe(e.target.value)}
              placeholder="Ihre Frage …"
              autoComplete="off"
              maxLength={200}
              className="min-h-11 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-base text-white placeholder:text-white/40 focus:border-violet-400 focus:outline-none"
            />
            <button aria-label="Senden" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 text-lg font-bold">
              ↑
            </button>
          </form>
          <p className="px-4 pb-2 text-center text-[11px] text-white/40">Beispiel mit vorbereiteten Antworten</p>
        </div>
      ) : (
        <button
          onClick={() => setOffen(true)}
          className="fixed bottom-5 right-5 z-50 flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 px-5 font-bold text-white shadow-[0_0_40px_rgba(167,139,250,0.55)] transition hover:scale-105"
        >
          <span aria-hidden>✦</span> Fragen Sie unsere KI
        </button>
      )}
    </>
  );
}
