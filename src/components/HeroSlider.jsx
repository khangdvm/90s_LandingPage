import { useContent } from "./ManagedContent.jsx";
import SafeImage from "./SafeImage.jsx";
import { useEffect, useRef, useState } from "react";
import { assetUrl, contentTarget, externalUrl } from "../data/data.js";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    update();
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

import PublicState from "./PublicState.jsx";

export default function HeroSlider({ resource, onConsult, reducedMotion }) {
  const content = useContent();
  const slides = resource.data || [];
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);
  const [interaction, setInteraction] = useState(0);
  const [status, setStatus] = useState("");
  const touch = useRef(null);
  const count = slides.length;

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (count < 2 || paused || hovering || focused || reducedMotion || !visible)
      return;
    const timer = window.setTimeout(
      () => setCurrent((value) => (value + 1) % count),
      6000,
    );
    return () => window.clearTimeout(timer);
  }, [
    current,
    count,
    paused,
    hovering,
    focused,
    reducedMotion,
    visible,
    interaction,
  ]);

  function change(index) {
    const next = (index + count) % count;
    setCurrent(next);
    setInteraction((value) => value + 1);
    setStatus(`Slide ${next + 1} / ${count}: ${slides[next].eyebrow}`);
  }
  useEffect(() => {
    setCurrent((value) => (count ? Math.min(value, count - 1) : 0));
  }, [count]);
  if (!count)
    return (
      <section className="hero" aria-label="Giới thiệu và chiến dịch">
        <PublicState
          resource={resource}
          label="giới thiệu"
          empty={!resource.loading && !resource.error}
        />
      </section>
    );
  const stopped = paused || reducedMotion;
  return (
    <section
      className="hero"
      aria-label="Giới thiệu và chiến dịch"
      aria-roledescription="carousel"
      tabIndex="0"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          change(current + (event.key === "ArrowLeft" ? -1 : 1));
        }
      }}
      onTouchStart={(event) => {
        touch.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }}
      onTouchEnd={(event) => {
        if (touch.current) {
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy))
            change(current + (dx < 0 ? 1 : -1));
          touch.current = null;
        }
      }}
    >
      <div id="hero-slides">
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={`hero-slide ${current === index ? "active" : ""}`}
            inert={current !== index}
            aria-hidden={current !== index}
            aria-roledescription="slide"
            aria-label={`${index + 1} / ${count}`}
          >
            {assetUrl(slide.image) && (
              <SafeImage
                src={assetUrl(slide.image)}
                alt={slide.eyebrow || slide.title}
                fetchPriority={index === 0 ? "high" : "auto"}
                loading={index === 0 ? "eager" : "lazy"}
              />
            )}
            <div className="hero-content">
              <p className="eyebrow">{slide.eyebrow}</p>
              {slide.badge && (
                <span className="promotion-badge">{slide.badge}</span>
              )}
              <h2 className="hero-title">{slide.title}</h2>
              <p className="hero-sub">{slide.description}</p>
              {slide.ctaText &&
                !(
                  slide.ctaTarget.startsWith("#") &&
                  content[slide.ctaTarget.slice(1) + "Enabled"] === "false"
                ) && (
                  <a
                    className="button ghost"
                    href={contentTarget(slide.ctaTarget) || "#lien-he"}
                    target={externalUrl(slide.ctaTarget) ? "_blank" : undefined}
                    rel={
                      externalUrl(slide.ctaTarget)
                        ? "noopener noreferrer"
                        : undefined
                    }
                    onClick={(event) => {
                      if (
                        !contentTarget(slide.ctaTarget) ||
                        slide.ctaTarget === "#lien-he"
                      ) {
                        event.preventDefault();
                        onConsult();
                      }
                    }}
                  >
                    {slide.ctaText}
                  </a>
                )}
            </div>
          </article>
        ))}
      </div>
      <div className="hero-controls">
        <button
          id="hero-prev"
          aria-label="Slide trước"
          disabled={count < 2}
          onClick={() => change(current - 1)}
        >
          ‹
        </button>
        <div id="hero-dots" role="group" aria-label="Chọn slide">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              data-slide={index}
              aria-label={`Xem slide ${index + 1}: ${slide.eyebrow}`}
              aria-pressed={index === current}
              onClick={() => change(index)}
            />
          ))}
        </div>
        <button
          id="hero-next"
          aria-label="Slide tiếp theo"
          disabled={count < 2}
          onClick={() => change(current + 1)}
        >
          ›
        </button>
        <button
          id="hero-pause"
          disabled={reducedMotion || count < 2}
          aria-label={stopped ? "Bật trình chiếu" : "Tạm dừng trình chiếu"}
          aria-pressed={stopped}
          onClick={() => setPaused((value) => !value)}
        >
          {stopped ? "▶" : "Ⅱ"}
        </button>
      </div>
      <p id="hero-status" className="sr-only" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
