import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import posts from "../data/posts";
import PostCard from "./PostCard";
import { Link } from "react-router-dom";

const LOOP_MULTIPLIER = 5;
const BASE_SPEED = 0.9;
const RESUME_DELAY_MS = 1100;

function Carousel() {
  const validPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          typeof post?.image === "string" &&
          post.image.trim() &&
          typeof post?.title === "string" &&
          post.title.trim() &&
          typeof post?.content === "string" &&
          post.content.trim()
      ),
    []
  );

  const repeatedPosts = useMemo(
    () =>
      Array.from({ length: LOOP_MULTIPLIER }, (_, copyIndex) =>
        validPosts.map((post) => ({
          ...post,
          renderKey: `${post.id}-${copyIndex}`
        }))
      ).flat(),
    [validPosts]
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
  const [hoveredId, setHoveredId] = useState(null);
  const [focusedRenderKey, setFocusedRenderKey] = useState(null);
  const [focusedPostId, setFocusedPostId] = useState(validPosts[0]?.id ?? null);

  useEffect(() => {
    const el = document.querySelector(".carousel");
    if (el) {
      el.classList.add("visible");
    }
  }, []);

  useEffect(() => {
    if (!validPosts.length) {
      return undefined;
    }

    const measure = () => {
      const viewport = viewportRef.current;
      const track = trackRef.current;

      if (!viewport || !track) {
        return;
      }

      const slides = track.querySelectorAll(".cinematic-slide");
      const firstSet = Array.from(slides).slice(0, validPosts.length);

      if (!firstSet.length) {
        return;
      }

      const firstRect = firstSet[0].getBoundingClientRect();
      const lastRect = firstSet[firstSet.length - 1].getBoundingClientRect();
      const viewportRect = viewport.getBoundingClientRect();
      const gap = firstSet.length > 1
        ? firstSet[1].getBoundingClientRect().left - firstRect.right
        : 0;

      const setWidth = lastRect.right - firstRect.left;
      const stepWidth = firstRect.width + gap;
      const slideWidth = firstRect.width;
      const centerOffset = setWidth * Math.floor(LOOP_MULTIPLIER / 2);
      const visibleCenterCorrection = viewportRect.width / 2 - stepWidth * 3 + gap / 2;

      setWidthRef.current = setWidth;
      stepWidthRef.current = stepWidth;
      slideWidthRef.current = slideWidth;
      centerOffsetRef.current = centerOffset - visibleCenterCorrection;
      baseOffsetRef.current = 0;
      arrowOffsetRef.current = 0;
      arrowTargetRef.current = 0;
      dragOffsetRef.current = 0;
    };

    const render = () => {
      const track = trackRef.current;
      if (!track) {
        return;
      }

      const totalOffset =
        centerOffsetRef.current +
        baseOffsetRef.current +
        arrowOffsetRef.current +
        dragOffsetRef.current;

      track.style.transform = `translate3d(${-totalOffset}px, 0, 0)`;

      const viewport = viewportRef.current;
      const stepWidth = stepWidthRef.current;
      const slideWidth = slideWidthRef.current;
      if (!viewport || !stepWidth || !slideWidth) {
        return;
      }

      const viewportCenter = viewport.clientWidth / 2;
      const slides = track.children;
      let nearestSlide = null;
      let nearestDistance = Number.POSITIVE_INFINITY;

      Array.from(slides).forEach((slide, index) => {
        const slideCenter = index * stepWidth + slideWidth / 2 - totalOffset;
        const distance = Math.abs(slideCenter - viewportCenter) / stepWidth;
        const limited = Math.min(distance, 2.5);

        const opacity = 1 - limited * 0.3;
        const blur = limited * 1.1;
        const scale = 1.03 - limited * 0.08;
        const brightness = 1 - limited * 0.12;
        const saturate = 1 - limited * 0.08;
        const translateY = limited < 0.35 ? -14 : 8 - limited * 4;

        slide.style.setProperty("--cinematic-opacity", `${Math.max(0.28, opacity)}`);
        slide.style.setProperty("--cinematic-blur", `${Math.max(0, blur)}px`);
        slide.style.setProperty("--cinematic-scale", `${Math.max(0.82, scale)}`);
        slide.style.setProperty("--cinematic-brightness", `${Math.max(0.76, brightness)}`);
        slide.style.setProperty("--cinematic-saturate", `${Math.max(0.8, saturate)}`);
        slide.style.setProperty("--cinematic-translate-y", `${translateY}px`);
        slide.style.zIndex = `${Math.max(1, 40 - Math.round(limited * 10))}`;

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestSlide = slide;
        }
      });

      if (nearestSlide) {
        const nextRenderKey = nearestSlide.dataset.renderKey;
        const nextPostId = Number(nearestSlide.dataset.postId);

        if (focusedRenderKeyRef.current !== nextRenderKey) {
          focusedRenderKeyRef.current = nextRenderKey;
          setFocusedRenderKey(nextRenderKey);
          setFocusedPostId(Number.isNaN(nextPostId) ? null : nextPostId);
        }
      }
    };

    const animate = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const delta = Math.min(32, time - lastTimeRef.current);
      lastTimeRef.current = time;
      const factor = delta / 16.6667;

      if (!hoveredRef.current && !dragActiveRef.current && time >= resumeAtRef.current) {
        baseOffsetRef.current += BASE_SPEED * factor;
      }

      const setWidth = setWidthRef.current;
      if (setWidth > 0) {
        while (baseOffsetRef.current >= setWidth) {
          baseOffsetRef.current -= setWidth;
        }

        while (baseOffsetRef.current < 0) {
          baseOffsetRef.current += setWidth;
        }

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
      if (Math.abs(diff) > 0.08) {
        arrowOffsetRef.current += diff * 0.18 * factor;
      } else {
        arrowOffsetRef.current = arrowTargetRef.current;
      }

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

    if (shellRef.current) {
      resizeObserver.observe(shellRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = 0;
    };
  }, [validPosts.length]);

  const pauseMotion = (id = null) => {
    hoveredRef.current = true;
    setHoveredId(id);
  };

  const resumeMotion = () => {
    hoveredRef.current = false;
    setHoveredId(null);
    resumeAtRef.current = performance.now() + RESUME_DELAY_MS;
  };

  const handleArrowClick = (direction) => {
    const stepWidth = stepWidthRef.current;
    if (!stepWidth) {
      return;
    }

    const delta = direction === "prev" ? -stepWidth * 2 : stepWidth * 2;
    arrowTargetRef.current += delta;
    resumeAtRef.current = performance.now() + 1450;
  };

  const handlePointerDown = (event) => {
    if (event.pointerType !== "touch") {
      return;
    }

    dragActiveRef.current = true;
    dragStartXRef.current = event.clientX;
    dragOffsetRef.current = 0;
    hoveredRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragActiveRef.current) {
      return;
    }

    dragOffsetRef.current = -(event.clientX - dragStartXRef.current);
  };

  const handlePointerEnd = (event) => {
    if (!dragActiveRef.current) {
      return;
    }

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

  const focusedIndex = focusedPostId
    ? validPosts.findIndex((post) => post.id === focusedPostId)
    : -1;
  const progressPercent =
    focusedIndex >= 0 && validPosts.length > 1
      ? (focusedIndex / (validPosts.length - 1)) * 100
      : 0;
  const focusedPost = focusedIndex >= 0 ? validPosts[focusedIndex] : validPosts[0];
const navigate = useNavigate();
  return (
    <section className="carousel reveal" id="poetry">
      <div className="container">
        <h2>Ποίηση</h2>

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
              {repeatedPosts.map((post) => (
                <div
                  key={post.renderKey}
                  data-render-key={post.renderKey}
                  data-post-id={post.id}
                  className={`cinematic-slide${
                    hoveredId === post.renderKey ? " is-hovered" : ""
                  }${
                    focusedRenderKey === post.renderKey ? " is-focused" : ""
                  }`}
                  onMouseEnter={() => pauseMotion(post.renderKey)}
                  onMouseLeave={resumeMotion}
                >
                  <PostCard
                    post={post}
                    isFocused={focusedRenderKey === post.renderKey}
                  />
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
            <span className="carousel-caption-title">
              {focusedPost?.title ?? "Ποίηση"}
            </span>
          </div>
        </div>

   <Link to="/poetry" className="see-all">
  Δες όλα τα άρθρα
</Link>
      </div>
    </section>
  );
}

export default Carousel;
