import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import useReveal from "./hooks/useReveal";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Carousel from "./components/Carousel";
import Article from "./pages/Article";
import PoetryPage from "./pages/PoetryPage";
import HistoryFeature from "./components/HistoryFeature";
import history from "./data/history";

function App() {
  const location = useLocation();

  // 🔥 reveal animations
  useReveal();

  // 🔥 LENIS
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.45,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smooth: true,
      smoothTouch: true,
      touchMultiplier: 0.9,
      wheelMultiplier: 0.92,
    });

    let frameId = 0;

    function raf(time) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  // 🔥 scroll top σε route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // 🎬 background + navbar effects
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // background parallax
          const offset = scrollY * 0.08;
          document.body.style.backgroundPosition = `center calc(50% + ${offset}px)`;

          // color shift
          const intensity = Math.min(scrollY / 1000, 1);

          document.body.style.setProperty(
            "--bg-overlay",
            `linear-gradient(
              rgba(255,255,255,${0.1 - intensity * 0.05}),
              rgba(200,220,255,${0.2 + intensity * 0.1})
            )`
          );

          // navbar blur
          const nav = document.querySelector(".navbar");
          if (nav) {
            if (scrollY > 50) {
              nav.classList.add("scrolled");
            } else {
              nav.classList.remove("scrolled");
            }
          }

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Carousel />
              <HistoryFeature posts={history} />
            </>
          }
        />

        <Route path="/poetry" element={<PoetryPage />} />
        <Route path="/post/:id" element={<Article />} />
      </Routes>
    </>
  );
}

export default App;
