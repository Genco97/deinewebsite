import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { abPreis, betriebAusSuche } from "@/lib/beispiele";

export const metadata: Metadata = { title: "Beispiel: Basic" };

const sterne = (n: number) => n.toLocaleString("de-AT", { minimumFractionDigits: 1 });

// Eine Seite, das Wichtigste – aber modern: Bild oben, Karten, Anruf-Knopf am Handy immer sichtbar.
export default async function BasicBeispiel({ searchParams }: PageProps<"/beispiele/basic">) {
  const betrieb = await betriebAusSuche(searchParams);
  const st = betrieb.stil;
  const farben = {
    "--a-bg": st.bg,
    "--a-flaeche": st.flaeche,
    "--a-ink": st.ink,
    "--a-muted": st.muted,
    "--a-linie": st.linie,
    "--a-akzent": st.akzent,
    "--a-auf": st.aufAkzent,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  } as CSSProperties;
  const knopf = "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 font-semibold transition hover:brightness-110";
  return (
    <div className="flex-1 bg-[var(--a-bg)] pb-20 text-[var(--a-ink)] md:pb-0" style={farben}>
      <header className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-4">
        <span aria-hidden className="grid h-10 w-10 place-items-center rounded-xl text-lg font-bold text-[var(--a-auf)]" style={{ background: st.akzent }}>
          {betrieb.name[0]}
        </span>
        <p className="font-bold">{betrieb.name}</p>
        <a href={betrieb.telefonLink} className="ml-auto hidden text-sm font-semibold text-[var(--a-akzent)] sm:block">
          {betrieb.telefon}
        </a>
      </header>

      <main className="mx-auto max-w-3xl px-5">
        {/* Großes Bild */}
        <div
          className="relative overflow-hidden rounded-3xl px-6 pb-7 pt-40 text-white sm:px-10 sm:pt-56"
          style={{ background: betrieb.bild ? `center / cover url(${betrieb.bild.hero})` : betrieb.heroFarbe }}
        >
          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-neutral-900">
              <span className="text-amber-500">★</span> {sterne(betrieb.bewertung.sterne)} · {betrieb.bewertung.anzahl} Bewertungen
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight sm:text-5xl">{betrieb.name}</h1>
            <p className="mt-1 text-lg text-white/85">
              {betrieb.art} in {betrieb.plz} {betrieb.ort} · {betrieb.vertrauen}
            </p>
          </div>
        </div>
        <p className="mt-2 text-right text-xs text-[var(--a-muted)]">Bewertungen: Beispielwerte</p>

        <p className="mt-6 text-lg leading-relaxed">{betrieb.einleitung}</p>
        <div className="mt-6 hidden gap-3 md:flex">
          <a href={betrieb.telefonLink} className={knopf} style={{ background: st.akzent, color: st.aufAkzent }}>
            📞 Jetzt anrufen
          </a>
          <a href="#anfahrt" className={`${knopf} border border-[var(--a-linie)]`}>
            Anfahrt
          </a>
        </div>

        {/* Preise als Karten */}
        <h2 className="mt-14 text-2xl font-bold">Preise</h2>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {betrieb.leistungen.map((l) => (
            <li key={l.id} className="flex min-w-0 items-center gap-4 rounded-2xl border border-[var(--a-linie)] bg-[var(--a-flaeche)] p-4">
              <span aria-hidden className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: `color-mix(in srgb, ${st.akzent} 12%, transparent)` }}>
                {l.symbol}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{l.name}</span>
                <span className="block truncate text-sm text-[var(--a-muted)]">{l.text}</span>
              </span>
              <span className="whitespace-nowrap font-bold text-[var(--a-akzent)]">{abPreis(l.preis)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-14 grid gap-4 md:grid-cols-2">
          {/* Öffnungszeiten */}
          <section className="rounded-2xl border border-[var(--a-linie)] bg-[var(--a-flaeche)] p-5">
            <h2 className="text-xl font-bold">Öffnungszeiten</h2>
            <dl className="mt-3 space-y-2">
              {betrieb.oeffnungszeiten.map((o) => (
                <div key={o.tage} className="flex justify-between gap-4">
                  <dt className="text-[var(--a-muted)]">{o.tage}</dt>
                  <dd className="font-semibold">{o.zeit}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Anfahrt */}
          <section id="anfahrt" className="scroll-mt-6 overflow-hidden rounded-2xl border border-[var(--a-linie)] bg-[var(--a-flaeche)]">
            <div
              aria-hidden
              className="relative h-32 bg-[#e8eef3] [background-image:linear-gradient(#fff_2px,transparent_2px),linear-gradient(90deg,#fff_2px,transparent_2px)] [background-size:36px_36px]"
            >
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-3xl drop-shadow">📍</span>
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold">Anfahrt</h2>
              <p className="mt-1">
                {betrieb.strasse}, {betrieb.plz} {betrieb.ort}
              </p>
              <p className="mt-1 text-sm text-[var(--a-muted)]">Auf der echten Seite: Google-Karte mit Route.</p>
            </div>
          </section>
        </div>

        {/* Kontakt */}
        <section className="mt-4 rounded-2xl p-6 text-center" style={{ background: `color-mix(in srgb, ${st.akzent} 10%, transparent)` }}>
          <p className="text-lg font-semibold">Fragen? Rufen Sie uns an.</p>
          <a href={betrieb.telefonLink} className="mt-1 block text-3xl font-bold text-[var(--a-akzent)]">
            {betrieb.telefon}
          </a>
          <a href={`mailto:${betrieb.email}`} className="mt-2 block text-sm text-[var(--a-muted)] underline">
            {betrieb.email}
          </a>
        </section>
      </main>

      <footer className="mt-14 border-t border-[var(--a-linie)] py-6 text-center text-sm text-[var(--a-muted)]">
        © {betrieb.name} · Impressum · Datenschutz
      </footer>

      {/* Am Handy immer sichtbar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--a-linie)] bg-[var(--a-flaeche)]/95 p-3 backdrop-blur md:hidden">
        <a href={betrieb.telefonLink} className={`${knopf} w-full`} style={{ background: st.akzent, color: st.aufAkzent }}>
          📞 Jetzt anrufen
        </a>
      </div>
    </div>
  );
}
