import { useEffect, useMemo, useRef, useState } from "react";

const LOOP_MULTIPLIER = 5;
const BASE_SPEED = 0.9;
const RESUME_DELAY_MS = 1100;

/**
 * Το cinematic carousel, ίδιο με πριν — αλλά τα δεδομένα έρχονται πλέον
 * ως prop από το Astro (serialized), όχι από import ενός data αρχείου.
 *
 * @param {{ items: Array<{href:string,title:string,excerpt:string,image:string,kicker:string}> }} props
 */
export default function Carousel({ items = [], heading = "Επιλογές", allHref = "/arxeio/", allLabel = "Δες όλα τα άρθρα" }) {
  const validItems = useMemo(
    () => items.filter((i) => i && i.href && i.title),
    [items]
  );

  const repeated = useMemo(
    () =>
      Array.from({ length: LOOP_MULTIPLIER }, (_, copy) =>
        validItems.map((item, i) => ({ ...item, renderKey: `${i}-${copy}`, index: i }))
      ).flat(),
    [validItems]
  );

  const shellRef = useRef(null);
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const setWidthRef = useRef(0);
  const slideWidthRef = useRef(0);
  const centerOffsetRef = useRef(0);
  const baseOffsetRef = useRef(0);
  const arrowOffsetRef = useRef(0);
  const arrowTargetRef = useRef(0);
  const stepWidthRef = useRef(0);
  const hoveredRef = useRef(false);
  const resumeAtRef = useRef(0);
  const focusedRenderKeyRef = useRef(null);
  const dragActiveRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragOffsetRef = useRef(0);

  const [hoveredKey, setHoveredKey] = useState(null);
  const [focusedRenderKey, setFocusedRenderKey] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    if (!validItems.length) return undefined;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const measure = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;
      if (!viewport || !track) return;

      const slides = track.querySelectorAll(".cinematic-slide");
      const firstSet = Array.from(slides).slice(0, validItems.length);
      if (!firstSet.length) return;

      const firstRect = firstSet[0].getBoundingClientRect();
      const lastRect = firstSet[firstSet.length - 1].getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      const gap =
        firstSet.length > 1
          ? firstSet[1].getBoundingClientRect().left - firstRect.right
          : 0;

      const setWidth = lastRect.right - firstRect.left;
      const stepWidth = firstRect.width + gap;
      const centerOffset = setWidth * Math.floor(LOOP_MULTIPLIER / 2);
      const correction = viewportRect.width / 2 - stepWidth * 3 + gap / 2;

      setWidthRef.current = setWidth;
      stepWidthRef.current = stepWidth;
      slideWidthRef.current = firstRect.width;
      centerOffsetRef.current = centerOffset - correction;
      baseOffsetRef.current = 0;
      arrowOffsetRef.current = 0;
      arrowTargetRef.current = 0;
      dragOffsetRef.current = 0;
    };

    const render = () => {
      const track = trackRef.current;
      if (!track) return;

      const totalOffset =
        centerOffsetRef.current +
        baseOffsetRef.current +
        arrowOffsetRef.current +
        dragOffsetRef.current;

      track.style.transform = `translate3d(${-totalOffset}px, 0, 0)`;

      const viewport = viewportRef.current;
      const stepWidth = stepWidthRef.current;
      const slideWidth = slideWidthRef.current;
      if (!viewport || !stepWidth || !slideWidth) return;

      const viewportCenter = viewport.clientWidth / 2;
      let nearestSlide = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      Array.from(track.children).forEach((slide, index) => {
        const slideCenter = index * stepWidth + slideWidth / 2 - totalOffset;
        const distance = Math.abs(slideCenter - viewportCenter) / stepWidth;
        const limited = Math.min(distance, 2.5);

        slide.style.setProperty("--cinematic-opacity", `${Math.max(0.28, 1 - limited * 0.3)}`);
        slide.style.setProperty("--cinematic-blur", `${Math.max(0, limited * 1.1)}px`);
        slide.style.setProperty("--cinematic-scale", `${Math.max(0.82, 1.03 - limited * 0.08)}`);
        slide.style.setProperty("--cinematic-brightness", `${Math.max(0.76, 1 - limited * 0.12)}`);
        slide.style.setProperty("--cinematic-saturate", `${Math.max(0.8, 1 - limited * 0.08)}`);
        slide.style.setProperty("--cinematic-translate-y", `${limited < 0.35 ? -14 : 8 - limited * 4}px`);
        slide.style.zIndex = `${Math.max(1, 40 - Math.round(limited * 10))}`;

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestSlide = slide;
        }
      });

      if (nearestSlide) {
        const key = nearestSlide.dataset.renderKey;
        if (focusedRenderKeyRef.current !== key) {
          focusedRenderKeyRef.current = key;
          setFocusedRenderKey(key);
          setFocusedIndex(Number(nearestSlide.dataset.index) || 0);
        }
      }
    };

    const animate = (time) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min(32, time - lastTimeRef.current);
      lastTimeRef.current = time;
      const factor = delta / 16.6667;

      if (!reduced && !hoveredRef.current && !dragActiveRef.current && time >= resumeAtRef.current) {
        baseOffsetRef.current += BASE_SPEED * factor;
      }

      const setWidth = setWidthRef.current;
      if (setWidth > 0) {
        while (baseOffsetRef.current >= setWidth) baseOffsetRef.current -= setWidth;
        while (baseOffsetRef.current < 0) baseOffsetRef.current += setWidth;
        while (arrowTargetRef.current >= setWidth) {
          arrowTargetRef.current -= setWidth;
          arrowOffsetRef.current -= setWidth;
        }
        while (arrowTargetRef.current <= -setWidth) {
          arrowTargetRef.current += setWidth;
          arrowOffsetRef.current += setWidth;
        }
      }

      const diff = arrowTargetRef.current - arrowOffsetRef.current;
      if (Math.abs(diff) > 0.08) arrowOffsetRef.current += diff * 0.18 * factor;
      else arrowOffsetRef.current = arrowTargetRef.current;

      render();
      frameRef.current = requestAnimationFrame(animate);
    };

    measure();
    render();
    frameRef.current = requestAnimationFrame(animate);

    const resizeObserver = new ResizeObserver(() => {
      measure();
      render();
    });
    if (shellRef.current) resizeObserver.observe(shellRef.current);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = 0;
    };
  }, [validItems.length]);

  const pauseMotion = (key) => {
    hoveredRef.current = true;
    setHoveredKey(key);
  };

  const resumeMotion = () => {
    hoveredRef.current = false;
    setHoveredKey(null);
    resumeAtRef.current = performance.now() + RESUME_DELAY_MS;
  };

  const handleArrowClick = (direction) => {
    const stepWidth = stepWidthRef.current;
    if (!stepWidth) return;
    arrowTargetRef.current += (direction === "prev" ? -1 : 1) * stepWidth * 2;
    resumeAtRef.current = performance.now() + 1450;
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== "touch") return;
    dragActiveRef.current = true;
    dragStartXRef.current = event.clientX;
    dragOffsetRef.current = 0;
    hoveredRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragActiveRef.current) return;
    dragOffsetRef.current = -(event.clientX - dragStartXRef.current);
  };

  const handlePointerEnd = (event) => {
    if (!dragActiveRef.current) return;
    const dragDistance = dragOffsetRef.current;
    const stepWidth = stepWidthRef.current;
    dragActiveRef.current = false;
    dragOffsetRef.current = 0;
    hoveredRef.current = false;

    if (stepWidth && Math.abs(dragDistance) > stepWidth * 0.18) {
      arrowTargetRef.current += Math.round(dragDistance / stepWidth) * stepWidth;
    }
    resumeAtRef.current = performance.now() + RESUME_DELAY_MS;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  if (!validItems.length) return null;

  const progressPercent =
    validItems.length > 1 ? (focusedIndex / (validItems.length - 1)) * 100 : 0;
  const focusedItem = validItems[focusedIndex] ?? validItems[0];

  return (
    <section className="carousel visible">
      <div className="container">
        <h2>{heading}</h2>

        <div className="carousel-shell" ref={shellRef}>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-prev"
            aria-label="Προηγούμενη κάρτα"
            onClick={() => handleArrowClick("prev")}
          >
            ←
          </button>

          <div className="carousel-viewport" ref={viewportRef}>
            <div
              className="carousel-track"
              ref={trackRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
            >
              {repeated.map((item) => (
                <div
                  key={item.renderKey}
                  data-render-key={item.renderKey}
                  data-index={item.index}
                  className={
                    "cinematic-slide" +
                    (hoveredKey === item.renderKey ? " is-hovered" : "") +
                    (focusedRenderKey === item.renderKey ? " is-focused" : "")
                  }
                  onMouseEnter={() => pauseMotion(item.renderKey)}
                  onMouseLeave={resumeMotion}
                >
                  <CarouselCard item={item} />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="carousel-arrow carousel-arrow-next"
            aria-label="Επόμενη κάρτα"
            onClick={() => handleArrowClick("next")}
          >
            →
          </button>
        </div>

        <div className="carousel-status">
          <div className="carousel-progress" aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="carousel-caption">
            <span className="carousel-caption-label">Κεντρική πρόταση</span>
            <span className="carousel-caption-title">{focusedItem?.title}</span>
          </div>
        </div>

        <a href={allHref} className="see-all">{allLabel}</a>
      </div>
    </section>
  );
}

function CarouselCard({ item }) {
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    card.style.setProperty("--rotateX", `${((y - cy) / cy) * 6}deg`);
    card.style.setProperty("--rotateY", `${((x - cx) / cx) * -6}deg`);
    card.style.setProperty("--magneticX", `${((x - cx) / cx) * 8}px`);
    card.style.setProperty("--magneticY", `${((y - cy) / cy) * 6}px`);
    card.style.setProperty("--mouseX", `${x}px`);
    card.style.setProperty("--mouseY", `${y}px`);
  };

  const reset = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--rotateX", "0deg");
    card.style.setProperty("--rotateY", "0deg");
    card.style.setProperty("--magneticX", "0px");
    card.style.setProperty("--magneticY", "0px");
  };

  return (
    <a
      href={item.href}
      className="card cinematic-card"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
    >
      <div className="image-wrapper">
        {item.image ? (
          <img src={item.image} alt={item.alt || ""} className="parallax-img" loading="lazy" decoding="async" />
        ) : null}
      </div>
      <div className="card-copy">
        <span className="card-kicker">{item.kicker}</span>
        <h3>{item.title}</h3>
        <p>{item.excerpt}</p>
      </div>
    </a>
  );
}
