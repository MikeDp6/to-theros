import { useEffect, useRef } from "react";

/**
 * Το cinematic intro του λογότυπου, όπως ήταν — με έναν έλεγχο
 * prefers-reduced-motion ώστε να μη ζαλίζει όποιον το έχει ζητήσει.
 */
export default function Hero() {
  const logoRef = useRef(null);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      logo.style.opacity = 1;
      logo.style.transform = "none";
      logo.style.filter = "none";
      return;
    }

    let introProgress = 0;
    let introDone = false;
    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const render = (easedIntro = introProgress) => {
      const scrollProgress = Math.min(window.scrollY / 400, 1);

      const scaleIntro = 0.6 + easedIntro * 0.4;
      const scaleScroll = 1 - scrollProgress * 0.35;

      const scale = introDone ? scaleScroll : scaleIntro;
      const opacity = introDone ? 1 - scrollProgress * 0.4 : easedIntro;
      const blur = introDone ? scrollProgress * 3 : (1 - easedIntro) * 1.5;
      const translateY = introDone ? scrollProgress * 20 : (1 - easedIntro) * 30;

      logo.style.transform = `perspective(1000px) scale(${scale}) translateY(${translateY}px)`;
      logo.style.opacity = opacity;
      logo.style.filter = `blur(${blur}px)`;

      logo.classList.toggle("sweep", easedIntro > 0.4 && easedIntro < 0.9);
    };

    const animate = (time) => {
      introProgress = Math.min((time - start) / 1600, 1);
      render(easeOut(introProgress));
      if (introProgress < 1) requestAnimationFrame(animate);
      else introDone = true;
    };

    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        render();
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    requestAnimationFrame(animate);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero">
      <div className="hero-logo-wrapper">
        <img
          ref={logoRef}
          src="/logo.png"
          className="hero-logo"
          alt="Το Θέρος"
          width="650"
          height="650"
          fetchPriority="high"
        />
      </div>
    </section>
  );
}
