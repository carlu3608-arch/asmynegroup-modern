// Scroll + entrance motion, following the Sun Resorts motion.js approach:
// Lenis smooth scroll, GSAP ScrollTrigger, split-text, fades, clip reveals,
// parallax, counters, and card tilt. Scoped to the Asmyne homepage.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { hasWebGL } from "./glutil";
import type { AtmosphereApi } from "./atmosphere";

gsap.registerPlugin(ScrollTrigger);

const $ = (s: string, c: ParentNode = document) => c.querySelector(s) as HTMLElement | null;
const $$ = (s: string, c: ParentNode = document) => [...c.querySelectorAll(s)] as HTMLElement[];

function splitWords(el: HTMLElement) {
  const walk = (node: Node, out: HTMLElement) => {
    node.childNodes.forEach((n) => {
      if (n.nodeType === 3) {
        (n.textContent || "").split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) out.appendChild(document.createTextNode(" "));
          else {
            const s = document.createElement("span");
            s.className = "split-word";
            s.textContent = p;
            out.appendChild(s);
          }
        });
      } else if (n.nodeName === "BR") out.appendChild(document.createElement("br"));
      else {
        const c = n.cloneNode(false) as HTMLElement;
        walk(n, c);
        out.appendChild(c);
      }
    });
  };
  const frag = document.createElement("div");
  walk(el, frag);
  el.innerHTML = frag.innerHTML;
  $$(".split-word", el).forEach((w) => {
    const m = document.createElement("span");
    m.className = "split-line";
    m.style.display = "inline-block";
    m.style.verticalAlign = "top";
    w.parentNode?.insertBefore(m, w);
    m.appendChild(w);
  });
  el.classList.add("split-done");
  return $$(".split-word", el);
}

export type MotionHandle = {
  destroy: () => void;
  playHero: (delay?: number) => void;
  attachAtmosphere: (api: AtmosphereApi) => void;
};

export function initAsmyneMotion(): MotionHandle {
  const root = document.documentElement;
  root.classList.add("js");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) root.classList.add("motion");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const glOK = !reduce && hasWebGL();
  if (!glOK) root.classList.add("no-gl");

  let lenis: Lenis | null = null;
  if (!reduce) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis?.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const header = $("[data-header]");
  let lastY = 0;
  const onScroll = (y: number) => {
    if (!header) return;
    header.classList.toggle("is-solid", y > 60);
    if (!document.body.classList.contains("menu-open")) header.classList.toggle("is-hidden", y > 400 && y > lastY + 2);
    if (y < lastY - 2) header.classList.remove("is-hidden");
    lastY = y;
  };
  const onLenisScroll = ({ scroll }: { scroll: number }) => onScroll(scroll);
  if (lenis) lenis.on("scroll", onLenisScroll);
  else addEventListener("scroll", () => onScroll(scrollY), { passive: true });
  onScroll(scrollY);

  const progress = $(".progress");
  if (progress) {
    gsap.to(progress, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
  }

  const heroWords: HTMLElement[] = [];
  $$("[data-split]").forEach((el) => {
    const words = splitWords(el);
    if (el.closest("[data-home-hero]")) {
      heroWords.push(...words);
      return;
    }
    if (!reduce) {
      gsap.from(words, {
        yPercent: 115,
        rotate: 4,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.035,
        scrollTrigger: { trigger: el, start: "top 88%" },
      });
    }
  });

  const heroFades = $$("[data-home-hero] [data-fade]");
  const heroTl = gsap.timeline({ paused: true });
  if (!reduce && heroWords.length) {
    heroTl.from(heroWords, { yPercent: 115, rotate: 5, duration: 1.3, ease: "expo.out", stagger: 0.05 });
  }
  if (!reduce) {
    heroTl.to(heroFades, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1 }, heroWords.length ? "-=0.9" : 0.2);
  } else {
    heroFades.forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }

  if (!reduce) {
    $$("[data-fade]")
      .filter((el) => !heroFades.includes(el))
      .forEach((el) => {
        gsap.to(el, { opacity: 1, y: 0, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
      });
    $$("[data-stagger]").forEach((g) => {
      gsap.to(g.children, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08, scrollTrigger: { trigger: g, start: "top 85%" } });
    });
    $$("[data-reveal]").forEach((el) => {
      gsap.to(el, { clipPath: "inset(0% 0 0 0)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: el, start: "top 85%" } });
    });
    $$("[data-parallax]").forEach((img) => {
      const parent = img.parentElement;
      if (!parent) return;
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: parent, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$("[data-count]").forEach((el) => {
      const raw = el.dataset.count || el.textContent || "0";
      const suffix = raw.replace(/^[\d.,]+/, "");
      const num = parseFloat(raw.replace(/[^\d.]/g, "")) || 0;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: num,
        duration: 2,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: () => {
          const isInt = Number.isInteger(num);
          el.textContent = (isInt ? Math.round(obj.v) : obj.v.toFixed(1)) + suffix;
        },
      });
    });
    if (finePointer) {
      $$("[data-tilt]").forEach((c) => {
        c.addEventListener("mousemove", (e) => {
          const ev = e as MouseEvent;
          const r = c.getBoundingClientRect();
          const px = (ev.clientX - r.left) / r.width - 0.5;
          const py = (ev.clientY - r.top) / r.height - 0.5;
          gsap.to(c, { rotateY: px * 8, rotateX: -py * 8, transformPerspective: 900, duration: 0.6, ease: "power3.out" });
        });
        c.addEventListener("mouseleave", () => gsap.to(c, { rotateX: 0, rotateY: 0, duration: 0.9, ease: "elastic.out(1,0.5)" }));
      });
    }
  }

  let fxCleanup: (() => void) | undefined;
  if (glOK && finePointer && innerWidth > 900) {
    import("./fx")
      .then((m) => {
        fxCleanup = m.initFx();
      })
      .catch((e) => console.warn(e));
  }

  let atmosphere: AtmosphereApi | null = null;
  const attachAtmosphere = (api: AtmosphereApi) => {
    atmosphere = api;
    if (!reduce) {
      gsap.fromTo(api.state, { rise: 0 }, { rise: 1, duration: 2.8, ease: "power2.inOut" });
    } else {
      api.state.rise = 1;
    }
  };

  const playHero = (delay = 0.15) => {
    if (reduce) {
      heroWords.forEach((w) => {
        w.style.transform = "none";
      });
      heroTl.progress(1);
      return;
    }
    gsap.delayedCall(delay, () => heroTl.play());
  };

  // If the user prefers motion, still play even without waiting for first GL frame.
  if (reduce) playHero(0);

  const destroy = () => {
    fxCleanup?.();
    atmosphere?.destroy();
    if (lenis) {
      lenis.off("scroll", onLenisScroll);
      gsap.ticker.remove((t) => lenis?.raf(t * 1000));
      lenis.destroy();
    }
    ScrollTrigger.getAll().forEach((t) => t.kill());
    heroTl.kill();
    root.classList.remove("has-cursor", "gl-ocean", "motion");
  };

  return { destroy, playHero, attachAtmosphere };
}
