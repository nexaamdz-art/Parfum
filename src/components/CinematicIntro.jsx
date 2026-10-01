import { useCallback, useRef, useState } from "react";
import {
  VIDEO_PATH,
  BRAND_NAME,
  SUBTITLE,
  TAGLINE,
  BOTTLE_TILT
} from "../config.js";

import { useScrollScrub } from "../hooks/useScrollScrub.js";
import Butterfly from "./Butterfly.jsx";
import PerfumeReveal from "./PerfumeReveal.jsx";

const clamp = (v, a = 0, b = 1) =>
  Math.min(b, Math.max(a, v));

const ease = (t) =>
  t * t * (3 - 2 * t);

export default function CinematicIntro() {
  const track = useRef(null);
  const video = useRef(null);
  const intro = useRef(null);
  const hint = useRef(null);
  const glow = useRef(null);
  const bottle = useRef(null);
  const end = useRef(null);
  const fly = useRef(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const onFrame = useCallback((p) => {
    if (
      !intro.current ||
      !hint.current ||
      !glow.current ||
      !bottle.current ||
      !end.current ||
      !fly.current
    ) {
      return;
    }

    /* =====================================================
       INTRO
       ===================================================== */

    const introProgress =
      clamp((p - 0.02) / 0.2);

    const introOpacity =
      1 - introProgress;

    intro.current.style.opacity =
      introOpacity;

    /*
      التمركز أصبح مسؤولية CSS translate.
      JavaScript يحرك العنصر رأسيًا فقط.
    */
    intro.current.style.transform =
      `translateY(${
        (1 - introOpacity) * -30
      }px)`;

    hint.current.style.opacity =
      0.75 * (1 - clamp(p / 0.05));

    /* =====================================================
       BUTTERFLY
       ===================================================== */

    const butterflyProgress =
      clamp((p - 0.55) / 0.4);

    const W = window.innerWidth;
    const H = window.innerHeight;

    fly.current.style.opacity =
      butterflyProgress > 0
        ? Math.min(
            1,
            butterflyProgress * 3
          )
        : 0;

    fly.current.style.transform =
      `translate(` +
      `${W * 0.5 +
        Math.sin(
          butterflyProgress * 7
        ) *
          W *
          0.05 -
        17 +
        butterflyProgress *
          W *
          0.16}px,` +
      `${H *
        (0.75 -
          0.4 *
            butterflyProgress) +
        Math.sin(
          butterflyProgress * 11
        ) *
          12}px)` +
      ` rotate(` +
      `${Math.sin(
        butterflyProgress * 6
      ) *
        14 +
        10}deg)` +
      ` scale(${
        0.7 +
        butterflyProgress * 0.5
      })`;

    /* =====================================================
       GLOW
       ===================================================== */

    const glowProgress =
      clamp((p - 0.62) / 0.25);

    glow.current.style.opacity =
      glowProgress;

    glow.current.style.transform =
      `scale(${
        0.8 +
        glowProgress * 0.25
      })`;

    /* =====================================================
       BOTTLE
       ===================================================== */

    const bottleProgress =
      ease(
        clamp(
          (p - 0.76) / 0.24
        )
      );

    bottle.current.style.opacity =
      bottleProgress;

    /*
      لا نلمس translate الخاص بالتمركز.
      JavaScript مسؤول فقط عن الحركة والدوران والحجم.
    */
    bottle.current.style.transform =
      `translateY(${
        (1 - bottleProgress) *
        110
      }px)` +
      ` rotate(${
        BOTTLE_TILT *
        bottleProgress
      }deg)` +
      ` scale(${
        0.92 +
        bottleProgress * 0.08
      })`;

    /* =====================================================
       END
       ===================================================== */

    const endProgress =
      clamp(
        (bottleProgress - 0.72) /
          0.28
      );

    end.current.style.opacity =
      endProgress;

    end.current.style.transform =
      `translateY(${
        (1 - endProgress) * 14
      }px)`;
  }, []);

  const handleReady = useCallback(() => {
    setReady(true);
    setError(false);
  }, []);

  const handleError = useCallback(() => {
    setError(true);
  }, []);

  useScrollScrub({
    trackRef: track,
    videoRef: video,
    onFrame,
    onReady: handleReady,
    onError: handleError
  });

  return (
    <main
      className="track"
      ref={track}
    >
      <div
        className={`loader ${
          ready || error ? "off" : ""
        }`}
        role="status"
        aria-live="polite"
      >
        {error
          ? "Unable to load Nocturne"
          : BRAND_NAME}
      </div>

      <section
        className="stage"
        aria-label={`${BRAND_NAME}, ${TAGLINE}`}
      >
        <video
          ref={video}
          src={VIDEO_PATH}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
        />

        <div className="shade" />

        <PerfumeReveal
          glowRef={glow}
          bottleRef={bottle}
          endRef={end}
        />

        <Butterfly ref={fly} />

        <div
          className="intro"
          ref={intro}
        >
          <h1>{BRAND_NAME}</h1>

          <p className="sub">
            {SUBTITLE}
          </p>

          <p className="tag">
            {TAGLINE}
          </p>
        </div>

        <div
          className="scroll"
          ref={hint}
          aria-hidden="true"
        >
          SCROLL TO ENTER
          <i />
        </div>
      </section>
    </main>
  );
}
