"use client";

import { useEffect, useRef } from "react";

interface TypewriterProps {
  text: string;
  /** Milliseconds between characters. */
  speed?: number;
  /** Milliseconds before the first character. */
  delay?: number;
  className?: string;
}

/**
 * Types its text once, on mount, and stops. The full string is in the document
 * at first paint, so the heading is never empty: search engines, assistive tech
 * and a browser without JavaScript all get it. Only the visible copy is
 * emptied and typed back in, and the caret fades out when the line is done.
 *
 * `prefers-reduced-motion` keeps the finished line and hides the caret.
 */
export function Typewriter({
  text,
  speed = 45,
  delay = 0,
  className,
}: TypewriterProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const node = textRef.current;
    if (!container || !node) return;

    // Bind to locals so the timer callback below keeps the narrowed types.
    const containerEl: HTMLSpanElement = container;
    const textEl: HTMLSpanElement = node;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      textEl.style.opacity = "1";
      return;
    }

    // Clear only the visible copy. The sr-only copy below holds the full string
    // for screen readers, and the CSS keeps the visible copy hidden until this
    // effect runs.
    textEl.textContent = "";
    textEl.style.opacity = "1";

    let index = 0;
    let timer = window.setTimeout(step, delay);

    function step() {
      // The caret appears with the first character, not while this line waits
      // its turn behind the one above it.
      if (index === 0) containerEl.dataset.typing = "true";
      index += 1;
      textEl.textContent = text.slice(0, index);
      if (index < text.length) {
        timer = window.setTimeout(step, speed);
      } else {
        containerEl.dataset.typing = "false";
      }
    }

    return () => {
      window.clearTimeout(timer);
      containerEl.dataset.typing = "false";
    };
  }, [delay, speed, text]);

  return (
    <span
      ref={containerRef}
      className={className ? `typewriter ${className}` : "typewriter"}
    >
      <span ref={textRef} className="typewriter-text" aria-hidden="true">
        {text}
      </span>
      <span className="typewriter-caret" aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </span>
  );
}
