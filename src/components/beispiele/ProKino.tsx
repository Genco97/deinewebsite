"use client";

import { useEffect, useRef } from "react";

/*
 * Alle Scroll- und Maus-Effekte der Pro-Seite „Kino“. Die Seite selbst ist fertig gerendert –
 * hier werden nur Bewegungen ergänzt (über data-Attribute). Ohne JavaScript oder bei
 * „Bewegung reduzieren“ bleibt alles sichtbar und ruhig.
 */
export function ProKino() {
  const zeiger = useRef<HTMLDivElement>(null);
  const balken = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seite = document.querySelector<HTMLElement>(".pro-seite");
    const vorspann = document.querySelector<HTMLElement>("[data-vorspann]");
    if (!seite) return;
    const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maus = matchMedia("(pointer: fine)").matches;

    // Der feste Kopf rutscht unter die Beispiel-Leiste, solange sie sichtbar ist
    const kopf = document.querySelector<HTMLElement>("[data-pro-kopf]");
    const kopfSetzen = () => {
      const leiste = document.querySelector("[data-beispiel-leiste]");
      if (kopf && matchMedia("(min-width: 768px)").matches) kopf.style.top = `${Math.max(0, leiste?.getBoundingClientRect().bottom ?? 0)}px`;
    };
    // Die Leiste erscheint erst nach dem Laden – kurz nachmessen
    const messen = [0, 100, 400, 1000].map((ms) => setTimeout(kopfSetzen, ms));
    addEventListener("scroll", kopfSetzen, { passive: true });
    if (ruhig) {
      vorspann?.remove();
      return () => {
        messen.forEach(clearTimeout);
        removeEventListener("scroll", kopfSetzen);
      };
    }

    let aus = false;
    let aufraeumen = () => {};
    (async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }, { default: Lenis }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
        import("gsap/SplitText"),
        import("lenis"),
      ]);
      if (aus) return;
      gsap.registerPlugin(ScrollTrigger, SplitText);
      const $ = (s: string) => Array.from(seite.querySelectorAll<HTMLElement>(s));

      // Weiches Scrollen nur mit Maus – am Handy bleibt das gewohnte Wischen
      const lenis = maus ? new Lenis({ lerp: 0.085 }) : null;
      const tempo = () => (lenis ? lenis.velocity : 0);
      const lenisTick = (t: number) => lenis?.raf(t * 1000);
      if (lenis) {
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(lenisTick);
        gsap.ticker.lagSmoothing(0);
      }

      const ctx = gsap.context(() => {
        // Fortschrittsbalken
        if (balken.current) gsap.to(balken.current, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

        // Vorspann: Zähler, dann Vorhang auf, dann Titel
        const titel = $("[data-titel-wort]");
        const tl = gsap.timeline();
        if (vorspann) {
          vorspann.style.animation = "none";
          lenis?.stop();
          const zahl = vorspann.querySelector<HTMLElement>("[data-vorspann-zahl]");
          const z = { n: 0 };
          tl.to(z, { n: 100, duration: 1.4, ease: "power3.inOut", onUpdate: () => zahl && (zahl.textContent = String(Math.round(z.n))) })
            .to(vorspann.querySelectorAll("b,small"), { opacity: 0, duration: 0.25 })
            .to(vorspann.children[0], { yPercent: -100, duration: 1, ease: "expo.inOut" }, "<.05")
            .to(vorspann.children[1], { yPercent: 100, duration: 1, ease: "expo.inOut", onComplete: () => { vorspann.remove(); lenis?.start(); } }, "<");
        }
        tl.from(titel, { yPercent: 115, rotate: 6, opacity: 0, stagger: 0.08, duration: 1.3, ease: "expo.out" }, vorspann ? "<.35" : 0).from("[data-held-info]", { opacity: 0, y: 30, duration: 1, stagger: 0.1 }, "<.4");

        // Titel fliegt beim Scrollen auseinander
        titel.forEach((w, i) =>
          gsap.to(w, { xPercent: [-40, 30, -20, 50][i % 4], yPercent: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: "[data-held]", start: "top top", end: "bottom top", scrub: true } }),
        );

        // Laufband: läuft immer, schneller und schräg mit dem Scroll-Tempo
        const band = seite.querySelector<HTMLElement>("[data-band]");
        if (band) {
          let x = 0;
          const laufen = () => {
            const v = tempo();
            x -= 1.1 + Math.abs(v) * 0.5;
            const breite = band.scrollWidth / 2;
            if (-x > breite) x += breite;
            gsap.set(band, { x, skewX: gsap.utils.clamp(-12, 12, -v * 0.5) });
          };
          gsap.ticker.add(laufen);
          return () => gsap.ticker.remove(laufen);
        }
      }, seite);

      const ctx2 = gsap.context(() => {
        // Manifest: Wörter werden beim Scrollen hell
        const manifest = seite.querySelector("[data-manifest]");
        if (manifest) {
          const s = SplitText.create(manifest, { type: "words" });
          gsap.fromTo(s.words, { opacity: 0.13 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: manifest, start: "top 78%", end: "bottom 45%", scrub: true } });
        }

        // Überschriften: Wörter gleiten von unten herein
        $("[data-h2]").forEach((h) => {
          const s = SplitText.create(h, { type: "lines,words", linesClass: "pro-zeile-text" });
          gsap.from(s.words, { yPercent: 115, rotate: 4, duration: 1.1, ease: "expo.out", stagger: 0.04, scrollTrigger: { trigger: h, start: "top 88%" } });
        });
        $("[data-rein]").forEach((el) => gsap.from(el, { y: 60, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));

        // Galerie quer: am Computer bleibt die Seite stehen und die Bilder fahren vorbei
        const mm = gsap.matchMedia();
        mm.add("(min-width: 768px)", () => {
          const quer = seite.querySelector<HTMLElement>("[data-quer]");
          const spur = seite.querySelector<HTMLElement>("[data-quer-spur]");
          if (!quer || !spur) return;
          const fahrt = gsap.to(spur, {
            x: () => -(spur.scrollWidth - innerWidth + 60),
            ease: "none",
            scrollTrigger: { trigger: quer, pin: true, start: "top top", end: () => `+=${spur.scrollWidth}`, scrub: 1, invalidateOnRefresh: true },
          });
          $("[data-quer-bild]").forEach((b) =>
            gsap.fromTo(b, { xPercent: 8 }, { xPercent: -8, ease: "none", scrollTrigger: { trigger: b.parentElement, containerAnimation: fahrt, start: "left right", end: "right left", scrub: true } }),
          );
          const karten = $("[data-quer-karte]");
          const kippen = () => {
            gsap.to(karten, { skewX: gsap.utils.clamp(-7, 7, tempo() * -0.3), duration: 0.4, overwrite: "auto" });
          };
          gsap.ticker.add(kippen);
          return () => gsap.ticker.remove(kippen);
        });

        // Riesenschrift-Maske: Flug in den Namen hinein
        const deckSek = seite.querySelector("[data-deck-sek]");
        if (deckSek) {
          gsap
            .timeline({ scrollTrigger: { trigger: deckSek, pin: true, start: "top top", end: "+=180%", scrub: 1 } })
            .to("[data-deck]", { scale: 55, ease: "power2.in", duration: 1 })
            .to("[data-deck]", { opacity: 0, duration: 0.12 }, "-=.1")
            .fromTo("[data-deck-text]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.25 }, "-=.05");
        }

        // Stapel-Karten: die vordere schiebt sich über die hintere
        const stapel = $("[data-stapel-karte]");
        stapel.forEach((k, i) => {
          const naechste = stapel[i + 1];
          if (naechste) gsap.to(k, { scale: 0.9, filter: "brightness(.45)", ease: "none", scrollTrigger: { trigger: naechste, start: "top bottom", end: "top 110px", scrub: true } });
        });

        // Vorher/Nachher wischt beim Scrollen
        const wisch = seite.querySelector("[data-wisch-sek]");
        if (wisch) {
          gsap
            .timeline({ scrollTrigger: { trigger: wisch, pin: true, start: "top top", end: "+=130%", scrub: true } })
            .fromTo("[data-wisch-neu]", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", ease: "none" }, 0)
            .fromTo("[data-wisch-linie]", { left: "0%" }, { left: "100%", ease: "none" }, 0);
        }

        // Zahlen zählen hoch
        $("[data-z]").forEach((el) => {
          const ziel = Number(el.dataset.z);
          const komma = Number(el.dataset.komma ?? 0);
          const o = { v: 0 };
          gsap.to(o, {
            v: ziel,
            duration: 2.2,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            onUpdate: () => (el.textContent = o.v.toLocaleString("de-AT", { minimumFractionDigits: komma, maximumFractionDigits: komma })),
          });
        });

        // Riesiger Name steigt am Ende auf
        gsap.from("[data-riesig] span", { yPercent: 100, stagger: 0.08, ease: "none", scrollTrigger: { trigger: "[data-riesig]", start: "top bottom", end: "bottom bottom", scrub: true } });

        return () => mm.revert();
      }, seite);

      // Maus-Effekte
      const weg: (() => void)[] = [];
      const an = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Window, typ: K, fn: (e: HTMLElementEventMap[K]) => void) => {
        el.addEventListener(typ, fn as EventListener);
        weg.push(() => el.removeEventListener(typ, fn as EventListener));
      };
      if (maus) {
        const z = zeiger.current;
        if (z) {
          const zx = gsap.quickTo(z, "x", { duration: 0.25 });
          const zy = gsap.quickTo(z, "y", { duration: 0.25 });
          an(window, "pointermove", (e) => { zx(e.clientX); zy(e.clientY); });
          $("a,button,[data-tilt],[data-zeile]").forEach((el) => {
            an(el, "pointerenter", () => z.classList.add("pro-gross"));
            an(el, "pointerleave", () => z.classList.remove("pro-gross"));
          });
        }
        // Knöpfe ziehen sich zur Maus
        $("[data-magnet]").forEach((b) => {
          const x = gsap.quickTo(b, "x", { duration: 0.6, ease: "elastic.out(1,.4)" });
          const y = gsap.quickTo(b, "y", { duration: 0.6, ease: "elastic.out(1,.4)" });
          an(b, "pointermove", (e) => {
            const r = b.getBoundingClientRect();
            x((e.clientX - r.left - r.width / 2) * 0.3);
            y((e.clientY - r.top - r.height / 2) * 0.4);
          });
          an(b, "pointerleave", () => { x(0); y(0); });
        });
        // Karten kippen in 3D, Licht folgt der Maus
        $("[data-tilt]").forEach((k) => {
          const rx = gsap.quickTo(k, "rotationX", { duration: 0.5 });
          const ry = gsap.quickTo(k, "rotationY", { duration: 0.5 });
          an(k, "pointermove", (e) => {
            const b = k.getBoundingClientRect();
            const px = (e.clientX - b.left) / b.width;
            const py = (e.clientY - b.top) / b.height;
            ry((px - 0.5) * 16);
            rx((0.5 - py) * 16);
            k.style.setProperty("--mx", `${px * 100}%`);
            k.style.setProperty("--my", `${py * 100}%`);
          });
          an(k, "pointerleave", () => { rx(0); ry(0); });
        });
        // Leistungen: Foto folgt der Maus
        const folge = seite.querySelector<HTMLElement>("[data-folgebild]");
        const folgeBild = folge?.querySelector<HTMLElement>("div");
        if (folge && folgeBild) {
          const fx = gsap.quickTo(folge, "x", { duration: 0.5, ease: "power3" });
          const fy = gsap.quickTo(folge, "y", { duration: 0.5, ease: "power3" });
          an(window, "pointermove", (e) => {
            fx(e.clientX);
            fy(e.clientY);
            gsap.to(folge, { rotate: gsap.utils.clamp(-12, 12, e.movementX * 0.6), duration: 0.4 });
          });
          $("[data-zeile]").forEach((r) => {
            an(r, "pointerenter", () => {
              folgeBild.style.background = r.dataset.bild ?? "";
              gsap.to(folge, { opacity: 1, scale: 1, duration: 0.4 });
            });
            an(r, "pointerleave", () => gsap.to(folge, { opacity: 0, scale: 0.6, duration: 0.3 }));
          });
        }
      }

      aufraeumen = () => {
        weg.forEach((f) => f());
        ctx.revert();
        ctx2.revert();
        if (lenis) {
          gsap.ticker.remove(lenisTick);
          lenis.destroy();
        }
      };
    })();

    return () => {
      aus = true;
      messen.forEach(clearTimeout);
      removeEventListener("scroll", kopfSetzen);
      aufraeumen();
    };
  }, []);

  return (
    <>
      <div ref={balken} aria-hidden className="fixed left-0 top-0 z-[96] h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
      <div aria-hidden className="pro-korn" />
      <div ref={zeiger} aria-hidden className="pro-zeiger" />
    </>
  );
}
