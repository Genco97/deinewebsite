"use client";

import { useState } from "react";

/** Basic: kurze Terminanfrage, die per WhatsApp (oder E-Mail) beim Betrieb ankommt. */
export function BasicAnfrage({ leistungen, nummer, email, aktion }: { leistungen: string[]; nummer: string; email: string; aktion: string }) {
  const [name, setName] = useState("");
  const [was, setWas] = useState(leistungen[0] ?? "");
  const [wann, setWann] = useState("diese Woche");
  const wunsch = /vorbestell/i.test(aktion) ? "vorbestellen" : /tisch/i.test(aktion) ? "einen Tisch reservieren" : /angebot/i.test(aktion) ? "ein Angebot anfragen" : /abgabe/i.test(aktion) ? "eine Abgabe vormerken" : "einen Termin vereinbaren";
  const text = `Hallo, hier ist ${name || "…"}. Ich möchte gern ${wunsch}: ${was}, ${wann}.`;
  const feld = "min-h-12 w-full rounded-xl border border-[var(--a-linie)] bg-[var(--a-bg)] px-4 outline-none focus:border-[var(--a-akzent)]";
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="rounded-[22px] border border-[var(--a-linie)] bg-[var(--a-flaeche)] p-6 sm:p-8"
      aria-label="Terminanfrage"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm text-[var(--a-muted)]">
          Ihr Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Anna M." className={`${feld} mt-1.5 text-[var(--a-ink)]`} />
        </label>
        <label className="block text-sm text-[var(--a-muted)]">
          Wofür?
          <select value={was} onChange={(e) => setWas(e.target.value)} className={`${feld} mt-1.5 text-[var(--a-ink)]`}>
            {leistungen.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm text-[var(--a-muted)]">
          Wann?
          <select value={wann} onChange={(e) => setWann(e.target.value)} className={`${feld} mt-1.5 text-[var(--a-ink)]`}>
            {["heute", "morgen", "diese Woche", "nächste Woche", "am Wochenende"].map((w) => (
              <option key={w}>{w}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <a
          href={`https://wa.me/${nummer}?text=${encodeURIComponent(text)}`}
          className="inline-flex min-h-13 items-center justify-center rounded-full bg-[#25a244] px-7 font-semibold text-white transition hover:-translate-y-0.5"
        >
          Per WhatsApp anfragen
        </a>
        <a href={`mailto:${email}?subject=${encodeURIComponent("Anfrage")}&body=${encodeURIComponent(text)}`} className="inline-flex min-h-13 items-center justify-center rounded-full border border-[var(--a-ink)]/70 px-7 font-semibold">
          Per E-Mail
        </a>
        <p className="text-sm text-[var(--a-muted)] sm:ml-2">Die Nachricht ist schon geschrieben – Sie tippen nur auf Senden.</p>
      </div>
    </form>
  );
}
