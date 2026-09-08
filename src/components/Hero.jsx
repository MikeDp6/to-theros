import { useEffect, useRef } from "react";

function Hero() {
  const logoRef = useRef(null);

  useEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    let introProgress = 0;
    let introDone = false;

    const start = performance.now();

    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (time) => {
      const elapsed = time - start;
      const duration = 1600; // πιο cinematic

      introProgress = Math.min(elapsed / duration, 1);
      const eased = easeOut(introProgress);

      render(eased);

      if (introProgress < 1) {
        requestAnimationFrame(animate);
      } else {
        introDone = true;
      }
    };

    const render = (easedIntro = introProgress) => {
      const scrollY = window.scrollY;
      const maxScroll = 400;
      const scrollProgress = Math.min(scrollY / maxScroll, 1);

      // 🎬 ΠΟΛΥ ΜΙΚΡΟ → ΜΕΓΑΛΟ
      const scaleIntro = 0.6 + easedIntro * 0.4;

      // glow δυναμώνει
      const glow = easedIntro * 1;

      // light sweep ενεργοποιείται στο mid animation
      const sweepOpacity = easedIntro > 0.4 && easedIntro < 0.9 ? 1 : 0;

      // scroll behavior
      const scaleScroll = 1 - scrollProgress * 0.35;
      const opacityScroll = 1 - scrollProgress * 0.4;
      const blurScroll = scrollProgress * 3;

      const scale = introDone ? scaleScroll : scaleIntro;
      const opacity = introDone ? opacityScroll : easedIntro;
      const blur = introDone ? blurScroll : (1 - easedIntro) * 1.5;

      const translateY = introDone
        ? scrollProgress * 20
        : (1 - easedIntro) * 30;

      logo.style.transform = `
        perspective(1000px)
        scale(${scale})
        translateY(${translateY}px)
      `;

      logo.style.opacity = opacity;
      logo.style.filter = `blur(${blur}px)`;

    

      // 🔥 LIGHT SWEEP trigger class
      if (sweepOpacity) {
        logo.classList.add("sweep");
      } else {
        logo.classList.remove("sweep");
      }
    };

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          render();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    requestAnimationFrame(animate);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="hero">
      <div className="hero-logo-wrapper">
        <img ref={logoRef} src="/logo.png" className="hero-logo" />
      </div>
    </section>
  );
}

export default Hero;