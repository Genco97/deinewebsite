"use client";

import { useEffect, useRef, useState } from "react";
import { abPreis, type Betrieb } from "@/lib/beispiele";

type Nachricht = { von: "ki" | "ich"; text: string };

const klein = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Vorbereitete Antworten – im Beispiel ohne echte KI, damit nichts kostet.
function antwortFuer(b: Betrieb, frage: string) {
  const f = klein(frage);
  const preis = (l: Betrieb["leistungen"][number]) =>
    `${l.name}: ${abPreis(l.preis)}${l.dauer ? `, Dauer ca. ${l.dauer} Minuten` : ""}.`;

  // Eine Leistung beim Namen genannt? (z. B. „Fade“, „Kebap“, „Küche“)
  const treffer = b.leistungen.find((l) =>
    klein(l.name)
      .split(/[^a-z0-9]+/)
      .some((w) => w.length > 3 && f.includes(w.slice(0, Math.max(4, w.length - 2)))),
  );
  if (treffer) return `${preis(treffer)} ${treffer.text}.`;

  if (/offen|offnung|oeffnung|zeit|wann|samstag|sonntag|montag|heute|morgen/.test(f)) {
    const offen = b.oeffnungszeiten.filter((o) => o.zeit !== "geschlossen").map((o) => `${o.tage} ${o.zeit}`);
    const zu = b.oeffnungszeiten.filter((o) => o.zeit === "geschlossen").map((o) => o.tage);
    return `Wir haben ${offen.join(" und ")} offen.${zu.length ? ` ${zu.join(" und ")} ist geschlossen.` : ""}`;
  }
  if (/\bwo\b|adresse|anfahrt|bahn|parken/.test(f)) return `Sie finden uns in der ${b.strasse}, ${b.plz} ${b.ort}.`;
  for (const q of b.fragen) {
    const kern = klein(q.f).split(/[^a-z0-9]+/).filter((w) => w.length > 4 && !["kostet", "konnen", "machen"].includes(w));
    if (kern.some((w) => f.includes(w.slice(0, 6)))) return q.a;
  }
  if (/termin|buch|reserv|bestell|frei|tisch/.test(f))
    return `Gern! Scrollen Sie zu „${b.buchung.titel.replace(".", "")}“ – dort geht es in 20 Sekunden. Oder rufen Sie uns an: ${b.telefon}`;
  if (/preis|kost|teuer|was kostet/.test(f))
    return `Zum Beispiel: ${b.leistungen.slice(0, 3).map((l) => `${l.name} ${abPreis(l.preis)}`).join(", ")}. Alle Preise finden Sie weiter oben.`;
  if (/karte|zahl|bar|bankomat/.test(f)) return "Sie können bar, mit Bankomat-, Kreditkarte oder mit dem Handy zahlen.";
  if (/\b(hallo|hi|servus)\b|gruss|gruess/.test(f)) return "Servus! 👋 Wie kann ich Ihnen helfen?";
  if (/danke/.test(f)) return "Sehr gern! Wir freuen uns auf Ihren Besuch.";
  return `Gute Frage! Das beantworten wir Ihnen am besten persönlich unter ${b.telefon}. Ich kann Ihnen sonst bei Preisen, Öffnungszeiten, Anfahrt und ${b.aktionKurz === "Termin" ? "Terminen" : "Reservierungen"} helfen.`;
}

export function ProChat({ betrieb }: { betrieb: Betrieb }) {
  const [offen, setOffen] = useState(false);
  const [verlauf, setVerlauf] = useState<Nachricht[]>([
    { von: "ki", text: `Hallo! Ich bin der KI-Assistent von ${betrieb.name}. Fragen Sie mich nach Preisen, Öffnungszeiten oder einem Termin.` },
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
      setVerlauf((v) => [...v, { von: "ki", text: antwortFuer(betrieb, frage) }]);
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
                <p className="font-bold leading-tight">{betrieb.marke.charAt(0) + betrieb.marke.slice(1).toLowerCase()} KI</p>
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
            {betrieb.chat.map((v) => (
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
          aria-label="Fragen Sie unsere KI"
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-400 font-bold text-white shadow-[0_0_40px_color-mix(in_srgb,var(--pro-b)_55%,transparent)] transition hover:scale-105 sm:w-auto sm:px-5"
        >
          {/* Am Handy nur das Symbol, damit der Knopf keine Inhalte verdeckt */}
          <span aria-hidden className="text-lg sm:text-base">✦</span>
          <span aria-hidden className="hidden sm:inline">Fragen Sie unsere KI</span>
        </button>
      )}
    </>
  );
}
