import { BOTTLE_IMAGE_PATH, BRAND_NAME, SUBTITLE, TAGLINE } from "../config.js";

/** Glow, tilted bottle and closing text. Styles are driven from CinematicIntro via refs. */
export default function PerfumeReveal({ glowRef, bottleRef, endRef }) {
  return (
    <>
      <div className="glow" ref={glowRef} />
      <div className="bottle" ref={bottleRef}>
        <div className="float">
          <img src={BOTTLE_IMAGE_PATH} alt="NOCTURNE Eau de Parfum bottle" decoding="async" />
        </div>
      </div>
      <div className="end" ref={endRef}>
        <h2>{BRAND_NAME}</h2>
        <p className="sub">{SUBTITLE}</p>
        <p className="tag">{TAGLINE}</p>
      </div>
    </>
  );
}
