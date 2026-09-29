import { forwardRef } from "react";

const wing = "rgba(243,217,225,.55)";

const Butterfly = forwardRef(function Butterfly(_, ref) {
  return (
    <svg ref={ref} className="butterfly" viewBox="0 0 40 30" aria-hidden="true">
      <g className="wings">
        <path d="M20 15C14 2 3 1 3 8c0 6 8 8 17 7zM20 15c-6 13-15 14-15 8 0-5 8-8 15-8z" fill={wing} stroke="#D8B98A" strokeWidth=".5" />
        <path d="M20 15C26 2 37 1 37 8c0 6-8 8-17 7zM20 15c6 13 15 14 15 8 0-5-8-8-15-8z" fill={wing} stroke="#D8B98A" strokeWidth=".5" />
      </g>
      <rect x="19.4" y="9" width="1.2" height="14" rx=".6" fill="#F5F0EA" />
    </svg>
  );
});

export default Butterfly;
