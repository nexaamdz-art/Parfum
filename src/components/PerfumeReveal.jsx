import {
  BOTTLE_IMAGE_PATH,
  BRAND_NAME,
  SUBTITLE,
  TAGLINE
} from "../config.js";

export default function PerfumeReveal({
  glowRef,
  bottleRef,
  endRef
}) {
  return (
    <>
      <div
        className="glow"
        ref={glowRef}
        aria-hidden="true"
      />

      <div
        className="bottle"
        ref={bottleRef}
      >
        <div className="float">
          <img
            src={BOTTLE_IMAGE_PATH}
            alt={`${BRAND_NAME} ${SUBTITLE} perfume bottle`}
            decoding="async"
            draggable="false"
          />
        </div>
      </div>

      <div
        className="end"
        ref={endRef}
      >
        <h2>{BRAND_NAME}</h2>

        <p className="sub">
          {SUBTITLE}
        </p>

        <p className="tag">
          {TAGLINE}
        </p>
      </div>
    </>
  );
}
