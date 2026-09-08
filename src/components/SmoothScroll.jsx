import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

/**
 * Το smooth scroll και τα scroll-driven εφέ του παλιού App.jsx,
 * μεταφερμένα σε ένα island που φορτώνει με client:idle.
 * Δεν βγάζει markup — μόνο συμπεριφορά.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let lenis = null;
    let frameId = 0;

    if (!reduced) {
      lenis = new Lenis({
        duration: 1.45,
        easing: (t) => 1 - Math.pow(1 - t, 4),
        smoothTouch: true,
        touchMultiplier: 0.9,
        wheelMultiplier: 0.92,
      });

      const raf = (time) => {
        lenis.raf(time);
        frameId = requestAnimationFrame(raf);
      };
      frameId = requestAnimationFrame(raf);
    }

    // ---- background parallax + navbar blur ----
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const scrollY = window.scrollY;

        if (!reduced) {
          document.body.style.backgroundPosition = `center calc(50% + ${scrollY * 0.08}px)`;
        }

        const intensity = Math.min(scrollY / 1000, 1);
        document.body.style.setProperty(
          "--bg-overlay",
          `linear-gradient(rgba(255,255,255,${0.1 - intensity * 0.05}), rgba(200,220,255,${0.2 + intensity * 0.1}))`
        );

        document.querySelector(".navbar")?.classList.toggle("scrolled", scrollY > 50);

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // ---- reveal on scroll ----
    const revealables = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealables.forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
      if (frameId) cancelAnimationFrame(frameId);
      lenis?.destroy();
    };
  }, []);

  return null;
}
