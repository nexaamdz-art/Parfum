import { useCallback, useRef, useState } from "react";
import { VIDEO_PATH, BRAND_NAME, SUBTITLE, TAGLINE, BOTTLE_TILT } from "../config.js";
import { useScrollScrub } from "../hooks/useScrollScrub.js";
import Butterfly from "./Butterfly.jsx";
import PerfumeReveal from "./PerfumeReveal.jsx";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);

export default function CinematicIntro() {
  const track = useRef(null), video = useRef(null), intro = useRef(null), hint = useRef(null);
  const glow = useRef(null), bottle = useRef(null), end = useRef(null), fly = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const onFrame = useCallback((p) => {
    const io = 1 - clamp((p - 0.02) / 0.2);
    intro.current.style.opacity = io;
    intro.current.style.transform = `translateY(${(1 - io) * -30}px)`;
    hint.current.style.opacity = 0.75 * (1 - clamp(p / 0.05));

    const bp = clamp((p - 0.55) / 0.4);
    const W = innerWidth, H = innerHeight;

    fly.current.style.opacity = bp > 0 ? Math.min(1, bp * 3) : 0;
    fly.current.style.transform =
      `translate(${W * 0.5 + Math.sin(bp * 7) * W * 0.05 - 17 + bp * W * 0.16}px,` +
      `${H * (0.75 - 0.4 * bp) + Math.sin(bp * 11) * 12}px) ` +
      `rotate(${Math.sin(bp * 6) * 14 + 10}deg) scale(${0.7 + bp * 0.5})`;

    glow.current.style.opacity = clamp((p - 0.65) / 0.3);

    const r = ease(clamp((p - 0.8) / 0.2));
    bottle.current.style.opacity = r;
    bottle.current.style.transform =
      `translateY(${(1 - r) * 110}px) rotate(${BOTTLE_TILT * r}deg)`;

    const e = clamp((r - 0.7) / 0.3);
    end.current.style.opacity = e;
    end.current.style.transform = `translateY(${(1 - e) * 14}px)`;
  }, []);

  const handleReady = useCallback(() => setReady(true), []);
  const handleError = useCallback(() => setError(true), []);

  useScrollScrub({
    trackRef: track,
    videoRef: video,
    onFrame,
    onReady: handleReady,
    onError: handleError
  });

  return (
    <main className="track" ref={track}>
      <div className={`loader ${ready || error ? "off" : ""}`} role="status">
        {error ? "Unable to load Nocturne" : BRAND_NAME}
      </div>

      <section
        className="stage"
        aria-label="NOCTURNE, a whisper of flowers after dark"
      >
        <video
          ref={video}
          src={VIDEO_PATH}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="shade" />

        <PerfumeReveal
          glowRef={glow}
          bottleRef={bottle}
          endRef={end}
        />

        <Butterfly ref={fly} />

        <div className="intro" ref={intro}>
          <h1>{BRAND_NAME}</h1>
          <p className="sub">{SUBTITLE}</p>
          <p className="tag">{TAGLINE}</p>
        </div>

        <div className="scroll" ref={hint}>
          SCROLL TO ENTER
          <i />
        </div>
      </section>
    </main>
  );
}
