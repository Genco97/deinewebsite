"use client";

import { useEffect, useRef } from "react";

/*
 * Held-Foto als WebGL-Fläche: Wellen unter der Maus, Farbversatz beim schnellen Scrollen,
 * Zoom beim Runterscrollen. Ohne Maus, bei „Bewegung reduzieren“ oder ohne WebGL bleibt das normale Foto.
 */

const VERTEX = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.);}`;
const FRAGMENT = `uniform sampler2D uTex;uniform float uZeit,uKraft,uTempo,uFort;uniform vec2 uMaus,uRes,uBild;varying vec2 vUv;
vec2 cover(vec2 uv){float rs=uRes.x/uRes.y,ri=uBild.x/uBild.y;vec2 s=rs>ri?vec2(1.,ri/rs):vec2(rs/ri,1.);return (uv-.5)*s+.5;}
void main(){vec2 uv=vUv;uv=(uv-.5)/(1.+uFort*.35)+.5;
 vec2 a=vec2(uRes.x/uRes.y,1.);float d=distance(uv*a,uMaus*a);
 float welle=sin(d*38.-uZeit*5.)*exp(-d*7.)*.035*uKraft;
 uv+=normalize(uv-uMaus+.0001)*welle;
 uv.y+=sin(uv.x*10.+uZeit)*.004*uKraft;
 vec2 c=cover(uv);float v=uTempo+welle*.4;
 vec3 col=vec3(texture2D(uTex,c+vec2(v,0.)).r,texture2D(uTex,c).g,texture2D(uTex,c-vec2(v,0.)).b);
 col*=1.-uFort*.6;
 gl_FragColor=vec4(col,1.);}`;

export function ProWasserBild({ bild }: { bild: string }) {
  const rahmen = useRef<HTMLDivElement>(null);
  const flaeche = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const box = rahmen.current;
    const cv = flaeche.current;
    if (!box || !cv) return;
    const ruhig = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const maus = matchMedia("(pointer: fine)").matches && innerWidth >= 768;
    if (ruhig || !maus) return;

    let aus = false;
    let aufraeumen = () => {};
    (async () => {
      const [THREE, { gsap }, { ScrollTrigger }] = await Promise.all([import("three"), import("gsap"), import("gsap/ScrollTrigger")]);
      if (aus) return;
      gsap.registerPlugin(ScrollTrigger);
      let r: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        r = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
      } catch {
        return; // kein WebGL – das normale Foto bleibt sichtbar
      }
      r.setPixelRatio(Math.min(devicePixelRatio, 2));
      const tex = await new THREE.TextureLoader().loadAsync(bild);
      if (aus) return r.dispose();
      tex.colorSpace = THREE.SRGBColorSpace;
      const u = {
        uTex: { value: tex },
        uZeit: { value: 0 },
        uMaus: { value: new THREE.Vector2(0.5, 0.5) },
        uKraft: { value: 0 },
        uTempo: { value: 0 },
        uFort: { value: 0 },
        uRes: { value: new THREE.Vector2() },
        uBild: { value: new THREE.Vector2(tex.image.width, tex.image.height) },
      };
      const szene = new THREE.Scene();
      const kamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const material = new THREE.ShaderMaterial({ uniforms: u, vertexShader: VERTEX, fragmentShader: FRAGMENT });
      const geo = new THREE.PlaneGeometry(2, 2);
      szene.add(new THREE.Mesh(geo, material));
      const groesse = () => {
        r.setSize(box.clientWidth, box.clientHeight, false);
        u.uRes.value.set(box.clientWidth, box.clientHeight);
      };
      groesse();
      cv.style.opacity = "1";

      const ziel = new THREE.Vector2(0.5, 0.5);
      let letztY = scrollY;
      const bewegen = (e: PointerEvent) => {
        const b = cv.getBoundingClientRect();
        ziel.set((e.clientX - b.left) / b.width, 1 - (e.clientY - b.top) / b.height);
        gsap.to(u.uKraft, { value: 1, duration: 0.6, overwrite: true });
      };
      const weg = () => gsap.to(u.uKraft, { value: 0, duration: 1.2, overwrite: true });
      const tick = (t: number) => {
        u.uZeit.value = t;
        u.uMaus.value.lerp(ziel, 0.08);
        // Farbversatz nach Scroll-Tempo, sanft begrenzt
        const tempo = Math.max(-1, Math.min(1, (scrollY - letztY) / 60));
        letztY = scrollY;
        u.uTempo.value += (tempo * 0.008 - u.uTempo.value) * 0.12;
        r.render(szene, kamera);
      };
      const zoom = gsap.to(u.uFort, { value: 1, ease: "none", scrollTrigger: { trigger: box, start: "top top", end: "bottom top", scrub: true } });
      box.addEventListener("pointermove", bewegen);
      box.addEventListener("pointerleave", weg);
      addEventListener("resize", groesse);
      gsap.ticker.add(tick);
      aufraeumen = () => {
        gsap.ticker.remove(tick);
        zoom.scrollTrigger?.kill();
        zoom.kill();
        box.removeEventListener("pointermove", bewegen);
        box.removeEventListener("pointerleave", weg);
        removeEventListener("resize", groesse);
        geo.dispose();
        material.dispose();
        tex.dispose();
        r.dispose();
      };
    })();
    return () => {
      aus = true;
      aufraeumen();
    };
  }, [bild]);

  return (
    <div ref={rahmen} className="absolute inset-0">
      <div aria-hidden className="absolute inset-0" style={{ background: `center / cover url(${bild})` }} />
      <canvas ref={flaeche} aria-hidden className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500" />
    </div>
  );
}
